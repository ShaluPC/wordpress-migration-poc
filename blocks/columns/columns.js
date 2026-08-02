// eslint-disable-next-line import/no-cycle
import { decorateBlock, loadBlock, readBlockConfig } from '../../scripts/aem.js';

function mergeSingleCellRows(block) {
  const rows = [...block.children].filter((child) => child.tagName === 'DIV');
  if (rows.length < 2 || !rows.every((row) => row.children.length === 1)) return;

  const mergedRow = document.createElement('div');
  rows.forEach((row) => {
    mergedRow.append(row.firstElementChild);
  });

  block.replaceChildren(mergedRow);
}

function applyColumnStyles(column) {
  const metadata = column.querySelector(':scope > div.column-metadata')
    || ([...column.children].find((row) => row.children?.length === 2
      && row.firstElementChild?.textContent?.trim().toLowerCase() === 'style') || null);
  if (!metadata) return;

  const { style, width } = readBlockConfig(metadata);
  if (width) {
    column.classList.add(width);
  }
  if (style) {
    style
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => column.classList.add(token));
  }

  metadata.remove();
}

export default async function decorate(block) {
  mergeSingleCellRows(block);

  if (!block.firstElementChild) return;

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      applyColumnStyles(col);

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  const nestedBlocks = [];
  [...block.querySelectorAll(':scope > div > div')].forEach((col) => {
    [...col.children].forEach((child) => {
      if (child.tagName === 'DIV' && child.className) {
        decorateBlock(child);
        if (child.classList.contains('block')) nestedBlocks.push(child);
      }
    });
  });

  await Promise.all(nestedBlocks.map((nestedBlock) => loadBlock(nestedBlock)));
}
