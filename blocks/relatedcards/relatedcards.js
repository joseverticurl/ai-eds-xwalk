/**
 * Related Cards Block
 *
 * Structure contract (per user-story-relatedcards.md):
 * - block.children[0] = Section title row
 * - block.children[1..N] = Card rows (variable, minimum 1)
 *
 * Per card row (4 cells, max per xwalk rule):
 * - row.children[0] = Image (picture/img); alt from img
 * - row.children[1] = Category
 * - row.children[2] = Title
 * - row.children[3] = Link
 *
 * @param {Element} block The block element
 */
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const ARROW_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';
const CHEVRON_RIGHT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';

const PLACEHOLDER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="370" height="280" viewBox="0 0 370 280"><rect width="370" height="280" fill="#e8e8e8"/><text x="50%" y="50%" fill="#999" text-anchor="middle" dy=".3em" font-size="14">Image</text></svg>';
const PLACEHOLDER_IMG = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_SVG)}`;

function extractText(cell) {
  if (!cell) return '';
  let text = cell?.textContent?.trim() ?? '';
  if (!text) text = cell?.querySelector?.('p')?.textContent?.trim() ?? '';
  return text;
}

function extractLink(cell) {
  if (!cell) return '';
  const linkEl = cell?.querySelector?.('a') || cell?.querySelector?.('p a');
  return linkEl?.getAttribute?.('href') || linkEl?.href || '';
}

function findLinkInRow(row) {
  for (let i = 0; i < (row?.children?.length ?? 0); i += 1) {
    const href = extractLink(row.children[i]);
    if (href) return href;
  }
  return '';
}

function initScrollControl(track, cards) {
  if (cards.length <= 3) return;

  let currentIndex = 0;
  const cardCount = cards.length;

  function scrollToIndex(index) {
    currentIndex = Math.max(0, Math.min(index, cardCount - 1));
    const card = cards[currentIndex];
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.classList.add('relatedcards-scroll-btn');
  nextBtn.setAttribute('aria-label', 'View more cards');
  nextBtn.innerHTML = CHEVRON_RIGHT_SVG;
  nextBtn.addEventListener('click', () => scrollToIndex(currentIndex + 1));

  const controlsWrapper = track.parentElement;
  if (controlsWrapper) {
    controlsWrapper.classList.add('relatedcards-controls-wrapper');
    controlsWrapper.appendChild(nextBtn);
  }

  track.addEventListener('scroll', () => {
    const { scrollLeft } = track;
    const cardWidth = cards[0]?.offsetWidth || 1;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex >= 0 && newIndex < cardCount) currentIndex = newIndex;
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const titleRow = rows[0];
  const cardRows = rows.slice(1);

  const titleText = extractText(titleRow?.children?.[0]) || 'You may also like';

  const container = document.createElement('div');
  container.classList.add('relatedcards-wrapper');

  const heading = document.createElement('h2');
  heading.classList.add('relatedcards-title');
  heading.textContent = titleText;
  if (titleRow) moveInstrumentation(titleRow?.children?.[0], heading);
  container.appendChild(heading);

  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add('relatedcards-cards');
  if (cardRows.length > 3) {
    cardsContainer.classList.add('relatedcards-cards-scrollable');
  }

  const cards = [];

  cardRows.forEach((row) => {
    const imgCell = row?.children?.[0];
    const categoryCell = row?.children?.[1];
    const titleCell = row?.children?.[2];
    const linkCell = row?.children?.[3];

    const pictureOrImg = imgCell?.querySelector?.('picture, img');
    const img = pictureOrImg?.tagName === 'IMG' ? pictureOrImg : pictureOrImg?.querySelector?.('img');
    const imgSrc = img?.getAttribute?.('src') || img?.src
      || imgCell?.querySelector?.('a')?.getAttribute?.('href') || imgCell?.querySelector?.('a')?.href || '';
    const altText = img?.getAttribute?.('alt') || img?.alt || extractText(titleCell) || '';
    const category = extractText(categoryCell) ?? '';
    const cardTitle = extractText(titleCell) ?? '';
    const link = extractLink(linkCell) || findLinkInRow(row) || '#';
    const ctaText = 'Read more';

    const card = document.createElement('a');
    card.href = link;
    card.classList.add('relatedcards-card');
    const ariaLabel = [cardTitle, category].filter(Boolean).join(', ').trim() || 'Read article';
    card.setAttribute('aria-label', ariaLabel);
    if (linkCell) moveInstrumentation(linkCell, card);

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('relatedcards-card-image');

    if (imgSrc) {
      const optimizedPic = createOptimizedPicture(
        imgSrc,
        altText,
        false,
        [{ media: '(min-width: 900px)', width: '750' }, { width: '750' }],
      );
      const imgEl = optimizedPic.querySelector('img');
      if (imgEl) {
        imgEl.addEventListener('error', () => {
          imgEl.src = PLACEHOLDER_IMG;
          imgEl.alt = altText || 'Placeholder';
          imgEl.onerror = null;
        });
      }
      imageWrapper.appendChild(optimizedPic);
    } else {
      const placeholderImg = document.createElement('img');
      placeholderImg.src = PLACEHOLDER_IMG;
      placeholderImg.alt = altText || 'Placeholder';
      imageWrapper.appendChild(placeholderImg);
    }

    const overlay = document.createElement('div');
    overlay.classList.add('relatedcards-card-overlay');

    if (category) {
      const tag = document.createElement('span');
      tag.classList.add('relatedcards-card-tag');
      tag.textContent = category;
      overlay.appendChild(tag);
    }

    if (cardTitle) {
      const titleEl = document.createElement('h3');
      titleEl.classList.add('relatedcards-card-title');
      titleEl.textContent = cardTitle;
      overlay.appendChild(titleEl);
    }

    const cta = document.createElement('span');
    cta.classList.add('relatedcards-card-cta');
    cta.innerHTML = `${ctaText} ${ARROW_ICON_SVG}`;
    overlay.appendChild(cta);

    card.appendChild(imageWrapper);
    card.appendChild(overlay);
    cardsContainer.appendChild(card);
    cards.push(card);
  });

  container.appendChild(cardsContainer);

  if (cards.length > 3) {
    initScrollControl(cardsContainer, cards);
  }

  moveInstrumentation(block, container);
  block.replaceChildren(container);
}
