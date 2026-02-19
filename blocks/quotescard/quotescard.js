/**
 * Quotes Card Block
 *
 * Structure contract (from user-provided HTML, quotescard.html):
 * - block.children[0] = CTA link row (cell 0: <a>)
 * - block.children[1] = CTA text row (cell 0: text)
 * - block.children[2] = CTA target row (cell 0: _self|_blank)
 * - block.children[3+] = Quote card rows
 *
 * Per quote card row:
 * - row.children[0] = Image cell (picture/img)
 * - row.children[1] = Quote text cell
 * - row.children[2] = Author name cell
 * - row.children[3] = Author title cell
 * - row.children[4] = Author location cell
 *
 * @param {Element} block The block element
 */
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function extractText(cell) {
  if (!cell) return '';
  let text = cell?.textContent?.trim() ?? '';
  if (!text) text = cell?.querySelector?.('p')?.textContent?.trim() ?? '';
  return text;
}

function extractLink(cell) {
  const linkEl = cell?.querySelector?.('a') || cell?.querySelector?.('p a');
  return linkEl?.getAttribute?.('href') || linkEl?.href || '';
}

export default function decorate(block) {
  const rows = [...block.children];

  // CTA: rows 0, 1, 2
  const ctaLinkCell = rows[0]?.children?.[0];
  const ctaTextCell = rows[1]?.children?.[0];
  const ctaTargetCell = rows[2]?.children?.[0];
  const ctaLink = extractLink(ctaLinkCell);
  let ctaText = extractText(ctaTextCell);
  if (!ctaText && ctaLinkCell) {
    const linkText = ctaLinkCell?.querySelector?.('a')?.textContent?.trim() ?? '';
    ctaText = (linkText.startsWith('/') || linkText.includes('http')) ? '' : linkText;
  }
  const ctaTarget = extractText(ctaTargetCell) || '_self';

  // Quote cards: rows 3+
  const cardRows = rows.slice(3);

  const leftCol = document.createElement('div');
  leftCol.classList.add('quotescard-left');

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('quotescard-image-container');

  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add('quotescard-cards');

  const cards = [];
  cardRows.forEach((row) => {
    const imgCell = row?.children?.[0];
    const quoteCell = row?.children?.[1];
    const nameCell = row?.children?.[2];
    const titleCell = row?.children?.[3];
    const locationCell = row?.children?.[4];

    const pictureOrImg = imgCell?.querySelector?.('picture, img');
    const img = pictureOrImg?.tagName === 'IMG' ? pictureOrImg : pictureOrImg?.querySelector?.('img');
    const imgSrc = img?.getAttribute?.('src') || img?.src
      || imgCell?.querySelector?.('a')?.getAttribute?.('href') || imgCell?.querySelector?.('a')?.href || '';
    const altText = img?.getAttribute?.('alt') || img?.alt || '';
    const quote = extractText(quoteCell) ?? '';
    const authorName = extractText(nameCell) ?? '';
    const authorTitle = extractText(titleCell) ?? '';
    const authorLocation = extractText(locationCell) ?? '';

    const card = document.createElement('div');
    card.classList.add('quotescard-card');

    const quoteEl = document.createElement('blockquote');
    quoteEl.classList.add('quotescard-quote');
    quoteEl.textContent = quote;

    const attribution = document.createElement('div');
    attribution.classList.add('quotescard-attribution');
    attribution.textContent = [authorName, authorTitle, authorLocation].filter(Boolean).join(', ');

    card.appendChild(quoteEl);
    card.appendChild(attribution);
    if (row) moveInstrumentation(row, card);
    cardsContainer.appendChild(card);

    cards.push({ imgSrc, altText, card });
  });

  // Initial image (first card)
  let currentImageEl = null;
  if (cards.length > 0 && cards[0].imgSrc) {
    const optimizedPic = createOptimizedPicture(
      cards[0].imgSrc,
      cards[0].altText,
      false,
      [{ media: '(min-width: 900px)', width: '1440' }, { width: '750' }],
    );
    currentImageEl = optimizedPic;
    imageContainer.appendChild(optimizedPic);
  }

  // CTA button
  if (ctaLink) {
    const cta = document.createElement('a');
    cta.href = ctaLink;
    cta.textContent = ctaText || 'Learn more';
    cta.target = ctaTarget;
    cta.classList.add('quotescard-cta');
    if (ctaTarget === '_blank') cta.rel = 'noopener noreferrer';
    if (ctaLinkCell) moveInstrumentation(ctaLinkCell, cta);
    leftCol.appendChild(imageContainer);
    leftCol.appendChild(cta);
  } else {
    leftCol.appendChild(imageContainer);
  }

  // Scroll-driven image update via IntersectionObserver
  if (cards.length > 1 && currentImageEl && imageContainer) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const cardEl = entry.target;
          const idx = cards.findIndex((c) => c.card === cardEl);
          if (idx >= 0 && cards[idx].imgSrc) {
            const img = currentImageEl?.querySelector?.('img');
            if (img) {
              const optimizedPic = createOptimizedPicture(
                cards[idx].imgSrc,
                cards[idx].altText,
                false,
                [{ media: '(min-width: 900px)', width: '1440' }, { width: '750' }],
              );
              moveInstrumentation(img, optimizedPic.querySelector('img'));
              currentImageEl.replaceWith(optimizedPic);
              currentImageEl = optimizedPic;
            }
          }
        });
      },
      { threshold: 0.5, rootMargin: '0px 0px -20% 0px' },
    );
    cards.forEach((c) => observer.observe(c.card));
  }

  const wrapper = document.createElement('div');
  wrapper.classList.add('quotescard-wrapper');
  wrapper.appendChild(leftCol);
  wrapper.appendChild(cardsContainer);

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);
}
