import { content } from './content.js';

const overlay = () => document.getElementById('overlay');
const titleEl = () => document.getElementById('overlay-title');
const contentEl = () => document.getElementById('overlay-content');

export function showPanel(section) {
  const entry = content[section];
  if (!entry) return;
  titleEl().textContent = entry.title;
  contentEl().innerHTML = entry.body;
  const el = overlay();
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden', 'false');
  // next frame so the transition triggers
  requestAnimationFrame(() => el.classList.add('visible'));
}

export function hidePanel() {
  const el = overlay();
  el.classList.remove('visible');
  el.setAttribute('aria-hidden', 'true');
  setTimeout(() => el.classList.add('hidden'), 300);
}

export function bindClose(handler) {
  document.getElementById('overlay-close').addEventListener('click', handler);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay().classList.contains('hidden')) handler();
  });
}
