/* Homepage controller — featured carousel and team grid. */

import { observeReveals, syncFavoriteButtons } from './site.js';
import { PROPERTIES, AGENTS } from './data.js';
import { propertyCardHTML } from './cards.js';
import { initCarousel } from './carousel.js';
import { icon } from './icons.js';

const teamCardHTML = (agent, index) => `
  <article class="team-card reveal" style="--reveal-delay:${index * 80}ms">
    <div class="team-card__media">
      <img src="${agent.photo}" alt="Portrait of ${agent.name}" loading="lazy" decoding="async" width="600" height="740">
      <div class="team-card__socials">
        <a href="mailto:${agent.email}" aria-label="Email ${agent.name}">${icon('mail', 16)}</a>
        <a href="${agent.phone.replace(/[^\d+]/g, '')}" aria-label="Call ${agent.name}" data-tel="${agent.phone}">${icon('phone', 16)}</a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="${agent.name} on LinkedIn">${icon('linkedin', 16)}</a>
      </div>
    </div>
    <div class="team-card__body">
      <h3 class="h3">${agent.name}</h3>
      <span>${agent.role}</span>
    </div>
  </article>`;

const featuredTrack = document.querySelector('[data-featured-track]');
if (featuredTrack) {
  const ordered = [...PROPERTIES].sort((a, b) => Number(b.featured) - Number(a.featured));
  featuredTrack.innerHTML = ordered
    .map(
      (property) =>
        `<div class="carousel__item">${propertyCardHTML(property, { delay: 0 })}</div>`
    )
    .join('');
}

const teamGrid = document.querySelector('[data-team-grid]');
if (teamGrid) teamGrid.innerHTML = AGENTS.map(teamCardHTML).join('');

const carousel = document.querySelector('[data-carousel]');
if (carousel) initCarousel(carousel);

/* Team phone links: use the human-readable number as the tel target. */
document.querySelectorAll('[data-tel]').forEach((link) => {
  link.href = `tel:${link.dataset.tel.replace(/[^\d+]/g, '')}`;
});

syncFavoriteButtons();
observeReveals();
