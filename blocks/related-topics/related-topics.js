import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(node) {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getDirectChildren(node) {
  return node ? [...node.children] : [];
}

function buildTopicItemFromRow(row) {
  const item = document.createElement('li');
  item.className = 'related-topics__item';
  moveInstrumentation(row, item);

  const cells = getDirectChildren(row).filter((child) => getText(child) || child.querySelector('a[href]') || child.tagName === 'A');
  const buttonCell = cells.find((child) => child.querySelector('a[href]') || child.tagName === 'A');
  const link = buttonCell?.querySelector('a[href]') || buttonCell;
  const textCells = cells.filter((child) => child !== buttonCell && getText(child));
  const buttonTextCell = textCells[0];
  const infoCell = textCells[1];

  if (link?.tagName === 'A') {
    const button = document.createElement('a');
    button.className = 'related-topics__button';
    button.href = link.href;
    button.textContent = getText(link) || getText(buttonTextCell);
    moveInstrumentation(link, button);
    if (buttonTextCell) {
      moveInstrumentation(buttonTextCell, button);
    }
    item.append(button);
  }

  if (infoCell) {
    const info = document.createElement('p');
    info.className = 'related-topics__info';
    info.textContent = getText(infoCell);
    moveInstrumentation(infoCell, info);
    item.append(info);
  }

  return item;
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
  const item = document.createElement('li');
  item.className = 'related-topics__item';

  const linkField = fields.link;
  const buttonTextField = fields.buttonText;
  const infoField = fields.topicInfo;

  const linkNode = linkField?.querySelector('a[href]');
  const href = linkNode?.href;
  const buttonText = getText(buttonTextField) || getText(linkNode);

  if (buttonText) {
    const button = document.createElement(href ? 'a' : 'span');
    button.className = 'related-topics__button';
    button.textContent = buttonText;
    if (href) button.href = href;

    if (linkNode) {
      moveInstrumentation(linkNode, button);
    } else if (buttonTextField) {
      moveInstrumentation(buttonTextField, button);
    }

    item.append(button);
  }

  const infoText = getText(infoField);
  if (infoText) {
    const info = document.createElement('p');
    info.className = 'related-topics__info';
    info.textContent = infoText;
    moveInstrumentation(infoField, info);
    item.append(info);
  }

  return item;
}

export default function decorate(block) {
  const children = [...block.children];

  const wrapper = document.createElement('div');
  wrapper.className = 'related-topics__content';

  const titleCell = block.querySelector('[data-aue-prop="title"]')
    || children.find((child) => getText(child));

  if (titleCell) {
    const title = document.createElement('h2');
    title.className = 'related-topics__title';
    title.textContent = getText(titleCell);
    moveInstrumentation(titleCell, title);
    wrapper.append(title);
  }

  const list = document.createElement('ul');
  list.className = 'related-topics__list';

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
      const item = buildTopicItemFromRow(row);
      if (item.children.length) {
        list.append(item);
      }
    });
  }

  if (!list.children.length) return;

  wrapper.append(list);
  block.replaceChildren(wrapper);
}