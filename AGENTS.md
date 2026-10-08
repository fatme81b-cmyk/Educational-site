# Horizon Properties — working notes

Static marketing site: no build step, no package manager, no backend, no database.
`index.html`, `properties.html` and `property.html` are served as-is; all behaviour
lives in ES modules under `js/` and plain CSS under `css/`.

## Running it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Serves the repository through stock `nginx:alpine` on host port **3000**, with the
repo bind-mounted at `/usr/share/nginx/html`. Because there is no bundler, edits to
HTML/CSS/JS are live as soon as the browser re-fetches the file — a hard refresh
(or the Base44 preview reload) is all that is needed. No container restart, no
rebuild.

## Quirks worth knowing

- The clone's root directory is mode `0700`. nginx's unprivileged worker cannot
  traverse it and returns **403 Forbidden** for every request. The compose command
  relaxes the read/execute bits on the mounted source (`chmod -R a+rX`) before
  starting nginx. Keep that line if you change the command.
- Photo URLs point at `images.unsplash.com` and are requested by the browser, not
  by the container. Card grids request 800px wide derivatives, galleries 1200px and
  the lightbox 1600px, via `atWidth()` in `js/data.js`.
- No secrets or environment variables are required. Nothing here needs credentials.

## Hero film (scroll-scrubbed)

The homepage hero is a scroll-driven film, not a background video: it is never
played, only scrubbed. `index.html` gives the hero a **300vh runway** with a
**100vh stage pinned inside it** (`position: sticky`, css/home.css), and
`js/hero-scrub.js` maps scroll progress onto `video.currentTime` — 0% scroll is
frame 0, 100% is the final frame, the whole timeline is traversed exactly once.
Scrolling down runs it forward, up runs it back, stopping freezes the frame.

- Assets: `assets/hero-scrub.mp4` (desktop 1280x704), `hero-scrub-mobile.mp4`
  (720px, picked when the viewport is ≤767px), `hero-scrub.webm` (engines without
  H.264) and `hero-poster.jpg` (first frame: the poster, the under-layer, and the
  no-JS/static visual). The encode is chosen in JS and fetched once — do **not**
  reintroduce `<source media>`: Chrome probed the phone file on desktop and logged
  a failed source.
- Seeking is the whole game, so the encodes matter: a keyframe every 4 frames, no
  audio track, `+faststart`. The original export carried a single keyframe and
  stuttered on every seek. To rebuild (from a fresh source in /tmp):

  ```bash
  docker run --rm -v "$PWD/assets:/out" -v "/tmp:/src" mwader/static-ffmpeg:7.1 \
    -i /src/source.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -g 4 -keyint_min 4 -sc_threshold 0 -crf 22 -preset slow -tune film \
    -movflags +faststart -vf scale=1280:-2 /out/hero-scrub.mp4
  ```

- The film is fetched into a blob before it is scrubbed. `preload` alone is not
  enough: a paused media element keeps only a window buffered (Chrome discarded
  everything past ~3s of this film), which puts the network back inside the seek
  path. Keep the blob — and keep it in mind for any future scrubbed media here.
- Until that blob decodes, the hero shows the poster frame plus the hairline
  loading state; the film only fades in once it can answer a seek, and the scroll
  hint appears with it.
- `prefers-reduced-motion: reduce` short-circuits everything: no pin, no scrub, no
  film download (the `<video>` never gets a src and is `display: none`) — the hero
  is the static first frame and the page scrolls normally.
- If the film cannot be fetched or decoded, `hero--no-video` swaps the element's
  `data-hero-image` value (the previous Unsplash hero photo) into the poster layer.

## Verifying changes

- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` — sanity check.
- Front-end behaviour is best checked in the preview: the property carousel
  (arrows/drag/arrow keys), favourites (persisted in `localStorage` under
  `horizon:favorites`), the browse filters and URL state on `properties.html`, and
  the gallery lightbox plus "Schedule a viewing" dialog on `property.html`.
- Syntax-check the modules without a browser:
  `docker run --rm -v $PWD/js:/app -w /app node:22-alpine sh -c 'for f in *.js; do node --check "$f"; done'`
  (needs a `{"type":"module"}` `package.json` beside them, since they are ESM).

## Architecture

- `js/layout.js` renders the shared header, mobile drawer, footer and contact
  dialog into the `[data-header-mount]` / `[data-footer]` placeholders, so chrome
  markup exists once. Keep the mount attributes distinct from any `body`
  attribute: `body[data-header-variant="solid"]` on `property.html` requests the
  always-opaque header, and a name collision there once made the header
  replacement swallow the whole page.
- `js/site.js` is imported by every page: it mounts the chrome and wires header
  scroll state, mobile nav, scroll reveals, favourites, toasts, the contact dialog
  and the newsletter form. Other modules open the dialog by dispatching a
  `contact:open` event with `{ message }` in `detail`.
- `js/data.js` holds agents and the ten property records; every property field is
  already flat and serialisable, so the array can be swapped for an API or a
  database query without touching the templates.
- `js/cards.js` is the single source of property-card markup; `js/carousel.js`
  drives the featured rail; `js/properties.js` and `js/property.js` are the browse
  and detail controllers, and `js/home.js` fills the featured rail and team grid.
- Page scripts are loaded with `<script type="module">`, so `site.js` always
  initialises before page-specific rendering runs.
