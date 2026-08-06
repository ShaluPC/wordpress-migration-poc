const PAGE_URL = window.location.href;

const ICONS = {
  clock: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.51 8.51 0 0 0 12 3.5Zm0 15.5a7 7 0 1 1 7-7 7.01 7.01 0 0 1-7 7Z" fill="currentColor"/><path d="M12.75 7.5h-1.5v5.09l3.85 2.31.77-1.28-3.12-1.87V7.5Z" fill="currentColor"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 2.5h1.5V4H16V2.5h1.5V4H20a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 20 21H4a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 4 4h1.5V2.5H7Zm13.5 7.5H3.5v9.5h17V10Zm0-1.5V5.5h-17V8.5Z" fill="currentColor"/></svg>`,
  author: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5Zm0 1.5a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5ZM4.5 20.5v-1.75A5.75 5.75 0 0 1 10.25 13h3.5A5.75 5.75 0 0 1 19.5 18.75v1.75h-1.5v-1.75A4.25 4.25 0 0 0 13.75 14.5h-3.5a4.25 4.25 0 0 0-4.25 4.25v1.75Z" fill="currentColor"/></svg>`,
  reviewed: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5 4 5.5v5.86c0 4.54 3.09 8.8 8 10.14 4.91-1.34 8-5.6 8-10.14V5.5l-8-3ZM12 4l6.5 2.44v4.92c0 3.78-2.54 7.24-6.5 8.39-3.96-1.15-6.5-4.61-6.5-8.39V6.44L12 4Zm-1.1 11.9 5.1-5.1-1.06-1.06-4.04 4.04-1.9-1.9-1.06 1.06 2.96 2.96Z" fill="currentColor"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.5 8.5H3V21h2.5V8.5ZM4.25 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm6.25 1.5H8V21h2.5v-6.4c0-1.7.31-3.35 2.44-3.35 2.1 0 2.11 1.96 2.11 3.45V21h2.5v-6.92c0-3.39-.73-5.58-4.07-5.58-1.6 0-2.69.88-3.14 1.72h-.04V8.5Z" fill="currentColor"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-7h2.35l.35-2.75H13.5V9.5c0-.8.22-1.35 1.37-1.35H16V5.7c-.28-.04-1.24-.12-2.36-.12-2.33 0-3.93 1.42-3.93 4.03v1.64H7V14h2.71v7h3.79Z" fill="currentColor"/></svg>`,
  x: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m4 4 6.8 9.13L4.1 20h2.18l5.57-6.04L16.24 20H20l-7.05-9.46L19.7 4h-2.18l-5.13 5.56L8.33 4H4Zm3.2 1.5h1.57L19 18.5h-1.57L7.2 5.5Z" fill="currentColor"/></svg>`,
};

function createSection(icon, body, className = '') {
  const section = document.createElement('section');
  section.className = `article-detail-bar__section ${className}`.trim();

  const iconWrap = document.createElement('span');
  iconWrap.className = 'article-detail-bar__icon';
  iconWrap.innerHTML = ICONS[icon];

  const content = document.createElement('div');
  content.className = 'article-detail-bar__content';
  if (typeof body === 'string') {
    content.textContent = body;
  } else {
    content.append(body);
  }

  section.append(iconWrap, content);
  return section;
}

function createShareLink(label, href, icon) {
  const link = document.createElement('a');
  link.className = `article-detail-bar__share-link article-detail-bar__share-link--${label.toLowerCase()}`;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noreferrer noopener';
  link.setAttribute('aria-label', `Share on ${label}`);
  link.innerHTML = ICONS[icon];
  return link;
}

export default function decorate(block) {
  const shareUrl = encodeURIComponent(PAGE_URL);
  const title = encodeURIComponent(document.title || '');

  const items = [
    createSection('clock', '7 min read', 'article-detail-bar__section--read-time'),
    createSection('calendar', 'March 21, 2025', 'article-detail-bar__section--date'),
    createSection('author', (() => {
      const fragment = document.createDocumentFragment();
      const label = document.createElement('span');
      label.className = 'article-detail-bar__label';
      label.textContent = 'Written by:';
      const value = document.createElement('span');
      value.className = 'article-detail-bar__value';
      value.textContent = 'H&R Block Content Team';
      fragment.append(label, value);
      return fragment;
    })(), 'article-detail-bar__section--written-by'),
    createSection('reviewed', (() => {
      const fragment = document.createDocumentFragment();
      const label = document.createElement('span');
      label.className = 'article-detail-bar__label';
      label.textContent = 'Reviewed by:';
      const value = document.createElement('a');
      value.className = 'article-detail-bar__value article-detail-bar__value--link';
      value.href = 'https://www.thetaxinstitute.com/';
      value.textContent = 'The Tax Institute';
      fragment.append(label, value);
      return fragment;
    })(), 'article-detail-bar__section--reviewed-by'),
  ];

  const shareSection = document.createElement('section');
  shareSection.className = 'article-detail-bar__share';

  const shareLabel = document.createElement('p');
  shareLabel.className = 'article-detail-bar__share-label';
  shareLabel.textContent = 'Share:';

  const shareLinks = document.createElement('div');
  shareLinks.className = 'article-detail-bar__share-links';
  shareLinks.append(
    createShareLink('LinkedIn', `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${title}`, 'linkedin'),
    createShareLink('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, 'facebook'),
    createShareLink('X', `https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}`, 'x'),
  );

  shareSection.append(shareLabel, shareLinks);

  block.replaceChildren(...items, shareSection);
}