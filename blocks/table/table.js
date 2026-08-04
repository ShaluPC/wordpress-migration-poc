import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(value) {
  return value?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getItems(cell) {
  const list = cell?.querySelector(':scope > ul');
  if (list) return [...list.children];
  return [...(cell?.children || [])];
}

function extractItems(cell) {
  const items = getItems(cell);
  if (items.length) return items;
  const text = getText(cell);
  return text ? [cell] : [];
}

function unwrapSingleChild(node) {
  let current = node;
  while (current?.children?.length === 1 && current.children[0].children.length) {
    current = current.children[0];
  }
  return current;
}

export default function decorate(block) {
  const sections = [...block.children];
  if (!sections.length) return;

  const headersCell = sections[0];
  const rowsCell = sections[1];

  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'table-scroll';

  const table = document.createElement('table');
  table.className = 'table-grid';

  const headerItems = getItems(unwrapSingleChild(headersCell));
  if (headerItems.length) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headerItems.forEach((item, index) => {
      const th = document.createElement('th');
      moveInstrumentation(item, th);
      th.scope = 'col';
      th.textContent = getText(item);
      if (index === 0) th.classList.add('table-row-title');
      headerRow.append(th);
    });

    thead.append(headerRow);
    table.append(thead);
  }

  const rowItems = getItems(unwrapSingleChild(rowsCell));
  if (rowItems.length) {
    const tbody = document.createElement('tbody');

    rowItems.forEach((rowItem) => {
      const tr = document.createElement('tr');
      moveInstrumentation(rowItem, tr);

      const rowContent = unwrapSingleChild(rowItem);
      const rowChildren = [...rowContent.children];
      const rowTitleCell = rowChildren[0];
      let dataCells = rowChildren.slice(1);

      if (dataCells.length === 1) {
        const nestedDataCells = extractItems(unwrapSingleChild(dataCells[0]));
        if (nestedDataCells.length > 1) dataCells = nestedDataCells;
      }

      const rowTitle = document.createElement('th');
      rowTitle.scope = 'row';
      rowTitle.className = 'table-row-title';
      rowTitle.textContent = getText(rowTitleCell);
      tr.append(rowTitle);

      dataCells.forEach((valueItem) => {
        const td = document.createElement('td');
        moveInstrumentation(valueItem, td);
        td.textContent = getText(valueItem);
        tr.append(td);
      });

      tbody.append(tr);
    });

    table.append(tbody);
  }

  scrollWrap.append(table);
  block.replaceChildren(scrollWrap);
}