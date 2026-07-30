// eslint-disable-next-line import/no-cycle
import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
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

  const nestedBreadcrumbs = [...block.querySelectorAll('.breadcrumb')]
    .filter((nestedBlock) => nestedBlock !== block);

  nestedBreadcrumbs.forEach((nestedBlock) => {
    decorateBlock(nestedBlock);
  });

  await Promise.all(nestedBreadcrumbs.map((nestedBlock) => loadBlock(nestedBlock)));
}
