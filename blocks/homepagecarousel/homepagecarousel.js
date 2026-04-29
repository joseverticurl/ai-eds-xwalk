/**
 * Homepage hero carousel
 *
 * Structure (from Universal Editor):
 * - block.children[0] = section headline (nested <p> lines)
 * - block.children[1] = transition duration (seconds)
 * - block.children[2] = autoplay (true/false)
 * - block.children[3] = loop slides (true/false)
 * - block.children[4] = enable aura (true/false)
 * - block.children[5] = aura style (optional class token)
 * - block.children[6+] = slide rows
 *
 * Each slide row:
 * - children[0] = mediaType (image | video)
 * - children[1] = background picture OR first video <a> (video slides)
 * - children[2] = video <a> (secondary) or video field when image slide
 * - children[3] = category tag
 * - children[4] = body (richtext or plain)
 * - children[5] = CTA link (anchor)
 * - children[6] = CTA label
 * - children[7] = brand icon picture
 * - children[8] = optional overlay / gradient token
 *
 * @param {Element} block
 */

import {
  createOptimizedPicture,
  loadCSS,
  loadScript,
} from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';

const CONFIG_ROW_COUNT = 6;
const ALIGN = ['align-left', 'align-right', 'align-center'];

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getLink(el) {
  const link = el?.querySelector?.('a') || (el?.tagName === 'A' ? el : null);
  return link?.getAttribute?.('href') || link?.href || '';
}

function getImageSrc(pictureEl) {
  const root = pictureEl?.closest?.('picture') || pictureEl;
  const img = root?.querySelector?.('img');
  return img?.src || img?.getAttribute?.('src') || '';
}

function getImageAlt(pictureEl) {
  const root = pictureEl?.closest?.('picture') || pictureEl;
  const img = root?.querySelector?.('img');
  return img?.alt || img?.getAttribute?.('alt') || '';
}

/**
 * @param {Element} bodyCell
 * @param {string} [fallbackAlignClass]
 * @returns {Element}
 */
function buildBodyWithAlignment(bodyCell) {
  const wrap = document.createElement('div');
  wrap.className = 'homepagecarousel-body';

  if (!bodyCell) return wrap;

  const clone = bodyCell.cloneNode(true);
  const ps = clone.querySelectorAll('p');
  if (ps.length) {
    ps.forEach((p, i) => p.classList.add(ALIGN[i % 3]));
    wrap.append(...clone.querySelectorAll('p'));
  } else {
    const text = getText(bodyCell);
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      p.classList.add(ALIGN[0]);
      wrap.appendChild(p);
    }
  }
  return wrap;
}

/**
 * @param {Element} row
 * @returns {object}
 */
function parseSlideRow(row) {
  const c = (i) => row?.children?.[i];
  const typeRaw = getText(c(0)).toLowerCase() || 'image';
  const isVideo = typeRaw === 'video';
  const cell1 = c(1);
  const cell2 = c(2);
  const pic1 = cell1?.querySelector?.('picture, img');

  let imageSrc = '';
  let imageAlt = '';
  let videoUrl = '';

  if (isVideo) {
    videoUrl = getLink(cell1) || getLink(cell2) || '';
  } else if (pic1) {
    const picEl = pic1?.closest?.('picture') || pic1;
    imageSrc = getImageSrc(picEl);
    imageAlt = getImageAlt(picEl);
  }

  const brandPic = c(7)?.querySelector?.('picture, img');
  const brandSrc = getImageSrc(brandPic);
  const brandAlt = getImageAlt(brandPic) || 'Brand';

  return {
    mediaType: isVideo ? 'video' : 'image',
    imageSrc,
    imageAlt,
    videoUrl,
    category: getText(c(3)),
    bodyCell: c(4),
    ctaLink: getLink(c(6)),
    ctaLabel: getText(c(5)) || 'Read more',
    ctaLinkCell: c(5),
    brandSrc,
    brandAlt,
    overlayToken: getText(c(8)),
    sourceRow: row,
  };
}

