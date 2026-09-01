import { keepAuthoredDom, moveInstrumentation } from '../../scripts/scripts.js';

/**
 * @param {Element} root
 */
function addLinkTracking(root) {
  root.querySelectorAll('a').forEach((link) => {
    const name = link.textContent.trim().toLowerCase();
    if (name && !link.hasAttribute('data-track')) {
      link.setAttribute('data-track', JSON.stringify({ loc: 'f', nm: name }));
    }
  });
}

/**
 * Footer Links — authorable columns (doc §3.3)
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .footer-links-inner')) {
    addLinkTracking(block);
    return;
  }

  const rows = [...block.children];
  if (!rows.length) return;

  // UE keeps authored items as the source; do not rebuild or clone them.
  if (keepAuthoredDom(block)) {
    rows.forEach((row) => row.classList.add('footer-links-column'));
    addLinkTracking(block);
    return;
  }

  const inner = document.createElement('div');
  inner.className = 'footer-links-inner';

  const columns = document.createElement('div');
  columns.className = 'footer-links-columns';

  rows.forEach((row) => {
    const columnEl = document.createElement('div');
    columnEl.className = 'footer-links-column';
    moveInstrumentation(row, columnEl);

    const contentCell = row.querySelector(':scope > div') || row;
    while (contentCell.firstChild) {
      columnEl.append(contentCell.firstChild);
    }

    addLinkTracking(columnEl);
    columns.append(columnEl);
  });

  inner.append(columns);
  block.replaceChildren(inner);
}
