/**
 * Career Timeline Block
 *
 * Structure contract (from user-provided HTML):
 * - block.children[0] = title row; row.children[0] = section title
 * - block.children[1] = aura row; row.children[0] = aura class value
 * - block.children[2..n] = card item rows
 *
 * Card item row:
 * - row.children[0] = image (picture/img)
 * - row.children[1] = category
 * - row.children[2] = title
 * - row.children[3] = link (anchor)
 * - row.children[4] = cta text
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

function isExternalLink(url) {
  return /^https?:\/\//.test(url);
}

export default function decorate(block) {
  const rows = [...block.children];

  const sectionTitle = getText(rows[0]?.children?.[0]);
  const aura = getText(rows[1]?.children?.[0]);
  const cardRows = rows.slice(2);

  // Business rule: do not render when fewer than 2 cards exist.
  if (cardRows.length < 2) {
    block.replaceChildren();
    return;
  }

  const cardsToShow = cardRows.slice(0, 3);
  const cardsCount = cardsToShow.length;

  const wrapper = document.createElement('div');
  wrapper.className = 'careertimeline-wrapper';
  if (aura) wrapper.classList.add(aura);

  if (sectionTitle) {
    const heading = document.createElement('h2');
    heading.className = 'careertimeline-title';
    heading.textContent = sectionTitle;
    if (rows[0]?.children?.[0]) moveInstrumentation(rows[0].children[0], heading);
    wrapper.appendChild(heading);
  }

  const cardsContainer = document.createElement('div');
  cardsContainer.className = `careertimeline-cards row careertimeline-cards-count-${cardsCount}`;

  cardsToShow.forEach((row) => {
    const imageCell = row?.children?.[0];
    const category = getText(row?.children?.[1]);
    const cardTitle = getText(row?.children?.[2]);
    const linkCell = row?.children?.[3];
    const linkUrl = getLink(linkCell);
    const ctaText = getText(row?.children?.[4]) || 'Read more';
    const imageSrc = getImageSrc(imageCell);
    const imageAlt = getImageAlt(imageCell) || category || cardTitle;

    const card = document.createElement('a');
    card.className = 'careertimeline-card col-4 col-md-3 col-lg-4';
    card.href = linkUrl || '#';
    card.setAttribute('aria-label', cardTitle || ctaText);
    if (isExternalLink(card.href)) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    const cardInner = document.createElement('div');
    cardInner.className = 'careertimeline-card-inner';

    if (imageSrc) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'careertimeline-card-image';
      const picture = createOptimizedPicture(imageSrc, imageAlt, false, [{ width: '750' }, { width: '2000' }]);
      imageWrap.appendChild(picture);
      cardInner.appendChild(imageWrap);
    }

    const content = document.createElement('div');
    content.className = 'careertimeline-card-content';

    if (category) {
      const badge = document.createElement('span');
      badge.className = 'careertimeline-card-badge';
      badge.textContent = category;
      content.appendChild(badge);
    }

    if (cardTitle) {
      const title = document.createElement('h3');
      title.className = 'careertimeline-card-title';
      title.textContent = cardTitle;
      content.appendChild(title);
    }

    const cta = document.createElement('span');
    cta.className = 'careertimeline-card-cta';
    cta.textContent = ctaText.replace(/^readmore$/i, 'Read more');
    content.appendChild(cta);

    cardInner.appendChild(content);
    card.appendChild(cardInner);
    moveInstrumentation(row, card);
    cardsContainer.appendChild(card);
  });

  wrapper.appendChild(cardsContainer);
  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);
}
