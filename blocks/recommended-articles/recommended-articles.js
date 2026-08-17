import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(node) {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getDirectChildren(node) {
  return node ? [...node.children] : [];
}

function getImageElement(node) {
  if (!node) return null;
  const picture = node.querySelector('picture');
  if (picture) return picture.cloneNode(true);

  const img = node.querySelector('img');
  return img ? img.cloneNode(true) : null;
}

function createCard({ imageNode, imageAltNode, sectionNameNode, linkNode, linkTextNode }) {
  const link = linkNode?.querySelector?.('a[href]') || (linkNode?.tagName === 'A' ? linkNode : null);
  const href = link?.href || '#';
  const sectionName = getText(sectionNameNode);
  const linkText = getText(linkTextNode) || getText(link);
  const imageAlt = getText(imageAltNode);

  if (!sectionName && !linkText) return null;

  const li = document.createElement('li');
  li.className = 'recommended-articles-item';

  const anchor = document.createElement('a');
  anchor.className = 'recommended-articles-card';
  anchor.href = href;

  if (link) {
    moveInstrumentation(link, anchor);
  }

  const image = getImageElement(imageNode);
  if (image) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'recommended-articles-card-image';

    const imageTag = image.tagName === 'PICTURE' ? image.querySelector('img') : image;
    if (imageAlt && imageTag && !imageTag.alt) {
      imageTag.alt = imageAlt;
    }

    imageWrap.append(image);
    anchor.append(imageWrap);
  }

  const content = document.createElement('div');
  content.className = 'recommended-articles-card-content';

  if (sectionName) {
    const sectionNameEl = document.createElement('p');
    sectionNameEl.className = 'recommended-articles-section-name';
    sectionNameEl.textContent = sectionName;
    moveInstrumentation(sectionNameNode, sectionNameEl);
    content.append(sectionNameEl);
  }

  if (linkText) {
    const linkTextEl = document.createElement('p');
    linkTextEl.className = 'recommended-articles-link-text';
    linkTextEl.textContent = linkText;
    moveInstrumentation(linkTextNode || linkNode, linkTextEl);
    content.append(linkTextEl);
  }

  anchor.append(content);
  li.append(anchor);
  return li;
}

function getFieldGroups(block) {
  const fieldNodes = [...block.querySelectorAll('[data-aue-prop^="articles/"]')];
  if (!fieldNodes.length) return [];

  const groups = new Map();
  fieldNodes.forEach((node) => {
    const prop = node.getAttribute('data-aue-prop') || '';
    const match = prop.match(/^articles\/(\d+)\/([^/]+)$/);
    if (!match) return;

    const [, index, fieldName] = match;
    if (!groups.has(index)) groups.set(index, {});
    groups.get(index)[fieldName] = node;
  });

  return [...groups.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, fields]) => fields);
}

function buildCardsFromFlatRow(row) {
  const root = row.querySelector(':scope > div') || row;
  const segments = [];
  let current = [];

  getDirectChildren(root).forEach((node) => {
    if (node.tagName === 'HR') {
      if (current.length) segments.push(current);
      current = [];
      return;
    }

    const hasContent = getText(node) || node.querySelector('a[href], picture, img');
    if (hasContent) current.push(node);
  });

  if (current.length) segments.push(current);

  return segments
    .map((segment) => {
      const imageNode = segment.find((node) => node.querySelector('picture, img'));
      const linkNode = segment.find((node) => node.querySelector('a[href]') || node.tagName === 'A');
      const textNodes = segment.filter((node) => node !== imageNode && node !== linkNode && getText(node));
      return createCard({
        imageNode,
        sectionNameNode: textNodes[0],
        linkNode,
        linkTextNode: textNodes[1],
      });
    })
    .filter(Boolean);
}

function buildCardFromRow(row) {
  const cells = getDirectChildren(row).filter((child) => getText(child) || child.querySelector('a[href], picture, img'));
  const imageNode = cells.find((node) => node.querySelector('picture, img'));
  const linkNode = cells.find((node) => node.querySelector('a[href]') || node.tagName === 'A');
  const textNodes = cells.filter((node) => node !== imageNode && node !== linkNode && getText(node));

  return createCard({
    imageNode,
    sectionNameNode: textNodes[0],
    linkNode,
    linkTextNode: textNodes[1],
  });
}

export default function decorate(block) {
  const children = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'recommended-articles-content';

  const titleCell = block.querySelector('[data-aue-prop="title"]') || children.find((child) => getText(child));
  if (titleCell) {
    const title = document.createElement('h2');
    title.className = 'recommended-articles-title';
    title.textContent = getText(titleCell);
    moveInstrumentation(titleCell, title);
    wrapper.append(title);
  }

  const list = document.createElement('ul');
  list.className = 'recommended-articles-list';

  const fieldGroups = getFieldGroups(block);
  if (fieldGroups.length) {
    fieldGroups.forEach((fields) => {
      const card = createCard({
        imageNode: fields.image,
        imageAltNode: fields.imageAlt,
        sectionNameNode: fields.sectionName,
        linkNode: fields.link,
        linkTextNode: fields.linkText,
      });

      if (card) list.append(card);
    });
  } else {
    const rows = children
      .filter((child) => child !== titleCell)
      .filter((child) => getText(child) || child.querySelector('a[href], picture, img'));

    rows.forEach((row) => {
      const cards = row.querySelector('hr') ? buildCardsFromFlatRow(row) : [buildCardFromRow(row)].filter(Boolean);
      cards.forEach((card) => list.append(card));
    });
  }

  if (!list.children.length) return;

  wrapper.append(list);
  block.replaceChildren(wrapper);
}
