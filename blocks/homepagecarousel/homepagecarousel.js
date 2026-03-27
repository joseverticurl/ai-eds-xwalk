/**
 * Homepage Carousel
 *
 * Structure contract (from user-provided Universal Editor HTML):
 * - block.children[0] = section headline row (nested divs containing multiple <p>)
 * - block.children[1] = transitionDuration (number as text)
 * - block.children[2] = autoplay ("true" | "false")
 * - block.children[3] = loopSlides ("true" | "false")
 * - block.children[4] = enableAuraEffect ("true" | "false")
 * - block.children[5] = auraGradient (optional text / empty)
 * - block.children[6+] = slide item rows
 *
 * Each slide row (Universal Editor cell order):
 * - row.children[0] = mediaType ("image" | "video")
 * - row.children[1] = picture (image) OR <a> to video asset
 * - row.children[2] = duplicate video <a> when video; optional stray link when image
 *   (ignored for background image slides)
 * - row.children[3] = categoryTag
 * - row.children[4] = paragraphs (plain or richtext HTML)
 * - row.children[5] = ctaLink (anchored cell)
 * - row.children[6] = ctaLabel
 * - row.children[7] = brandIcon (picture)
 * - row.children[8] = brandIconAlt / overlay (may be empty)
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
const PARENT_FIELD_ROWS = 6;

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getLink(el) {
  const link = el?.querySelector?.('a') || el?.querySelector?.('p a');
  return link?.getAttribute?.('href') || link?.href || '';
}

function getImageFromPicture(cell) {
  const pic = cell?.querySelector?.('picture') || cell?.closest?.('picture');
  const img = (pic || cell)?.querySelector?.('img');
  if (!img) return { src: '', alt: '' };
  return { src: img.src || img.getAttribute('src') || '', alt: img.alt || img.getAttribute('alt') || '' };
}

function parseBoolCell(text) {
  return String(text).toLowerCase() === 'true';
}

function alignmentClassForIndex(i) {
  const m = i % 3;
  if (m === 0) return 'homepagecarousel-align-left';
  if (m === 1) return 'homepagecarousel-align-right';
  return 'homepagecarousel-align-center';
}

function applyStaggeredAlignment(container) {
  container.querySelectorAll('p').forEach((p, i) => {
    p.classList.add(alignmentClassForIndex(i));
  });
}

function buildHeadline(row, instrumentFrom) {
  const wrap = document.createElement('div');
  wrap.className = 'homepagecarousel-headline';
  row.querySelectorAll('p').forEach((p, i) => {
    const copy = document.createElement('p');
    copy.textContent = p.textContent.trim();
    copy.classList.add(alignmentClassForIndex(i));
    wrap.appendChild(copy);
  });
  if (instrumentFrom) moveInstrumentation(instrumentFrom, wrap);
  return wrap;
}

function parseSlideRow(row) {
  const c = [...row.children];
  const mediaType = getText(c[0]).toLowerCase();
  const picCell = c[1];
  const auxCell = c[2];
  const pictureEl = picCell?.querySelector?.('picture');
  const imgFromBg = getImageFromPicture(picCell);
  const videoPrimary = getLink(picCell);
  const videoSecondary = getLink(auxCell);
  let imageUrl = '';
  let imageAlt = '';
  let videoUrl = '';
  if (mediaType === 'video') {
    videoUrl = videoPrimary || videoSecondary;
    if (pictureEl) {
      const v = getImageFromPicture(picCell);
      imageUrl = v.src;
      imageAlt = v.alt;
    }
  } else {
    imageUrl = imgFromBg.src;
    imageAlt = imgFromBg.alt;
    if (!imageUrl && pictureEl) {
      imageUrl = imgFromBg.src;
    }
  }
  const categoryTag = getText(c[3]);
  const paragraphsCell = c[4];
  const paragraphsHTML = paragraphsCell?.innerHTML?.trim()
    ? paragraphsCell.innerHTML
    : getText(paragraphsCell);
  const ctaLink = getLink(c[5]);
  const ctaLabel = getText(c[6]);
  const brand = getImageFromPicture(c[7]);
  const tailCell = getText(c[8]);
  let overlayGradient = '';
  if (tailCell && (tailCell.includes('gradient') || tailCell.includes('rgba') || /^#/.test(tailCell))) {
    overlayGradient = tailCell;
  }

  return {
    mediaType: mediaType === 'video' ? 'video' : 'image',
    imageUrl,
    imageAlt,
    videoUrl,
    categoryTag,
    paragraphsHTML,
    ctaLink,
    ctaLabel,
    brandIconUrl: brand.src,
    brandIconAlt: brand.alt || '',
    overlayGradient,
    sourceRow: row,
  };
}

function buildSlideMedia(slide) {
  const media = document.createElement('div');
  media.className = 'homepagecarousel-slide__media';
  if (slide.mediaType === 'video' && slide.videoUrl) {
    const v = document.createElement('video');
    v.className = 'homepagecarousel-slide__video';
    v.src = slide.videoUrl;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.autoplay = true;
    v.setAttribute('aria-label', slide.imageAlt || 'Background video');
    media.appendChild(v);
  } else if (slide.imageUrl) {
    const pic = createOptimizedPicture(
      slide.imageUrl,
      slide.imageAlt,
      false,
      [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }],
    );
    media.appendChild(pic);
  }
  const overlay = document.createElement('div');
  overlay.className = 'homepagecarousel-slide__media-overlay';
  if (slide.overlayGradient) {
    overlay.style.background = slide.overlayGradient;
  }
  media.appendChild(overlay);
  return media;
}

function buildSlideBody(slide) {
  const body = document.createElement('div');
  body.className = 'homepagecarousel-slide__body';
  if (slide.categoryTag) {
    const tag = document.createElement('span');
    tag.className = 'homepagecarousel-slide__tag';
    tag.textContent = slide.categoryTag;
    body.appendChild(tag);
  }
  const copy = document.createElement('div');
  copy.className = 'homepagecarousel-slide__copy';
  if (slide.paragraphsHTML.includes('<')) {
    copy.innerHTML = slide.paragraphsHTML;
  } else if (slide.paragraphsHTML) {
    const p = document.createElement('p');
    p.textContent = slide.paragraphsHTML;
    copy.appendChild(p);
  }
  applyStaggeredAlignment(copy);
  body.appendChild(copy);
  if (slide.ctaLink && slide.ctaLabel) {
    const a = document.createElement('a');
    a.className = 'homepagecarousel-slide__cta';
    a.href = slide.ctaLink;
    a.textContent = slide.ctaLabel;
    if (slide.ctaLink.startsWith('http://') || slide.ctaLink.startsWith('https://')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    body.appendChild(a);
  }
  return body;
}

function buildBrandStrip(slides, durationSec, autoplayOn) {
  const nav = document.createElement('div');
  nav.className = 'homepagecarousel-brandstrip';
  nav.style.setProperty('--brand-duration', `${durationSec}s`);
  slides.forEach((slide, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'homepagecarousel-brand-btn';
    btn.dataset.index = String(idx);
    btn.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ring.setAttribute('class', 'homepagecarousel-brand-ring');
    ring.setAttribute('viewBox', '0 0 52 52');
    ring.setAttribute('aria-hidden', 'true');
    const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circ.setAttribute('cx', '26');
    circ.setAttribute('cy', '26');
    circ.setAttribute('r', '23');
    circ.setAttribute('fill', 'none');
    circ.setAttribute('stroke', 'rgba(255,255,255,0.9)');
    circ.setAttribute('stroke-width', '2');
    circ.setAttribute('stroke-dasharray', '144.5');
    circ.setAttribute('stroke-dashoffset', '144.5');
    circ.setAttribute('stroke-linecap', 'round');
    ring.appendChild(circ);
    btn.appendChild(ring);
    if (slide.brandIconUrl) {
      const img = document.createElement('img');
      img.src = slide.brandIconUrl;
      img.alt = slide.brandIconAlt || '';
      img.width = 40;
      img.height = 40;
      img.loading = 'lazy';
      img.className = 'homepagecarousel-brand-btn__img';
      btn.appendChild(img);
    } else {
      const fallback = document.createElement('span');
      fallback.className = 'homepagecarousel-brand-btn__fallback';
      fallback.textContent = String(idx + 1);
      btn.appendChild(fallback);
    }
    nav.appendChild(btn);
  });
  if (autoplayOn) {
    nav.classList.add('homepagecarousel-brandstrip--autoplay');
  }
  return nav;
}

function syncBrandActive(nav, idx, autoplayOn) {
  nav.querySelectorAll('.homepagecarousel-brand-btn').forEach((btn, i) => {
    const isActive = i === idx;
    btn.classList.toggle('homepagecarousel-brand-btn--active', isActive);
    const svg = btn.querySelector('.homepagecarousel-brand-ring');
    const circ = svg?.querySelector('circle');
    if (!svg || !circ) return;
    svg.classList.remove('homepagecarousel-brand-ring--running');
    circ.setAttribute('stroke-dashoffset', '144.5');
    if (autoplayOn && isActive) {
      svg.getBoundingClientRect();
      svg.classList.add('homepagecarousel-brand-ring--running');
    }
  });
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length <= PARENT_FIELD_ROWS) return;

  const headlineRow = rows[0];
  const instrumentHeadlineSource = headlineRow.querySelector('div > div') || headlineRow;

  const transitionDuration = Math.min(60, Math.max(1, Number.parseInt(
    getText(rows[1]?.children?.[0]) || '5',
    10,
  ) || 5));
  const autoplayOn = parseBoolCell(getText(rows[2]?.children?.[0]));
  const loopOn = parseBoolCell(getText(rows[3]?.children?.[0]));
  const auraOn = parseBoolCell(getText(rows[4]?.children?.[0]));
  const auraGradient = getText(rows[5]?.children?.[0]);

  const slideRows = rows.slice(PARENT_FIELD_ROWS);
  const slides = slideRows.map(parseSlideRow);
  if (slides.length === 0) return;

  const root = document.createElement('div');
  root.className = 'homepagecarousel-root';

  const container = document.createElement('div');
  container.className = 'container';
  const row = document.createElement('div');
  row.className = 'row';

  const headlineCol = document.createElement('div');
  headlineCol.className = 'homepagecarousel-headline-col col-s-4 col-m-4 col-xl-5';
  const headlineEl = buildHeadline(headlineRow, instrumentHeadlineSource);
  headlineCol.appendChild(headlineEl);

  const stageCol = document.createElement('div');
  stageCol.className = 'homepagecarousel-stage-col col-s-4 col-m-8 col-xl-7';
  const stage = document.createElement('div');
  stage.className = 'homepagecarousel-stage';
  if (auraOn) {
    stage.classList.add('homepagecarousel-stage--aura');
    if (auraGradient) {
      stage.style.setProperty('--homepagecarousel-aura', auraGradient);
    }
  }

  const brandstrip = buildBrandStrip(slides, transitionDuration, autoplayOn);
  const swiperEl = document.createElement('div');
  swiperEl.className = 'swiper homepagecarousel-swiper';
  swiperEl.innerHTML = '<div class="swiper-wrapper"></div>';
  const swiperWrapper = swiperEl.querySelector('.swiper-wrapper');

  slides.forEach((slide) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'swiper-slide homepagecarousel-slide';
    slideEl.appendChild(buildSlideMedia(slide));
    slideEl.appendChild(buildSlideBody(slide));
    moveInstrumentation(slide.sourceRow, slideEl);
    swiperWrapper.appendChild(slideEl);
  });

  stage.appendChild(brandstrip);
  stage.appendChild(swiperEl);
  stageCol.appendChild(stage);
  row.appendChild(headlineCol);
  row.appendChild(stageCol);
  container.appendChild(row);
  root.appendChild(container);

  moveInstrumentation(block, root);
  block.replaceChildren(root);

  await Promise.all([
    loadCSS(SWIPER_CSS),
    loadScript(SWIPER_JS),
  ]);

  const { Swiper } = window;
  if (!Swiper) return;

  const loopEnabled = loopOn && slides.length > 1;

  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1,
    loop: loopEnabled,
    speed: 600,
    autoplay: autoplayOn
      ? {
        delay: transitionDuration * 1000,
        disableOnInteraction: false,
      }
      : false,
    on: {
      /* Swiper passes instance; outer `const swiper` is still in TDZ during constructor init. */
      slideChange(sw) {
        syncBrandActive(brandstrip, sw.realIndex, autoplayOn);
      },
    },
  });

  function goTo(idx) {
    if (loopEnabled) {
      swiper.slideToLoop(idx);
    } else {
      swiper.slideTo(idx);
    }
    const { autoplay } = swiper;
    if (autoplay && autoplayOn) {
      autoplay.stop();
      autoplay.start();
    }
    syncBrandActive(brandstrip, idx, autoplayOn);
  }

  brandstrip.querySelectorAll('.homepagecarousel-brand-btn').forEach((btn, idx) => {
    btn.addEventListener('click', () => goTo(idx));
  });

  syncBrandActive(brandstrip, swiper.realIndex, autoplayOn);
}
