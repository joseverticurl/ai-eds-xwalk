/**
 * Homepage Carousel
 *
 * Structure contract (Universal Editor HTML):
 * Parent rows (block.children):
 * - [0] Section headline — nested divs with one or more <p> lines (desktop only)
 * - [1] carousel_transitionDuration — plain number text (seconds)
 * - [2] carousel_autoplay — "true" | "false"
 * - [3] carousel_loopSlides — "true" | "false"
 * - [4] aura_enableAuraEffect — "true" | "false"
 * - [5] aura_auraGradient — optional CSS (may be empty)
 *
 * Slide rows (block.children[6+]), each row has 9 cells (row.children):
 * - [0] media_kind — "image" | "video"
 * - [1] Background image (<picture>) OR video link (<a href="...mp4">)
 * - [2] Secondary video reference (<a>) when applicable
 * - [3] copy_categoryTag
 * - [4] copy_paragraphs — text or HTML
 * - [5] cta_link — <a href="...">
 * - [6] cta_linkText
 * - [7] brand_brandIcon — <picture>
 * - [8] brand_overlayGradient — optional CSS (may be empty)
 *
 * @param {Element} block The block element
 */

import { loadCSS, loadScript } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';

const ALIGN_CYCLE = ['homepagecarousel-p--left', 'homepagecarousel-p--right', 'homepagecarousel-p--center'];

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getImageSrc(pictureEl) {
  const img = pictureEl?.querySelector?.('img');
  return img?.src || img?.getAttribute?.('src') || '';
}

function getImageAlt(pictureEl) {
  const img = pictureEl?.querySelector?.('img');
  return img?.alt || img?.getAttribute?.('alt') || '';
}

function getLinkHref(cell) {
  const a = cell?.querySelector?.('a[href]');
  return a?.getAttribute?.('href') || '';
}

/**
 * @param {Element} row
 * @returns {Record<string, string> | null}
 */
function parseSlideRow(row) {
  const cells = [...row.children];
  if (cells.length < 9) return null;

  const kind = (getText(cells[0]) || 'image').toLowerCase();
  const link1 = getLinkHref(cells[1]);
  const link2 = getLinkHref(cells[2]);
  const pic1 = cells[1]?.querySelector?.('picture, img');

  let imageSrc = '';
  let imageAlt = '';
  let videoSrc = '';

  if (kind === 'video') {
    videoSrc = link1 || link2 || '';
  } else {
    imageSrc = getImageSrc(pic1?.closest?.('picture') || pic1);
    imageAlt = getImageAlt(pic1?.closest?.('picture') || pic1);
    if (!imageSrc && (link1?.endsWith('.mp4') || link2?.endsWith('.mp4'))) {
      videoSrc = link1.endsWith('.mp4') ? link1 : link2;
    }
  }

  const categoryTag = getText(cells[3]);
  const bodyHtml = cells[4]?.innerHTML?.trim() || '';
  const ctaHref = getLinkHref(cells[5]) || '#';
  const ctaLabel = getText(cells[6]);
  const brandPic = cells[7]?.querySelector?.('picture, img');
  const brandIconSrc = getImageSrc(brandPic?.closest?.('picture') || brandPic);
  const brandIconAlt = getImageAlt(brandPic?.closest?.('picture') || brandPic);
  const overlayGradient = getText(cells[8]);

  return {
    kind,
    imageSrc,
    imageAlt,
    videoSrc,
    categoryTag,
    bodyHtml,
    ctaHref,
    ctaLabel,
    brandIconSrc,
    brandIconAlt,
    overlayGradient,
    ctaSourceEl: cells[5],
  };
}

/**
 * @param {HTMLElement} container
 */
function applyParagraphAlignment(container) {
  const html = container.innerHTML.trim();
  if (!html) return;

  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  let paragraphs = [...tmp.querySelectorAll('p')];

  if (paragraphs.length === 0) {
    const p = document.createElement('p');
    p.textContent = tmp.textContent.trim();
    paragraphs = [p];
  }

  paragraphs.forEach((p, i) => {
    ALIGN_CYCLE.forEach((c) => p.classList.remove(c));
    p.classList.add(ALIGN_CYCLE[i % ALIGN_CYCLE.length]);
  });

  container.replaceChildren(...paragraphs);
}

/**
 * @param {Record<string, string>} data
 * @param {string} durationSec
 */
