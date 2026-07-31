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

function buildAutoItems() {
  const segments = resolvePagePath()
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  // Last segment is treated as the current page, so it is not included.
  const parentSegments = segments.slice(0, -1);

  const items = parentSegments.map((segment, index) => {
    const href = `/${parentSegments.slice(0, index + 1).join('/')}`;
    const label = toLabelFromSegment(segment);

    return { label, href };
  });

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

    li.append(anchor);
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}

export default async function decorate(block) {
  const items = buildAutoItems();
  render(items, block);
}
