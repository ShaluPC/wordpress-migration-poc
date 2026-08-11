import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(node) {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getChildItems(container) {
  if (!container) return [];
  const list = container.querySelector(':scope ul');
  if (list) return [...list.children];
  return [...container.children];
}

function buildPoints(pointsCell) {
  const list = document.createElement('ul');
  list.className = 'key-takeaways-points';

  getChildItems(pointsCell).forEach((item) => {
    const text = getText(item);
    if (!text) return;

    const li = document.createElement('li');
    moveInstrumentation(item, li);
    li.textContent = text;
    list.append(li);
  });

  return list;
}

export default function decorate(block) {
  const children = [...block.children];
  if (!children.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'key-takeaways-content';

  const titleCell = children.find((child) => getText(child));
  if (titleCell) {
    const title = document.createElement('h2');
    moveInstrumentation(titleCell, title);
    title.className = 'key-takeaways-title';
    title.textContent = getText(titleCell);
    wrapper.append(title);
  }

  const pointsCell = children.find((child) => child !== titleCell && getChildItems(child).length);
  if (pointsCell) {
    wrapper.append(buildPoints(pointsCell));
  }

  block.replaceChildren(wrapper);
}
