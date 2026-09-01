import { getMetadata, loadCSS } from '../../scripts/aem.js';
import { isCurrentFragmentPath } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

async function ensureNavStyles() {
  const base = window.hlx.codeBasePath || '';
  await Promise.all([
    loadCSS(`${base}/blocks/nav-family/nav-family.css`),
    loadCSS(`${base}/blocks/nav-brand/nav-brand.css`),
    loadCSS(`${base}/blocks/nav-menu/nav-menu.css`),
    loadCSS(`${base}/blocks/nav-panel/nav-panel.css`),
    loadCSS(`${base}/blocks/nav-tools/nav-tools.css`),
    loadCSS(`${base}/blocks/nav-secondary/nav-secondary.css`),
  ]);
}

function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  if (!nav) return;
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;
  const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
  if (navSectionExpanded && isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(navSections);
    navSectionExpanded.querySelector('.nav-menu-link')?.focus();
  } else if (!isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, navSections);
    nav.querySelector('.nav-hamburger button')?.focus();
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (nav.contains(e.relatedTarget)) return;
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;
  if (isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(navSections, false);
  } else {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, navSections, false);
  }
}

/**
 * @param {Element} sections
 * @param {boolean} expanded
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-drop').forEach((section) => {
    section.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
  document.body.classList.toggle('nav-mega-open', Boolean(expanded && isDesktop.matches
    && sections.querySelector('.nav-drop[aria-expanded="true"] .mega-menu')));
}

/**
 * @param {Element} nav
 * @param {Element} navSections
 * @param {boolean|null} forceExpanded
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, !(expanded || isDesktop.matches));
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Assemble standalone nav-panel blocks into a menu list.
 * @param {Element} navSections
 */
function assembleNavPanels(navSections) {
  if (!navSections) return;
  if (navSections.querySelector('.nav-menu-list')) return;

  const panels = [...navSections.querySelectorAll('.nav-panel')];
  if (!panels.length) return;

  const list = document.createElement('ul');
  list.className = 'nav-menu-list';

  panels.forEach((panel) => {
    const li = document.createElement('li');
    li.className = 'nav-drop';
    if (panel.classList.contains('has-mega')) li.classList.add('has-mega');
    li.setAttribute('aria-expanded', 'false');
    const inner = panel.querySelector('.nav-panel-inner') || panel;
    while (inner.firstChild) li.append(inner.firstChild);
    list.append(li);
    const wrapper = panel.closest('.nav-panel-wrapper') || panel.parentElement;
    if (wrapper && wrapper !== navSections && !wrapper.classList.contains('section')) {
      wrapper.remove();
    } else {
      panel.remove();
    }
  });

  const wrapper = navSections.querySelector('.default-content-wrapper') || navSections;
  wrapper.append(list);
}

/**
 * Wire mega-menu / dropdown toggles.
 * Desktop: hover each top heading to open its mega menu.
 * Mobile: click accordion.
 * @param {Element} navSections
 */
