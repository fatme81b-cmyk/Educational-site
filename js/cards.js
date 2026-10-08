/* Reusable property card markup. */

import { icon } from './icons.js';
import { locationLabel, atWidth } from './data.js';
import { isFavorite } from './site.js';

const favLabel = (active) =>
  `<span class="visually-hidden">${active ? 'Remove from saved properties' : 'Save property'}</span>`;

export function propertyCardHTML(property, { delay = 0 } = {}) {
  const active = isFavorite(property.id);
  const href = `property.html?id=${encodeURIComponent(property.id)}`;
  const image = atWidth(property.images[0], 800);

  return `
  <article class="property-card reveal" style="--reveal-delay:${delay}ms">
    <div class="property-card__media">
      <a href="${href}" tabindex="-1" aria-hidden="true">
        <img src="${image}"
             srcset="${atWidth(image, 400)} 400w, ${image} 800w, ${atWidth(image, 1200)} 1200w"
             sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 400px"
             alt="" loading="lazy" decoding="async" width="800" height="600">
      </a>
      <div class="property-card__top">
        <span class="property-card__price">${property.priceLabel}</span>
        <button class="fav-btn${active ? ' is-active' : ''}" type="button" data-favorite="${property.id}"
                aria-pressed="${active}">${favLabel(active)}${icon('heart', 18)}</button>
      </div>
    </div>
    <div class="property-card__body">
      <span class="chip">${property.status} · ${property.type}</span>
      <h3 class="property-card__title"><a href="${href}">${property.title}</a></h3>
      <p class="property-card__location">${icon('pin', 15)}<span>${locationLabel(property)}</span></p>
      <div class="property-card__specs">
        <span class="meta">${icon('bed', 16)}${property.beds} Beds</span>
        <span class="meta">${icon('bath', 16)}${property.baths} Baths</span>
        <span class="meta">${icon('area', 16)}${property.sqft.toLocaleString('en-US')} sq ft</span>
      </div>
    </div>
  </article>`;
}

export function propertyGridHTML(properties) {
  return properties.map((p, i) => propertyCardHTML(p, { delay: Math.min(i, 5) * 70 })).join('');
}
