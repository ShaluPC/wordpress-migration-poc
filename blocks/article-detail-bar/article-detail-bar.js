const PAGE_URL = window.location.href;

const ICONS = {
  clock: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="11" stroke="#262626" stroke-width="2"></circle>
                  <path d="M12 12.0002V1.2002C20.64 1.2002 22.8 8.4002 22.8 12.0002H12Z" fill="#005D1F" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>`,
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><path fill="#003512" fill-rule="evenodd" d="M13.293 2.293A1 1 0 0 1 14 2h14a1 1 0 0 1 1 1v23c0 2.252-1.748 4-4 4H6c-1.652 0-3-1.348-3-3V17a1 1 0 0 1 1-1h3V9a1 1 0 0 1 .293-.707zM7 18H5v9c0 .548.452 1 1 1s1-.452 1-1zm1.828 10H25c1.148 0 2-.852 2-2V4H14.414L9 9.414V27c0 .35-.06.687-.172 1" clip-rule="evenodd"></path><path fill="#003512" fill-rule="evenodd" d="M11 20.667a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1M11 25a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1M14 2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8a1 1 0 0 1 0-2h5V3a1 1 0 0 1 1-1M11 16.333a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1M17 12a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1" clip-rule="evenodd"></path></svg>',
  author: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><path fill="#003512" d="M16 14a1 1 0 1 1 0 2h-4c-2.248 0-4 1.752-4 4v8h8a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1v-9c0-3.352 2.648-6 6-6zm0-11a1 1 0 1 1 0 2c-1.648 0-3 1.352-3 3s1.352 3 3 3a1 1 0 1 1 0 2c-2.752 0-5-2.248-5-5s2.248-5 5-5"></path><path fill="#003512" d="M20 14c3.352 0 6 2.648 6 6v10H16v-2h.424l-.392-12H16v-2zM16 3c2.752 0 5 2.248 5 5s-2.248 5-5 5v-2l.023-.001.146-5.994A3 3 0 0 0 16 5z"></path><path fill="#003512" d="M16 4.563h3.205v6.783H16z"></path></svg>',
  reviewed: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><path fill="#003512" fill-rule="evenodd" d="M9.492 3.612c1.038-1.427 2.902-2.125 4.668-1.445l.013.005 1.244.518.031.016c.319.159.787.159 1.106 0l.09-.046 1.551-.413c1.724-.635 3.712.023 4.661 1.635l.484.775c.283.42.595.656 1.035.782l.012.003 1.621.506.009.003c1.586.53 2.818 2.118 2.681 3.923v.003l-.102 1.43-.005.034c-.058.404.048.823.378 1.219l.006.008.803 1.003a3.87 3.87 0 0 1 0 4.958l-.767.959c-.265.412-.404.89-.41 1.377l.1 1.297v.038a4.12 4.12 0 0 1-2.906 3.956l-.034.01-1.308.302c-.49.145-.868.412-1.115.779l-.71 1.116-.018.025c-1.038 1.427-2.902 2.125-4.668 1.445l-.013-.005-1.222-.509a1.57 1.57 0 0 0-1.312 0l-.01.004-1.212.505-.013.005c-1.674.644-3.722.166-4.712-1.511l-.685-1.075c-.247-.367-.625-.634-1.114-.779l-1.298-.3-.025-.006c-1.812-.518-3.06-2.119-2.923-4.033v-.006l.103-1.332.005-.032c.057-.404-.049-.823-.378-1.219l-.007-.008-.803-1.003a3.87 3.87 0 0 1 0-4.958l.768-.959c.265-.412.403-.89.41-1.377l-.1-1.297V9.9a4.12 4.12 0 0 1 2.906-3.956l.034-.01 1.308-.302c.483-.143.857-.405 1.105-.765l.708-1.214zm1.645 1.14L10.45 5.93l-.017.025c-.55.823-1.361 1.35-2.258 1.607l-.024.007-1.287.297a2.12 2.12 0 0 0-1.463 2l.1 1.296v.038c0 .89-.254 1.784-.768 2.555l-.024.036-.834 1.042c-.599.732-.599 1.702 0 2.434l.007.008.794.993c.657.793.95 1.757.82 2.738l-.098 1.265v.003c-.062.877.482 1.67 1.455 1.958l1.298.3.024.006c.897.256 1.709.784 2.258 1.607l.006.01.716 1.124.01.017c.411.705 1.349 1.022 2.265.675l1.182-.492a3.56 3.56 0 0 1 2.878 0l1.181.492c.823.31 1.743.016 2.304-.736l.688-1.08.006-.01c.549-.823 1.36-1.35 2.257-1.607l.025-.007 1.287-.296a2.12 2.12 0 0 0 1.463-2l-.1-1.297V20.9c0-.889.254-1.784.768-2.555l.024-.036.834-1.042c.598-.732.598-1.702 0-2.434l-.007-.008-.794-.993c-.657-.793-.95-1.755-.82-2.735l.097-1.368v-.006c.062-.79-.502-1.598-1.31-1.872l-1.58-.493c-.948-.274-1.631-.834-2.144-1.603l-.008-.013-.516-.825-.008-.013c-.444-.761-1.419-1.1-2.277-.77l-.05.019-1.464.39a3.34 3.34 0 0 1-2.758-.032L13.43 4.03c-.817-.309-1.73-.02-2.293.722" clip-rule="evenodd"></path><path fill="#003512" d="M16 8a8 8 0 1 1 0 16 8 8 0 0 1 0-16m4.107 4.893a1 1 0 0 0-1.414 0L14.4 17.186l-1.293-1.293a1 1 0 0 0-1.414 1.415l2 2a1 1 0 0 0 1.414 0l5-5c.39-.39.39-1.025 0-1.415"></path></svg>',
  linkedin: `<svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M15 14.3753H12.75V10.1354C12.75 7.58715 9.75 7.78009 9.75 10.1354V14.3753H7.5V6.05277H9.75V7.38817C10.797 5.43161 15 5.2871 15 9.2615V14.3753ZM4.875 5.09341C4.1505 5.09341 3.5625 4.4957 3.5625 3.75877C3.5625 3.02185 4.1505 2.42414 4.875 2.42414C5.5995 2.42414 6.1875 3.02185 6.1875 3.75877C6.1875 4.4957 5.60025 5.09341 4.875 5.09341ZM3.75 14.3753H6V6.05277H3.75V14.3753ZM14.25 0H3.75C1.67925 0 0 1.69402 0 3.78298V14.3753C0 16.4643 1.67925 18.1583 3.75 18.1583H14.25C16.3215 18.1583 18 16.4643 18 14.3753V3.78298C18 1.69402 16.3215 0 14.25 0Z" fill="#005D1F"></path>
    </svg>`,
  facebook: `<svg width="8" height="19" viewBox="0 0 8 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2 6.05277H0V9.07916H2V18.1583H5.33333V9.07916H7.76133L8 6.05277H5.33333V4.79153C5.33333 4.06898 5.46133 3.78298 6.07667 3.78298H8V0H5.46133C3.064 0 2 1.19769 2 3.49169V6.05277Z" fill="#005D1F"></path>
    </svg>`,
  x: `<svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="st0" d="M20,19.3c0,0-0.8-1.1-1.7-2.3c-0.9-1.2-2-2.6-2.3-3.1c-0.4-0.5-1.4-1.9-2.4-3.2s-1.7-2.3-1.7-2.3
    s5-5.5,6.7-7.3l0.5-0.5h-0.9h-0.9l-1,1.1c-0.6,0.6-2,2.1-3.1,3.4l-2.1,2.2L8.5,4L6,0.6H3c-1.6,0-3,0-3,0s0.7,0.9,1.5,2
    S4.1,6,5.4,7.8L7.7,11l-0.2,0.2c-0.1,0.1-1.8,2-3.9,4.2c-2,2.2-3.7,4-3.7,4.1c0,0,0.3,0,0.9,0h0.9L2,19.1c0.2-0.2,1.6-1.8,3.3-3.6
    s3.1-3.3,3.1-3.4L8.5,12l0.8,1.1c0.5,0.6,1.7,2.3,2.8,3.7l1.9,2.6h3C19.5,19.4,20,19.4,20,19.3z M16.1,18.1h-1.4L12,14.5
    C5.8,6.2,2.7,2,2.6,1.9c0,0,0.3,0,1.3,0h1.4l1.8,2.4c1,1.3,2.5,3.3,3.3,4.5c0.9,1.1,2.8,3.7,4.3,5.7s2.7,3.6,2.7,3.6
    S17.1,18.1,16.1,18.1z" fill="#005D1F"></path>
    </svg>`,
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
