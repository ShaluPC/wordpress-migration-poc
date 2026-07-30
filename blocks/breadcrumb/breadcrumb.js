import { moveInstrumentation } from '../../scripts/scripts.js';

const LABEL_OVERRIDES = {
  'tax-center': 'Tax Information Center',
};

const titleCase = (value) => value
  .toLowerCase()
  .split(' ')
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const toLabelFromSegment = (segment) => {
  const cleaned = decodeURIComponent(segment || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return LABEL_OVERRIDES[segment] || titleCase(cleaned);
};

async function resolveLabel(path, fallback) {
  try {
    const response = await fetch(`${path}.plain.html`);
    if (!response.ok) return fallback;

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const heading = doc.querySelector('h1, h2, title');

    return heading?.textContent?.trim() || fallback;
  } catch {
    return fallback;
  }
}

function parseMode(block) {
  const modeFromData = block.dataset.displayMode;
  if (modeFromData === 'manual' || modeFromData === 'auto') {
    return modeFromData;
  }

  const firstRow = block.firstElementChild;
  if (!firstRow || firstRow.children.length < 2) {
    return 'auto';
  }

  const key = firstRow.children[0].textContent.trim().toLowerCase();
  const value = firstRow.children[1].textContent.trim().toLowerCase();

  if (key.includes('display mode') || key === 'mode') {
    return value === 'manual' ? 'manual' : 'auto';
  }

  return 'auto';
}

function parseManualItems(block) {
  const rows = [...block.children];
  return rows
    .map((row) => {
      const cells = [...row.children];
      if (!cells.length) return null;

      const firstLink = row.querySelector('a[href]');
      if (firstLink) {
        return {
          label: firstLink.textContent.trim(),
          href: firstLink.getAttribute('href'),
          source: row,
        };
      }

      if (cells.length >= 2) {
        const firstCellText = cells[0].textContent.trim();
        const secondCellText = cells[1].textContent.trim();
        if (firstCellText.toLowerCase().includes('display mode')) return null;

        if (firstCellText && secondCellText) {
          return {
            label: firstCellText,
            href: secondCellText,
            source: row,
          };
        }
      }

      return null;
    })
    .filter(Boolean);
}

async function buildAutoItems() {
  const segments = window.location.pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  // Last segment is treated as the current page, so it is not included.
  const parentSegments = segments.slice(0, -1);

  const items = await Promise.all(parentSegments.map(async (segment, index) => {
    const href = `/${parentSegments.slice(0, index + 1).join('/')}`;
    const fallback = toLabelFromSegment(segment);
    const label = await resolveLabel(href, fallback);

    return { label, href };
  }));

  return items.filter((item) => item.label && item.href);
}

function render(items, block) {
  if (!items.length) {
    block.textContent = '';
    return;
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');

  items.forEach((item) => {
    const li = document.createElement('li');
    const anchor = document.createElement('a');

    anchor.href = item.href;
    anchor.textContent = item.label;

    if (item.source) {
      moveInstrumentation(item.source, li);
      moveInstrumentation(item.source, anchor);
    }

    li.append(anchor);
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}

export default async function decorate(block) {
  const mode = parseMode(block);
  const items = mode === 'manual' ? parseManualItems(block) : await buildAutoItems();
  render(items, block);
}