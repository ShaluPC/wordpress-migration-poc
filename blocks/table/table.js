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

function splitCells(source) {
  const raw = source?.tagName === 'TEXTAREA' ? source.value : getText(source);
  return raw
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function unwrapSingleChild(node) {
  let current = node;
  while (current?.children?.length === 1 && current.children[0].children.length) {
    current = current.children[0];
  }
  return current;
}

function getRowGroups(rowsCell) {
  const root = unwrapSingleChild(rowsCell);
  const textareas = [...root.querySelectorAll('textarea[data-aue-prop$="/cells"], textarea')];

  if (textareas.length) {
    return textareas.map((textarea) => ({
      dataCells: splitCells(textarea),
    }));
  }

  const rowCells = [...root.querySelectorAll(':scope > ul')];
  if (rowCells.length) {
    return rowCells.map((cellsCell) => ({ dataCells: [...cellsCell.children].flatMap((cell) => splitCells(cell)) }));
  }

  return [...root.children].map((rowItem) => {
    const rowContent = unwrapSingleChild(rowItem);
    const cellsCell = rowContent?.querySelector?.('textarea[data-aue-prop$="/cells"]')
      || rowContent?.querySelector?.('textarea')
      || rowContent?.querySelector?.(':scope > ul')
      || rowContent?.querySelector?.('ul');
    return { dataCells: cellsCell ? splitCells(cellsCell) : [] };
  });
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

  const rowGroups = getRowGroups(rowsCell).filter(({ dataCells }) => dataCells.length);
  if (rowGroups.length) {
    const tbody = document.createElement('tbody');

    rowGroups.forEach(({ dataCells }) => {
      const tr = document.createElement('tr');

      dataCells.forEach((valueItem) => {
        const td = document.createElement('td');
        td.textContent = valueItem;
        tr.append(td);
      });

      tbody.append(tr);
    });

    table.append(tbody);
  }

  scrollWrap.append(table);
  block.replaceChildren(scrollWrap);
}