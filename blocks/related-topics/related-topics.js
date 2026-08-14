import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(node) {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getDirectChildren(node) {
  return node ? [...node.children] : [];
}

function buildTopicItem(linkNode, buttonTextNode, infoNode) {
  const item = document.createElement('li');
  item.className = 'related-topics-item';

  const link = linkNode?.querySelector?.('a[href]') || (linkNode?.tagName === 'A' ? linkNode : null);
  const href = link?.href;
  const buttonText = getText(buttonTextNode) || getText(link);

  if (buttonText) {
    const button = document.createElement('a');
    button.className = 'related-topics-button';
    button.href = href || '#';

    const buttonTextSpan = document.createElement('span');
    buttonTextSpan.className = 'related-topics-button-text';
    buttonTextSpan.textContent = buttonText;
    button.append(buttonTextSpan);

    if (link) {
      moveInstrumentation(link, button);
    } else if (buttonTextNode) {
      moveInstrumentation(buttonTextNode, button);
    }

    item.append(button);
  }

  if (infoNode && getText(infoNode)) {
    const info = document.createElement('p');
    info.className = 'related-topics-info';
    info.textContent = getText(infoNode);
    moveInstrumentation(infoNode, info);
    item.append(info);
  }

  return item;
}

function buildTopicItemFromRow(row) {
  const cells = getDirectChildren(row).filter((child) => getText(child) || child.querySelector('a[href]') || child.tagName === 'A');
  const linkNode = cells.find((child) => child.querySelector('a[href]') || child.tagName === 'A');
  const textCells = cells.filter((child) => child !== linkNode && getText(child));
  const buttonTextNode = textCells[0];
  const infoNode = textCells[1];

  return buildTopicItem(linkNode, buttonTextNode, infoNode);
}

function buildTopicItemsFromFlatRow(row) {
  const root = row.querySelector(':scope > div') || row;
  const segments = [];
  let current = [];

  getDirectChildren(root).forEach((node) => {
    if (node.tagName === 'HR') {
      if (current.length) segments.push(current);
      current = [];
      return;
    }

    if (node.tagName === 'P' || node.tagName === 'DIV' || node.tagName === 'A') {
      if (getText(node) || node.querySelector('a[href]')) {
        current.push(node);
      }
    }
  });

  if (current.length) segments.push(current);

  return segments.map((segment) => {
    const linkNode = segment.find((node) => node.querySelector('a[href]') || node.tagName === 'A');
    const textNodes = segment.filter((node) => node !== linkNode && getText(node));
    const buttonTextNode = textNodes[0];
    const infoNode = textNodes[1];
    return buildTopicItem(linkNode, buttonTextNode, infoNode);
  });
}

function getTopicFieldGroups(block) {
  const fieldNodes = [...block.querySelectorAll('[data-aue-prop^="topics/"]')];
  if (!fieldNodes.length) return [];

  const groups = new Map();

  fieldNodes.forEach((fieldNode) => {
    const prop = fieldNode.getAttribute('data-aue-prop') || '';
    const match = prop.match(/^topics\/(\d+)\/([^/]+)$/);
    if (!match) return;

    const [, index, fieldName] = match;
    if (!groups.has(index)) groups.set(index, {});
    groups.get(index)[fieldName] = fieldNode;
  });

  return [...groups.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, fields]) => fields);
}

function buildTopicItemFromFields(fields) {
  const linkField = fields.link;
  const buttonTextField = fields.linkText || fields.buttonText;
  const infoField = fields.topicInfo;
  return buildTopicItem(linkField, buttonTextField, infoField);
}

export default function decorate(block) {
  const children = [...block.children];

  const wrapper = document.createElement('div');
  wrapper.className = 'related-topics-content';

  const titleCell = block.querySelector('[data-aue-prop="title"]')
    || children.find((child) => getText(child));

  if (titleCell) {
    const title = document.createElement('h2');
    title.className = 'related-topics-title';
    title.textContent = getText(titleCell);
    moveInstrumentation(titleCell, title);
    wrapper.append(title);
  }

  const list = document.createElement('ul');
  list.className = 'related-topics-list';

  const fieldGroups = getTopicFieldGroups(block);

  if (fieldGroups.length) {
    fieldGroups.forEach((fields) => {
      const item = buildTopicItemFromFields(fields);
      if (item.children.length) {
        list.append(item);
      }
    });
  } else {
    const rows = children
      .filter((child) => child !== titleCell)
      .filter((child) => getText(child) || child.querySelector('a[href]'));

    rows.forEach((row) => {
      const hasFlatMarkup = !!row.querySelector('hr');
      const items = hasFlatMarkup ? buildTopicItemsFromFlatRow(row) : [buildTopicItemFromRow(row)];

      items.forEach((item) => {
        if (item.children.length) {
          list.append(item);
        }
      });
    });
  }

  if (!list.children.length) return;

  wrapper.append(list);
  block.replaceChildren(wrapper);
}
