/* Property detail page — gallery, lightbox, agent panel, similar homes. */

import { observeReveals, syncFavoriteButtons } from './site.js';
import { getProperty, getAgent, locationLabel, similarProperties, atWidth } from './data.js';
import { propertyCardHTML } from './cards.js';
import { icon } from './icons.js';

const mount = document.querySelector('[data-detail]');
const similarMount = document.querySelector('[data-similar]');
const stickyMount = document.querySelector('[data-detail-sticky]');
const id = new URLSearchParams(window.location.search).get('id');
const property = getProperty(id);

/* ------------------------------------------------------------ not found --- */
if (!property) {
  document.title = 'Property not found — Horizon Properties';
  if (mount) {
    mount.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>${icon('chevronRight', 13)}
        <a href="properties.html">Properties</a>
      </nav>
      <div class="empty-state" style="margin-top:34px">
        ${icon('house', 42)}
        <h1 class="h2">We could not find that property</h1>
        <p>The listing may have been sold or withdrawn. Explore the rest of our collection instead.</p>
        <a class="btn" href="properties.html">Browse all properties ${icon('arrowRight', 16)}</a>
      </div>`;
  }
} else {
  const agent = getAgent(property.agentId);
  const location = locationLabel(property);
  const photos = property.images;
  const favLabel = 'Save this property';
  document.title = `${property.title}, ${location} — Horizon Properties`;

  /* ------------------------------------------------------------- markup --- */
  if (mount) {
    mount.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>${icon('chevronRight', 13)}
        <a href="properties.html">Properties</a>${icon('chevronRight', 13)}
        <span aria-current="page">${property.title}</span>
      </nav>

      <div class="detail__top">
        <div class="detail__heading">
          <span class="chip">${property.status} · ${property.type}</span>
          <h1>${property.title}</h1>
          <p class="property-card__location">${icon('pin', 15)}<span>${location}</span></p>
        </div>
        <div>
          <div class="detail__price"><span>Guide price</span>${property.priceLabel}</div>
          <div class="detail__actions">
            <button class="btn" type="button" data-open-contact data-property="${property.title}">
              ${icon('phone', 16)} Contact agent
            </button>
            <button class="btn btn--outline" type="button" data-schedule>
              ${icon('calendar', 16)} Schedule a viewing
            </button>
            <button class="fav-btn" type="button" data-favorite="${property.id}" aria-pressed="false">
              <span class="visually-hidden">${favLabel}</span>${icon('heart', 18)}
            </button>
          </div>
        </div>
      </div>

      <div class="gallery" data-gallery>
        ${photos
          .slice(0, 3)
          .map(
            (src, i) => `
          <button class="gallery__item" type="button" data-photo="${i}"
                  aria-label="Open photo ${i + 1} of ${photos.length} in full screen">
            <img src="${atWidth(src, 1200)}" alt="${property.title} — photo ${i + 1}"
                 srcset="${atWidth(src, 800)} 800w, ${atWidth(src, 1200)} 1200w"
                 sizes="(max-width: 900px) 92vw, 50vw"
                 ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
          </button>`
          )
          .join('')}
        <button class="gallery__more" type="button" data-photo="0">
          ${icon('camera', 15)} View all ${photos.length} photos
        </button>
      </div>

      <div class="detail__grid">
        <div>
          <div class="spec-strip">
            <div class="meta">${icon('bed', 22)}<div><strong>${property.beds}</strong><span>Bedrooms</span></div></div>
            <div class="meta">${icon('bath', 22)}<div><strong>${property.baths}</strong><span>Bathrooms</span></div></div>
            <div class="meta">${icon('area', 22)}<div><strong>${property.sqft.toLocaleString('en-US')}</strong><span>Square feet</span></div></div>
            <div class="meta">${icon('calendar', 22)}<div><strong>${property.year}</strong><span>Year built</span></div></div>
          </div>

          <section class="detail-block">
            <h2>About this property</h2>
            <p>${property.description}</p>
          </section>

          <section class="detail-block">
            <h2>Key features</h2>
            <ul class="pill-list">
              ${property.features.map((f) => `<li>${icon('check', 15)}${f}</li>`).join('')}
            </ul>
          </section>

          <section class="detail-block">
            <h2>Amenities</h2>
            <ul class="amenity-grid">
              ${property.amenities.map((a) => `<li>${icon('sparkle', 17)}${a}</li>`).join('')}
            </ul>
          </section>

          <section class="detail-block">
            <h2>Property facts</h2>
            <dl class="detail-facts">
              <div><dt>Property type</dt><dd>${property.type}</dd></div>
              <div><dt>Status</dt><dd>${property.status}</dd></div>
              <div><dt>Location</dt><dd>${location}</dd></div>
              <div><dt>Price per sq ft</dt><dd>$${Math.round(property.price / property.sqft).toLocaleString('en-US')}</dd></div>
              <div><dt>Reference</dt><dd>HP-${property.id.slice(0, 6).toUpperCase()}</dd></div>
            </dl>
          </section>
        </div>

        <aside class="agent-card" aria-label="Listing advisor">
          <div class="agent-card__head">
            <img src="${agent.photo}" alt="Portrait of ${agent.name}" loading="lazy" decoding="async" width="120" height="120">
            <div>
              <strong>${agent.name}</strong>
              <span>${agent.role}</span>
            </div>
          </div>
          <ul class="agent-card__list">
            <li>${icon('phone', 16)}<a href="tel:${agent.phone.replace(/[^\d+]/g, '')}">${agent.phone}</a></li>
            <li>${icon('mail', 16)}<a href="mailto:${agent.email}">${agent.email}</a></li>
            <li>${icon('pin', 16)}<span>1200 Congress Avenue, Austin, TX</span></li>
          </ul>
          <button class="btn btn--block" type="button" data-open-contact data-property="${property.title}">
            Contact ${agent.name.split(' ')[0]} ${icon('arrowRight', 16)}
          </button>
          <button class="btn btn--outline btn--block" type="button" data-schedule>
            ${icon('calendar', 16)} Schedule a viewing
          </button>
          <p class="agent-card__note">Private viewings available seven days a week.</p>
        </aside>
      </div>`;
  }

  if (stickyMount) {
    stickyMount.hidden = false;
    stickyMount.innerHTML = `
      <div class="detail-sticky__price">${property.priceLabel}</div>
      <a class="btn btn--outline btn--sm" href="tel:${agent.phone.replace(/[^\d+]/g, '')}"
         aria-label="Call ${agent.name}">${icon('phone', 16)}</a>
      <button class="btn btn--sm" type="button" data-schedule>Schedule viewing</button>`;
  }

  const similar = similarProperties(property, 3);
  if (similarMount && similar.length) {
    similarMount.hidden = false;
    similarMount.innerHTML = `
      <div class="container">
        <div class="results__head">
          <div class="section-head">
            <span class="eyebrow">You may also like</span>
            <h2 class="h2">Similar Properties</h2>
          </div>
          <a class="link-arrow" href="properties.html">View all properties <span class="arrow">${icon('arrowRight', 15)}</span></a>
        </div>
        <div class="property-grid">${similar.map((p, i) => propertyCardHTML(p, { delay: i * 70 })).join('')}</div>
      </div>`;
  } else if (similarMount) {
    similarMount.remove();
  }

  /* ------------------------------------------------------------ lightbox --- */
  let galleryImages = photos;
  let current = 0;
  let lastFocused = null;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', `${property.title} photo gallery`);
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="lightbox__bar">
      <div>
        <strong>${property.title}</strong>
        <div class="lightbox__count" data-lb-count></div>
      </div>
      <button class="lightbox__close" type="button" data-lb-close aria-label="Close gallery">${icon('close', 20)}</button>
    </div>
    <div class="lightbox__stage">
      <button class="lightbox__nav lightbox__nav--prev" type="button" data-lb-prev aria-label="Previous photo">${icon('arrowLeft', 20)}</button>
      <img data-lb-image src="" alt="">
      <button class="lightbox__nav lightbox__nav--next" type="button" data-lb-next aria-label="Next photo">${icon('arrowRight', 20)}</button>
    </div>
    <div class="lightbox__thumbs" data-lb-thumbs></div>`;
  document.body.appendChild(lightbox);

  const lbImage = lightbox.querySelector('[data-lb-image]');
  const lbCount = lightbox.querySelector('[data-lb-count]');
  const lbThumbs = lightbox.querySelector('[data-lb-thumbs]');

  lbThumbs.innerHTML = galleryImages
    .map(
      (src, i) => `<button type="button" data-lb-thumb="${i}" aria-label="Show photo ${i + 1}">
        <img src="${atWidth(src, 200)}" alt="" loading="lazy" decoding="async"></button>`
    )
    .join('');

  function show(index) {
    current = (index + galleryImages.length) % galleryImages.length;
    lbImage.src = atWidth(galleryImages[current], 1600);
    lbImage.alt = `${property.title} — photo ${current + 1} of ${galleryImages.length}`;
    lbCount.textContent = `${current + 1} / ${galleryImages.length}`;
    lbThumbs.querySelectorAll('button').forEach((btn, i) => {
      btn.setAttribute('aria-current', String(i === current));
    });
  }

  function openLightbox(index, trigger) {
    lastFocused = trigger || document.activeElement;
    lightbox.hidden = false;
    show(index);
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.classList.add('nav-open');
    lightbox.querySelector('[data-lb-close]').focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    setTimeout(() => {
      lightbox.hidden = true;
    }, 300);
    lastFocused?.focus?.();
  }

  document.querySelectorAll('[data-photo]').forEach((tile) => {
    tile.addEventListener('click', () => openLightbox(Number(tile.dataset.photo), tile));
  });
  lightbox.querySelector('[data-lb-close]').addEventListener('click', closeLightbox);
  lightbox.querySelector('[data-lb-prev]').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('[data-lb-next]').addEventListener('click', () => show(current + 1));
  lbThumbs.addEventListener('click', (e) => {
    const thumb = e.target.closest('[data-lb-thumb]');
    if (thumb) show(Number(thumb.dataset.lbThumb));
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });

  /* ------------------------------------------------------------ actions --- */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-schedule]')) return;
    document.dispatchEvent(
      new CustomEvent('contact:open', {
        detail: {
          message: `I would like to schedule a viewing of ${property.title} (${location}). Please send me available times.`,
        },
      })
    );
  });
}

syncFavoriteButtons();
observeReveals();
