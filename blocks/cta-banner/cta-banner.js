import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function decorateButtons(rows) {
  const buttonList = document.createElement('div');
  buttonList.className = 'cta-banner-buttons';

  function getHref(linkCell) {
    const anchor = linkCell?.matches?.('a[href]') ? linkCell : linkCell?.querySelector?.('a[href]');
    if (anchor?.href) return anchor.href;

    const text = linkCell?.textContent?.trim();
    if (!text) return '';
    if (/^https?:\/\//i.test(text)) return text;
    if (/^www\./i.test(text)) return `https://${text}`;
    return text;
  }

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > *')].filter((cell) => cell.tagName !== 'HR');
    const linkCell = row.querySelector('[data-aue-prop$="/link"]') || cells.find((cell) => cell.matches?.('a[href]')) || cells[0] || null;
    const textCell = row.querySelector('[data-aue-prop$="/linkText"]')
      || cells.find((cell) => cell !== linkCell && cell.textContent?.trim() && cell.textContent.trim().toLowerCase() !== 'right-arrow')
      || null;
    const typeCell = row.querySelector('[data-aue-prop$="/classes"]')
      || cells.find((cell) => cell.textContent?.trim().toLowerCase() === 'right-arrow')
      || null;
    const sourceNode = linkCell?.matches?.('a[href]') ? linkCell : linkCell?.querySelector?.('a[href]') || linkCell;
    const href = getHref(linkCell);
    if (!href) return;

    const buttonWrapper = document.createElement('p');
    buttonWrapper.className = 'button-wrapper';

    const button = document.createElement('a');
    moveInstrumentation(sourceNode, button);
    button.href = href;
    button.textContent = textCell?.textContent?.trim() || linkCell?.textContent?.trim() || href;
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
  const ctaRows = rows.slice(2).map((row) => {
    const field = row.querySelector('[data-aue-prop^="ctas/"]');
    if (field) return field.closest('div') || field.parentElement;

    return row.querySelector('a[href]') ? row : null;
  }).filter(Boolean);

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