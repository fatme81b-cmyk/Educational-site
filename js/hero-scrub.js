/* Scroll-driven hero film.
 *
 * The hero section is a tall runway (300vh, see css/home.css) with a 100vh stage
 * pinned inside it by `position: sticky`. Scroll progress through the runway maps
 * linearly onto the film's timeline, so the hero reads as a camera move the
 * visitor drives rather than a video that plays:
 *
 *   progress 0    → currentTime = 0
 *   progress 0.5  → currentTime = duration / 2
 *   progress 1    → currentTime = duration
 *
 * It works in both directions, and `video.play()` is never called: the film stays
 * paused, so stopping the scroll freezes that exact frame.
 *
 * Why it does not stutter:
 * - One passive scroll listener. All it does is record the target progress and
 *   ask for a frame — no DOM writes, no layout reads beyond a cached section
 *   offset (measured on load and resize only).
 * - Every visual update happens inside requestAnimationFrame, and the loop stops
 *   itself once the rendered progress has caught up with the target, so an idle
 *   page costs nothing.
 * - An exponential smoothing step (current += (target - current) * SMOOTHING)
 *   keeps the film from snapping between frames while staying tight to the scroll.
 * - A seek is only issued when it would move the film by more than half a frame,
 *   which keeps us far away from "currentTime on every scroll event".
 * - The film is pulled into a blob before it is scrubbed (see the start-up
 *   block), so seeking never waits on the network, and the hero copy cannot be
 *   scrolled before the film is actually ready.
 *
 * Encoding note — the files in assets/ are prepared for random-access seeking:
 * a normal export carries a single keyframe, so every seek has to decode from
 * frame 0 and scrubbing stutters. The hero film is therefore re-encoded with a
 * keyframe every 4 frames (~0.17s), no audio track, +faststart, and a modest
 * resolution/bitrate:
 *
 *   ffmpeg -i source.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p \
 *          -g 4 -keyint_min 4 -sc_threshold 0 -crf 22 -preset slow -tune film \
 *          -movflags +faststart -vf scale=1280:-2 hero-scrub.mp4
 *
 * (a 720px-wide, crf 25 variant for phones, plus a WebM/VP9 alternative with the
 * same GOP). If the film is ever replaced, keep those characteristics: frequent
 * keyframes, H.264 or WebM/VP9, sane resolution and bitrate, `-movflags
 * +faststart`, and no audio.
 */

/* How tightly the rendered frame follows the scroll: 1 = none, 0 = never.
   Low enough to absorb jitter, high enough to stay stuck to the scroll. */
const SMOOTHING = 0.18;
/* Smallest seek worth issuing, in seconds (a 24fps frame is ~0.042s). */
const SEEK_EPSILON = 0.012;
/* Phones pay more per seek, so skip a little more: same visual result. */
const SEEK_EPSILON_TOUCH = 0.025;
/* Fraction of the runway over which the hero copy and the grade fade away. */
const COPY_FADE = 0.3;
/* Progress at which the white transition arc starts to appear. */
const ARC_FADE = 0.84;

/* The cuts of the film, chosen at runtime (see the start-up block). */
const DESKTOP_SRC = 'assets/hero-scrub.mp4';
const PHONE_SRC = 'assets/hero-scrub-mobile.mp4';
const WEBM_SRC = 'assets/hero-scrub.webm';

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (t) => t * t * (3 - 2 * t);

