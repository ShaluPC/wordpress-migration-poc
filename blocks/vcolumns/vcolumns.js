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
    configRows: [],
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const key = normalizeKey(cells[0].textContent);
    const mapped = CONFIG_KEYS[key];
    if (!mapped) return;

    config.configRows.push(row);
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

  config.configRows.forEach((row) => row.remove());
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

function isAuthoringContext(block) {
  return !!(block.closest('[data-aue-resource]') || block.querySelector('[data-aue-resource]'));
}

function applyColumnStyles(column, widthPercentage, backgroundRaw) {
  column.classList.add('vcolumns-col');
  const backgroundClass = toBackgroundClass(backgroundRaw);
  if (backgroundClass) column.classList.add(backgroundClass);

  if (widthPercentage) {
    column.style.flex = `0 0 ${widthPercentage}%`;
    column.style.maxWidth = `${widthPercentage}%`;
  }
}

function getColumnRows(block, configRows) {
  const excluded = new Set(configRows);
  return [...block.children].filter((child) => !excluded.has(child));
}

function decorateExistingRows(rows, widths) {
  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const contentCell = cells[0];
    const backgroundCell = cells.length > 1 ? cells[cells.length - 1] : null;
    const backgroundRaw = backgroundCell ? backgroundCell.textContent.trim() : '';

    row.classList.add('vcolumns-row');
    applyColumnStyles(contentCell, widths[index], backgroundRaw);

    if (backgroundCell && backgroundCell !== contentCell) {
      backgroundCell.remove();
    }
  });
}

function addVisualPlaceholders(block, existingCount, targetCount, widths) {
  for (let i = existingCount; i < targetCount; i += 1) {
    const placeholder = document.createElement('div');
    placeholder.className = 'vcolumns-col vcolumns-col-placeholder';
    if (widths[i]) {
      placeholder.style.flex = `0 0 ${widths[i]}%`;
      placeholder.style.maxWidth = `${widths[i]}%`;
    }
    block.append(placeholder);
  }
}

export default async function decorate(block) {
  const config = parseConfig(block);
  const targetColumns = Math.min(MAX_COLUMNS, config.columns);
  const rows = getColumnRows(block, config.configRows).slice(0, targetColumns);

  const widths = parseColumnWidths(config.columnWidths, targetColumns);
  block.classList.add('vcolumns-grid', 'vcolumns-mode-percentage');

  decorateExistingRows(rows, widths);
  if (!isAuthoringContext(block) && rows.length < targetColumns) {
    addVisualPlaceholders(block, rows.length, targetColumns, widths);
  }

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