import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(value) {
  return value?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getItems(cell) {
  const list = cell?.querySelector(':scope > ul');
  if (list) return [...list.children];
  return [...(cell?.children || [])];
}

// function extractItems(cell) {
//   const items = getItems(cell);
//   if (items.length) return items;
//   const text = getText(cell);
//   return text ? [cell] : [];
// }

function unwrapSingleChild(node) {
  let current = node;
  while (current?.children?.length === 1 && current.children[0].children.length) {
    [current] = current.children;
  }
  return current;
}

function getRowGroups(rowsCell) {
  const root = unwrapSingleChild(rowsCell);
  const titles = [...root.querySelectorAll('p[data-aue-prop$="/rowTitle"]')];

  if (titles.length) {
    return titles.map((titleCell) => ({
      titleCell,
      dataCells: [...(titleCell.parentElement?.querySelector(':scope > ul')?.children || [])],
    }));
  }

  const rowCells = [...root.querySelectorAll(':scope > ul')];
  if (rowCells.length) {
    return rowCells.map((cellsCell) => ({ dataCells: [...cellsCell.children], titleCell: null }));
  }

  return [...root.children].map((rowItem) => {
    const rowContent = unwrapSingleChild(rowItem);
    const titleCell = rowContent?.querySelector?.('p[data-aue-prop$="/rowTitle"]') || null;
    const cellsCell = rowContent?.querySelector?.(':scope > ul') || rowContent?.querySelector?.('ul');
    const dataCells = cellsCell
      ? [...cellsCell.children]
      : [...(rowContent?.children || [])].filter((child) => child !== titleCell);
    return { titleCell, dataCells };
  });
}

export default function decorate(block) {
  const sections = [...block.children];
  if (!sections.length) return;

  const fixedLayout = block.classList.contains('fixed-layout');
  const headersCell = sections[0];
  const rowsCell = sections[1];

  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'table-scroll';

  const table = document.createElement('table');
  table.className = 'table-grid';
  if (fixedLayout) table.classList.add('table-grid--fixed');

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

    rowGroups.forEach(({ titleCell, dataCells }) => {
      const tr = document.createElement('tr');
      if (titleCell) moveInstrumentation(titleCell, tr);

      if (titleCell) {
        const rowTitle = document.createElement('th');
        rowTitle.scope = 'row';
        rowTitle.className = 'table-row-title';
        rowTitle.textContent = getText(titleCell);
        tr.append(rowTitle);
      }

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
