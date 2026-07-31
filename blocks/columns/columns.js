// eslint-disable-next-line import/no-cycle
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
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
