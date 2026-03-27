/**
 * You May Also Like block
 *
 * UE structure (index-based):
 * block.children[0] = title row — first cell contains heading text
 * block.children[1] = aura row — first cell is class token (e.g. aura-creative)
 * block.children[2+] = card rows — cells: picture, category, title, link (<a>), read-more label
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const AURA_CLASSES = new Set([
  'aura-creative',
  'aura-health',
  'aura-sustainability',
  'aura-light',
  'aura-dark',
]);

const MIN_CARDS = 2;
const MAX_CARDS = 3;

function cellText(row, index) {
  return row?.children?.[index]?.textContent?.trim() ?? '';
}

function normalizeReadMore(text) {
  const t = text?.trim() ?? '';
  if (!t || /^read\s*more$/i.test(t) || /^readmore$/i.test(t)) return 'Read more';
  return t;
}

function appendOptimizedPicture(media, pictureCell) {
  const img = pictureCell?.querySelector?.('img');
  const picture = pictureCell?.querySelector?.('picture');
  const imgSrc = img?.getAttribute?.('src') || img?.src || '';
  if (!imgSrc) return;

  const imgAlt = img?.getAttribute?.('alt') || img?.alt || '';
  const optimizedPic = createOptimizedPicture(
    imgSrc,
    imgAlt,
    false,
    [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }],
  );
  const newImg = optimizedPic.querySelector('img');
  if (picture && newImg) moveInstrumentation(picture.querySelector('img'), newImg);
  else if (img && newImg) moveInstrumentation(img, newImg);
  media.appendChild(optimizedPic);
}

function buildCardLink(row) {
  const pictureCell = row?.children?.[0];
  const category = cellText(row, 1);
  const heading = cellText(row, 2);
  const linkCell = row?.children?.[3];
  const readMoreRaw = cellText(row, 4);
  const anchor = linkCell?.querySelector?.('a');
  const href = anchor?.getAttribute?.('href') || anchor?.href || '#';

  const link = document.createElement('a');
  link.className = 'youmayalsolike-card-link';
  link.href = href;
  if (heading) link.setAttribute('aria-label', heading);

  const media = document.createElement('div');
  media.className = 'youmayalsolike-card-media';
  appendOptimizedPicture(media, pictureCell);

  const overlay = document.createElement('div');
  overlay.className = 'youmayalsolike-card-overlay';

  if (category) {
    const cat = document.createElement('span');
    cat.className = 'youmayalsolike-card-category';
    cat.textContent = category;
    overlay.appendChild(cat);
  }

  if (heading) {
    const titleEl = document.createElement('p');
    titleEl.className = 'youmayalsolike-card-heading';
    titleEl.textContent = heading;
    overlay.appendChild(titleEl);
  }

  const cta = document.createElement('span');
  cta.className = 'youmayalsolike-card-cta';
  cta.textContent = normalizeReadMore(readMoreRaw);
  overlay.appendChild(cta);

  link.append(media, overlay);
  return link;
}

function buildCard(row) {
  const link = buildCardLink(row);
  if (!link.querySelector('.youmayalsolike-card-media')?.querySelector('picture, img')) {
    return null;
  }
  const li = document.createElement('li');
  li.className = 'youmayalsolike-card';
  li.appendChild(link);
  return li;
}

function applyAuraClass(block, auraRaw) {
  if (!AURA_CLASSES.has(auraRaw)) return;
  block.classList.add(auraRaw);
}

export default function decorate(block) {
  const rows = [...block.children];
  const titleText = rows[0]?.children?.[0]?.textContent?.trim() ?? '';
  const auraRaw = rows[1]?.children?.[0]?.textContent?.trim() ?? '';
  const cardRows = rows.slice(2, 2 + MAX_CARDS);

  if (cardRows.length < MIN_CARDS) {
    block.replaceChildren();
    return;
  }

  applyAuraClass(block, auraRaw);

  const title = document.createElement('h2');
  title.className = 'youmayalsolike-title';
  title.textContent = titleText || 'You may also like';

  const grid = document.createElement('ul');
  grid.className = 'youmayalsolike-grid';

  cardRows.forEach((row) => {
    const card = buildCard(row);
    if (card) grid.appendChild(card);
  });

  const cardCount = grid.children.length;
  if (cardCount < MIN_CARDS) {
    block.replaceChildren();
    return;
  }

  grid.classList.add(
    cardCount === 2 ? 'youmayalsolike-grid-cols-2' : 'youmayalsolike-grid-cols-3',
  );

  block.replaceChildren(title, grid);
}
