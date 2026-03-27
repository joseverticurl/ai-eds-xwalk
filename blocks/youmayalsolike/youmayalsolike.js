/**
 * You may also like
 *
 * Structure contract (Universal Editor HTML — source of truth):
 * - block.children[0]: title row — cells[0] = section heading text
 * - block.children[1]: aura row — cells[0] = class token (e.g. "aura-creative")
 * - block.children[2..]: card rows (max 3 used) — each row:
 *   - cells[0]: picture wrapper
 *   - cells[1]: category (pill)
 *   - cells[2]: article title
 *   - cells[3]: link cell with <a href="...">
 *   - cells[4]: read-more label (e.g. "Readmore"; shown on small viewports in CSS)
 *
 * Runtime: fewer than 2 valid cards → remove block; more than 3 card rows → use first 3 only.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const AURA_CLASS_RE = /^aura-[a-z0-9-]+$/i;

function readMoreIcon() {
  const wrap = document.createElement('span');
  wrap.className = 'youmayalsolike-card-more-icon';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return wrap;
}

function normalizeUrl(url) {
  if (!url) return '';
  return url.replaceAll('&#x26;', '&');
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 4) {
    block.remove();
    return;
  }

  const titleText = rows[0]?.children?.[0]?.textContent?.trim() || '';
  const auraRaw = rows[1]?.children?.[0]?.textContent?.trim() || '';
  const cardRows = rows.slice(2, 5);

  if (cardRows.length < 2) {
    block.remove();
    return;
  }

  if (auraRaw && AURA_CLASS_RE.test(auraRaw)) {
    block.classList.add(auraRaw);
  }

  const inner = document.createElement('div');
  inner.className = 'youmayalsolike-inner';

  if (titleText) {
    const h2 = document.createElement('h2');
    h2.className = 'youmayalsolike-title';
    h2.textContent = titleText;
    inner.appendChild(h2);
  }

  const cardRow = document.createElement('div');
  cardRow.className = 'row youmayalsolike-cards';
  const built = [];

  cardRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 4) return;

    const pictureCell = cells[0];
    const category = cells[1]?.textContent?.trim() || '';
    const articleTitle = cells[2]?.textContent?.trim() || '';
    const linkEl = cells[3]?.querySelector('a');
    let href = normalizeUrl(linkEl?.getAttribute('href') || '');
    if (!href) href = '#';
    const readMoreRaw = cells[4]?.textContent?.trim() || '';
    const normalizedReadMore = readMoreRaw.replace(/\s+/g, '').toLowerCase() === 'readmore';
    const readMoreLabel = normalizedReadMore ? 'Read more' : readMoreRaw || 'Read more';

    const img = pictureCell?.querySelector('img');
    const imgSrc = normalizeUrl(img?.getAttribute('src') || img?.src || '');
    const imgAlt = img?.getAttribute('alt') || '';

    if (!imgSrc) return;

    const card = document.createElement('a');
    card.className = 'youmayalsolike-card';
    card.href = href;

    if (href.startsWith('http')) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    const media = document.createElement('span');
    media.className = 'youmayalsolike-card-media';

    const optimizedPic = createOptimizedPicture(imgSrc, imgAlt, false, [
      { media: '(min-width: 600px)', width: '2000' },
      { width: '750' },
    ]);
    const newImg = optimizedPic.querySelector('img');
    if (img && newImg) moveInstrumentation(img, newImg);
    media.appendChild(optimizedPic);

    const gradient = document.createElement('span');
    gradient.className = 'youmayalsolike-card-gradient';
    gradient.setAttribute('aria-hidden', 'true');
    media.appendChild(gradient);

    card.appendChild(media);

    const body = document.createElement('span');
    body.className = 'youmayalsolike-card-body';

    if (category) {
      const badge = document.createElement('span');
      badge.className = 'youmayalsolike-card-badge';
      badge.textContent = category;
      body.appendChild(badge);
    }

    const bottom = document.createElement('span');
    bottom.className = 'youmayalsolike-card-bottom';

    if (articleTitle) {
      const titleEl = document.createElement('span');
      titleEl.className = 'youmayalsolike-card-title';
      titleEl.textContent = articleTitle;
      bottom.appendChild(titleEl);
    }

    const more = document.createElement('span');
    more.className = 'youmayalsolike-card-more';
    const moreLabel = document.createElement('span');
    moreLabel.className = 'youmayalsolike-card-more-label';
    moreLabel.textContent = readMoreLabel;
    more.appendChild(moreLabel);
    more.appendChild(readMoreIcon());

    bottom.appendChild(more);
    body.appendChild(bottom);
    card.appendChild(body);

    moveInstrumentation(row, card);
    built.push(card);
  });

  if (built.length < 2) {
    block.remove();
    return;
  }

  const colXl = built.length === 2 ? 'col-xl-6' : 'col-xl-4';
  built.forEach((cardEl) => {
    const col = document.createElement('div');
    col.className = `col-s-4 col-m-4 ${colXl}`;
    col.appendChild(cardEl);
    cardRow.appendChild(col);
  });

  inner.appendChild(cardRow);
  block.replaceChildren(inner);
}
