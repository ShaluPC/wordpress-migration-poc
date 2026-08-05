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
    const cells = Array.isArray(row) ? row : [...row.querySelectorAll(':scope > *')].filter((cell) => cell.tagName !== 'HR');
    const linkCell = cells.find((cell) => cell.matches?.('a[href], [data-aue-prop$="/link"]')) || cells[0] || null;
    const typeCell = cells.find((cell) => cell.textContent?.trim().toLowerCase() === 'right-arrow' || ['primary', 'secondary'].includes(cell.textContent?.trim().toLowerCase())) || null;
    const sourceNode = linkCell?.matches?.('a[href]') ? linkCell : linkCell?.querySelector?.('a[href]') || linkCell;
    const href = getHref(linkCell);
    if (!href) return;

    const buttonWrapper = document.createElement('p');
    buttonWrapper.className = 'button-wrapper';

    const button = document.createElement('a');
    moveInstrumentation(sourceNode, button);
    button.href = href;
    button.textContent = sourceNode?.textContent?.trim() || linkCell?.textContent?.trim() || href;
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
  const ctaRows = rows.slice(2).flatMap((row) => {
    const ctaContainer = row.querySelector('[data-aue-prop^="ctas/"]')?.closest('div') || row;
    const groups = [];
    let currentGroup = [];

    [...ctaContainer.children].forEach((child) => {
      if (child.tagName === 'HR') {
        if (currentGroup.length) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        return;
      }

      currentGroup.push(child);
    });

    if (currentGroup.length) groups.push(currentGroup);

    if (!groups.length && ctaContainer.querySelector('a[href]')) {
      groups.push([...ctaContainer.children].filter((child) => child.tagName !== 'HR'));
    }

    return groups;
  });

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