/* Small inline icon set (stroke-based, inherits currentColor). */

const PATHS = {
  pin: '<path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  bed: '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/>',
  bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V6.5A2.5 2.5 0 0 1 8.5 4c1.4 0 2.5 1.1 2.5 2.5"/><path d="M8 19l-1 2M16 19l1 2"/>',
  area: '<path d="M4 8V4h4"/><path d="M20 16v4h-4"/><path d="M4 4l16 16"/>',
  phone: '<path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 6.2 2 2 0 0 1 6.5 3Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  chevronRight: '<path d="m9 5 7 7-7 7"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  heart: '<path d="M12 20s-7-4.6-7-9.4A4.1 4.1 0 0 1 12 7.6 4.1 4.1 0 0 1 19 10.6c0 4.8-7 9.4-7 9.4Z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  key: '<circle cx="8" cy="14" r="3.4"/><path d="m10.5 11.5 8-8"/><path d="m15 4 3 3"/><path d="m17.5 6.5 2 2"/>',
  shield: '<path d="M12 3.5 19 6v6c0 4.2-3 7.4-7 8.5-4-1.1-7-4.3-7-8.5V6l7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  chart: '<path d="M4 19h16"/><path d="M7 19V9M12 19V5M17 19v-7"/>',
  sparkle: '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z"/>',
  diamond: '<path d="m12 3 4 5-4 13-4-13 4-5Z"/><path d="M4 8h16"/>',
  house: '<path d="m4 10.5 8-6.5 8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z"/><path d="M9.5 21v-6h5v6"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="12" cy="13.5" r="3.4"/><path d="M9 7l1.4-2.5h3.2L15 7"/>',
  calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>',
  users: '<circle cx="9" cy="8" r="3.4"/><path d="M3.5 20c0-3.3 2.5-5.6 5.5-5.6s5.5 2.3 5.5 5.6"/><path d="M16 5.4a3.4 3.4 0 0 1 0 6.6"/><path d="M17 14.6c2 .7 3.5 2.6 3.5 5.4"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m14.8 9.2-1.6 4.4-4.4 1.6 1.6-4.4 4.4-1.6Z"/>',
  scale: '<path d="M12 4v16"/><path d="M7 20h10"/><path d="m5 8 3 5H2l3-5Z"/><path d="m19 8 3 5h-6l3-5Z"/><path d="M5 8h14"/>',
  truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
  instagram: '<rect x="4" y="4" width="16" height="16" rx="4.6"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.4" r=".9" fill="currentColor" stroke="none"/>',
  linkedin: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10.5V16M8 8v.01"/><path d="M11.5 16v-3.2a2.3 2.3 0 0 1 4.6 0V16"/>',
  twitter: '<path d="M4.5 5h3l4 5.4L15.6 5h3.4l-5.3 6.4L19.5 19h-3l-4.2-5.6L7.6 19H4.2l5.6-6.7L4.5 5Z"/>',
  facebook: '<path d="M14.5 8.5h2.2V5.6h-2.4c-2 0-3.3 1.3-3.3 3.4v1.5H9v3h2v7h3v-7h2.2l.4-3H14v-1.2c0-.5.2-.8.5-.8Z"/>',
  whatsapp: '<path d="M5 19l1-3A7 7 0 1 1 8.6 18L5 19Z"/><path d="M9.4 9.2c.6 2 2.4 3.8 4.4 4.4l1-1.4 1.8.8v1.2c-2.8.7-7-2.5-7.8-6.3h1.2l.8 1.8-1.4 1"/>',
};

export function icon(name, size = 20) {
  const path = PATHS[name] || '';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}

/* Replace every [data-icon] placeholder in a scope with its inline SVG. */
export function hydrateIcons(scope = document) {
  scope.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, Number(el.dataset.iconSize) || 20);
    el.removeAttribute('data-icon');
  });
}