export function initHeroScrub() {
  const section = document.querySelector('[data-hero-scrub]');
  if (!section) return;

  const video = section.querySelector('[data-hero-video]');
  const fallback = section.querySelector('[data-hero-fallback]');
  const content = section.querySelector('[data-hero-content]');
  const overlay = section.querySelector('[data-hero-overlay]');
  const hint = section.querySelector('[data-hero-hint]');
  const arc = section.querySelector('[data-hero-arc]');
  const loadBar = section.querySelector('[data-hero-loadbar]');
  if (!video || !content) return;

  /* Reduced motion: no pin and no scrub. The poster frame stands in, the copy
     stays put, and the page scrolls normally. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    section.classList.add('hero--static');
    return;
  }

  const isPhone = window.matchMedia('(max-width: 767px)').matches;
  const seekEpsilon = isPhone ? SEEK_EPSILON_TOUCH : SEEK_EPSILON;

  let duration = 0;
  let sectionTop = 0;
  let travel = 0;
  let target = 0; /* progress the scroll is asking for */
  let current = 0; /* progress actually rendered */
  let rafId = 0;
  let ready = false;
  let failed = false;

  /* ----------------------------------------------------------- geometry -- */
  const measure = () => {
    sectionTop = section.getBoundingClientRect().top + window.scrollY;
    travel = Math.max(0, section.offsetHeight - window.innerHeight);
  };

  const progressAt = () =>
    travel > 0 ? clamp01((window.scrollY - sectionTop) / travel) : 0;

  /* ---------------------------------------------------------- rendering -- */
  /* The single place that touches the DOM, called once per animation frame. */
  const render = (progress) => {
    if (ready && duration) {
      /* Stay a hair inside the end of the timeline: seeking exactly to
         `duration` can land past the last frame in some browsers. */
      const time = progress >= 1 ? duration - 0.001 : progress * duration;
      if (Math.abs(time - video.currentTime) > seekEpsilon) video.currentTime = time;
    }

    const fade = smoothstep(clamp01(progress / COPY_FADE));
    content.style.opacity = String(1 - fade);
    content.style.transform = `translate3d(0, ${(-28 * fade).toFixed(1)}px, 0)`;
    /* Lift the grade as the copy leaves, so the film stays visually dominant. */
    overlay.style.opacity = String(1 - 0.5 * fade);
    hint.style.opacity = ready || failed ? String(1 - clamp01(progress / 0.05)) : '0';
    arc.style.opacity = String(smoothstep(clamp01((progress - ARC_FADE) / (1 - ARC_FADE))));
  };

  /* --------------------------------------------------- animation loop ---- */
  const frame = () => {
    rafId = 0;
    current += (target - current) * SMOOTHING;
    if (Math.abs(target - current) < 0.0008) current = target;
    render(current);
    if (current !== target) rafId = requestAnimationFrame(frame);
  };

  const schedule = () => {
    if (!rafId) rafId = requestAnimationFrame(frame);
  };

  /* The scroll handler only records the target progress and asks for a frame. */
  const onScroll = () => {
    target = progressAt();
    schedule();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      /* Deliberately no snap: re-measuring can shift the target slightly (mobile
         browser chrome, window resize) and the smoothing glides to it. */
      measure();
      onScroll();
    },
    { passive: true }
  );

  /* ------------------------------------------------------ loading state -- */
  const loadTrack = loadBar?.parentElement;

  /* fraction < 0 means the size is unknown (a chunked proxy): sweep instead. */
  const setLoaded = (fraction) => {
    if (!loadBar || !loadTrack) return;
    if (fraction < 0) {
      loadTrack.classList.add('is-indeterminate');
      return;
    }
    loadTrack.classList.remove('is-indeterminate');
    loadBar.style.transform = `scaleX(${clamp01(fraction).toFixed(3)})`;
  };

  const reveal = () => {
    if (ready) return;
    ready = true;
    duration = video.duration || 0;
    /* Paint the frame the current scroll position asks for *before* revealing,
       so the fade-in never flashes frame 0. */
    target = current = progressAt();
    render(current);
    section.classList.add('hero--ready');
    video.classList.add('is-ready');
  };
  video.addEventListener('loadeddata', reveal, { once: true });

  /* ------------------------------------------------------------ fallback -- */
  const fail = () => {
    if (failed) return;
    failed = true;
    if (fallback?.dataset.heroImage) fallback.src = fallback.dataset.heroImage;
    section.classList.add('hero--no-video');
    render(current);
  };
  /* Fired when the chosen encode cannot be decoded. */
  video.addEventListener('error', fail);

  /* --------------------------------------------------------------- start -- */
  measure();
  target = current = progressAt();
  render(current);

  /* One encode, chosen here rather than with <source media> so exactly one file
     is fetched: phones get the lighter 720px cut, and an engine without H.264
     (some Linux builds) falls back to the WebM. */
  const canPlay = (type) => video.canPlayType(type) !== '';
  const source = canPlay('video/mp4; codecs="avc1.42E01E"')
    ? isPhone
      ? PHONE_SRC
      : DESKTOP_SRC
    : WEBM_SRC;

  /* Bring the whole film in before it can be scrubbed. Left to itself a media
     element keeps only a window buffered — Chrome discarded everything past ~3s
     of this paused film when tested — so a seek beyond that window waits on the
     network, which is exactly the stutter this hero must not have. Holding the
     film in a blob makes every seek local on any connection; the upfront
     download (4 MB desktop / 1.3 MB phone) is what the loading state covers, and
     it runs in parallel with the rest of the page. */
  const load = async () => {
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const total = Number(response.headers.get('content-length')) || 0;
      let blob;
      if (response.body && total) {
        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          setLoaded(received / total);
        }
        blob = new Blob(chunks, { type: response.headers.get('content-type') || 'video/mp4' });
      } else {
        setLoaded(-1);
        blob = await response.blob();
      }
      setLoaded(1);
      video.preload = 'auto';
      video.src = URL.createObjectURL(blob);
      video.load();
    } catch {
      fail();
    }
  };
  load();
}
