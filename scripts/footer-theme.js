import { decorateBlock } from './aem.js';

const FOOTER_BLOCKS = [
  'footer-support',
  'footer-links',
  'footer-legal',
  'footer-seals',
];

const NAV_SEL = [
  '.nav-family',
  '.nav-brand',
  '.nav-menu',
  '.nav-panel',
  '.nav-tools',
  '[data-aue-model="nav-family"]',
  '[data-aue-model="nav-brand"]',
  '[data-aue-model="nav-menu"]',
  '[data-aue-model="nav-panel"]',
  '[data-aue-model="nav-tools"]',
].join(', ');

const FOOTER_SEL = [
  ...FOOTER_BLOCKS.map((n) => `.${n}`),
  ...FOOTER_BLOCKS.map((n) => `[data-aue-model="${n}"]`),
].join(', ');

/**
 * Ensure className starts with the block name (decorateBlock uses classList[0]).
 * @param {Element} el
 * @param {string} name
 */
function ensureBlockClass(el, name) {
  if (el.classList[0] === name) return;
  const rest = [...el.classList].filter((c) => c !== name);
  el.className = [name, ...rest].join(' ').trim();
}

/**
 * EDS only decorates `section > div > div`. Nested Site Footer (section-in-section)
 * leaves footer-* blocks undecorated so their CSS/JS never load — fix that.
 * @param {Element} root
 */
export function decorateNestedFooterBlocks(root) {
  if (!root) return;
  FOOTER_BLOCKS.forEach((name) => {
    root.querySelectorAll(`.${name}, [data-aue-model="${name}"]`).forEach((el) => {
      if (el.dataset.blockStatus) return;
      ensureBlockClass(el, name);
      decorateBlock(el);
    });
  });
}

/**
 * Ensure footer sections get theme classes (UE authoring + live /footer fragment).
 * Does not paint nav green when authors nest Site Footer under a shared Section.
 * @param {Element} root
 */
export default function applyFooterTheme(root) {
  if (!root) return;

  root.querySelectorAll('[data-aue-model="footer"], [data-aue-model="hrblock-footer"]').forEach((el) => {
    el.classList.add('section', 'site-footer', 'green-dark-theme');
    if (!el.dataset.sectionStatus) el.dataset.sectionStatus = 'initialized';
  });

  root.querySelectorAll('.section, [data-aue-model="section"]').forEach((section) => {
    const model = section.getAttribute('data-aue-model');
    if (model === 'footer' || model === 'hrblock-footer') return;
    const hasFooter = section.querySelector(FOOTER_SEL);
    const hasNav = section.querySelector(NAV_SEL);
    const styled = section.classList.contains('site-footer')
      || section.classList.contains('green-dark-theme');
    if ((hasFooter && !hasNav) || (styled && !hasNav)) {
      section.classList.add('site-footer', 'green-dark-theme');
    }
  });
}
