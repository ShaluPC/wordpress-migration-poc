import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(node) {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getDirectChildren(node) {
  return node ? [...node.children] : [];
}

function buildTopicItem(row) {
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

export default function decorate(block) {
  const children = [...block.children].filter((child) => getText(child) || child.querySelector('a[href]'));
  if (!children.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'related-topics__content';

  const titleCell = children.shift();
  if (titleCell) {
    const title = document.createElement('h2');
    title.className = 'related-topics__title';
    title.textContent = getText(titleCell);
    moveInstrumentation(titleCell, title);
    wrapper.append(title);
  }

  const list = document.createElement('ul');
  list.className = 'related-topics__list';

  children.forEach((row) => {
    const item = buildTopicItem(row);
    if (item.children.length) {
      list.append(item);
    }
  });

  wrapper.append(list);
  block.replaceChildren(wrapper);
}