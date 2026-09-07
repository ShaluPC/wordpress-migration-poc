import { createOptimizedPicture } from '../../scripts/aem.js';
import { keepAuthoredDom, moveInstrumentation } from '../../scripts/scripts.js';

function isSocialRow(row) {
  const img = row.querySelector('img');
  const link = row.querySelector('a');
  if (img) return true;
  if (!link) return false;
  const paragraphs = [...row.querySelectorAll('p')];
  if (paragraphs.length > 1) return false;
  if (paragraphs.length === 1) {
    const p = paragraphs[0];
    return p.querySelector('a') && p.textContent.trim() === link.textContent.trim();
  }
  const text = row.textContent.replace(link.textContent, '').trim();
  return !text;
}

function buildIconPicture(img, alt) {
  const label = alt || img.alt || '';
  try {
    const url = new URL(img.src, window.location.href);
    const isSvg = url.pathname.toLowerCase().endsWith('.svg');
    if (url.origin === window.location.origin && !isSvg) {
      const optimized = createOptimizedPicture(img.src, label, false, [{ width: '96' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      return optimized;
    }
  } catch {
    // fall through
  }
  const picture = img.closest('picture');
  if (picture) {
    img.alt = label || img.alt;
    img.loading = 'lazy';
    return picture;
  }
  img.alt = label || img.alt;
  img.loading = 'lazy';
  return img;
}

/**
 * Footer Legal — copyright + social links (doc §3.4)
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .footer-legal-inner')) return;
  if (keepAuthoredDom(block)) return;

  const rows = [...block.children];
  if (!rows.length) return;

  const inner = document.createElement('div');
  inner.className = 'footer-legal-inner';

  const legal = document.createElement('div');
  legal.className = 'legal-copy';

  const socialNav = document.createElement('ul');
  socialNav.className = 'social-media';
  socialNav.setAttribute('aria-label', 'Social media');

  rows.forEach((row) => {
    if (isSocialRow(row)) {
      const link = row.querySelector('a');
      const img = row.querySelector('img');
      if (!link?.href && !img) return;

      const label = (
        link?.getAttribute('title')
        || link?.textContent
        || img?.alt
        || 'Social link'
      ).trim();

      const li = document.createElement('li');
      moveInstrumentation(row, li);

      if (link?.href) {
        link.className = 'social-link';
        link.setAttribute('aria-label', `${label}, opens in new tab`);
        link.setAttribute('data-track', JSON.stringify({ loc: 'f', nm: label.toLowerCase() }));
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = '';
        if (img) link.append(buildIconPicture(img, label));
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = label;
        link.append(sr);
        li.append(link);
      }

      socialNav.append(li);
      return;
    }

    const cell = row.querySelector(':scope > div') || row;
    moveInstrumentation(row, legal);
    while (cell.firstChild) legal.append(cell.firstChild);
  });

  if (legal.childNodes.length) inner.append(legal);
  if (socialNav.children.length) inner.append(socialNav);
  block.replaceChildren(inner);
}
