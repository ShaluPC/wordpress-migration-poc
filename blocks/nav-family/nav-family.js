import { createOptimizedPicture } from '../../scripts/aem.js';
import { keepAuthoredDom, moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Optimize same-origin rasters; keep SVG / external assets as authored.
 * @param {HTMLImageElement} img
 * @param {string} alt
 * @returns {Element}
 */
function wrapBrandImage(img, alt) {
  const label = alt || img.alt || '';
  try {
    const url = new URL(img.src, window.location.href);
    const isSvg = url.pathname.toLowerCase().endsWith('.svg');
    if (url.origin === window.location.origin && !isSvg) {
      const optimized = createOptimizedPicture(img.src, label, false, [{ width: '120' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      return optimized;
    }
  } catch {
    // fall through
  }
  const picture = img.closest('picture');
  if (picture) {
    img.alt = label || img.alt;
    img.loading = 'eager';
    return picture;
  }
  img.alt = label || img.alt;
  img.loading = 'eager';
  return img;
}

/**
 * Nav Family — top dark-green brand switcher (H&R Block / Advisors / Spruce).
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .nav-family-inner')) return;
  if (keepAuthoredDom(block)) {
    block.querySelectorAll('a').forEach((link) => link.classList.add('nav-family-link'));
    return;
  }

  const rows = [...block.children];
  if (!rows.length) return;

  const inner = document.createElement('div');
  inner.className = 'nav-family-inner';

  const list = document.createElement('ul');
  list.className = 'nav-family-list';
  list.setAttribute('aria-label', 'H&R Block family brands');

  rows.forEach((row) => {
    const link = row.querySelector('a');
    const img = row.querySelector('img');
    if (!link) return;

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const isActive = row.classList.contains('active')
      || [...row.classList].includes('active')
      || [...row.children].some((cell) => cell.textContent.trim().toLowerCase() === 'active');
    if (isActive) li.classList.add('is-active');

    const label = (link.getAttribute('title') || link.textContent || img?.alt || '').trim();
    link.className = 'nav-family-link';
    if (label) link.setAttribute('aria-label', label);
    if (isActive) link.setAttribute('aria-current', 'true');

    link.textContent = '';
    if (img) {
      const icon = document.createElement('span');
      icon.className = 'nav-family-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.append(wrapBrandImage(img, label));
      link.append(icon);
    }

    const text = document.createElement('span');
    text.className = 'nav-family-label';
    text.textContent = label;
    link.append(text);

    li.append(link);
    list.append(li);
  });

  inner.append(list);
  block.replaceChildren(inner);
}
