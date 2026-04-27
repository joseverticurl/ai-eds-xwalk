/**
 * You May Also Like block
 *
 * Structure contract (Universal Editor — index-based):
 * - block.children[0] = section heading row (first cell: text, default "You may also like")
 * - block.children[1] = style / aura row (first cell: class token, e.g. aura-creative)
 * - block.children[2+] = card rows; each row has 5 cells:
 *   [0] picture, [1] category, [2] title, [3] link cell with <a>, [4] read-more label
 *
 * @param {Element} block The block element
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_HEADING = 'You may also like';
const BP = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }];

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getImageSrc(container) {
  const img = container?.querySelector?.('img');
  return img?.getAttribute?.('src') || img?.src || '';
}

function normalizeReadmoreLabel(text) {
  const t = text?.trim() ?? '';
  if (!t) return 'Read more';
  if (/^readmore$/i.test(t)) return 'Read more';
  return t;
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const headingText = getText(rows[0]?.children?.[0]) || DEFAULT_HEADING;
  const auraToken = getText(rows[1]?.children?.[0]);
  if (auraToken) {
    auraToken.split(/\s+/).filter(Boolean).forEach((c) => block.classList.add(c));
  }

  let itemRows = rows.slice(2);
  if (itemRows.length < 2) {
    block.remove();
    return;
  }
  if (itemRows.length > 3) {
    itemRows = itemRows.slice(0, 3);
  }

  const count = itemRows.length;
  const hasUuid = typeof crypto !== 'undefined' && crypto.randomUUID;
  const headingId = hasUuid
    ? `youmayalsolike-h-${crypto.randomUUID()}`
    : 'youmayalsolike-heading';

  const section = document.createElement('section');
  section.className = 'youmayalsolike-inner';
  section.dataset.cardCount = String(count);
  section.setAttribute('aria-labelledby', headingId);

  const h2 = document.createElement('h2');
  h2.id = headingId;
  h2.className = 'youmayalsolike-heading';
  h2.textContent = headingText;

  const grid = document.createElement('div');
  grid.className = 'youmayalsolike-grid';

  itemRows.forEach((itemRow) => {
    const cells = [...itemRow.children];
    const firstCell = cells[0];
    const pictureEl = firstCell?.querySelector?.('picture');
    const imgEl = firstCell?.querySelector?.('img');
    const src = getImageSrc(firstCell);
    const alt = imgEl?.getAttribute?.('alt') || '';
    const category = getText(cells[1]);
    const title = getText(cells[2]);
    const linkCell = cells[3];
    const rawAnchor = linkCell?.querySelector?.('a');
    const href = rawAnchor?.getAttribute?.('href') || rawAnchor?.href || '#';
    const readmore = normalizeReadmoreLabel(getText(cells[4]));

    const article = document.createElement('article');
    article.className = 'youmayalsolike-card';

    const cardLink = document.createElement('a');
    cardLink.className = 'youmayalsolike-card-link';
    cardLink.href = href;
    if (rawAnchor) moveInstrumentation(rawAnchor, cardLink);
    const titleText = title || category || 'Read article';
    cardLink.setAttribute('aria-label', titleText);

    const media = document.createElement('div');
    media.className = 'youmayalsolike-card-media';

    if (src) {
      const optimized = createOptimizedPicture(
        src,
        alt,
        false,
        BP,
      );
      if (pictureEl) moveInstrumentation(pictureEl, optimized);
      else if (imgEl) moveInstrumentation(imgEl, optimized);
      media.appendChild(optimized);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'youmayalsolike-card-media-empty';
      placeholder.setAttribute('role', 'presentation');
      media.appendChild(placeholder);
    }

    const grad = document.createElement('div');
    grad.className = 'youmayalsolike-card-gradient';
    grad.setAttribute('aria-hidden', 'true');
    media.appendChild(grad);

    const content = document.createElement('div');
    content.className = 'youmayalsolike-card-content';

    if (category) {
      const cat = document.createElement('p');
      cat.className = 'youmayalsolike-card-category';
      cat.textContent = category;
      content.appendChild(cat);
    }

    const bottom = document.createElement('div');
    bottom.className = 'youmayalsolike-card-bottom';

    if (title) {
      const h3 = document.createElement('h3');
      h3.className = 'youmayalsolike-card-title';
      h3.textContent = title;
      bottom.appendChild(h3);
    }

    const cta = document.createElement('p');
    cta.className = 'youmayalsolike-card-readmore';
    cta.textContent = readmore;

    const ctaIcon = document.createElement('span');
    ctaIcon.className = 'youmayalsolike-card-readmore-icon';
    ctaIcon.setAttribute('aria-hidden', 'true');
    cta.appendChild(ctaIcon);

    bottom.appendChild(cta);
    content.appendChild(bottom);
    cardLink.appendChild(media);
    cardLink.appendChild(content);
    article.appendChild(cardLink);
    grid.appendChild(article);
  });

  section.append(h2, grid);
  block.replaceChildren(section);
}
