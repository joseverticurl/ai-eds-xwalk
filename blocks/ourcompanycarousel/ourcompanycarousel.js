/**
 * Our Company Carousel Block
 *
 * Structure contract (from user-provided HTML, ourcompanycarousel.html):
 * - block.children[0] = Section title row (cell 0: title text)
 * - block.children[1] = CTA link row (cell 0: <a>)
 * - block.children[2] = CTA text row (cell 0: button label)
 * - block.children[3+] = Carousel item rows
 *
 * Per item row (3 cells in provided HTML; model has image, imageAlt, name, title, link):
 * - row.children[0] = Image cell (picture/img); alt from img element
 * - row.children[1] = Name/title text cell (single cell in HTML)
 * - row.children[2] = Link cell (<a>)
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
const CHEVRON_LEFT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
const CHEVRON_RIGHT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';

function initCarousel(carouselTrack, cards) {
  if (cards.length <= 1) return;

  const track = carouselTrack;
  let currentIndex = 0;
  const cardCount = cards.length;

  function scrollToIndex(index) {
    currentIndex = index;
    if (currentIndex < 0) currentIndex = cardCount - 1;
    if (currentIndex >= cardCount) currentIndex = 0;
    const card = cards[currentIndex];
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function goPrev() {
    scrollToIndex(currentIndex - 1);
  }

  function goNext() {
    scrollToIndex(currentIndex + 1);
  }

  // Build Drag control (arrows + "Drag" label) - desktop style
  const dragControl = document.createElement('div');
  dragControl.classList.add('ourcompanycarousel-drag-control');
  dragControl.setAttribute('role', 'group');
  dragControl.setAttribute('aria-label', 'Carousel navigation');

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.classList.add('ourcompanycarousel-arrow', 'ourcompanycarousel-arrow-prev');
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = CHEVRON_LEFT_SVG;
  prevBtn.addEventListener('click', goPrev);

  const dragLabel = document.createElement('span');
  dragLabel.classList.add('ourcompanycarousel-drag-label');
  dragLabel.textContent = 'Drag';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.classList.add('ourcompanycarousel-arrow', 'ourcompanycarousel-arrow-next');
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = CHEVRON_RIGHT_SVG;
  nextBtn.addEventListener('click', goNext);

  dragControl.appendChild(prevBtn);
  dragControl.appendChild(dragLabel);
  dragControl.appendChild(nextBtn);

  const controlsWrapper = track.parentElement;
  if (controlsWrapper) {
    controlsWrapper.classList.add('ourcompanycarousel-controls-wrapper');
    controlsWrapper.appendChild(dragControl);
  }

  // Track scroll position to update currentIndex (for loop)
  track.addEventListener('scroll', () => {
    const { scrollLeft } = track;
    const cardWidth = cards[0]?.offsetWidth || 1;
    const newIndex = Math.round(scrollLeft / cardWidth) % cardCount;
    if (newIndex >= 0 && newIndex < cardCount) currentIndex = newIndex;
  });

  // Swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }, { passive: true });
}

export default function decorate(block) {
  const rows = [...block.children];

  // Parent rows: 0 = title, 1 = ctaLink, 2 = ctaText
  const titleRow = rows[0];
  const ctaLinkRow = rows[1];
  const ctaTextRow = rows[2];
  const titleText = extractText(titleRow?.children?.[0]) || 'Meet the people leading the way';
  const ctaLink = extractLink(ctaLinkRow?.children?.[0]) || '';
  let ctaText = extractText(ctaTextRow?.children?.[0]) || 'Meet all our leaders';
  if (!ctaText && ctaLinkRow) {
    const linkText = ctaLinkRow?.querySelector?.('a')?.textContent?.trim() ?? '';
    ctaText = (linkText.startsWith('/') || linkText.includes('http')) ? '' : linkText;
  }
  ctaText = ctaText || 'Meet all our leaders';

  // Item rows: 3+
  const itemRows = rows.slice(3);

  const wrapper = document.createElement('div');
  wrapper.classList.add('ourcompanycarousel-wrapper');

  // Section heading
  const heading = document.createElement('h2');
  heading.classList.add('ourcompanycarousel-title');
  heading.textContent = titleText;
  if (titleRow?.children?.[0]) moveInstrumentation(titleRow.children[0], heading);
  wrapper.appendChild(heading);

  // Carousel container
  const carouselOuter = document.createElement('div');
  carouselOuter.classList.add('ourcompanycarousel-carousel');
  carouselOuter.setAttribute('role', 'region');
  carouselOuter.setAttribute('aria-label', 'Leadership carousel');

  const track = document.createElement('div');
  track.classList.add('ourcompanycarousel-track');
  track.setAttribute('tabindex', '0');

  const cards = [];

  itemRows.forEach((row) => {
    const imgCell = row?.children?.[0];
    const nameCell = row?.children?.[1];
    const linkCell = row?.children?.[2];

    const pictureOrImg = imgCell?.querySelector?.('picture, img');
    const img = pictureOrImg?.tagName === 'IMG' ? pictureOrImg : pictureOrImg?.querySelector?.('img');
    const imgSrc = img?.getAttribute?.('src') || img?.src
      || imgCell?.querySelector?.('a')?.getAttribute?.('href') || imgCell?.querySelector?.('a')?.href || '';
    const altText = img?.getAttribute?.('alt') || img?.alt || '';
    const nameText = extractText(nameCell) ?? '';
    const link = extractLink(linkCell) || '#';

    const nameTitleParts = nameText ? nameText.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
    const namePart = nameTitleParts[0] || '';
    const titlePart = nameTitleParts[1] || '';

    const card = document.createElement('a');
    card.href = link;
    card.classList.add('ourcompanycarousel-card');
    card.setAttribute('aria-label', namePart ? `View profile of ${namePart}` : 'View profile');
    if (linkCell) moveInstrumentation(linkCell, card);

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('ourcompanycarousel-card-image');
    if (imgSrc) {
      const optimizedPic = createOptimizedPicture(
        imgSrc,
        altText || nameText,
        false,
        [{ media: '(min-width: 900px)', width: '400' }, { width: '350' }],
      );
      imageWrapper.appendChild(optimizedPic);
    }

    const contentArea = document.createElement('div');
    contentArea.classList.add('ourcompanycarousel-card-content');
    const textBlock = document.createElement('div');
    textBlock.classList.add('ourcompanycarousel-card-text');
    if (namePart) {
      const nameEl = document.createElement('div');
      nameEl.classList.add('ourcompanycarousel-card-name');
      nameEl.textContent = namePart;
      textBlock.appendChild(nameEl);
    }
    if (titlePart) {
      const titleEl = document.createElement('div');
      titleEl.classList.add('ourcompanycarousel-card-title');
      titleEl.textContent = titlePart;
      textBlock.appendChild(titleEl);
    }
    contentArea.appendChild(textBlock);
    const ctaBtn = document.createElement('span');
    ctaBtn.classList.add('ourcompanycarousel-card-cta');
    ctaBtn.innerHTML = ARROW_ICON_SVG;
    ctaBtn.setAttribute('aria-hidden', 'true');
    contentArea.appendChild(ctaBtn);

    card.appendChild(imageWrapper);
    card.appendChild(contentArea);
    track.appendChild(card);
    cards.push(card);
  });

  carouselOuter.appendChild(track);

  initCarousel(track, cards);

  wrapper.appendChild(carouselOuter);

  // Section CTA
  if (ctaLink) {
    const ctaBtn = document.createElement('a');
    ctaBtn.href = ctaLink;
    ctaBtn.classList.add('ourcompanycarousel-cta');
    ctaBtn.textContent = ctaText;
    ctaBtn.setAttribute('aria-label', ctaText);
    if (ctaLinkRow?.children?.[0]) moveInstrumentation(ctaLinkRow.children[0], ctaBtn);
    wrapper.appendChild(ctaBtn);
  }

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);
}
