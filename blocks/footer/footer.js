import { getMetadata, loadCSS } from '../../scripts/aem.js';
import { isCurrentFragmentPath } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

async function ensureFooterStyles() {
  const base = window.hlx.codeBasePath || '';
  await Promise.all([
    loadCSS(`${base}/blocks/footer-disclosures/footer-disclosures.css`),
    loadCSS(`${base}/blocks/footer-support/footer-support.css`),
    loadCSS(`${base}/blocks/footer-links/footer-links.css`),
    loadCSS(`${base}/blocks/footer-legal/footer-legal.css`),
    loadCSS(`${base}/blocks/footer-seals/footer-seals.css`),
  ]);
}

function unit(root, name) {
  const el = root.querySelector(`.${name}`);
  if (!el) return null;
  return el.closest(`.${name}-wrapper`) || el;
}

/**
 * Place blocks as siblings inside .footer-wrapper > .footer
 * with EDS section + *-container classes.
 * @param {Element} block
 */
function layoutFooter(block) {
  const names = [
    'footer-disclosures',
    'footer-support',
    'footer-links',
    'footer-legal',
    'footer-seals',
  ];
  const units = names.map((name) => unit(block, name)).filter(Boolean);
  const containers = names
    .filter((name) => block.querySelector(`.${name}`))
    .map((name) => `${name}-container`);

  block.classList.add(
    'section',
    'site-footer',
    'green-dark-theme',
    ...containers,
  );

  units.forEach((el) => block.append(el));
}

/**
 * loads and decorates the footer from the authored /footer fragment
 * @param {Element} block
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  if (isCurrentFragmentPath(footerPath)) return;
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  await ensureFooterStyles();
  if (!fragment) return;

  while (fragment.firstElementChild) block.append(fragment.firstElementChild);
  layoutFooter(block);
}
