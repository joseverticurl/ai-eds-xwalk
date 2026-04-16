/**
 * You May Also Like — related article cards (2–3 items).
 *
 * Structure contract (align with Universal Editor output; update if UE differs):
 * - block.children[0] = section title row (cell 0 = text)
 * - block.children[1] = aura row (cell 0 = select value, e.g. aura-light)
 * - block.children[2+] = one row per card, cells:
 *   - [0] picture (reference image; use image alt from asset or <img alt>)
 *   - [1] category tag
 *   - [2] article title
 *   - [3] article link (aem-content → contains <a href="...">)
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const MAX_CARDS = 3;
const MIN_CARDS = 2;

const READ_MORE_ICON = '<svg class="youmayalsolike-card-cta-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getArticleHref(linkCell) {
  const a = linkCell?.querySelector?.('a') || linkCell?.querySelector?.('p a');
  const href = a?.getAttribute?.('href') || a?.href || '';
  return href.replaceAll('&#x26;', '&');
}

function buildCard({
  pictureCell,
  categoryCell,
  titleCell,
  linkCell,
}) {
  const href = getArticleHref(linkCell);
  if (!href) return null;

  const img = pictureCell?.querySelector?.('img');
  const src = img?.getAttribute?.('src') || img?.src || '';
  const alt = img?.getAttribute?.('alt') || img?.alt || '';
  const category = getText(categoryCell);
  const title = getText(titleCell);

  const card = document.createElement('a');
  card.className = 'youmayalsolike-card';
  card.href = href;
  card.setAttribute('aria-label', title || category || 'Read article');

  const media = document.createElement('div');
  media.className = 'youmayalsolike-card-media';
  if (src) {
    const pic = createOptimizedPicture(src, alt, false, [
      { media: '(min-width: 900px)', width: '440' },
      { width: '750' },
    ]);
    const picImg = pic.querySelector('img');
    if (picImg && img) moveInstrumentation(img, picImg);
    media.appendChild(pic);
  }

  const gradient = document.createElement('div');
  gradient.className = 'youmayalsolike-card-gradient';
  gradient.setAttribute('aria-hidden', 'true');

  const body = document.createElement('div');
  body.className = 'youmayalsolike-card-body';

  if (category) {
    const badge = document.createElement('span');
    badge.className = 'youmayalsolike-card-category';
    badge.textContent = category;
    body.appendChild(badge);
  }

  const titleEl = document.createElement('span');
  titleEl.className = 'youmayalsolike-card-title';
  titleEl.textContent = title;
  body.appendChild(titleEl);

  const cta = document.createElement('span');
  cta.className = 'youmayalsolike-card-cta';
  cta.innerHTML = `<span class="youmayalsolike-card-cta-text">Read more</span>${READ_MORE_ICON}`;
  body.appendChild(cta);

  card.appendChild(media);
  card.appendChild(gradient);
  card.appendChild(body);

  return card;
}

/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < MIN_CARDS + 2) {
    block.replaceChildren();
    return;
  }

  const titleRow = rows[0];
  const auraRow = rows[1];
  let cardRows = rows.slice(2);

  if (cardRows.length < MIN_CARDS) {
    block.replaceChildren();
    return;
  }

  cardRows = cardRows.slice(0, MAX_CARDS);

  const sectionTitle = getText(titleRow?.children?.[0]) || 'You may also like';
  const auraClass = getText(auraRow?.children?.[0]) || 'aura-light';

  const grid = document.createElement('div');

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const card = buildCard({
      pictureCell: cells[0],
      categoryCell: cells[1],
      titleCell: cells[2],
      linkCell: cells[3],
    });
    if (card) grid.appendChild(card);
  });

  if (grid.children.length < MIN_CARDS) {
    block.replaceChildren();
    return;
  }

  const layoutClass = grid.children.length === 2
    ? 'youmayalsolike-layout-pair'
    : 'youmayalsolike-layout-triple';
  grid.className = `youmayalsolike-grid ${layoutClass}`;

  const wrapper = document.createElement('div');
  wrapper.className = `youmayalsolike-wrapper ${auraClass}`.trim();

  const heading = document.createElement('h2');
  heading.className = 'youmayalsolike-heading';
  heading.textContent = sectionTitle;
  if (titleRow?.children?.[0]) moveInstrumentation(titleRow.children[0], heading);

  wrapper.appendChild(heading);
  wrapper.appendChild(grid);

  block.replaceChildren(wrapper);
}
