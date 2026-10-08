/* Shared behaviour: chrome mounting, header state, mobile nav, reveals,
   favourites, toast, contact modal, newsletter. */

import { mountChrome } from './layout.js';
import { hydrateIcons, icon } from './icons.js';

const FAV_KEY = 'horizon:favorites';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------ favourites -- */
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
  } catch {
    return [];
  }
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id) {
  const list = getFavorites();
  const index = list.indexOf(id);
  if (index > -1) list.splice(index, 1);
  else list.push(id);
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — favouriting stays session-only */
  }
  return index === -1;
}

export function syncFavoriteButtons() {
  const list = getFavorites();
  document.querySelectorAll('[data-favorite]').forEach((btn) => {
    const active = list.includes(btn.dataset.favorite);
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
    const label = btn.querySelector('.visually-hidden');
    if (label) label.textContent = active ? 'Remove from saved properties' : 'Save property';
  });
}

/* ----------------------------------------------------------------- toast -- */
let toastTimer;
export function toast(message) {
  let el = document.querySelector('[data-toast]');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.dataset.toast = '';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.innerHTML = `${icon('check', 17)}<span></span>`;
  el.querySelector('span').textContent = message;
  requestAnimationFrame(() => el.classList.add('is-visible'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3600);
}

/* ---------------------------------------------------------------- reveal -- */
let revealObserver;

export function observeReveals(scope = document) {
  const targets = scope.querySelectorAll('.reveal:not(.is-visible)');
  if (!targets.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
  }
  targets.forEach((el) => revealObserver.observe(el));
}

/* ------------------------------------------------------------- header ----- */
function initHeader() {
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const drawer = document.querySelector('[data-mobile-nav]');
  if (!header) return;

  const solid = header.dataset.solid === 'true';
  const update = () => {
    const scrolled = window.scrollY > 24;
    header.classList.toggle('is-scrolled', scrolled);
    header.classList.toggle('is-solid', solid && !scrolled);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });

  if (!toggle || !drawer) return;

  const links = drawer.querySelectorAll('.mobile-nav__link');
  links.forEach((link, i) => {
    link.style.transitionDelay = `${80 + i * 45}ms`;
  });

  const setOpen = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.visually-hidden').textContent = open ? 'Close menu' : 'Open menu';
    document.body.classList.toggle('nav-open', open);
    if (open) links[0]?.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* --------------------------------------------------------- contact modal -- */
function initContactModal() {
  const modal = document.querySelector('[data-contact-modal]');
  if (!modal) return;
  const panel = modal.querySelector('.modal__panel');
  const form = modal.querySelector('[data-contact-form]');
  const message = modal.querySelector('#cf-message');
  let lastFocused = null;

  const open = (trigger, preset) => {
    lastFocused = trigger || document.activeElement;
    const property = trigger?.dataset.property;
    if (message) message.value = preset || (property ? `I would like to arrange a viewing of ${property}.` : '');
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.classList.add('nav-open');
    modal.querySelector('input').focus();
  };

  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    setTimeout(() => {
      modal.hidden = true;
    }, 300);
    lastFocused?.focus?.();
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-contact]');
    if (trigger) {
      e.preventDefault();
      open(trigger);
    }
    if (e.target.closest('[data-close-contact]') || e.target === modal) close();
  });

  /* Other modules can request the dialog with a prefilled message. */
  document.addEventListener('contact:open', (e) => open(e.detail?.trigger, e.detail?.message));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
    if (e.key !== 'Tab' || modal.hidden) return;
    const focusables = panel.querySelectorAll('button, input, textarea, a[href]');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.querySelector('#cf-name').value.split(' ')[0];
    form.reset();
    close();
    toast(`Thank you${name ? `, ${name}` : ''} — an advisor will contact you shortly.`);
  });
}

/* ------------------------------------------------------------ misc wiring -- */
function initNewsletter() {
  document.querySelectorAll('[data-newsletter]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      form.reset();
      toast('You are subscribed — new listings will arrive monthly.');
    });
  });
}

function initFavorites() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-favorite]');
    if (!btn) return;
    e.preventDefault();
    const saved = toggleFavorite(btn.dataset.favorite);
    syncFavoriteButtons();
    toast(saved ? 'Saved to your shortlist.' : 'Removed from your shortlist.');
  });
}

function initSmoothAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });
}

function init() {
  mountChrome(document.body.dataset.page || '', document.body.dataset.headerVariant || 'transparent');
  hydrateIcons(document);
  initHeader();
  initContactModal();
  initNewsletter();
  initFavorites();
  initSmoothAnchors();
  syncFavoriteButtons();
  observeReveals();
}

init();
