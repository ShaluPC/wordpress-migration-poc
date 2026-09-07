import { keepAuthoredDom } from '../../scripts/scripts.js';

/**
 * Nav Menu — wraps nav-panel blocks into the top-level menu list.
 * Nested nav-panel blocks are decorated first by EDS; this organizes them.
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .nav-menu-list')) return;
  if (keepAuthoredDom(block)) return;

  const panels = [...block.querySelectorAll(':scope .nav-panel, :scope > div > .nav-panel')];
  // If panels are direct section siblings, header.js assembles them.
  // When nested under nav-menu, wrap here.
  if (!panels.length) {
    // legacy rows fallback: treat each child row link as a simple item
    const rows = [...block.children];
    const list = document.createElement('ul');
    list.className = 'nav-menu-list';
    rows.forEach((row) => {
      const link = row.querySelector('a');
      if (!link) return;
      const li = document.createElement('li');
      link.classList.add('nav-menu-link');
      li.append(link);
      list.append(li);
    });
    if (list.children.length) block.replaceChildren(list);
    return;
  }

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
    panel.remove();
  });

  block.replaceChildren(list);
}