/**
 * @param {object} s
 * @returns {Element}
 */
function buildSlide(s) {
  const slide = document.createElement('div');
  slide.className = 'swiper-slide homepagecarousel-slide';

  const media = document.createElement('div');
  media.className = 'homepagecarousel-slide-media';

  if (s.mediaType === 'video' && s.videoUrl) {
    const v = document.createElement('video');
    v.className = 'homepagecarousel-bg-video';
    v.setAttribute('playsinline', '');
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    const source = document.createElement('source');
    source.src = s.videoUrl;
    source.type = 'video/mp4';
    v.appendChild(source);
    media.appendChild(v);
  } else if (s.imageSrc) {
    const pic = createOptimizedPicture(
      s.imageSrc,
      s.imageAlt,
      false,
      [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }],
    );
    media.appendChild(pic);
  }

  const overlay = document.createElement('div');
  overlay.className = 'homepagecarousel-slide-overlay';
  if (s.overlayToken) {
    s.overlayToken.split(/\s+/).filter(Boolean).forEach((t) => overlay.classList.add(t));
  }

  const content = document.createElement('div');
  content.className = 'homepagecarousel-slide-content';

  if (s.category) {
    const badge = document.createElement('p');
    badge.className = 'homepagecarousel-badge';
    badge.textContent = s.category;
    content.appendChild(badge);
  }

  content.appendChild(buildBodyWithAlignment(s.bodyCell));

  if (s.ctaLink) {
    const a = document.createElement('a');
    a.href = s.ctaLink;
    a.className = 'homepagecarousel-cta';
    a.textContent = s.ctaLabel;
    if (s.ctaLink.startsWith('http://') || s.ctaLink.startsWith('https://')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    if (s.ctaLinkCell) {
      moveInstrumentation(s.ctaLinkCell, a);
    }
    content.appendChild(a);
  }

  slide.appendChild(media);
  slide.appendChild(overlay);
  slide.appendChild(content);

  return slide;
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < CONFIG_ROW_COUNT + 2) return;

  const configRows = rows.slice(0, CONFIG_ROW_COUNT);
  const slideRows = rows.slice(CONFIG_ROW_COUNT);
  if (slideRows.length < 2) return;

  const headlineSource = configRows[0];
  const transitionSec = Math.min(
    20,
    Math.max(1, Number.parseFloat(getText(configRows[1]?.children?.[0]) || '5') || 5),
  );
  const autoplayOn = getText(configRows[2]?.children?.[0]) === 'true';
  const loopOn = getText(configRows[3]?.children?.[0]) === 'true';
  const auraOn = getText(configRows[4]?.children?.[0]) === 'true';
  const auraClass = getText(configRows[5]?.children?.[0]);

  const slides = slideRows.map((row) => parseSlideRow(row));

  const wrapper = document.createElement('div');
  wrapper.className = 'homepagecarousel-wrapper';
  if (auraOn) {
    wrapper.classList.add('homepagecarousel-wrapper-aura');
  }
  if (auraOn && auraClass) {
    auraClass.split(/\s+/).filter(Boolean).forEach((c) => wrapper.classList.add(c));
  }
  wrapper.style.setProperty('--homepagecarousel-duration', `${transitionSec}s`);

  const headline = document.createElement('aside');
  headline.className = 'homepagecarousel-headline';
  const firstCell = headlineSource?.children?.[0];
  if (firstCell) {
    const headInner = firstCell.cloneNode(true);
    headInner.classList.add('homepagecarousel-headline-inner');
    headInner.querySelectorAll('p').forEach((p, i) => {
      p.classList.add(ALIGN[i % 3]);
    });
    headline.appendChild(headInner);
    moveInstrumentation(headlineSource, headline);
  }

  const stage = document.createElement('div');
  stage.className = 'homepagecarousel-stage';

  const brandNav = document.createElement('nav');
  brandNav.className = 'homepagecarousel-brands';
  brandNav.setAttribute('aria-label', 'Carousel slides');
  const swiperWrap = document.createElement('div');
  swiperWrap.className = 'swiper homepagecarousel-swiper';
  swiperWrap.innerHTML = '<div class="swiper-wrapper"></div>';
  const inner = swiperWrap.querySelector('.swiper-wrapper');
  if (!inner) {
    return;
  }

  slides.forEach((s, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'homepagecarousel-brand';
    btn.setAttribute('aria-label', `Go to slide ${index + 1}`);
    btn.dataset.index = String(index);

    const ring = document.createElement('span');
    ring.className = 'homepagecarousel-brand-ring';
    ring.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    svg.setAttribute('class', 'homepagecarousel-brand-ring-svg');
    const r = 27;
    const c = 2 * Math.PI * r;
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    track.setAttribute('cx', '30');
    track.setAttribute('cy', '30');
    track.setAttribute('r', String(r));
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke', 'rgba(255,255,255,0.35)');
    track.setAttribute('stroke-width', '2');
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    arc.setAttribute('cx', '30');
    arc.setAttribute('cy', '30');
    arc.setAttribute('r', String(r));
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', '#fff');
    arc.setAttribute('stroke-width', '2');
    arc.setAttribute('stroke-linecap', 'round');
    arc.setAttribute('stroke-dasharray', String(c));
    arc.setAttribute('stroke-dashoffset', String(c));
    arc.setAttribute('transform', 'rotate(-90 30 30)');
    arc.classList.add('homepagecarousel-brand-arc');
    svg.appendChild(track);
    svg.appendChild(arc);
    ring.appendChild(svg);

    const brandPic = s.brandSrc
      ? createOptimizedPicture(
        s.brandSrc,
        s.brandAlt,
        false,
        [{ media: '(min-width: 600px)', width: '120' }, { width: '80' }],
      )
      : null;
    if (brandPic) {
      const ph = document.createElement('div');
      ph.className = 'homepagecarousel-brand-img';
      ph.appendChild(brandPic);
      btn.appendChild(ring);
      btn.appendChild(ph);
    } else {
      btn.appendChild(ring);
    }
    brandNav.appendChild(btn);
  });

  slides.forEach((s) => {
    const slideEl = buildSlide(s);
    moveInstrumentation(s.sourceRow, slideEl);
    inner.appendChild(slideEl);
  });

  /** @type {any} */
  let swiper = null;

  function setActiveBrand(index) {
    brandNav.querySelectorAll('.homepagecarousel-brand').forEach((b, i) => {
      const on = i === index;
      b.classList.toggle('homepagecarousel-brand-active', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  function wireBrandClicks() {
    brandNav.querySelectorAll('.homepagecarousel-brand').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number.parseInt(btn.dataset.index || '0', 10);
        if (swiper) {
          swiper.slideTo(idx);
          if (autoplayOn && swiper.autoplay?.stop) {
            swiper.autoplay.stop();
            swiper.autoplay.start();
          }
        }
      });
    });
  }

  stage.appendChild(brandNav);
  stage.appendChild(swiperWrap);
  wrapper.appendChild(headline);
  wrapper.appendChild(stage);

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);

  await Promise.all([loadCSS(SWIPER_CSS), loadScript(SWIPER_JS)]);

  const { Swiper: SwiperClass } = window;
  if (!SwiperClass) return;

  /** @param {{ activeIndex: number }} s */
  function onActiveIndex(s) {
    setActiveBrand(s.activeIndex);
  }

  const swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: loopOn && slideRows.length > 1,
    allowTouchMove: true,
    autoplay: autoplayOn
      ? { delay: transitionSec * 1000, disableOnInteraction: false }
      : false,
    on: { slideChange: (sw) => onActiveIndex(sw) },
  };

  swiper = new SwiperClass(swiperWrap, swiperConfig);

  onActiveIndex(swiper);
  wireBrandClicks();
}
