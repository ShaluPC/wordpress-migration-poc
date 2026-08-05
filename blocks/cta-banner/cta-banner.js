import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function decorateButtons(rows) {
  const buttonList = document.createElement('div');
  buttonList.className = 'cta-banner-buttons';

  rows.forEach((row) => {
    const cells = [...row.children];
    const linkCell = cells[0];
    const textCell = cells[1];
    const titleCell = cells[2];
    const typeCell = cells[3];
    const link = linkCell?.matches?.('a[href]') ? linkCell : linkCell?.querySelector('a[href]');
    if (!link) return;

    const buttonWrapper = document.createElement('p');
    buttonWrapper.className = 'button-wrapper';

    const button = document.createElement('a');
    moveInstrumentation(link, button);
    button.href = link.href;
    button.textContent = textCell?.textContent?.trim() || link.textContent.trim();
    button.title = titleCell?.textContent?.trim() || link.title || button.textContent;
    button.className = 'button';

    const linkType = typeCell?.textContent?.trim().toLowerCase();
    if (linkType === 'primary') {
      button.classList.add('primary');
    } else if (linkType === 'secondary') {
      button.classList.add('secondary');
    } else if (linkType === 'right-arrow') {
      button.classList.add('arrow-link');
    } else {
      button.classList.add('secondary');
    }

    buttonWrapper.append(button);
    buttonList.append(buttonWrapper);
  });

  return buttonList;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const banner = document.createElement('div');
  banner.className = 'cta-banner-layout';

  const imageCell = rows[0]?.querySelector('picture, img');
  const titleCell = rows[1];

  const imageWrap = document.createElement('div');
  imageWrap.className = 'cta-banner-image';
  if (imageCell) {
    const img = imageCell.tagName === 'IMG' ? imageCell : imageCell.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '100' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      imageWrap.append(optimized);
    }
  }

  const contentWrap = document.createElement('div');
  contentWrap.className = 'cta-banner-content';
  const ctaRows = rows.slice(2).flatMap((row) => [...row.querySelectorAll('a[href]')]
    .map((link) => link.closest('li, div'))
    .filter(Boolean));

  if (titleCell) {
    const title = document.createElement('div');
    title.className = 'main-heading';
    moveInstrumentation(titleCell, title);
    title.textContent = titleCell.textContent.trim();
    contentWrap.append(title);
  }

  if (ctaRows.length) {
    contentWrap.append(decorateButtons(ctaRows));
  }

  banner.append(imageWrap, contentWrap);
  block.replaceChildren(banner);
}