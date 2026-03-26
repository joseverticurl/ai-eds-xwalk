import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getHref(el) {
  const link = el?.querySelector?.('a') || el?.querySelector?.('p a');
  return link?.getAttribute?.('href') || link?.href || '';
}

function normalizeCta(text) {
  return text.replace(/^readmore$/i, 'Read more');
}

function createCard(row) {
  const imageCell = row?.children?.[0];
  const category = getText(row?.children?.[1]);
  const title = getText(row?.children?.[2]);
  const href = getHref(row?.children?.[3]);
  const ctaText = normalizeCta(getText(row?.children?.[4]) || 'Read more');
  const picture = imageCell?.querySelector?.('picture');

  if (!picture || !title) return null;

  const card = document.createElement(href ? 'a' : 'article');
  card.className = 'youmayalsolike-card';
  if (href) {
    card.href = href;
    card.setAttribute('aria-label', title);
  }

  const media = document.createElement('div');
  media.className = 'youmayalsolike-card-media';
  media.appendChild(picture.cloneNode(true));

  const overlay = document.createElement('div');
  overlay.className = 'youmayalsolike-card-overlay';

  if (category) {
    const badge = document.createElement('span');
    badge.className = 'youmayalsolike-card-category';
    badge.textContent = category;
    overlay.appendChild(badge);
  }

  const heading = document.createElement('h3');
  heading.className = 'youmayalsolike-card-title';
  heading.textContent = title;
  overlay.appendChild(heading);

  const cta = document.createElement('span');
  cta.className = 'youmayalsolike-card-cta';
  cta.textContent = ctaText;
  overlay.appendChild(cta);

  media.appendChild(overlay);
  card.appendChild(media);
  moveInstrumentation(row, card);
  return card;
}

export default function decorate(block) {
  const rows = [...block.children];
  const headingText = getText(rows[0]?.children?.[0]) || 'You may also like';
  const auraClass = getText(rows[1]?.children?.[0]);
  const cardRows = rows.slice(2);

  const cards = cardRows.map(createCard).filter(Boolean).slice(0, 3);
  if (cards.length < 2) {
    block.replaceChildren();
    return;
  }

  if (auraClass) block.classList.add(auraClass);
  block.classList.toggle('is-two-cards', cards.length === 2);
  block.classList.toggle('is-three-cards', cards.length === 3);

  const wrapper = document.createElement('section');
  wrapper.className = 'youmayalsolike-wrapper';

  const heading = document.createElement('h2');
  heading.className = 'youmayalsolike-heading';
  heading.textContent = headingText;
  wrapper.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'youmayalsolike-grid';
  cards.forEach((card) => grid.appendChild(card));
  wrapper.appendChild(grid);

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);
}
