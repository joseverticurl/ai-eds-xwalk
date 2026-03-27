/**
 * Homepage Carousel Block
 *
 * Structure contract (from Universal Editor HTML):
 * - block.children[0] = section headline row; row.children[0] wraps nested div with <p> lines
 * - block.children[1] = transitionDuration (seconds, plain text)
 * - block.children[2] = autoplay ("true" | "false")
 * - block.children[3] = loopSlides ("true" | "false")
 * - block.children[4] = enableAuraEffect ("true" | "false")
 * - block.children[5] = auraGradient (optional text / token)
 * - block.children[6+] = slide rows (one row per slide)
 *
 * Each slide row (cells 0–8):
 * - row.children[0] = mediaType ("image" | "video")
 * - row.children[1] = hero image (<picture>) or video (<a href="...mp4">)
 * - row.children[2] = alternate video reference (anchor); used when mediaType is video
 * - row.children[3] = categoryTag
 * - row.children[4] = paragraphs (plain or multiple <p>)
 * - row.children[5] = cta link (<a>)
 * - row.children[6] = cta label text
 * - row.children[7] = brand icon (<picture>)
 * - row.children[8] = overlay gradient (optional text for CSS)
 *
 * @param {Element} block The block element (.homepagecarousel)
 */

import {
  createOptimizedPicture,
  loadCSS,
  loadScript,
} from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';

const PARA_ALIGN = ['homepagecarousel-p-left', 'homepagecarousel-p-right', 'homepagecarousel-p-center'];

function getText(el) {
  return el?.textContent?.trim() ?? '';
}

function getLink(el) {
  const link = el?.querySelector?.('a');
  return link?.getAttribute?.('href') || link?.href || '';
}

function getImageSrc(pictureOrImg) {
  const pic = pictureOrImg?.closest?.('picture') || pictureOrImg;
  const img = pic?.querySelector?.('img') || (pic?.tagName === 'IMG' ? pic : null);
  return img?.src || img?.getAttribute?.('src') || '';
}

function getImageAlt(pictureOrImg) {
  const pic = pictureOrImg?.closest?.('picture') || pictureOrImg;
  const img = pic?.querySelector?.('img') || (pic?.tagName === 'IMG' ? pic : null);
  return img?.alt || img?.getAttribute?.('alt') || '';
}

function parseBoolRow(row) {
  return getText(row?.children?.[0]).toLowerCase() === 'true';
}

function buildParagraphs(cell) {
  const wrap = document.createElement('div');
  wrap.className = 'homepagecarousel-paragraphs';
  const ps = cell?.querySelectorAll?.(':scope > p')?.length
    ? cell.querySelectorAll(':scope > p')
    : cell?.querySelectorAll?.('p');
  if (ps?.length) {
    ps.forEach((p, i) => {
      const np = document.createElement('p');
      const alignClass = PARA_ALIGN[i % PARA_ALIGN.length];
      if (alignClass) np.classList.add(alignClass);
      np.textContent = p.textContent?.trim() ?? '';
      if (np.textContent) wrap.appendChild(np);
    });
  } else {
    const text = getText(cell);
    if (text) {
      const p = document.createElement('p');
      p.classList.add(PARA_ALIGN[0]);
      p.textContent = text;
      wrap.appendChild(p);
    }
  }
  return wrap;
}

function parseSlideRow(row) {
  const cells = [...(row?.children ?? [])];
  const mediaType = getText(cells[0]).toLowerCase() || 'image';
  const c1 = cells[1];
  const c2 = cells[2];
  const pictureEl = c1?.querySelector?.('picture');
  const videoSrc = mediaType === 'video'
    ? (getLink(c1) || getLink(c2))
    : '';
  const imageSrc = pictureEl ? getImageSrc(pictureEl) : '';
  const imageAlt = pictureEl ? getImageAlt(pictureEl) : '';
  const brandPic = cells[7]?.querySelector?.('picture, img');
  const brandSrc = brandPic ? getImageSrc(brandPic) : '';
  const brandAlt = brandPic ? getImageAlt(brandPic) : '';
  return {
    mediaType,
    videoSrc,
    imageSrc,
    imageAlt,
    categoryTag: getText(cells[3]),
    paragraphCell: cells[4],
    ctaLink: getLink(cells[5]),
    ctaText: getText(cells[6]),
    brandSrc,
    brandAlt,
    overlayToken: getText(cells[8]),
    sourceRow: row,
  };
}

function buildHeadlineSection(headlineRow) {
  const section = document.createElement('div');
  section.className = 'homepagecarousel-headline';
  const source = headlineRow?.children?.[0];
  if (!source) return section;
  moveInstrumentation(source, section);
  while (source.firstChild) {
    section.appendChild(source.firstChild);
  }
  return section;
}

function buildSlideBackground(data) {
  const bg = document.createElement('div');
  bg.className = 'homepagecarousel-slide-bg';
  if (data.mediaType === 'video' && data.videoSrc) {
    const video = document.createElement('video');
    video.className = 'homepagecarousel-slide-video';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.src = data.videoSrc;
    bg.appendChild(video);
  } else if (data.imageSrc) {
    bg.appendChild(createOptimizedPicture(
      data.imageSrc,
      data.imageAlt,
      false,
      [{ width: '750' }, { width: '1500' }],
    ));
  }
  return bg;
}

