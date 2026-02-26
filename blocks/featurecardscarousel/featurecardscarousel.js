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
  const { tag, title, subheading, cta1, cta2 } = data;
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

  // Carousel area: center image + cards swiper
  const carouselSection = document.createElement('div');
  carouselSection.className = 'featurecardscarousel-carousel-section';

  const centerImageWrap = document.createElement('div');
  centerImageWrap.className = 'featurecardscarousel-center-image';
  centerImageWrap.style.setProperty('--bullet-duration', `${carouselLagSec}s`);
  const centerImg = document.createElement('img');
  centerImg.alt = cards[0].centerImageAlt;
  centerImg.loading = 'lazy';
  centerImg.src = cards[0].centerImage;
  centerImageWrap.appendChild(centerImg);
  const paginationEl = document.createElement('div');
  paginationEl.className = 'swiper-pagination featurecardscarousel-pagination';
  centerImageWrap.appendChild(paginationEl);
  carouselSection.appendChild(centerImageWrap);

  const swiperWrap = document.createElement('div');
  swiperWrap.className = 'swiper featurecardscarousel-swiper';
  swiperWrap.innerHTML = '<div class="swiper-wrapper"></div>';
  const swiperWrapper = swiperWrap.querySelector('.swiper-wrapper');

  cards.forEach((card, idx) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide featurecardscarousel-card';
    slide.dataset.centerImage = card.centerImage;
    slide.dataset.centerImageAlt = card.centerImageAlt;
    slide.dataset.index = String(idx);

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

    slide.appendChild(cardInner);
    swiperWrapper.appendChild(slide);
  });

  carouselSection.appendChild(swiperWrap);
  wrapper.appendChild(carouselSection);

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);

  // Load Swiper and init
  await Promise.all([
    loadCSS(SWIPER_CSS),
    loadScript(SWIPER_JS),
  ]);

  const Swiper = globalThis.Swiper;
  if (!Swiper) return;

  const swiper = new Swiper(swiperWrap, {
    slidesPerView: 1,
    spaceBetween: 16,
    autoplay: {
      delay: carouselLagSec * 1000,
      disableOnInteraction: false,
    },
    pagination: {
      el: paginationEl,
      clickable: true,
      renderBullet(index, className) {
        const bullet = document.createElement('span');
        bullet.className = `${className} featurecardscarousel-progress-bullet`;
        bullet.dataset.index = String(index);
        bullet.innerHTML = '<span class="featurecardscarousel-bullet-track"></span><span class="featurecardscarousel-bullet-fill"></span>';
        return bullet;
      },
    },
    breakpoints: {
      680: {
        slidesPerView: 1,
      },
      900: {
        slidesPerView: Math.min(cards.length, 4),
        spaceBetween: 16,
      },
    },
  });

  // Update center image and progress indicators on slide change
  function updateActiveState() {
    const idx = swiper.activeIndex;
    const slide = swiper.slides[idx];
    const img = centerImageWrap.querySelector('img');
    if (slide && img) {
      img.src = slide.dataset.centerImage || '';
      img.alt = slide.dataset.centerImageAlt || '';
    }
    // Progress indicators: fill animates over lag time (force restart on change)
    const fills = paginationEl.querySelectorAll('.featurecardscarousel-bullet-fill');
    fills.forEach((fill, i) => {
      const isActive = i === idx;
      fill.classList.remove('featurecardscarousel-bullet-fill--active');
      if (isActive) {
        void fill.offsetHeight; // force reflow to restart animation
        fill.classList.add('featurecardscarousel-bullet-fill--active');
      }
    });
  }

  swiper.on('slideChange', updateActiveState);
  updateActiveState(); // Initial state (first card selected, progress fill starts)

  // Click on card to go to slide
  swiperWrap.querySelectorAll('.featurecardscarousel-card').forEach((slide, idx) => {
    slide.addEventListener('click', () => {
      swiper.slideTo(idx);
    });
  });
}
