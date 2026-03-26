import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(node) {
  return node?.textContent?.trim() || '';
}

function decodeHtmlEntities(value) {
  if (!value) return '';
  return value.replaceAll('&#x26;', '&');
}

function getImageData(cell) {
  const img = cell?.querySelector('img');
  if (!img) return { src: '', alt: '' };
  return {
    src: decodeHtmlEntities(img.getAttribute('src') || img.src || ''),
    alt: img.getAttribute('alt') || '',
  };
}

function getLink(cell) {
  const link = cell?.querySelector('a');
  return decodeHtmlEntities(link?.getAttribute('href') || '');
}

function buildCard(card, index) {
  const article = document.createElement('article');
  article.className = 'youmayalsolike-card';

  const bg = document.createElement('div');
  bg.className = 'youmayalsolike-card-bg';
  if (card.image.src) {
    const pic = createOptimizedPicture(card.image.src, card.image.alt, false, [
      { media: '(min-width: 600px)', width: '1200' },
      { width: '750' },
    ]);
    bg.appendChild(pic);
  }

  const overlay = document.createElement('div');
  overlay.className = 'youmayalsolike-card-content';

  if (card.category) {
    const category = document.createElement('p');
    category.className = 'youmayalsolike-card-category';
    category.textContent = card.category;
    overlay.appendChild(category);
  }

  if (card.title) {
    const title = document.createElement('h3');
    title.className = 'youmayalsolike-card-title';
    title.textContent = card.title;
    overlay.appendChild(title);
  }

  if (card.mobileCta) {
    const cta = document.createElement('span');
    cta.className = 'youmayalsolike-card-mobile-cta';
    cta.textContent = card.mobileCta;
    overlay.appendChild(cta);
  }

  bg.appendChild(overlay);
  article.appendChild(bg);

  const href = card.link || '#';
  const clickable = document.createElement('a');
  clickable.className = 'youmayalsolike-card-link';
  clickable.href = href;
  clickable.setAttribute('aria-label', card.title || `Related article ${index + 1}`);
  clickable.appendChild(article);
  moveInstrumentation(card.row, clickable);

  return clickable;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 4) {
    block.replaceChildren();
    return;
  }

  const title = getText(rows[0]?.children?.[0]);
  const auraStyle = getText(rows[1]?.children?.[0]).toLowerCase();

  const rawCards = rows.slice(2).map((row) => ({
    row,
    image: getImageData(row.children[0]),
    category: getText(row.children[1]),
    title: getText(row.children[2]),
    link: getLink(row.children[3]),
    mobileCta: getText(row.children[4]) || 'Read more',
  }));

  if (rawCards.length < 2) {
    block.replaceChildren();
    return;
  }

  const cards = rawCards.slice(0, 3);
  const countClass = cards.length === 2 ? 'is-two-cards' : 'is-three-cards';

  const wrapper = document.createElement('div');
  wrapper.className = `youmayalsolike-wrapper ${countClass}`;
  if (auraStyle) wrapper.classList.add(auraStyle);

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'youmayalsolike-heading';
    heading.textContent = title;
    wrapper.appendChild(heading);
  }

  const list = document.createElement('div');
  list.className = 'youmayalsolike-cards';
  cards.forEach((card, index) => {
    list.appendChild(buildCard(card, index));
  });

  wrapper.appendChild(list);
  block.replaceChildren(wrapper);
}
