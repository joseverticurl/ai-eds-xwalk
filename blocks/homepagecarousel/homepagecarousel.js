/**
 * Homepage Carousel Block
 *
 * Structure contract (from user-provided HTML):
 * - block.children[0] = sectionHeadline row
 * - block.children[1] = transitionDuration row
 * - block.children[2] = autoplay row
 * - block.children[3] = loopSlides row
 * - block.children[4] = enableAuraEffect row
 * - block.children[5] = auraGradient row
 * - block.children[6+] = slide rows
 *
 * Each slide row:
 * - row.children[0] = mediaType (image|video)
 * - row.children[1] = image (picture) or video URL (link when mediaType=video)
 * - row.children[2] = video URL (link); when image, may duplicate video field
 * - row.children[3] = categoryTag
 * - row.children[4] = paragraphs (text or richtext)
 * - row.children[5] = ctaLink (a)
 * - row.children[6] = ctaLabel
 * - row.children[7] = brandIcon (picture)
 * - row.children[8] = brandIconAlt or overlayGradient (optional)
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
  const link = el?.querySelector?.('a') || el?.querySelector?.('p a') || (el?.tagName === 'A' ? el : null);
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

function resolveUrl(href) {
  if (!href) return '';
  try {
    return new URL(href, window.location.href).href;
  } catch {
    return href;
  }
}

function getParagraphAlignment(index) {
  const alignments = ['align-left', 'align-right', 'align-center'];
  return alignments[index % 3];
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Parent fields (indices 0-5)
  const sectionHeadline = getText(rows[0]?.children?.[0]);
  const transitionDuration = Math.min(10, Math.max(1, Number.parseInt(getText(rows[1]?.children?.[0]) || '5', 10) || 5));
  const autoplay = getText(rows[2]?.children?.[0]) !== 'false';
  const loopSlides = getText(rows[3]?.children?.[0]) !== 'false';
  const enableAuraEffect = getText(rows[4]?.children?.[0]) !== 'false';
  const auraGradient = getText(rows[5]?.children?.[0]) || '';

  // Slide rows (indices 6+)
  const slideRows = rows.slice(6);
  const slides = slideRows.map((row) => {
    const mediaType = getText(row?.children?.[0]) || 'image';
    const imgCell = row?.children?.[1];
    const videoCell = row?.children?.[2];
    const picture = imgCell?.querySelector?.('picture');
    const img = imgCell?.querySelector?.('img');
    const videoLink = videoCell?.querySelector?.('a') || videoCell;
    const videoHref = getLink(videoLink) || getLink(imgCell?.querySelector?.('a'));

    let mediaSrc = '';
    let mediaAlt = '';
    if (mediaType === 'video' && videoHref) {
      mediaSrc = resolveUrl(videoHref);
      mediaAlt = getText(row?.children?.[8]) || '';
    } else if (picture || img) {
      mediaSrc = getImageSrc(picture?.closest?.('picture') || img);
      mediaAlt = getImageAlt(picture?.closest?.('picture') || img) || '';
    }

    const ctaLinkEl = row?.children?.[5];
    const ctaLink = getLink(ctaLinkEl);
    const ctaLabel = getText(row?.children?.[6]) || getText(ctaLinkEl?.querySelector?.('a')) || '';

    const brandIconPic = row?.children?.[7]?.querySelector?.('picture, img');
    const brandIconSrc = brandIconPic ? getImageSrc(brandIconPic?.closest?.('picture') || brandIconPic) : '';
    const brandIconAlt = getImageAlt(brandIconPic?.closest?.('picture') || brandIconPic) || getText(row?.children?.[8]) || '';

    let paragraphsHtml = row?.children?.[4]?.innerHTML ?? getText(row?.children?.[4]) ?? '';
    if (paragraphsHtml && !paragraphsHtml.trim().startsWith('<')) {
      paragraphsHtml = `<p>${paragraphsHtml}</p>`;
    }

    return {
      mediaType,
      mediaSrc,
      mediaAlt,
      categoryTag: getText(row?.children?.[3]),
      paragraphsHtml,
      ctaLink,
      ctaLabel,
      brandIconSrc,
      brandIconAlt,
      ctaLinkEl,
    };
  });

  if (slides.length === 0) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'homepagecarousel-wrapper';
  if (enableAuraEffect) {
    wrapper.classList.add('homepagecarousel-wrapper--aura');
    if (auraGradient) {
      wrapper.style.setProperty('--homepagecarousel-aura', auraGradient);
    }
  }

  // Desktop: headline (left) + carousel (right)
  const layout = document.createElement('div');
  layout.className = 'homepagecarousel-layout';

  if (sectionHeadline) {
    const headlineSection = document.createElement('div');
    headlineSection.className = 'homepagecarousel-headline-section';
    const lines = sectionHeadline.split(/\n/).filter(Boolean);
    lines.forEach((line, idx) => {
      const p = document.createElement('p');
      p.className = `homepagecarousel-headline-line homepagecarousel-headline-line--${idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'right' : 'center'}`;
      p.textContent = line.trim();
      headlineSection.appendChild(p);
    });
    layout.appendChild(headlineSection);
  }

  const carouselSection = document.createElement('div');
  carouselSection.className = 'homepagecarousel-carousel-section';

  // Brand icons (navigation)
  const iconsContainer = document.createElement('div');
  iconsContainer.className = 'homepagecarousel-icons';
  iconsContainer.setAttribute('role', 'tablist');
  iconsContainer.setAttribute('aria-label', 'Carousel slides');

  slides.forEach((slide, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'homepagecarousel-icon homepagecarousel-icon--nav';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    btn.setAttribute('aria-label', `Slide ${idx + 1}`);
    btn.dataset.index = String(idx);
    if (slide.brandIconSrc) {
      const pic = createOptimizedPicture(slide.brandIconSrc, slide.brandIconAlt, false, [{ width: '100' }]);
      btn.appendChild(pic);
    } else {
      btn.textContent = idx + 1;
    }
    iconsContainer.appendChild(btn);
  });

  carouselSection.appendChild(iconsContainer);

  // Slides swiper
  const swiperWrap = document.createElement('div');
  swiperWrap.className = 'swiper homepagecarousel-swiper';
  swiperWrap.style.setProperty('--bullet-duration', `${transitionDuration}s`);
  swiperWrap.innerHTML = '<div class="swiper-wrapper"></div>';
  const swiperWrapper = swiperWrap.querySelector('.swiper-wrapper');

  slides.forEach((slide, idx) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'swiper-slide homepagecarousel-slide';
    slideEl.dataset.index = String(idx);

    const card = document.createElement('div');
    card.className = 'homepagecarousel-slide-card';

    // Media background
    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'homepagecarousel-slide-media';
    if (slide.mediaType === 'video' && slide.mediaSrc) {
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('aria-label', slide.mediaAlt || '');
      const source = document.createElement('source');
      source.src = slide.mediaSrc;
      video.appendChild(source);
      mediaWrap.appendChild(video);
    } else if (slide.mediaSrc) {
      const pic = createOptimizedPicture(
        slide.mediaSrc,
        slide.mediaAlt,
        idx === 0,
        [{ media: '(min-width: 900px)', width: '2000' }, { width: '750' }],
      );
      mediaWrap.appendChild(pic);
    }
    card.appendChild(mediaWrap);

    const overlay = document.createElement('div');
    overlay.className = 'homepagecarousel-slide-overlay';
    const content = document.createElement('div');
    content.className = 'homepagecarousel-slide-content';

    if (slide.categoryTag) {
      const tag = document.createElement('span');
      tag.className = 'homepagecarousel-slide-tag';
      tag.textContent = slide.categoryTag;
      content.appendChild(tag);
    }
    if (slide.paragraphsHtml) {
      const pWrap = document.createElement('div');
      pWrap.className = 'homepagecarousel-slide-paragraphs';
      pWrap.innerHTML = slide.paragraphsHtml;
      Array.from(pWrap.querySelectorAll('p')).forEach((p, i) => {
        p.classList.add(getParagraphAlignment(i));
      });
      content.appendChild(pWrap);
    }
    if (slide.ctaLink && slide.ctaLabel) {
      const a = document.createElement('a');
      a.href = slide.ctaLink;
      a.className = 'homepagecarousel-slide-cta';
      a.textContent = slide.ctaLabel;
      if (slide.ctaLinkEl) moveInstrumentation(slide.ctaLinkEl, a);
      const isExternal = slide.ctaLink.startsWith('http://') || slide.ctaLink.startsWith('https://');
      if (isExternal) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      content.appendChild(a);
    }
    overlay.appendChild(content);
    card.appendChild(overlay);
    slideEl.appendChild(card);
    swiperWrapper.appendChild(slideEl);
  });

  carouselSection.appendChild(swiperWrap);

  // Progress indicators (inside swiper area, positioned)
  const paginationEl = document.createElement('div');
  paginationEl.className = 'swiper-pagination homepagecarousel-pagination';
  carouselSection.appendChild(paginationEl);

  layout.appendChild(carouselSection);
  wrapper.appendChild(layout);

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);

  await Promise.all([
    loadCSS(SWIPER_CSS),
    loadScript(SWIPER_JS),
  ]);

  const Swiper = globalThis.Swiper;
  if (!Swiper) return;

  const bulletHtml = (index, className) => `<span class="${className} homepagecarousel-progress-bullet" data-index="${index}" role="button" tabindex="0" aria-label="Go to slide ${index + 1}"><span class="homepagecarousel-bullet-track"></span><span class="homepagecarousel-bullet-fill"></span></span>`;

  function updateProgressFills(container, idx) {
    const fills = container.querySelectorAll('.homepagecarousel-bullet-fill');
    fills.forEach((fill, i) => {
      fill.classList.remove('homepagecarousel-bullet-fill--active');
      if (i === idx) {
        void fill.offsetHeight;
        fill.classList.add('homepagecarousel-bullet-fill--active');
      }
    });
    iconsContainer.querySelectorAll('.homepagecarousel-icon').forEach((icon, i) => {
      icon.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  const swiper = new Swiper(swiperWrap, {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: loopSlides && slides.length > 1,
    autoplay: autoplay && slides.length > 1 ? {
      delay: transitionDuration * 1000,
      disableOnInteraction: false,
    } : false,
    pagination: {
      el: paginationEl,
      clickable: true,
      renderBullet: (index, className) => bulletHtml(index, className),
    },
  });

  swiper.on('slideChange', () => {
    const idx = swiper.realIndex;
    updateProgressFills(carouselSection, idx);
  });
  updateProgressFills(carouselSection, 0);

  const slideTo = (idx) => {
    if (loopSlides && slides.length > 1) {
      swiper.slideToLoop(idx);
    } else {
      swiper.slideTo(idx);
    }
  };

  iconsContainer.querySelectorAll('.homepagecarousel-icon').forEach((btn, idx) => {
    btn.addEventListener('click', () => slideTo(idx));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        slideTo(idx);
      }
    });
  });

  /* Swiper pagination is clickable: true, so bullet clicks are handled by Swiper */
}
