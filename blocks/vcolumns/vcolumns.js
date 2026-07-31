// eslint-disable-next-line import/no-cycle
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

const MAX_COLUMNS = 4;
const NESTED_BLOCK_SELECTOR = [
  '.breadcrumb',
  '.cards',
  '.hero',
  '.fragment',
  '.columns',
  '.vcolumns',
].join(', ');

const CONFIG_KEYS = {
  columns: 'columns',
  'column count': 'columns',
  'column widths': 'columnWidths',
  'column widths (%)': 'columnWidths',
  columnwidths: 'columnWidths',
};

function normalizeKey(value) {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function parseConfig(block) {
  const config = {
    columns: 2,
    columnWidths: '',
  };

  const configRows = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const key = normalizeKey(cells[0].textContent);
    const mapped = CONFIG_KEYS[key];
    if (!mapped) return;

    configRows.push(row);
    const rawValue = cells[1].textContent.trim();
    if (mapped === 'columns') {
      const parsed = Number.parseInt(rawValue, 10);
      if (!Number.isNaN(parsed)) {
        config.columns = Math.min(MAX_COLUMNS, Math.max(1, parsed));
      }
    }

    if (mapped === 'columnWidths') {
      config.columnWidths = rawValue;
    }
  });

  configRows.forEach((row) => row.remove());
  return config;
}

function parsePercentage(value) {
  const cleaned = (value || '').replace('%', '').trim();
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed) || parsed <= 0 || parsed > 100) return null;
  return parsed;
}

function parseColumnWidths(raw, columnCount) {
  const parts = (raw || '')
    .split(',')
    .map((part) => parsePercentage(part))
    .filter((value) => value !== null);

  if (parts.length !== columnCount) return [];
  const total = parts.reduce((sum, value) => sum + value, 0);
  if (total > 100.01) return [];
  return parts;
}

function toBackgroundClass(value) {
  const token = (value || '').toLowerCase().trim();
  if (!token || token === 'none') return '';
  return `vcolumns-bg-${token}`;
}

function decorateRow(row, widthPercentage) {
  const cells = [...row.children];
  const contentCell = cells[0];
  const backgroundCell = cells.length > 2 ? cells[2] : cells[1];

  const column = document.createElement('div');
  column.className = 'vcolumns-col';

  const backgroundRaw = backgroundCell?.textContent?.trim() || '';
  const backgroundClass = toBackgroundClass(backgroundRaw);
  if (backgroundClass) column.classList.add(backgroundClass);

  if (widthPercentage) {
    column.style.flex = `0 0 ${widthPercentage}%`;
    column.style.maxWidth = `${widthPercentage}%`;
  }

  if (contentCell) {
    while (contentCell.firstChild) {
      column.append(contentCell.firstChild);
    }
  }

  return column;
}

export default async function decorate(block) {
  const config = parseConfig(block);
  const targetColumns = Math.min(MAX_COLUMNS, config.columns);
  const rows = [...block.children].slice(0, targetColumns);
  while (rows.length < targetColumns) {
    rows.push(document.createElement('div'));
  }

  const widths = parseColumnWidths(config.columnWidths, targetColumns);

  const grid = document.createElement('div');
  grid.className = 'vcolumns-grid vcolumns-mode-percentage';

  rows.forEach((row, index) => {
    grid.append(decorateRow(row, widths[index]));
  });

  block.replaceChildren(grid);

  const nestedBlocks = [];
  [...block.querySelectorAll(`.vcolumns-col ${NESTED_BLOCK_SELECTOR}`)].forEach((candidate) => {
    if (candidate.classList.contains('block')) {
      nestedBlocks.push(candidate);
      return;
    }
    decorateBlock(candidate);
    if (candidate.classList.contains('block')) nestedBlocks.push(candidate);
  });

  await Promise.all(nestedBlocks.map((nestedBlock) => loadBlock(nestedBlock)));
}