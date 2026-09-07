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

function hasTopicContent(node) {
  return !!(node && (getText(node) || node.querySelector('a[href]') || node.tagName === 'A'));
}

function resolveTopicNodes(nodes) {
  const linkNode = nodes.find((node) => node.querySelector('a[href]') || node.tagName === 'A') || null;
  const textNodes = nodes.filter((node) => node !== linkNode && getText(node));

  if (textNodes.length >= 2) {
    return {
      linkNode,
      buttonTextNode: textNodes[0],
      infoNode: textNodes[1],
    };
  }

  if (textNodes.length === 1) {
    return {
      linkNode,
      buttonTextNode: linkNode ? null : textNodes[0],
      infoNode: linkNode ? textNodes[0] : null,
    };
  }

  return {
    linkNode,
    buttonTextNode: null,
    infoNode: null,
  };
}

function buildTopicItemFromNodes(nodes) {
  const { linkNode, buttonTextNode, infoNode } = resolveTopicNodes(nodes);
  return buildTopicItem(linkNode, buttonTextNode, infoNode);
}

function getFlatTopicGroups(root) {
  const groups = [];
  let current = [];

  getDirectChildren(root).forEach((node) => {
    if (node.tagName === 'HR') {
      if (current.length) groups.push(current);
      current = [];
      return;
    }

    if (hasTopicContent(node)) {
      current.push(node);
    }
  });

  if (current.length) groups.push(current);
  return groups;
}

function buildTopicItemsFromFlatRow(row) {
  const root = row.querySelector(':scope > div') || row;
  const groups = getFlatTopicGroups(root);

  if (groups.length > 1) {
    return groups.map((nodes) => buildTopicItemFromNodes(nodes));
  }

  const links = [...root.querySelectorAll('a[href]')];
  if (links.length <= 1) {
    return [buildTopicItemFromNodes(getDirectChildren(root).filter(hasTopicContent))];
  }

  return links.map((link) => {
    const linkNode = link.closest('p,div,li,a') || link;
    let infoNode = null;
    let cursor = linkNode.nextElementSibling;

    while (cursor) {
      if (cursor.querySelector('a[href]')) break;
      if (getText(cursor)) {
        infoNode = cursor;
        break;
      }
      cursor = cursor.nextElementSibling;
    }

    return buildTopicItem(linkNode, null, infoNode);
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
      .filter((child) => hasTopicContent(child) || child.querySelector('hr'));

    rows.forEach((row) => {
      const root = row.querySelector(':scope > div') || row;
      const hasFlatMarkup = !!root.querySelector('hr') || root.querySelectorAll('a[href]').length > 1;
      const items = hasFlatMarkup
        ? buildTopicItemsFromFlatRow(row)
        : [buildTopicItemFromNodes(getDirectChildren(row).filter(hasTopicContent))];

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