function decorateNavDrops(navSections) {
  if (!navSections) return;

  let closeTimer = null;
  const clearCloseTimer = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const openDrop = (navSection, trigger) => {
    clearCloseTimer();
    toggleAllNavSections(navSections, false);
    navSection.setAttribute('aria-expanded', 'true');
    trigger?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-mega-open');
  };

  const scheduleClose = (navSection, trigger) => {
    clearCloseTimer();
    closeTimer = window.setTimeout(() => {
      if (navSection.matches(':hover') || navSection.contains(document.activeElement)) return;
      navSection.setAttribute('aria-expanded', 'false');
      trigger?.setAttribute('aria-expanded', 'false');
      if (!navSections.querySelector('.nav-drop[aria-expanded="true"]')) {
        document.body.classList.remove('nav-mega-open');
      }
    }, 120);
  };

  navSections.querySelectorAll('.default-content-wrapper > ul > li').forEach((navSection) => {
    if (navSection.querySelector('ul, .mega-menu')) navSection.classList.add('nav-drop');
  });

  navSections.querySelectorAll('.nav-drop').forEach((navSection) => {
    navSection.setAttribute('aria-expanded', 'false');
    const trigger = navSection.querySelector(':scope > .nav-menu-link, :scope > a');
    if (trigger) {
      trigger.setAttribute('aria-haspopup', navSection.querySelector('.mega-menu') ? 'true' : 'false');
      trigger.setAttribute('aria-expanded', 'false');
    }

    navSection.addEventListener('click', (e) => {
      const inMegaLink = e.target.closest('.mega-menu a');
      if (inMegaLink) return;

      if (!isDesktop.matches) {
        if (e.target.closest('.nav-menu-link, :scope > a') || e.target === navSection) {
          const open = navSection.getAttribute('aria-expanded') === 'true';
          navSection.setAttribute('aria-expanded', open ? 'false' : 'true');
          trigger?.setAttribute('aria-expanded', open ? 'false' : 'true');
        }
        return;
      }

      if (!e.target.closest('.nav-menu-link, :scope > a') && e.target !== navSection) return;
      e.preventDefault();
      const expanded = navSection.getAttribute('aria-expanded') === 'true';
      toggleAllNavSections(navSections, false);
      if (!expanded) openDrop(navSection, trigger);
    });

    navSection.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      if (!navSection.querySelector('.mega-menu')) return;
      openDrop(navSection, trigger);
    });

    navSection.addEventListener('mouseleave', () => {
      if (!isDesktop.matches) return;
      if (!navSection.querySelector('.mega-menu')) return;
      scheduleClose(navSection, trigger);
    });

    navSection.addEventListener('focusin', () => {
      if (!isDesktop.matches) return;
      if (!navSection.querySelector('.mega-menu')) return;
      openDrop(navSection, trigger);
    });

    navSection.addEventListener('focusout', (e) => {
      if (!isDesktop.matches) return;
      if (navSection.contains(e.relatedTarget)) return;
      scheduleClose(navSection, trigger);
    });
  });

  document.addEventListener('click', (e) => {
    if (!isDesktop.matches) return;
    if (e.target.closest('#nav')) return;
    toggleAllNavSections(navSections, false);
  });
}

/**
 * loads and decorates the header / primary navigation from the authored /nav fragment
 * @param {Element} block
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  if (isCurrentFragmentPath(navPath)) return;
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  if (!fragment) return;

  await ensureNavStyles();

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Primary');

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  /* Classify by authored blocks so Family section can be optional */
  [...nav.children].forEach((section) => {
    if (section.querySelector('.nav-family, [data-block-name="nav-family"]')) {
      section.classList.add('nav-family');
    } else if (section.querySelector('.nav-brand, [data-block-name="nav-brand"]')) {
      section.classList.add('nav-brand');
    } else if (section.querySelector('.nav-panel, .nav-menu, [data-block-name="nav-panel"], [data-block-name="nav-menu"]')) {
      section.classList.add('nav-sections');
    } else if (section.querySelector('.nav-tools, [data-block-name="nav-tools"]')) {
      section.classList.add('nav-tools');
    } else if (section.querySelector('.nav-secondary, [data-block-name="nav-secondary"]')) {
      section.classList.add('nav-secondary');
    }
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container')?.classList.remove('button-container');
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  assembleNavPanels(navSections);
  decorateNavDrops(navSections);

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  const familyBlock = nav.querySelector('.nav-family[data-block-name="nav-family"]')
    || nav.querySelector('[data-block-name="nav-family"]')
    || nav.querySelector('.nav-family.block');
  if (familyBlock) {
    const navFamily = familyBlock.closest('.section')
      || familyBlock.closest('.nav-family-wrapper')
      || familyBlock;
    navFamily.style.removeProperty('display');
    navFamily.removeAttribute('hidden');
    navFamily.classList.add('nav-family');
    navWrapper.classList.add('nav-family-container');
    navWrapper.append(navFamily);
  }

  navWrapper.append(nav);

  const secondaryBlock = nav.querySelector('.nav-secondary[data-block-name="nav-secondary"]')
    || nav.querySelector('[data-block-name="nav-secondary"]')
    || nav.querySelector('.nav-secondary.block');
  if (secondaryBlock) {
    const navSecondary = secondaryBlock.closest('.section')
      || secondaryBlock.closest('.nav-secondary-wrapper')
      || secondaryBlock;
    navSecondary.style.removeProperty('display');
    navSecondary.removeAttribute('hidden');
    navSecondary.classList.add('nav-secondary');
    navWrapper.classList.add('nav-secondary-container');
    navWrapper.append(navSecondary);
  }

  block.append(navWrapper);
}
