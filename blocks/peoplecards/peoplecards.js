/**
 * PeopleCards Block
 *
 * Structure contract (from user-provided HTML peoplecard.html):
 * - block.children[0] = title row
 * - block.children[1] = ctaLabel row
 * - block.children[2] = ctaLink row
 * - block.children[3] = backgroundStyle row
 * - block.children[4+] = card item rows
 *
 * Each card row (3 or 5 cells depending on authoring):
 * - 3-cell: row.children[0] = picture, row.children[1] = title (job), row.children[2] = profileLink
 * - 5-cell: row.children[0] = picture, [1] = imageAlt, [2] = name, [3] = title, [4] = profileLink
 * Image alt is read from img in picture when not a separate cell.
 *
 * @param {Element} block The block element
 */

import {
  createOptimizedPicture,
  loadCSS,
  loadScript,
} from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getLink(el) {
  const link = el?.querySelector?.('a') || el?.querySelector?.('p a');
  return link?.getAttribute?.('href') || link?.href || '';
}

function getImageSrc(pictureEl) {
  const img = pictureEl?.querySelector?.('img');
  return img?.src || img?.getAttribute?.('src') || '';
}

function getImageAlt(pictureEl) {
  const img = pictureEl?.querySelector?.('img');
  return img?.alt || img?.getAttribute?.('alt') || '';
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Parent fields (indices 0-3)
  const title = getText(rows[0]?.children?.[0]);
  const ctaLabel = getText(rows[1]?.children?.[0]);
  const ctaLinkEl = rows[2]?.children?.[0];
  const ctaLink = getLink(ctaLinkEl) || (ctaLinkEl ? getText(ctaLinkEl.querySelector('a')) : '');
  const ctaLabelFinal = ctaLabel || (ctaLinkEl ? getText(ctaLinkEl.querySelector('a')) : '');
  const backgroundStyle = getText(rows[3]?.children?.[0]) || 'none';

  // Card items (indices 4+)
  const cardRows = rows.slice(4);
  const cards = cardRows.map((row) => {
    const cells = row?.children || [];
    const pictureEl = row?.querySelector?.('picture');
    const imgEl = pictureEl?.querySelector?.('img');
    const numCells = cells.length;

    let image = '';
    let imageAlt = '';
    let name = '';
    let titleText = '';
    let profileLink = '';

    if (numCells >= 5) {
      image = getImageSrc(pictureEl) || getImageSrc(imgEl);
      imageAlt = getText(cells[1]) || getImageAlt(pictureEl);
      name = getText(cells[2]);
      titleText = getText(cells[3]);
      const linkCell = cells[4];
      profileLink = getLink(linkCell) || (linkCell ? getText(linkCell.querySelector('a')) : '');
    } else {
      image = getImageSrc(pictureEl) || getImageSrc(imgEl);
      imageAlt = getImageAlt(pictureEl);
      name = '';
      titleText = getText(cells[1]);
      const linkCell = cells[2];
      profileLink = getLink(linkCell) || (linkCell ? getText(linkCell.querySelector('a')) : '');
      if (imageAlt && imageAlt.length > 2 && imageAlt.includes(' ')) {
        name = imageAlt;
      }
    }

    return {
      image, imageAlt, name, title: titleText, profileLink,
      sourceRow: row,
    };
  }).filter((c) => c.image || c.title || c.profileLink);

  if (cards.length < 1) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'peoplecards-wrapper';
  if (backgroundStyle === 'aura') {
    wrapper.classList.add('peoplecards-wrapper--aura');
  }

  const content = document.createElement('div');
  content.className = 'peoplecards-content';

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'peoplecards-heading';
    heading.textContent = title;
    content.appendChild(heading);
  }

  const carouselWrap = document.createElement('div');
  carouselWrap.className = 'peoplecards-carousel';
  const swiperWrap = document.createElement('div');
  swiperWrap.className = 'swiper peoplecards-swiper';
  swiperWrap.innerHTML = `
    <div class="swiper-wrapper"></div>
    <button type="button" class="swiper-button-prev peoplecards-prev" aria-label="Previous slide"></button>
    <button type="button" class="swiper-button-next peoplecards-next" aria-label="Next slide"></button>
    <div class="peoplecards-pagination swiper-pagination"></div>
  `;
  const swiperWrapper = swiperWrap.querySelector('.swiper-wrapper');
  const prevBtn = swiperWrap.querySelector('.peoplecards-prev');
  const nextBtn = swiperWrap.querySelector('.peoplecards-next');
  const paginationEl = swiperWrap.querySelector('.peoplecards-pagination');

  const codeBasePath = window.hlx?.codeBasePath || '';

  cards.forEach((card) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide peoplecards-slide';

    const cardInner = document.createElement('div');
    cardInner.className = 'peoplecards-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'peoplecards-card-image';
    if (card.image) {
      const optimizedPic = createOptimizedPicture(
        card.image,
        card.imageAlt || card.title || '',
        false,
        [{ width: '440' }, { width: '880' }],
      );
      imageWrap.appendChild(optimizedPic);
      const overlay = document.createElement('div');
      overlay.className = 'peoplecards-card-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      imageWrap.appendChild(overlay);
    }
    cardInner.appendChild(imageWrap);

    const infoWrap = document.createElement('div');
    infoWrap.className = 'peoplecards-card-info';
    const profileInfo = document.createElement('div');
    profileInfo.className = 'peoplecards-card-profile';
    if (card.name) {
      const nameEl = document.createElement('p');
      nameEl.className = 'peoplecards-card-name';
      nameEl.textContent = card.name;
      profileInfo.appendChild(nameEl);
    }
    if (card.title) {
      const titleEl = document.createElement('p');
      titleEl.className = 'peoplecards-card-title';
      titleEl.textContent = card.title;
      profileInfo.appendChild(titleEl);
    }
    infoWrap.appendChild(profileInfo);

    const btnWrap = document.createElement('div');
    btnWrap.className = 'peoplecards-card-button-wrap';
    if (card.profileLink) {
      const profileBtn = document.createElement('a');
      profileBtn.href = card.profileLink;
      profileBtn.className = 'peoplecards-card-button';
      profileBtn.setAttribute('aria-label', card.name ? `View ${card.name} profile` : 'View profile');
      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'icon icon-arrow-right';
      const arrowImg = document.createElement('img');
      arrowImg.src = `${codeBasePath}/icons/arrow-right.svg`;
      arrowImg.alt = '';
      arrowImg.width = 24;
      arrowImg.height = 24;
      arrowImg.loading = 'lazy';
      arrowSpan.appendChild(arrowImg);
      profileBtn.appendChild(arrowSpan);
      if (card.sourceRow) moveInstrumentation(card.sourceRow, profileBtn);
      btnWrap.appendChild(profileBtn);
    } else {
      const profileBtn = document.createElement('span');
      profileBtn.className = 'peoplecards-card-button peoplecards-card-button--no-link';
      profileBtn.setAttribute('aria-hidden', 'true');
      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'icon icon-arrow-right';
      const arrowImg = document.createElement('img');
      arrowImg.src = `${codeBasePath}/icons/arrow-right.svg`;
      arrowImg.alt = '';
      arrowImg.width = 24;
      arrowImg.height = 24;
      arrowSpan.appendChild(arrowImg);
      profileBtn.appendChild(arrowSpan);
      btnWrap.appendChild(profileBtn);
    }
    infoWrap.appendChild(btnWrap);

    cardInner.appendChild(infoWrap);
    slide.appendChild(cardInner);
    swiperWrapper.appendChild(slide);
  });

  carouselWrap.appendChild(swiperWrap);
  content.appendChild(carouselWrap);

  if (ctaLink && (ctaLabelFinal || 'Meet all our leaders')) {
    const ctaBtn = document.createElement('a');
    ctaBtn.href = ctaLink;
    ctaBtn.className = 'peoplecards-cta';
    ctaBtn.textContent = ctaLabelFinal || 'Meet all our leaders';
    if (ctaLinkEl) moveInstrumentation(ctaLinkEl, ctaBtn);
    const isExternal = ctaLink.startsWith('http://') || ctaLink.startsWith('https://');
    if (isExternal) {
      ctaBtn.target = '_blank';
      ctaBtn.rel = 'noopener noreferrer';
    }
    content.appendChild(ctaBtn);
  }

  wrapper.appendChild(content);
  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);

  await Promise.all([
    loadCSS(SWIPER_CSS),
    loadScript(SWIPER_JS),
  ]);

  const Swiper = globalThis.Swiper;
  if (!Swiper) return;

  const swiper = new Swiper(swiperWrap, {
    grabCursor: true,
    spaceBetween: 20,
    slidesPerView: 1.15,
    slidesPerGroup: 1,
    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
    pagination: {
      el: paginationEl,
      clickable: true,
      type: 'bullets',
    },
    breakpoints: {
      375: {
        slidesPerView: 1.15,
        spaceBetween: 16,
      },
      600: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      900: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
    },
  });
}
