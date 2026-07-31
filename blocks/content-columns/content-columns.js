// eslint-disable-next-line import/no-cycle
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

function mergeSingleCellRows(block) {
  const rows = [...block.children].filter((child) => child.tagName === 'DIV');
  if (rows.length < 2 || !rows.every((row) => row.children.length === 1)) return;

  const mergedRow = document.createElement('div');
  rows.forEach((row) => {
    mergedRow.append(row.firstElementChild);
  });
  block.replaceChildren(mergedRow);
}

export default async function decorate(block) {
  mergeSingleCellRows(block);

  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`content-columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('content-columns-img-col');
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
