/**
 * You May Also Like Block
 *
 * Structure contract (from user-provided HTML):
 * - block.children[0] = title row; row.children[0] = section title text
 * - block.children[1] = aura row; row.children[0] = aura class value (e.g. aura-creative)
 * - block.children[2..n] = card item rows
 *
 * Each card row:
 * - row.children[0] = image (link to image URL or picture/img)
 * - row.children[1] = category (badge text)
 * - row.children[2] = title (article title)
 * - row.children[3] = link (anchor with article URL)
 * - row.children[4] = ctaText (e.g. Read more)
 *
 * @param {Element} block The block element
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getLink(el) {
  const link = el?.querySelector?.('a') || el?.querySelector?.('p a');
  return link?.getAttribute?.('href') || link?.href || '';
}

function getImageSrc(cell) {
  const picture = cell?.querySelector?.('picture');
  const img = cell?.querySelector?.('img') || picture?.querySelector?.('img');
  if (img) return img.src || img.getAttribute?.('src') || '';
  const link = cell?.querySelector?.('a') || cell?.querySelector?.('p a');
  if (link?.href) {
    const href = link.getAttribute?.('href') || link.href || '';
    if (/\.(avif|webp|jpg|jpeg|png|gif)(\?|$)/i.test(href)) return href;
  }
  return '';
}

function getImageAlt(cell) {
  const img = cell?.querySelector?.('img');
  return img?.alt || img?.getAttribute?.('alt') || '';
}

export default function decorate(block) {
  const rows = [...block.children];

  const title = getText(rows[0]?.children?.[0]);
  const aura = getText(rows[1]?.children?.[0]);
  const cardRows = rows.slice(2);

  if (cardRows.length < 2) {
    block.innerHTML = '';
    return;
  }

  const cardsToShow = cardRows.slice(0, 3);

  const wrapper = document.createElement('div');
  wrapper.className = 'youmayalsolike-wrapper';
  if (aura) wrapper.classList.add(aura);

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'youmayalsolike-title';
    heading.textContent = title;
    if (rows[0]?.children?.[0]) {
      moveInstrumentation(rows[0].children[0], heading);
    }
    wrapper.appendChild(heading);
  }

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'youmayalsolike-cards';

  cardsToShow.forEach((row, idx) => {
    const imageCell = row?.children?.[0];
    const category = getText(row?.children?.[1]);
    const cardTitle = getText(row?.children?.[2]);
    const linkCell = row?.children?.[3];
    const linkUrl = getLink(linkCell) || linkCell?.querySelector?.('a')?.href || '';
    const ctaText = getText(row?.children?.[4]) || 'Read more';

    const imageSrc = getImageSrc(imageCell);
    const imageAlt = getImageAlt(imageCell) || category || cardTitle;

    const card = document.createElement('a');
    card.className = 'youmayalsolike-card';
    card.href = linkUrl || '#';
    if (linkUrl.startsWith('http')) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    const cardInner = document.createElement('div');
    cardInner.className = 'youmayalsolike-card-inner';

    if (imageSrc) {
      const picture = createOptimizedPicture(
        imageSrc,
        imageAlt,
        false,
        [{ width: '440' }, { width: '880' }],
      );
      const cardImage = document.createElement('div');
      cardImage.className = 'youmayalsolike-card-image';
      cardImage.appendChild(picture);
      cardInner.appendChild(cardImage);
    }

    const cardContent = document.createElement('div');
    cardContent.className = 'youmayalsolike-card-content';

    if (category) {
      const badge = document.createElement('span');
      badge.className = 'youmayalsolike-card-badge';
      badge.textContent = category;
      cardContent.appendChild(badge);
    }

    if (cardTitle) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'youmayalsolike-card-title';
      titleEl.textContent = cardTitle;
      cardContent.appendChild(titleEl);
    }

    const cta = document.createElement('span');
    cta.className = 'youmayalsolike-card-cta';
    cta.textContent = ctaText;
    cardContent.appendChild(cta);

    cardInner.appendChild(cardContent);
    card.appendChild(cardInner);

    moveInstrumentation(row, card);
    cardsContainer.appendChild(card);
  });

  wrapper.appendChild(cardsContainer);
  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);
}
