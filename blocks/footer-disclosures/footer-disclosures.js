import { keepAuthoredDom, moveInstrumentation } from '../../scripts/scripts.js';

let groupCount = 0;

function groupHeading(row) {
  const authored = row.querySelector(':scope > div > :is(h1, h2, h3, h4, h5, h6)');
  if (authored?.textContent.trim()) return authored.textContent.trim();
  const headingCell = [...row.children].find((cell) => (
    cell.textContent.trim()
    && !cell.querySelector('ul, ol, p')
  ));
  if (headingCell) return headingCell.textContent.trim();
  return 'Full Site Disclaimers';
}

function toOrderedList(row) {
  const source = row.querySelector('ol, ul');
  const ol = document.createElement('ol');
  ol.className = 'footer-disclosures-group-panel';
  if (source) {
    [...source.children].forEach((li) => {
      const item = document.createElement('li');
      item.innerHTML = li.innerHTML;
      const numbered = li.getAttribute('value') || li.textContent.trim().match(/^(\d+)\./)?.[1];
      if (numbered) {
        item.setAttribute('value', numbered);
        item.dataset.disclaimerNumber = numbered;
      }
      ol.append(item);
    });
    const start = source.getAttribute('start') || ol.querySelector('li[value]')?.getAttribute('value');
    if (start) ol.start = start;
    return ol;
  }

  [...row.querySelectorAll('p')]
    .map((p) => p.innerHTML.trim())
    .filter(Boolean)
    .forEach((html) => {
      const item = document.createElement('li');
      const match = html.replace(/<[^>]+>/g, '').trim().match(/^(\d+)\.\s*/);
      if (match) {
        const [, number] = match;
        item.setAttribute('value', number);
        item.dataset.disclaimerNumber = number;
        item.innerHTML = html.replace(/^(\d+)\.\s*/, '');
      } else {
        item.innerHTML = html;
      }
      ol.append(item);
    });
  return ol;
}

function syncWrapHeight(wrap) {
  const desktop = window.matchMedia('(min-width: 900px)').matches;
  const open = wrap.querySelector('.footer-disclosures-group.is-open .footer-disclosures-group-panel');
  wrap.style.minHeight = desktop && open ? `${open.offsetHeight + 16}px` : '';
}

function openGroup(wrap, group, open) {
  wrap.querySelectorAll('.footer-disclosures-group').forEach((other) => {
    const isTarget = other === group && open;
    other.classList.toggle('is-open', isTarget);
    other.querySelector('.footer-disclosures-group-btn')?.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
  });
  syncWrapHeight(wrap);
}

function buildGroup(row, title) {
  const heading = title || groupHeading(row) || 'Disclaimer';
  const panel = toOrderedList(row);
  if (!panel.children.length) return null;

  groupCount += 1;
  const panelId = `footer-disclosures-group-${groupCount}`;
  panel.id = panelId;

  const group = document.createElement('div');
  group.className = 'footer-disclosures-group';
  moveInstrumentation(row, group);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'footer-disclosures-group-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', panelId);
  btn.append(document.createTextNode(heading));
  const caret = document.createElement('span');
  caret.className = 'footer-disclosures-caret';
  caret.setAttribute('aria-hidden', 'true');
  btn.append(caret);

  group.append(btn, panel);
  btn.addEventListener('click', () => {
    const wrap = group.closest('.footer-disclosures-wrap');
    const willOpen = !group.classList.contains('is-open');
    openGroup(wrap, group, willOpen);
  });
  return group;
}

/**
 * Footer Disclosures — nested accordion matching live .disclaimer-wrap
 * (group titles left, numbered notes right on desktop).
 * @param {Element} block
 */
export default function decorate(block) {
  if (block.querySelector(':scope > .footer-disclosures-inner')) return;
  if (keepAuthoredDom(block)) return;

  const rows = [...block.children];
  const headingRow = rows.find((row) => row.querySelector('h1, h2, h3, h4, h5, h6'))
    || rows.find((row) => !row.querySelector('a, ul, ol') && row.textContent.trim());
  const contentRows = rows.filter((row) => row !== headingRow);

  const inner = document.createElement('div');
  inner.className = 'footer-disclosures-inner';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'footer-disclosures-toggle';
  toggle.setAttribute('aria-expanded', 'true');

  let heading = headingRow?.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) {
    heading = document.createElement('h2');
    heading.textContent = (headingRow?.textContent || 'Offer details and disclosures').trim();
  }
  if (headingRow) moveInstrumentation(headingRow, heading);
  toggle.append(heading);
  const outerCaret = document.createElement('span');
  outerCaret.className = 'footer-disclosures-caret';
  outerCaret.setAttribute('aria-hidden', 'true');
  toggle.append(outerCaret);
  inner.append(toggle);

  const body = document.createElement('div');
  body.className = 'footer-disclosures-body';
  const wrap = document.createElement('div');
  wrap.className = 'footer-disclosures-wrap';

  contentRows.forEach((row) => {
    const group = buildGroup(row);
    if (group) wrap.append(group);
  });

  if (wrap.children.length) {
    openGroup(wrap, wrap.firstElementChild, true);
    body.append(wrap);
  }
  inner.append(body);

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    body.hidden = expanded;
    if (!expanded) syncWrapHeight(wrap);
  });

  window.addEventListener('resize', () => syncWrapHeight(wrap));
  block.id = 'legal-disclaimer';
  block.replaceChildren(inner);
}