function buildSlideForeground(data) {
  const fg = document.createElement('div');
  fg.className = 'homepagecarousel-slide-fg';
  const overlay = document.createElement('div');
  overlay.className = 'homepagecarousel-slide-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  if (data.overlayToken) {
    overlay.style.background = data.overlayToken;
  }
  fg.appendChild(overlay);
  if (data.categoryTag) {
    const tag = document.createElement('span');
    tag.className = 'homepagecarousel-tag';
    tag.textContent = data.categoryTag;
    fg.appendChild(tag);
  }
  fg.appendChild(buildParagraphs(data.paragraphCell));
  if (data.ctaLink || data.ctaText) {
    const a = document.createElement('a');
    a.href = data.ctaLink || '#';
    a.className = 'homepagecarousel-cta';
    a.textContent = data.ctaText || '';
    const isExternal = /^https?:\/\//i.test(a.href);
    if (isExternal) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    fg.appendChild(a);
  }
  return fg;
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 8) return;

  const headlineSection = buildHeadlineSection(rows[0]);
  const durationSec = Math.max(1, Number.parseInt(getText(rows[1]?.children?.[0]) || '5', 10) || 5);
  const autoplayEnabled = parseBoolRow(rows[2]);
  const loopOn = parseBoolRow(rows[3]);
  const auraOn = parseBoolRow(rows[4]);
  const auraGradient = getText(rows[5]?.children?.[0]);

  const slideRows = rows.slice(6);
  const slides = slideRows.map(parseSlideRow);
  if (slides.length < 2) return;

  const root = document.createElement('div');
  root.className = 'homepagecarousel-root';
  if (auraOn) {
    root.classList.add('homepagecarousel-root-aura');
    if (auraGradient) {
      root.style.setProperty('--homepagecarousel-aura', auraGradient);
    }
  }
  root.style.setProperty('--homepagecarousel-duration', `${durationSec}s`);

  const container = document.createElement('div');
  container.className = 'container homepagecarousel-container';
  const gridRow = document.createElement('div');
  gridRow.className = 'row homepagecarousel-grid';

  const headlineCol = document.createElement('div');
  headlineCol.className = 'col-s-4 col-m-8 col-xl-5 homepagecarousel-headline-col';
  headlineCol.appendChild(headlineSection);

  const mainCol = document.createElement('div');
  mainCol.className = 'col-s-4 col-m-8 col-xl-7 homepagecarousel-main';

  const stage = document.createElement('div');
  stage.className = 'homepagecarousel-stage';

  const iconNav = document.createElement('div');
  iconNav.className = 'homepagecarousel-icon-nav';
  iconNav.setAttribute('role', 'tablist');
  iconNav.setAttribute('aria-label', 'Carousel slides');

  const swiperShell = document.createElement('div');
  swiperShell.className = 'homepagecarousel-swiper-shell';
  const swiperEl = document.createElement('div');
  swiperEl.className = 'swiper homepagecarousel-swiper';
  swiperEl.innerHTML = '<div class="swiper-wrapper"></div>';
  const swiperWrapper = swiperEl.querySelector('.swiper-wrapper');

  slides.forEach((data, idx) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide homepagecarousel-slide';
    const inner = document.createElement('div');
    inner.className = 'homepagecarousel-slide-inner';
    inner.appendChild(buildSlideBackground(data));
    inner.appendChild(buildSlideForeground(data));
    slide.appendChild(inner);
    swiperWrapper?.appendChild(slide);
    moveInstrumentation(data.sourceRow, slide);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'homepagecarousel-icon-btn';
    btn.setAttribute('role', 'tab');
    const label = data.brandAlt || `Slide ${idx + 1}`;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    if (data.brandSrc) {
      const img = document.createElement('img');
      img.src = data.brandSrc;
      img.alt = data.brandAlt || '';
      img.width = 50;
      img.height = 50;
      btn.appendChild(img);
    }
    const progress = document.createElement('span');
    progress.className = 'homepagecarousel-icon-progress';
    progress.setAttribute('aria-hidden', 'true');
    btn.appendChild(progress);
    btn.addEventListener('click', () => {
      /* set by swiper init */
    });
    iconNav.appendChild(btn);
  });

  swiperShell.appendChild(swiperEl);
  stage.appendChild(iconNav);
  stage.appendChild(swiperShell);
  mainCol.appendChild(stage);

  gridRow.appendChild(headlineCol);
  gridRow.appendChild(mainCol);
  container.appendChild(gridRow);
  root.appendChild(container);

  moveInstrumentation(block, root);
  block.replaceChildren(root);

  await Promise.all([
    loadCSS(SWIPER_CSS),
    loadScript(SWIPER_JS),
  ]);

  const { Swiper } = window;
  if (!Swiper) return;

  const iconButtons = [...iconNav.querySelectorAll('.homepagecarousel-icon-btn')];

  function setActiveIcon(idx) {
    iconButtons.forEach((btn, i) => {
      const on = i === idx;
      btn.classList.toggle('homepagecarousel-icon-btn-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      const fill = btn.querySelector('.homepagecarousel-icon-progress');
      fill?.classList.remove('homepagecarousel-icon-progress-animating');
      if (on && fill) {
        fill.getBoundingClientRect();
        fill.classList.add('homepagecarousel-icon-progress-animating');
      }
    });
  }

  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 0,
    allowTouchMove: true,
    loop: loopOn && slides.length > 1,
    autoplay: autoplayEnabled ? {
      delay: durationSec * 1000,
      disableOnInteraction: false,
    } : false,
    on: {
      slideChange() {
        setActiveIcon(swiper.realIndex);
      },
    },
  });

  setActiveIcon(swiper.realIndex);

  function restartAutoplay() {
    const { autoplay } = swiper;
    if (!autoplayEnabled || !autoplay) return;
    autoplay.stop();
    autoplay.start();
  }

  iconButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      if (loopOn && typeof swiper.slideToLoop === 'function') {
        swiper.slideToLoop(idx);
      } else {
        swiper.slideTo(idx);
      }
      restartAutoplay();
    });
  });
}
