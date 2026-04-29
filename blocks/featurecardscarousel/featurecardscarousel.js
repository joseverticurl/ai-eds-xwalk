/**
 * Feature Cards Carousel Block
 *
 * Structure contract (from user-provided HTML):
 * - block.children[0] = title row
 * - block.children[1] = tag row
 * - block.children[2] = subheading row
 * - block.children[3] = cta1Link row
 * - block.children[4] = cta1Text row
 * - block.children[5] = cta1Type row
 * - block.children[6] = cta2Link row
 * - block.children[7] = cta2Text row
 * - block.children[8] = cta2Type row
 * - block.children[9] = carouselLagTime row
 * - block.children[10+] = card item rows
 *
 * Each card row:
 * - row.children[0] = centerImage (picture)
 * - row.children[1] = logo (picture)
 * - row.children[2] = title
 * - row.children[3] = description
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

function buildTitleSection(data) {
  const {
    tag, title, subheading, cta1, cta2,
  } = data;
  const section = document.createElement('div');
  section.className = 'featurecardscarousel-title-section';
  if (tag) {
    const p = document.createElement('p');
    p.className = 'featurecardscarousel-tag';
    p.textContent = tag;
    section.appendChild(p);
  }
  if (title) {
    const h2 = document.createElement('h2');
    h2.className = 'featurecardscarousel-heading';
    h2.textContent = title;
    section.appendChild(h2);
  }
  if (subheading) {
    const p = document.createElement('p');
    p.className = 'featurecardscarousel-subheading';
    p.textContent = subheading;
    section.appendChild(p);
  }
  const isExternal = (url) => url.startsWith('http://') || url.startsWith('https://');
  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'featurecardscarousel-ctas';
  [cta1, cta2].filter(Boolean).forEach((cta) => {
    const a = document.createElement('a');
    a.href = cta.link;
    a.textContent = cta.text || 'Learn more';
    a.className = `featurecardscarousel-cta featurecardscarousel-cta--${cta.type}`;
    if (isExternal(cta.link)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    if (cta.sourceEl) moveInstrumentation(cta.sourceEl, a);
    ctaWrap.appendChild(a);
  });
  section.appendChild(ctaWrap);
  return section;
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Parent fields (indices 0-9)
  const title = getText(rows[0]?.children?.[0]);
  const tag = getText(rows[1]?.children?.[0]);
  const subheading = getText(rows[2]?.children?.[0]);

  const cta1LinkEl = rows[3]?.children?.[0];
  const cta1Link = getLink(cta1LinkEl);
  const cta1Text = getText(rows[4]?.children?.[0])
    || (cta1LinkEl ? getText(cta1LinkEl.querySelector('a')) : '');
  const cta1Type = getText(rows[5]?.children?.[0]) || 'primary';

  const cta2LinkEl = rows[6]?.children?.[0];
  const cta2Link = getLink(cta2LinkEl);
  const cta2Text = getText(rows[7]?.children?.[0])
    || (cta2LinkEl ? getText(cta2LinkEl.querySelector('a')) : '');
  const cta2Type = getText(rows[8]?.children?.[0]) || 'secondary';

  const carouselLagSec = Math.min(5, Math.max(1, Number.parseInt(getText(rows[9]?.children?.[0]) || '4', 10) || 4));

  // Card items (indices 10+)
  const cardRows = rows.slice(10);
  const cards = cardRows.map((row) => {
    const centerPic = row?.children?.[0]?.querySelector?.('picture, img');
    const logoPic = row?.children?.[1]?.querySelector?.('picture, img');
    return {
      centerImage: getImageSrc(centerPic?.closest?.('picture') || centerPic),
      centerImageAlt: getImageAlt(centerPic?.closest?.('picture') || centerPic),
      logo: getImageSrc(logoPic?.closest?.('picture') || logoPic),
      logoAlt: getImageAlt(logoPic?.closest?.('picture') || logoPic),
      title: getText(row?.children?.[2]),
      description: getText(row?.children?.[3]),
    };
  });

  if (cards.length < 2) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'featurecardscarousel-wrapper';

  const cta1 = cta1Link ? {
    link: cta1Link, text: cta1Text, type: cta1Type, sourceEl: cta1LinkEl,
  } : null;
  const cta2 = cta2Link ? {
    link: cta2Link, text: cta2Text, type: cta2Type, sourceEl: cta2LinkEl,
  } : null;
  wrapper.appendChild(buildTitleSection({
    tag, title, subheading, cta1, cta2,
  }));

  // Carousel area
  const carouselSection = document.createElement('div');
  carouselSection.className = 'featurecardscarousel-carousel-section';

  function buildCardInner(card) {
    const cardInner = document.createElement('div');
    cardInner.className = 'featurecardscarousel-card-inner';
    if (card.logo) {
      const logoPic = createOptimizedPicture(card.logo, card.logoAlt, false, [{ width: '166' }]);
      const logoWrap = document.createElement('div');
      logoWrap.className = 'featurecardscarousel-card-logo';
      logoWrap.appendChild(logoPic);
      cardInner.appendChild(logoWrap);
    }
    if (card.title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'featurecardscarousel-card-title';
      titleEl.textContent = card.title;
      cardInner.appendChild(titleEl);
    }
    if (card.description) {
      const descEl = document.createElement('p');
      descEl.className = 'featurecardscarousel-card-description';
      descEl.textContent = card.description;
      cardInner.appendChild(descEl);
    }
    return cardInner;
  }

  // Desktop: image swiper + fixed cards row (only image moves, cards are selectors)
  const desktopWrap = document.createElement('div');
  desktopWrap.className = 'featurecardscarousel-desktop';
  const centerImageWrap = document.createElement('div');
  centerImageWrap.className = 'featurecardscarousel-center-image';
  centerImageWrap.style.setProperty('--bullet-duration', `${carouselLagSec}s`);
  const imageSwiperWrap = document.createElement('div');
  imageSwiperWrap.className = 'swiper featurecardscarousel-image-swiper';
  imageSwiperWrap.innerHTML = '<div class="swiper-wrapper"></div>';
  const imageSwiperWrapper = imageSwiperWrap.querySelector('.swiper-wrapper');
  cards.forEach((card) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    const img = document.createElement('img');
    img.src = card.centerImage;
    img.alt = card.centerImageAlt;
    img.loading = 'lazy';
    slide.appendChild(img);
    imageSwiperWrapper.appendChild(slide);
  });
  centerImageWrap.appendChild(imageSwiperWrap);
  const paginationEl = document.createElement('div');
  paginationEl.className = 'swiper-pagination featurecardscarousel-pagination';
  centerImageWrap.appendChild(paginationEl);
  desktopWrap.appendChild(centerImageWrap);
  const cardsRow = document.createElement('div');
  cardsRow.className = 'featurecardscarousel-cards-row';
  cards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'featurecardscarousel-card';
    cardEl.dataset.index = String(idx);
    cardEl.appendChild(buildCardInner(card));
    cardsRow.appendChild(cardEl);
  });
  desktopWrap.appendChild(cardsRow);
  carouselSection.appendChild(desktopWrap);

  // Mobile/Tablet: single image + cards swiper
  const mobileWrap = document.createElement('div');
  mobileWrap.className = 'featurecardscarousel-mobile';
  const mobileCenterWrap = document.createElement('div');
  mobileCenterWrap.className = 'featurecardscarousel-center-image';
  mobileCenterWrap.style.setProperty('--bullet-duration', `${carouselLagSec}s`);
  const mobileImg = document.createElement('img');
  mobileImg.alt = cards[0].centerImageAlt;
  mobileImg.loading = 'lazy';
  mobileImg.src = cards[0].centerImage;
  mobileCenterWrap.appendChild(mobileImg);
  const mobilePaginationEl = document.createElement('div');
  mobilePaginationEl.className = 'swiper-pagination featurecardscarousel-pagination';
  mobileCenterWrap.appendChild(mobilePaginationEl);
  mobileWrap.appendChild(mobileCenterWrap);
  const cardsSwiperWrap = document.createElement('div');
  cardsSwiperWrap.className = 'swiper featurecardscarousel-swiper';
  cardsSwiperWrap.innerHTML = '<div class="swiper-wrapper"></div>';
  const cardsSwiperWrapper = cardsSwiperWrap.querySelector('.swiper-wrapper');
  cards.forEach((card, idx) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide featurecardscarousel-card';
    slide.dataset.centerImage = card.centerImage;
    slide.dataset.centerImageAlt = card.centerImageAlt;
    slide.dataset.index = String(idx);
    slide.appendChild(buildCardInner(card));
    cardsSwiperWrapper.appendChild(slide);
  });
  mobileWrap.appendChild(cardsSwiperWrap);
  carouselSection.appendChild(mobileWrap);
  wrapper.appendChild(carouselSection);

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);

  // Load Swiper and init
  await Promise.all([
    loadCSS(SWIPER_CSS),
    loadScript(SWIPER_JS),
  ]);

  const { Swiper } = window;
  if (!Swiper) return;

  const bulletHtml = (index, className) => `<span class="${className} featurecardscarousel-progress-bullet" data-index="${index}"><span class="featurecardscarousel-bullet-track"></span><span class="featurecardscarousel-bullet-fill"></span></span>`;

  function updateProgressFills(container, idx) {
    const fills = container.querySelectorAll('.featurecardscarousel-bullet-fill');
    fills.forEach((fill, i) => {
      fill.classList.remove('featurecardscarousel-bullet-fill--active');
      if (i === idx) {
        // eslint-disable-next-line no-void -- intentional reflow before toggling active fill class
        void fill.offsetHeight;
        fill.classList.add('featurecardscarousel-bullet-fill--active');
      }
    });
  }

  function setSelectedCard(container, idx) {
    container.querySelectorAll('.featurecardscarousel-card').forEach((el, i) => {
      el.classList.toggle('featurecardscarousel-card--selected', i === idx);
    });
  }

  // Desktop: image swiper (only image moves), fixed cards as selectors
  const imageSwiper = new Swiper(imageSwiperWrap, {
    slidesPerView: 1,
    allowTouchMove: false,
    autoplay: {
      delay: carouselLagSec * 1000,
      disableOnInteraction: false,
    },
    pagination: {
      el: paginationEl,
      clickable: true,
      renderBullet: (index, className) => bulletHtml(index, className),
    },
  });

  imageSwiper.on('slideChange', () => {
    const idx = imageSwiper.activeIndex;
    setSelectedCard(desktopWrap, idx);
    updateProgressFills(centerImageWrap, idx);
  });
  setSelectedCard(desktopWrap, 0);
  updateProgressFills(centerImageWrap, 0);

  cardsRow.querySelectorAll('.featurecardscarousel-card').forEach((cardEl, idx) => {
    cardEl.addEventListener('click', () => {
      imageSwiper.slideTo(idx);
    });
  });

  // Mobile: cards swiper, image updates on card change
  const cardsSwiper = new Swiper(cardsSwiperWrap, {
    slidesPerView: 1,
    spaceBetween: 16,
    autoplay: {
      delay: carouselLagSec * 1000,
      disableOnInteraction: false,
    },
    pagination: {
      el: mobilePaginationEl,
      clickable: true,
      renderBullet: (index, className) => bulletHtml(index, className),
    },
  });

  cardsSwiper.on('slideChange', () => {
    const idx = cardsSwiper.activeIndex;
    const card = cardsSwiper.slides[idx];
    const img = mobileCenterWrap.querySelector('img');
    if (card && img) {
      img.src = card.dataset.centerImage || '';
      img.alt = card.dataset.centerImageAlt || '';
    }
    updateProgressFills(mobileCenterWrap, idx);
  });
  updateProgressFills(mobileCenterWrap, 0);

  mobileWrap.querySelectorAll('.featurecardscarousel-card').forEach((slide, idx) => {
    slide.addEventListener('click', () => {
      cardsSwiper.slideTo(idx);
    });
  });
}
