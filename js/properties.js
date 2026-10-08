/* Browse page controller — search, filters, sorting and URL state. */

import { observeReveals, syncFavoriteButtons } from './site.js';
import { PROPERTIES, PROPERTY_TYPES, LOCATIONS } from './data.js';
import { propertyGridHTML } from './cards.js';
import { icon } from './icons.js';

const PRICE_RANGES = [
  { id: '', label: 'Any price', min: 0, max: Infinity },
  { id: '0-2500000', label: 'Up to $2.5M', min: 0, max: 2500000 },
  { id: '2500000-4000000', label: '$2.5M – $4M', min: 2500000, max: 4000000 },
  { id: '4000000-6000000', label: '$4M – $6M', min: 4000000, max: 6000000 },
  { id: '6000000-', label: '$6M and above', min: 6000000, max: Infinity },
];

const SORTS = [
  { id: 'featured', label: 'Featured first' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'beds-desc', label: 'Most bedrooms' },
  { id: 'size-desc', label: 'Largest floor area' },
];

const defaults = {
  q: '',
  location: '',
  type: '',
  price: '',
  beds: '',
  baths: '',
  sort: 'featured',
};

const url = new URLSearchParams(window.location.search);
const state = { ...defaults };
Object.keys(defaults).forEach((key) => {
  const value = url.get(key);
  if (value !== null) state[key] = value;
});

const form = document.querySelector('[data-filters]');
const grid = document.querySelector('[data-results]');
const countEl = document.querySelector('[data-result-count]');

const options = (items, current, placeholder) =>
  [`<option value="">${placeholder}</option>`]
    .concat(
      items.map(
        (item) =>
          `<option value="${item.value}"${item.value === current ? ' selected' : ''}>${item.label}</option>`
      )
    )
    .join('');

if (form) {
  form.innerHTML = `
    <div class="filters__search">
      ${icon('search', 19)}
      <label class="visually-hidden" for="f-q">Search properties</label>
      <input id="f-q" type="search" name="q" placeholder="Search by name, city or state…" value="${state.q}">
    </div>
    <div class="filters__grid">
      <label class="visually-hidden" for="f-location">Location</label>
      <select id="f-location" name="location">
        ${options(LOCATIONS.map((l) => ({ value: l, label: l })), state.location, 'All locations')}
      </select>
      <label class="visually-hidden" for="f-type">Property type</label>
      <select id="f-type" name="type">
        ${options(PROPERTY_TYPES.map((t) => ({ value: t, label: t })), state.type, 'All property types')}
      </select>
      <label class="visually-hidden" for="f-price">Price range</label>
      <select id="f-price" name="price">
        ${options(PRICE_RANGES.filter((p) => p.id).map((p) => ({ value: p.id, label: p.label })), state.price, 'Any price')}
      </select>
      <label class="visually-hidden" for="f-beds">Bedrooms</label>
      <select id="f-beds" name="beds">
        ${options(
          [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}+ bedrooms` })),
          state.beds,
          'Any bedrooms'
        )}
      </select>
      <label class="visually-hidden" for="f-sort">Sort by</label>
      <select id="f-sort" name="sort">
        ${SORTS.map(
          (s) => `<option value="${s.id}"${s.id === state.sort ? ' selected' : ''}>${s.label}</option>`
        ).join('')}
      </select>
    </div>
    <div class="filters__foot">
      <div class="filters__chips" data-filter-chips></div>
      <button class="btn btn--outline btn--sm" type="button" data-reset>Reset filters</button>
    </div>`;
}

/* Queried after the toolbar exists, so the chips container is available. */
const chipsEl = form ? form.querySelector('[data-filter-chips]') : null;

function matches(property) {
  const term = state.q.trim().toLowerCase();
  if (term) {
    const haystack = `${property.title} ${property.city} ${property.state} ${property.type} ${property.status}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  if (state.location && `${property.city}, ${property.state}` !== state.location) return false;
  if (state.type && property.type !== state.type) return false;
  if (state.beds && property.beds < Number(state.beds)) return false;
  if (state.baths && property.baths < Number(state.baths)) return false;
  if (state.price) {
    const range = PRICE_RANGES.find((p) => p.id === state.price);
    if (range && (property.price < range.min || property.price > range.max)) return false;
  }
  return true;
}

function sort(list) {
  const sorted = [...list];
  switch (state.sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'beds-desc':
      return sorted.sort((a, b) => b.beds - a.beds || b.baths - a.baths);
    case 'size-desc':
      return sorted.sort((a, b) => b.sqft - a.sqft);
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price);
  }
}

function activeChips() {
  const chips = [];
  if (state.q) chips.push({ key: 'q', label: `“${state.q}”` });
  if (state.location) chips.push({ key: 'location', label: state.location });
  if (state.type) chips.push({ key: 'type', label: state.type });
  if (state.price) {
    const range = PRICE_RANGES.find((p) => p.id === state.price);
    if (range) chips.push({ key: 'price', label: range.label });
  }
  if (state.beds) chips.push({ key: 'beds', label: `${state.beds}+ bedrooms` });
  if (state.baths) chips.push({ key: 'baths', label: `${state.baths}+ bathrooms` });
  return chips;
}

function syncUrl() {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([key, value]) => {
    if (value && value !== defaults[key]) params.set(key, value);
  });
  const query = params.toString();
  history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
}

function render() {
  const results = sort(PROPERTIES.filter(matches));

  grid.innerHTML =
    propertyGridHTML(results) ||
    `<div class="empty-state">
       ${icon('search', 42)}
       <h3 class="h3">No properties match those filters</h3>
       <p>Try widening your price range or clearing a filter to see more homes.</p>
       <button class="btn" type="button" data-empty-reset>Clear all filters</button>
     </div>`;

  if (countEl) {
    countEl.innerHTML = `<strong>${results.length}</strong> ${results.length === 1 ? 'property' : 'properties'} available`;
  }

  const chips = activeChips();
  if (chipsEl) {
    chipsEl.innerHTML = chips
      .map(
        (chip) => `<span class="filter-chip">${chip.label}
          <button type="button" data-clear="${chip.key}" aria-label="Remove ${chip.label} filter">${icon('close', 13)}</button>
        </span>`
      )
      .join('');
  }

  syncUrl();
  syncFavoriteButtons();
  observeReveals();
}

function update(key, value) {
  state[key] = value;
  if (form) {
    const field = form.querySelector(`[name="${key}"]`);
    if (field && field.value !== value) field.value = value;
  }
  render();
}

form?.addEventListener('submit', (e) => e.preventDefault());
form?.addEventListener('input', (e) => {
  const field = e.target.closest('input, select');
  if (!field) return;
  update(field.name, field.value);
});

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-reset], [data-empty-reset]')) {
    Object.assign(state, defaults);
    if (form) {
      form.querySelectorAll('input, select').forEach((field) => {
        field.value = field.name === 'sort' ? defaults.sort : '';
      });
    }
    render();
    return;
  }
  const clear = e.target.closest('[data-clear]');
  if (clear) update(clear.dataset.clear, '');
});

render();