function buildSlideElement(data, durationSec) {
  const slide = document.createElement('div');
  slide.className = 'swiper-slide';

  const root = document.createElement('div');
  root.className = 'homepagecarousel-slide';
  root.style.setProperty('--bullet-duration', `${durationSec}s`);

  const bg = document.createElement('div');
  bg.className = 'homepagecarousel-slide__media';

  if (data.kind === 'video' && data.videoSrc) {
    const video = document.createElement('video');
    video.className = 'homepagecarousel-slide__video';
    video.src = data.videoSrc;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('aria-label', data.imageAlt || data.brandIconAlt || 'Background video');
    bg.appendChild(video);
  } else if (data.imageSrc) {
    const img = document.createElement('img');
    img.className = 'homepagecarousel-slide__img';
    img.src = data.imageSrc;
    img.alt = data.imageAlt || '';
    img.loading = 'lazy';
    bg.appendChild(img);
  }

  const overlay = document.createElement('div');
  overlay.className = 'homepagecarousel-slide__gradient';
  if (data.overlayGradient) {
    overlay.style.background = data.overlayGradient;
  }

  const inner = document.createElement('div');
  inner.className = 'homepagecarousel-slide__content';

  if (data.categoryTag) {
    const tag = document.createElement('p');
    tag.className = 'homepagecarousel-slide__tag';
    tag.textContent = data.categoryTag;
    inner.appendChild(tag);
  }

  const body = document.createElement('div');
  body.className = 'homepagecarousel-slide__body';
  body.innerHTML = data.bodyHtml || '';
  applyParagraphAlignment(body);
  inner.appendChild(body);

  const cta = document.createElement('a');
  cta.className = 'homepagecarousel-slide__cta';
  cta.href = data.ctaHref;
  cta.textContent = data.ctaLabel || 'Read more';
  if (data.ctaHref.startsWith('http')) {
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
  }
  if (data.ctaSourceEl) {
    const srcA = data.ctaSourceEl.querySelector?.('a');
    if (srcA) moveInstrumentation(srcA, cta);
  }
  inner.appendChild(cta);

  root.appendChild(bg);
  root.appendChild(overlay);
  root.appendChild(inner);

  slide.appendChild(root);
  return slide;
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 7) return;

  const headlineRow = rows[0];
  const transitionSec = Math.min(
    60,
    Math.max(1, Number.parseInt(getText(rows[1]?.children?.[0]) || '5', 10) || 5),
  );
  const autoplayOn = getText(rows[2]?.children?.[0]) === 'true';
  const loopOn = getText(rows[3]?.children?.[0]) === 'true';
  const auraOn = getText(rows[4]?.children?.[0]) === 'true';
  const auraGradient = getText(rows[5]?.children?.[0]);

  const slideRows = rows.slice(6);
  const slidesData = slideRows.map(parseSlideRow).filter(Boolean);

  if (slidesData.length === 0) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'homepagecarousel-wrapper';
  if (auraOn && auraGradient) {
    wrapper.style.background = auraGradient;
  } else if (auraOn) {
    wrapper.classList.add('homepagecarousel-wrapper--aura-default');
  }

  const container = document.createElement('div');
  container.className = 'container';

  const row = document.createElement('div');
  row.className = 'row';

  const headlineCol = document.createElement('div');
  headlineCol.className = 'homepagecarousel-headline col-s-4 col-xl-5';
  const headlineInner = document.createElement('div');
  headlineInner.className = 'homepagecarousel-headline__inner';
  headlineInner.innerHTML = headlineRow.innerHTML;
  headlineCol.appendChild(headlineInner);

  const carouselCol = document.createElement('div');
  carouselCol.className = 'homepagecarousel-carousel-col col-s-4 col-xl-7';

  const shell = document.createElement('div');
  shell.className = 'homepagecarousel-shell';

  const paginationEl = document.createElement('div');
  paginationEl.className = 'swiper-pagination homepagecarousel-pagination';

  const swiperEl = document.createElement('div');
  swiperEl.className = 'swiper homepagecarousel-swiper';

  const swiperWrap = document.createElement('div');
  swiperWrap.className = 'swiper-wrapper';

  slidesData.forEach((d) => {
    swiperWrap.appendChild(buildSlideElement(d, transitionSec));
  });

  swiperEl.appendChild(swiperWrap);
  shell.appendChild(paginationEl);
  shell.appendChild(swiperEl);
  carouselCol.appendChild(shell);

  row.appendChild(headlineCol);
  row.appendChild(carouselCol);
  container.appendChild(row);
  wrapper.appendChild(container);

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);

  await Promise.all([loadCSS(SWIPER_CSS), loadScript(SWIPER_JS)]);

  const { Swiper } = window;
  if (!Swiper) return;

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');

  const bulletHtml = (index, className) => {
    const s = slidesData[index];
    const src = s.brandIconSrc || '';
    const alt = s.brandIconAlt || '';
    const img = src
      ? `<img class="homepagecarousel-bullet-img" src="${esc(src)}" alt="${esc(alt)}" width="50" height="50" loading="lazy" />`
      : `<span class="homepagecarousel-bullet-fallback">${index + 1}</span>`;
    return `<span class="${className} homepagecarousel-progress-bullet" role="presentation">${img}<span class="homepagecarousel-bullet-track"></span><span class="homepagecarousel-bullet-fill"></span></span>`;
  };

  function updateProgressFills(idx) {
    wrapper.querySelectorAll('.homepagecarousel-bullet-fill').forEach((fill, i) => {
      fill.classList.remove('homepagecarousel-bullet-fill--active');
      if (i === idx) {
        requestAnimationFrame(() => {
          fill.classList.add('homepagecarousel-bullet-fill--active');
        });
      }
    });
  }

  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1,
    loop: loopOn && slidesData.length > 1,
    allowTouchMove: true,
    autoplay: autoplayOn
      ? {
        delay: transitionSec * 1000,
        disableOnInteraction: false,
      }
      : false,
    pagination: {
      el: paginationEl,
      clickable: true,
      renderBullet: (index, className) => bulletHtml(index, className),
    },
  });

  swiper.on('slideChange', () => {
    updateProgressFills(swiper.realIndex);
  });

  updateProgressFills(swiper.realIndex);
}
