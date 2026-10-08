/* Shared chrome — header, mobile navigation, footer, contact modal.
   Rendered once and injected into every page so navigation markup lives in
   exactly one place. */

import { icon } from './icons.js';

export const PHONE = '(555) 246-7890';
export const PHONE_HREF = 'tel:+15552467890';
export const EMAIL = 'hello@horizonproperties.com';
export const ADDRESS = '1200 Congress Avenue, Suite 400, Austin, TX 78701';

const NAV = [
  { label: 'Home', href: 'index.html', page: 'home' },
  { label: 'Properties', href: 'properties.html', page: 'properties' },
  { label: 'About Us', href: 'index.html#about' },
  { label: 'Services', href: 'index.html#services' },
  { label: 'Team', href: 'index.html#team' },
  { label: 'Contact', href: '#contact' },
];

const BRAND_MARK = `<svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <path d="M6 33V15.5L20 5l14 10.5V33" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M14 33V22.5h12V33" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M20 5v7M20 22.5v-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const brand = (tagline = true) => `
  <a class="brand" href="index.html" aria-label="Horizon Properties — home">
    ${BRAND_MARK}
    <span class="brand__text">
      <span class="brand__name">HORIZON</span>
      <span class="brand__sub">${tagline ? 'PROPERTIES' : ''}</span>
    </span>
  </a>`;

const navLinks = (activePage, className, listClass) => `
  <ul class="${listClass}">
    ${NAV.map(
      (item) => `<li><a class="${className}" href="${item.href}"${
        item.page && item.page === activePage ? ' aria-current="page"' : ''
      }>${item.label}</a></li>`
    ).join('')}
  </ul>`;

export function renderHeader(activePage, variant = 'transparent') {
  return `
  <header class="site-header" data-site-header${variant === 'solid' ? ' data-solid="true"' : ''}>
    <div class="container site-header__inner">
      ${brand()}
      <nav class="main-nav" aria-label="Primary">
        ${navLinks(activePage, 'main-nav__link', 'main-nav__list')}
      </nav>
      <div class="header-actions">
        <a class="site-header__phone" href="${PHONE_HREF}">
          ${icon('phone', 15)}<span>${PHONE}</span>
        </a>
        <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav">
          <span class="visually-hidden">Open menu</span>
          <span class="nav-toggle__bars"><span></span><span></span><span></span></span>
        </button>
      </div>
    </div>
  </header>
  <div class="mobile-nav" id="mobile-nav" data-mobile-nav aria-hidden="true">
    <nav aria-label="Mobile">
      ${navLinks(activePage, 'mobile-nav__link', 'mobile-nav__list')}
    </nav>
    <div class="mobile-nav__footer">
      <a class="btn btn--gold" href="${PHONE_HREF}">${icon('phone', 16)} ${PHONE}</a>
      <button class="btn btn--ghost" type="button" data-open-contact>Book a consultation ${icon('arrowRight', 16)}</button>
    </div>
  </div>`;
}

export function renderFooter() {
  return `
  <footer class="site-footer" id="contact">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          ${brand()}
          <p>Horizon Properties represents exceptional homes and considered investments across the United States — with discretion, clarity and an eye for architecture.</p>
          <div class="socials">
            <a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram', 17)}</a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn">${icon('linkedin', 17)}</a>
            <a href="https://x.com/" target="_blank" rel="noopener" aria-label="X">${icon('twitter', 17)}</a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook', 17)}</a>
          </div>
        </div>

        <div>
          <h3 class="footer__title">Explore</h3>
          <ul class="footer__list">
            ${NAV.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join('')}
          </ul>
        </div>

        <div>
          <h3 class="footer__title">Services</h3>
          <ul class="footer__list">
            <li><a href="index.html#services">Luxury Home Sales</a></li>
            <li><a href="index.html#services">Property Investment</a></li>
            <li><a href="index.html#services">Property Marketing</a></li>
            <li><a href="index.html#services">Real Estate Advisory</a></li>
            <li><a href="index.html#services">Property Valuation</a></li>
            <li><a href="index.html#services">Relocation Services</a></li>
          </ul>
        </div>

        <div>
          <h3 class="footer__title">Get in touch</h3>
          <ul class="footer__contact footer__list">
            <li>${icon('phone', 16)}<a href="${PHONE_HREF}">${PHONE}</a></li>
            <li>${icon('mail', 16)}<a href="mailto:${EMAIL}">${EMAIL}</a></li>
            <li>${icon('pin', 16)}<span>${ADDRESS}</span></li>
          </ul>
          <form class="newsletter" data-newsletter novalidate>
            <label class="visually-hidden" for="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" name="email" placeholder="Your email address" required>
            <button class="btn btn--gold btn--sm" type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div class="footer__bottom">
        <span>© ${new Date().getFullYear()} Horizon Properties. All rights reserved.</span>
        <span>Equal Housing Opportunity · Licensed real estate brokerage</span>
      </div>
    </div>
  </footer>`;
}

export function renderContactModal() {
  return `
  <div class="modal" data-contact-modal role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" hidden>
    <div class="modal__panel">
      <button class="modal__close" type="button" data-close-contact aria-label="Close dialog">${icon('close', 18)}</button>
      <h3 class="h3" id="contact-modal-title">Speak with an advisor</h3>
      <p class="lead">Tell us what you are looking for and one of our specialists will be in touch within one business day.</p>
      <form data-contact-form novalidate>
        <div class="field">
          <label for="cf-name">Full name</label>
          <input id="cf-name" name="name" type="text" autocomplete="name" required>
        </div>
        <div class="field--row">
          <div class="field">
            <label for="cf-email">Email</label>
            <input id="cf-email" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="cf-phone">Phone</label>
            <input id="cf-phone" name="phone" type="tel" autocomplete="tel">
          </div>
        </div>
        <div class="field">
          <label for="cf-message">How can we help?</label>
          <textarea id="cf-message" name="message" placeholder="I would like to arrange a viewing…"></textarea>
        </div>
        <button class="btn btn--block" type="submit">Send request ${icon('arrowRight', 16)}</button>
      </form>
    </div>
  </div>`;
}

export function mountChrome(activePage, variant = 'transparent') {
  const headerMount = document.querySelector('[data-header-mount]');
  const footerMount = document.querySelector('[data-footer]');
  if (headerMount) headerMount.outerHTML = renderHeader(activePage, variant);
  if (footerMount) footerMount.outerHTML = renderFooter();
  document.body.insertAdjacentHTML('beforeend', renderContactModal());
}
