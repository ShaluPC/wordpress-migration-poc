import { createOptimizedPicture } from '../../scripts/aem.js';
import { keepAuthoredDom, moveInstrumentation } from '../../scripts/scripts.js';

function wrapSealImage(img, alt) {
  try {
    const url = new URL(img.src, window.location.href);
    if (url.origin === window.location.origin && !url.pathname.toLowerCase().endsWith('.svg')) {
      const optimized = createOptimizedPicture(img.src, alt, false, [{ width: '126' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      return optimized;
    }
  } catch {
    // fall through
  }
  const picture = img.closest('picture');
  if (picture) {
    img.alt = alt || img.alt;
    img.loading = 'lazy';
    return picture;
  }
  img.alt = alt || img.alt;
  img.loading = 'lazy';
  return img;
}

/**
 * Footer Seals — image seals and/or text privacy link (doc §3.5)
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .seals-inner')) return;
  if (keepAuthoredDom(block)) return;

  const rows = [...block.children];
  if (!rows.length) return;

  const inner = document.createElement('div');
  inner.className = 'seals-inner';

  rows.forEach((row) => {
    const link = row.querySelector('a');
    const img = row.querySelector('img');
    if (!link && !img) return;

    const item = document.createElement('div');
    item.className = 'seal-item';
    moveInstrumentation(row, item);

    if (link) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const trackName = (link.textContent || img?.alt || 'seal').trim().toLowerCase();
      link.setAttribute('data-track', JSON.stringify({ loc: 'f', nm: trackName }));

      if (img) {
        link.className = 'seal-link';
        const alt = link.getAttribute('title') || img.alt || link.textContent.trim();
        link.textContent = '';
        link.append(wrapSealImage(img, alt));
        if (alt) link.setAttribute('aria-label', alt);
      } else {
        link.className = 'privacy-choices';
        const label = link.getAttribute('title') || link.textContent.trim();
        if (label) link.setAttribute('aria-label', label);
      }
      item.append(link);
    } else if (img) {
      item.append(wrapSealImage(img, img.alt));
    }

    inner.append(item);
  });

  block.replaceChildren(inner);
}
