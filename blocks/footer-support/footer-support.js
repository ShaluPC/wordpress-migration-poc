import { createOptimizedPicture } from '../../scripts/aem.js';
import { keepAuthoredDom, moveInstrumentation } from '../../scripts/scripts.js';

function wrapIconImage(img, alt, width = '48') {
  const label = alt || img.alt || '';
  try {
    const url = new URL(img.src, window.location.href);
    const isSvg = url.pathname.toLowerCase().endsWith('.svg');
    if (url.origin === window.location.origin && !isSvg) {
      const optimized = createOptimizedPicture(img.src, label, false, [{ width }]);
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
 * Footer Support — heading + support actions (doc §3.2)
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .footer-support-inner')) return;
  if (keepAuthoredDom(block)) return;

  const rows = [...block.children];
  if (!rows.length) return;

  const inner = document.createElement('div');
  inner.className = 'footer-support-inner';

  const headingRow = rows.find((row) => row.querySelector('h1, h2, h3, h4, h5, h6'))
    || rows.find((row) => !row.querySelector('a, picture, img'));
  const actionRows = rows.filter((row) => row !== headingRow);

  const list = document.createElement('ul');
  list.className = 'support-actions';

  if (headingRow) {
    let heading = headingRow.querySelector('h1, h2, h3, h4, h5, h6');
    if (!heading) {
      heading = document.createElement('h2');
      heading.textContent = headingRow.textContent.trim();
    }
    if (heading) {
      const li = document.createElement('li');
      li.className = 'support-heading';
      moveInstrumentation(headingRow, li);
      li.append(heading);
      list.append(li);
    }
  }

  actionRows.forEach((row) => {
    const link = row.querySelector('a');
    const img = row.querySelector('img');
    if (!link) return;

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const label = (link.getAttribute('title') || link.textContent || img?.alt || 'Support').trim();
    link.className = 'support-action';
    link.setAttribute('aria-label', label);
    link.setAttribute('data-track', JSON.stringify({ loc: 'f', nm: label.toLowerCase() }));

    const text = link.textContent.trim() || label;
    link.textContent = '';
    if (img) {
      const icon = document.createElement('span');
      icon.className = 'support-action-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.append(wrapIconImage(img, label));
      link.append(icon);
    }
    const name = document.createElement('span');
    name.className = 'support-action-label';
    name.textContent = text;
    link.append(name);

    li.append(link);
    list.append(li);
  });

  inner.append(list);
  block.replaceChildren(inner);
}
