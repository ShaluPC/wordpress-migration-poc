import { createOptimizedPicture } from '../../scripts/aem.js';
import { keepAuthoredDom, moveInstrumentation } from '../../scripts/scripts.js';

/**
 * @param {HTMLImageElement} img
 * @param {string} alt
 * @returns {Element}
 */
function buildIcon(img, alt) {
  const label = alt || img.alt || '';
  try {
    const url = new URL(img.src, window.location.href);
    if (url.pathname.toLowerCase().endsWith('.svg')) {
      img.alt = label;
      return img.closest('picture') || img;
    }
  } catch {
    // fall through
  }
  const picture = createOptimizedPicture(img.src, label, false, [{ width: '48' }]);
  moveInstrumentation(img, picture.querySelector('img'));
  return picture;
}

/**
 * Sign-in rows include a plain-text eyebrow cell in addition to image + link.
 * @param {Element} row
 * @returns {string}
 */
function getEyebrow(row, link) {
  return [...row.children]
    .filter((cell) => !cell.querySelector('img, picture, a'))
    .map((cell) => cell.textContent.trim())
    .find((text) => text && text !== link.textContent.trim()) || '';
}

/**
 * Nav Tools — Find office / Search utilities + Sign in CTA.
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .nav-tools-inner')) return;
  if (keepAuthoredDom(block)) {
    block.querySelectorAll('a').forEach((link) => {
      if (!link.classList.contains('nav-signin')) link.classList.add('nav-tool-link');
    });
    return;
  }

  const rows = [...block.children];
  if (!rows.length) return;

  const tools = document.createElement('div');
  tools.className = 'nav-tools-inner';

  const utilities = document.createElement('ul');
  utilities.className = 'nav-utilities';

  const signIns = [];

  rows.forEach((row) => {
    const link = row.querySelector('a');
    const img = row.querySelector('img');
    if (!link) return;

    const eyebrow = getEyebrow(row, link);
    const isSignIn = Boolean(eyebrow);

    if (isSignIn) {
      const primary = link.textContent.trim();
      const label = (link.getAttribute('title') || `${eyebrow} ${primary}`.trim()).trim();

      const signInEl = document.createElement('a');
      signInEl.href = link.href;
      signInEl.className = 'nav-signin';
      signInEl.setAttribute('aria-label', label);
      if (link.target) signInEl.target = link.target;
      moveInstrumentation(row, signInEl);

      if (img) signInEl.append(buildIcon(img, label));

      const textWrap = document.createElement('span');
      textWrap.className = 'nav-signin-text';

      const eye = document.createElement('span');
      eye.className = 'nav-signin-eyebrow';
      eye.textContent = eyebrow;
      textWrap.append(eye);

      const main = document.createElement('span');
      main.className = 'nav-signin-label';
      main.textContent = primary || label;
      textWrap.append(main);

      signInEl.append(textWrap);
      signIns.push(signInEl);
      return;
    }

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    link.classList.add('nav-tool-link');
    const label = (link.getAttribute('title') || link.textContent || img?.alt || '').trim();
    if (label) link.setAttribute('aria-label', label);

    if (img) link.prepend(buildIcon(img, label));

    li.append(link);
    utilities.append(li);
  });

  if (utilities.children.length) tools.append(utilities);
  signIns.forEach((el) => tools.append(el));

  block.replaceChildren(tools);
}
