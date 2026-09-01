import { createOptimizedPicture } from '../../scripts/aem.js';
import { keepAuthoredDom, moveInstrumentation } from '../../scripts/scripts.js';

let topicPanelCount = 0;

/**
 * Optimize same-origin raster images; keep SVG / external assets as authored.
 * @param {HTMLImageElement} img
 * @param {string} alt
 * @returns {Element}
 */
function wrapIconImage(img, alt) {
  const label = alt || img.alt || '';
  try {
    const url = new URL(img.src, window.location.href);
    const isSvg = url.pathname.toLowerCase().endsWith('.svg');
    if (url.origin === window.location.origin && !isSvg) {
      const optimized = createOptimizedPicture(img.src, label, false, [{ width: '48' }]);
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
 * Mark the current tax-center topic as active.
 * @param {Element} list
 */
function markCurrent(list) {
  const here = window.location.pathname.replace(/\/$/, '') || '/';
  list.querySelectorAll('a[href]').forEach((link) => {
    try {
      const path = new URL(link.href, window.location.href).pathname.replace(/\/$/, '') || '/';
      if (path !== '/' && (here === path || here.startsWith(`${path}/`))) {
        link.setAttribute('aria-current', 'page');
      }
    } catch {
      // ignore invalid hrefs
    }
  });
}

/**
 * Nav Secondary — tax-center topic bar (Explore All Topics + category links).
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .nav-secondary-inner')) return;
  if (keepAuthoredDom(block)) {
    block.querySelectorAll('a').forEach((link) => link.classList.add('nav-secondary-link'));
    return;
  }

  const rows = [...block.children];
  if (!rows.length) return;

  const inner = document.createElement('div');
  inner.className = 'nav-secondary-inner';

  const list = document.createElement('ul');
  list.className = 'nav-secondary-list';
  list.setAttribute('aria-label', 'Tax Center topics');

  rows.forEach((row) => {
    const link = row.querySelector('a');
    const img = row.querySelector('img');
    const topics = row.querySelector('ul');
    if (!link) return;

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const label = (link.getAttribute('title') || link.textContent || img?.alt || '').trim();
    link.classList.add('nav-secondary-link');
    if (label) link.setAttribute('aria-label', label);
    if (img) link.prepend(wrapIconImage(img, label));

    if (topics && topics !== link.closest('ul')) {
      li.classList.add('nav-secondary-explore');
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-secondary-explore-btn';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-haspopup', 'true');
      while (link.firstChild) trigger.append(link.firstChild);
      if (!trigger.textContent.trim() && label) {
        trigger.append(document.createTextNode(label));
      }

      topics.className = 'nav-secondary-topics';
      topicPanelCount += 1;
      const panelId = `nav-secondary-topics-${topicPanelCount}`;
      topics.id = panelId;
      trigger.setAttribute('aria-controls', panelId);

      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
        li.classList.toggle('is-open', !open);
      });

      document.addEventListener('click', (e) => {
        if (li.contains(e.target)) return;
        trigger.setAttribute('aria-expanded', 'false');
        li.classList.remove('is-open');
      });

      li.append(trigger, topics);
    } else {
      li.append(link);
    }

    list.append(li);
  });

  markCurrent(list);
  inner.append(list);
  block.replaceChildren(inner);
}
