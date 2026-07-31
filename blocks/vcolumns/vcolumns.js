const MAX_COLUMNS = 4;

const CONFIG_KEYS = {
  columns: 'columns',
  'column count': 'columns',
  'width mode': 'widthMode',
  widthmode: 'widthMode',
};

function normalizeKey(value) {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function parseConfig(block) {
  const config = {
    columns: 2,
    widthMode: 'ratio',
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

    if (mapped === 'widthMode') {
      config.widthMode = rawValue.toLowerCase() === 'percentage' ? 'percentage' : 'ratio';
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

function parseRatio(value) {
  const raw = (value || '').trim();
  if (!raw) return 1;
  if (raw.includes(':')) {
    const [left] = raw.split(':');
    const parsed = Number.parseFloat(left);
    return Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
  }
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
}

function toBackgroundClass(value) {
  const token = (value || '').toLowerCase().trim();
  if (!token || token === 'none') return '';
  return `vcolumns-bg-${token}`;
}

function decorateRow(row, config) {
  const cells = [...row.children];
  const contentCell = cells[0];
  const sizeCell = cells[1];
  const backgroundCell = cells[2];

  const column = document.createElement('div');
  column.className = 'vcolumns-col';

  const sizeRaw = sizeCell?.textContent?.trim() || '';
  const backgroundRaw = backgroundCell?.textContent?.trim() || '';
  const backgroundClass = toBackgroundClass(backgroundRaw);
  if (backgroundClass) column.classList.add(backgroundClass);

  if (config.widthMode === 'percentage') {
    const percentage = parsePercentage(sizeRaw);
    if (percentage) {
      column.style.flex = `0 0 ${percentage}%`;
      column.style.maxWidth = `${percentage}%`;
    }
  } else {
    const ratio = parseRatio(sizeRaw || '1');
    column.style.flex = `${ratio} 1 0`;
  }

  if (contentCell) {
    while (contentCell.firstChild) {
      column.append(contentCell.firstChild);
    }
  }

  return column;
}

export default function decorate(block) {
  const config = parseConfig(block);
  const rows = [...block.children].slice(0, Math.min(MAX_COLUMNS, config.columns));

  const grid = document.createElement('div');
  grid.className = `vcolumns-grid vcolumns-mode-${config.widthMode}`;

  rows.forEach((row) => {
    grid.append(decorateRow(row, config));
  });

  block.replaceChildren(grid);
}