/* Horizontal property carousel: arrows, mouse drag, touch swipe, keyboard,
   scroll snapping with wrap-around at the ends. */

export function initCarousel(root) {
  const viewport = root.querySelector('.carousel__viewport');
  const track = root.querySelector('.carousel__track');
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  if (!viewport || !track) return;

  const gap = () => parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
  const step = () => {
    const item = viewport.querySelector('.carousel__item');
    return item ? item.getBoundingClientRect().width + gap() : viewport.clientWidth * 0.8;
  };
  const maxScroll = () => viewport.scrollWidth - viewport.clientWidth;

  const go = (direction) => {
    const max = maxScroll();
    if (max <= 4) return;
    const atEnd = viewport.scrollLeft >= max - 4;
    const atStart = viewport.scrollLeft <= 4;
    let left = viewport.scrollLeft + direction * step();
    if (direction > 0 && atEnd) left = 0;
    else if (direction < 0 && atStart) left = max;
    viewport.scrollTo({ left, behavior: 'smooth' });
  };

  const syncControls = () => {
    const scrollable = maxScroll() > 4;
    [prev, next].forEach((btn) => {
      if (!btn) return;
      btn.disabled = !scrollable;
      btn.setAttribute('aria-disabled', String(!scrollable));
    });
  };

  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));

  /* Mouse drag */
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let moved = 0;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    dragging = true;
    moved = 0;
    startX = e.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add('is-dragging');
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    viewport.scrollLeft = startScroll - dx;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    if (moved > 6) {
      viewport.dataset.dragged = '1';
      setTimeout(() => delete viewport.dataset.dragged, 80);
    }
  };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((evt) =>
    viewport.addEventListener(evt, endDrag)
  );

  /* Suppress the click that ends a drag gesture */
  viewport.addEventListener(
    'click',
    (e) => {
      if (viewport.dataset.dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  /* Keyboard */
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  });

  viewport.addEventListener('scroll', syncControls, { passive: true });
  window.addEventListener('resize', syncControls);
  syncControls();
}
