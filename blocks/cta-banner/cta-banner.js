import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(node) {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getDirectChildren(node) {
  return node ? [...node.children] : [];
}

const CTA_TYPES = ['primary', 'secondary', 'right-arrow'];

function normalizeType(value) {
  const normalized = (value || '').toLowerCase().trim();
  return CTA_TYPES.includes(normalized) ? normalized : '';
}

function typeFromClassList(node) {
  if (!node?.classList) return '';
  return CTA_TYPES.find((type) => node.classList.contains(type)) || '';
}

function typeFromAttributes(node) {
  if (!node?.getAttribute) return '';

  return normalizeType(
    node.getAttribute('data-link-type')
    || node.getAttribute('data-type')
    || node.getAttribute('data-cta-type')
    || '',
  );
}

function inferTypeFromMarkup(node) {
  if (!node) return '';

  const classType = typeFromClassList(node);
  if (classType) return classType;

  const attrType = typeFromAttributes(node);
  if (attrType) return attrType;

  if (node.matches?.('li') && node.querySelector('strong a, strong')) {
    return 'primary';
  }

  return '';
}

function getCtaFieldGroups(block) {
  const fieldNodes = [...block.querySelectorAll('[data-aue-prop^="ctas/"]')];
  if (!fieldNodes.length) return [];

  const groups = new Map();
  fieldNodes.forEach((node) => {
    const prop = node.getAttribute('data-aue-prop') || '';
    const match = prop.match(/^ctas\/(\d+)\/([^/]+)$/);
    if (!match) return;

    const [, index, fieldName] = match;
    if (!groups.has(index)) groups.set(index, {});
    groups.get(index)[fieldName] = node;
  });

  return [...groups.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, fields]) => fields);
}

function getCtaRowsFromMarkup(row) {
  const root = row.querySelector(':scope > div') || row;
  const listItems = [...root.querySelectorAll(':scope ul > li')];
  if (listItems.length) return listItems;

  const groups = [];
  let current = [];

  getDirectChildren(root).forEach((child) => {
    if (child.tagName === 'HR') {
      if (current.length) groups.push(current);
      current = [];
      return;
    }

    if (getText(child) || child.querySelector('a[href]')) {
      current.push(child);
    }
  });

  if (current.length) groups.push(current);
  if (groups.length) return groups;

  return getText(root) || root.querySelector('a[href]') ? [[...getDirectChildren(root)]] : [];
}

function decorateButtons(rows) {
  const buttonList = document.createElement('div');
  buttonList.className = 'cta-banner-buttons';

  function getHref(linkCell) {
    const anchor = linkCell?.matches?.('a[href]') ? linkCell : linkCell?.querySelector?.('a[href]');
    if (anchor?.href) return anchor.href;

    const text = linkCell?.textContent?.trim();
    if (!text) return '';
    if (/^https?:\/\//i.test(text)) return text;
    if (/^www\./i.test(text)) return `https://${text}`;
    return text;
  }

  function getTypeFromCell(cell) {
    if (!cell) return '';

    const classType = typeFromClassList(cell);
    if (classType) return classType;

    const attrType = typeFromAttributes(cell);
    if (attrType) return attrType;

    const directType = normalizeType(getText(cell));
    if (directType) return directType;

    const nestedTypeNode = cell.querySelector?.('[data-aue-prop$="/linkType"]');
    return normalizeType(getText(nestedTypeNode));
  }

  function parseRow(row) {
    const cells = Array.isArray(row) ? row : [row];
    const linkCell = cells.find((cell) => cell.matches?.('a[href], [data-aue-prop$="/link"], [data-aue-prop$="/linkText"]')
      || cell.querySelector?.('a[href]')) || null;
    const sourceNode = linkCell?.matches?.('a[href]') ? linkCell : linkCell?.querySelector?.('a[href]') || linkCell;
    const typeCell = cells.find((cell) => getTypeFromCell(cell)) || null;
    const textCell = cells.find((cell) => cell !== linkCell
      && cell !== typeCell
      && (cell.matches?.('[data-aue-prop$="/linkText"]') || !!getText(cell))) || null;
    const href = getHref(linkCell);

    if (!href) return null;

    const inferredType = getTypeFromCell(typeCell)
      || inferTypeFromMarkup(Array.isArray(row) ? null : row)
      || inferTypeFromMarkup(linkCell)
      || inferTypeFromMarkup(sourceNode);

    return {
      href,
      sourceNode,
      type: inferredType,
      text: getText(textCell) || getText(sourceNode) || getText(linkCell) || href,
    };
  }

  const ctas = rows.map((row) => parseRow(row)).filter(Boolean);
  if (!ctas.length) return buttonList;

  ctas.forEach((cta) => {
    const buttonWrapper = document.createElement('p');
    buttonWrapper.className = 'button-wrapper';

    const button = document.createElement('a');
    moveInstrumentation(cta.sourceNode, button);
    button.href = cta.href;
    button.className = 'button';

    const linkType = cta.type || 'secondary';
    button.setAttribute('data-link-type', linkType);
    const buttonText = cta.text;

    if (linkType === 'primary') {
      button.textContent = buttonText;
      button.classList.add('primary');
    } else if (linkType === 'secondary') {
      button.textContent = buttonText;
      button.classList.add('secondary');
    } else if (linkType === 'right-arrow') {
      button.innerHTML = `<span class="arrow-link-text">${buttonText}</span>`;
      button.classList.add('arrow-link');
    } else {
      button.textContent = buttonText;
      button.classList.add('secondary');
    }

    buttonWrapper.append(button);
    buttonList.append(buttonWrapper);
  });

  return buttonList;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const banner = document.createElement('div');
  banner.className = 'cta-banner-layout';

  const imageCell = rows[0]?.querySelector('picture, img');
  const titleCell = rows[1];

  const imageWrap = document.createElement('div');
  imageWrap.className = 'cta-banner-image';
  if (imageCell) {
    const img = imageCell.tagName === 'IMG' ? imageCell : imageCell.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '100' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      imageWrap.append(optimized);
    }
  }

  const contentWrap = document.createElement('div');
  contentWrap.className = 'cta-banner-content';
  const fieldGroups = getCtaFieldGroups(block);
  const ctaRows = fieldGroups.length
    ? fieldGroups.map((fields) => [
      fields.link || fields.linkText || fields.buttonText,
      fields.linkText,
      fields.linkType,
    ].filter(Boolean))
    : rows.slice(2).flatMap((row) => getCtaRowsFromMarkup(row));

  if (titleCell) {
    const title = document.createElement('div');
    title.className = 'main-heading';
    moveInstrumentation(titleCell, title);
    title.textContent = titleCell.textContent.trim();
    contentWrap.append(title);
  }

  if (ctaRows.length) {
    contentWrap.append(decorateButtons(ctaRows));
  }

  banner.append(imageWrap, contentWrap);
  block.replaceChildren(banner);
}
