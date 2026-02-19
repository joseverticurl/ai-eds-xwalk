/**
 * Related Articles Block
 *
 * Structure contract (from user-provided HTML, relatedarticles.html):
 * - block.children[0] = Section title row (cell 0: title text)
 * - block.children[1..3] = Article item rows
 *
 * Per article row (4 cells):
 * - row.children[0] = Image cell (picture/img)
 * - row.children[1] = Category cell
 * - row.children[2] = Title cell
 * - row.children[3] = Link cell (<a>)
 * Note: Alt text extracted from img inside picture element
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

const ARROW_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';

export default function decorate(block) {
  const rows = [...block.children];

  // Section title: block.children[0]
  const titleRow = rows[0];
  const titleText = extractText(titleRow?.children?.[0]) || 'You may also like';

  // Article rows: block.children[1..3]
  const articleRows = rows.slice(1);

  const container = document.createElement('div');
  container.classList.add('relatedarticles-wrapper');

  // Section heading
  const heading = document.createElement('h2');
  heading.classList.add('relatedarticles-title');
  heading.textContent = titleText;
  if (titleRow) moveInstrumentation(titleRow?.children?.[0], heading);
  container.appendChild(heading);

  // Cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add('relatedarticles-cards');

  articleRows.forEach((row) => {
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
    const articleTitle = extractText(titleCell) ?? '';
    const link = extractLink(linkCell) || '#';

    const card = document.createElement('a');
    card.href = link;
    card.classList.add('relatedarticles-card');
    card.setAttribute('aria-label', articleTitle || 'Read article');

    if (linkCell) moveInstrumentation(linkCell, card);

    // Image wrapper with overlay
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('relatedarticles-card-image');

    if (imgSrc) {
      const optimizedPic = createOptimizedPicture(
        imgSrc,
        altText,
        false,
        [{ media: '(min-width: 900px)', width: '750' }, { width: '750' }],
      );
      imageWrapper.appendChild(optimizedPic);
    }

    // Overlay for text readability
    const overlay = document.createElement('div');
    overlay.classList.add('relatedarticles-card-overlay');

    if (category) {
      const tag = document.createElement('span');
      tag.classList.add('relatedarticles-card-tag');
      tag.textContent = category;
      overlay.appendChild(tag);
    }

    if (articleTitle) {
      const titleEl = document.createElement('h3');
      titleEl.classList.add('relatedarticles-card-title');
      titleEl.textContent = articleTitle;
      overlay.appendChild(titleEl);
    }

    // Read more CTA (visible on mobile only via CSS)
    const cta = document.createElement('span');
    cta.classList.add('relatedarticles-card-cta');
    cta.innerHTML = `Read more ${ARROW_ICON_SVG}`;
    overlay.appendChild(cta);

    card.appendChild(imageWrapper);
    card.appendChild(overlay);
    cardsContainer.appendChild(card);
  });

  container.appendChild(cardsContainer);
  moveInstrumentation(block, container);
  block.replaceChildren(container);
}
