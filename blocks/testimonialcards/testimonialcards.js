/**
 * Testimonial Cards Block
 *
 * Structure contract (from user-provided HTML, testimonialcards.html):
 * - block.children[0] = Section title line 1 row
 * - block.children[1] = Section title line 2 row
 * - block.children[2] = Description row
 * - block.children[3] = CTA label row
 * - block.children[4] = CTA link row
 * - block.children[5] = Background option row
 * - block.children[6+] = Card item rows
 *
 * Per item row (observed): image(0), name(1), quote(2), mediaType(3), mediaSource(4),
 * mediaThumbnail(5), errorMessageOverride(6). Alt from img element.
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

const CHEVRON_LEFT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
const CHEVRON_RIGHT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
const PLAY_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

const ACCENT_COLORS = ['#6cc9d0', '#d5b85c', '#ff570f', '#6acf7f'];

const PLACEHOLDER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="370" height="280" viewBox="0 0 370 280"><rect width="370" height="280" fill="#e8e8e8"/><text x="50%" y="50%" fill="#999" text-anchor="middle" dy=".3em" font-size="14">Image</text></svg>';
const PLACEHOLDER_IMG = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_SVG)}`;

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

function getImgFromCell(cell) {
  const pictureOrImg = cell?.querySelector?.('picture, img');
  const img = pictureOrImg?.tagName === 'IMG'
    ? pictureOrImg
    : pictureOrImg?.querySelector?.('img');
  return img;
}

async function initSwiper(swiperWrap, cards) {
  if (cards.length === 0) return;
  await Promise.all([
    loadCSS(SWIPER_CSS),
    loadScript(SWIPER_JS),
  ]);
  const SwiperLib = window.Swiper;
  if (!SwiperLib) return;
  const swiperInstance = new SwiperLib(swiperWrap, {
    grabCursor: true,
    loop: cards.length > 1,
    slidesPerView: 1,
    spaceBetween: 16,
    navigation: {
      nextEl: swiperWrap.querySelector('.testimonialcards-next'),
      prevEl: swiperWrap.querySelector('.testimonialcards-prev'),
    },
    breakpoints: {
      390: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 16 },
      768: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 24 },
      1280: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 24 },
      1920: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 32 },
    },
  });
  swiperWrap.testimonialcardsSwiper = swiperInstance;
}

export default async function decorate(block) {
  const rows = [...block.children];

  const title1 = extractText(rows[0]?.children?.[0]) ?? '';
  const title2 = extractText(rows[1]?.children?.[0]) ?? '';
  const description = extractText(rows[2]?.children?.[0]) ?? '';
  const ctaLabel = extractText(rows[3]?.children?.[0]) ?? '';
  const ctaLink = extractLink(rows[4]?.children?.[0]) ?? '';
  const backgroundOption = extractText(rows[5]?.children?.[0]) ?? 'default';

  const itemRows = rows.slice(6);

  const wrapper = document.createElement('div');
  wrapper.classList.add('testimonialcards-wrapper');
  if (backgroundOption && backgroundOption.toLowerCase() !== 'none') {
    wrapper.classList.add('testimonialcards-with-bg');
  }

  const headingWrap = document.createElement('div');
  headingWrap.classList.add('testimonialcards-heading');
  const h2 = document.createElement('h2');
  h2.classList.add('testimonialcards-title');
  if (title1) {
    const line1 = document.createElement('span');
    line1.classList.add('testimonialcards-title-line1');
    line1.textContent = title1;
    h2.appendChild(line1);
  }
  if (title2) {
    const line2 = document.createElement('span');
    line2.classList.add('testimonialcards-title-line2');
    line2.textContent = title2;
    h2.appendChild(line2);
  }
  if (title1 || title2) {
    headingWrap.appendChild(h2);
    wrapper.appendChild(headingWrap);
  }

  const carouselWrap = document.createElement('div');
  carouselWrap.classList.add('testimonialcards-carousel-wrap');
  carouselWrap.setAttribute('role', 'region');
  carouselWrap.setAttribute('aria-label', 'Testimonial cards');

  const swiperDiv = document.createElement('div');
  swiperDiv.classList.add('swiper', 'testimonialcards-swiper');
  swiperDiv.innerHTML = `
    <div class="swiper-wrapper"></div>
    <button type="button" class="testimonialcards-prev swiper-button-prev" aria-label="Previous slide">${CHEVRON_LEFT_SVG}</button>
    <button type="button" class="testimonialcards-next swiper-button-next" aria-label="Next slide">${CHEVRON_RIGHT_SVG}</button>
    <div class="testimonialcards-drag-control">
      <span class="testimonialcards-drag-label">Drag</span>
    </div>
  `;
  const swiperWrapper = swiperDiv.querySelector('.swiper-wrapper');
  const dragControl = swiperDiv.querySelector('.testimonialcards-drag-control');
  if (dragControl) {
    const prevBtn = swiperDiv.querySelector('.testimonialcards-prev');
    const nextBtn = swiperDiv.querySelector('.testimonialcards-next');
    dragControl.insertBefore(prevBtn, dragControl.firstChild);
    dragControl.appendChild(nextBtn);
  }

  const cards = [];

  itemRows.forEach((row, idx) => {
    const imgCell = row?.children?.[0];
    const nameCell = row?.children?.[1];
    const quoteCell = row?.children?.[2];
    const mediaTypeCell = row?.children?.[3];
    const mediaSourceCell = row?.children?.[4];
    const errorCell = row?.children?.[6];

    const imgEl = getImgFromCell(imgCell);
    const imgSrc = imgEl?.getAttribute?.('src') || imgEl?.src
      || imgCell?.querySelector?.('a')?.href || '';
    const altText = imgEl?.getAttribute?.('alt') || imgEl?.alt
      || extractText(nameCell) || '';
    const name = extractText(nameCell) ?? '';
    const roleCell = row?.children?.[3];
    const cell3Text = extractText(roleCell) ?? '';
    const role = ['none', 'video', 'audio'].includes(cell3Text.toLowerCase())
      ? ''
      : cell3Text;
    const quote = extractText(quoteCell) ?? '';
    const mediaType = (extractText(mediaTypeCell) || 'None').trim();
    const mediaSource = extractLink(mediaSourceCell) || extractText(mediaSourceCell) || '';
    const errorOverride = extractText(errorCell) || 'Media unavailable';

    const isQuote = mediaType.toLowerCase() === 'none' && quote;
    const mediaErrorMsg = errorOverride;
    const isVideo = ['video', 'audio'].includes(mediaType.toLowerCase()) && mediaSource;

    const slide = document.createElement('div');
    slide.classList.add('swiper-slide', 'testimonialcards-slide');
    slide.dataset.accentIndex = String(idx % ACCENT_COLORS.length);

    const card = document.createElement('div');
    card.classList.add('testimonialcards-card');
    card.classList.add(isQuote ? 'testimonialcards-card-quote' : 'testimonialcards-card-video');

    if (isQuote) {
      const quoteBox = document.createElement('div');
      quoteBox.classList.add('testimonialcards-quote-box');
      const quoteEl = document.createElement('p');
      quoteEl.classList.add('testimonialcards-quote-text');
      quoteEl.textContent = quote;
      quoteBox.appendChild(quoteEl);

      const profilePill = document.createElement('div');
      profilePill.classList.add('testimonialcards-profile-pill');
      const imgWrap = document.createElement('div');
      imgWrap.classList.add('testimonialcards-profile-img');
      if (imgSrc) {
        const pic = createOptimizedPicture(
          imgSrc,
          altText || name,
          false,
          [{ media: '(min-width: 600px)', width: '100' }, { width: '50' }],
        );
        const picImg = pic.querySelector('img');
        if (picImg) {
          picImg.onerror = function onImgError() {
            this.onerror = null;
            this.src = PLACEHOLDER_IMG;
          };
        }
        imgWrap.appendChild(pic);
      } else {
        const placeholder = document.createElement('img');
        placeholder.src = PLACEHOLDER_IMG;
        placeholder.alt = altText || name;
        imgWrap.appendChild(placeholder);
      }
      const info = document.createElement('div');
      info.classList.add('testimonialcards-profile-info');
      if (name) {
        const nameEl = document.createElement('div');
        nameEl.classList.add('testimonialcards-name');
        nameEl.textContent = name;
        info.appendChild(nameEl);
      }
      if (role) {
        const roleEl = document.createElement('div');
        roleEl.classList.add('testimonialcards-role');
        roleEl.textContent = role;
        info.appendChild(roleEl);
      }
      profilePill.appendChild(imgWrap);
      profilePill.appendChild(info);

      quoteBox.appendChild(profilePill);
      card.appendChild(quoteBox);
    } else if (isVideo) {
      const mediaWrap = document.createElement('div');
      mediaWrap.classList.add('testimonialcards-video-wrap');
      if (imgSrc) {
        const pic = createOptimizedPicture(
          imgSrc,
          altText || name,
          false,
          [{ media: '(min-width: 900px)', width: '740' }, { width: '630' }],
        );
        const picImg = pic.querySelector('img');
        if (picImg) {
          picImg.onerror = function onImgError() {
            this.onerror = null;
            this.src = PLACEHOLDER_IMG;
          };
        }
        mediaWrap.appendChild(pic);
      }
      const overlay = document.createElement('div');
      overlay.classList.add('testimonialcards-video-overlay');
      const bar = document.createElement('div');
      bar.classList.add('testimonialcards-video-bar');
      const barInfo = document.createElement('div');
      barInfo.classList.add('testimonialcards-video-bar-info');
      if (name) {
        const nameEl = document.createElement('div');
        nameEl.classList.add('testimonialcards-name');
        nameEl.textContent = name;
        barInfo.appendChild(nameEl);
      }
      if (role) {
        const roleEl = document.createElement('div');
        roleEl.classList.add('testimonialcards-role');
        roleEl.textContent = role;
        barInfo.appendChild(roleEl);
      }
      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.classList.add('testimonialcards-play-btn');
      playBtn.setAttribute('aria-label', 'Play testimonial video');
      playBtn.innerHTML = PLAY_ICON_SVG;
      playBtn.addEventListener('click', () => {
        const mediaEl = mediaWrap.querySelector('video, audio, iframe');
        if (mediaEl) {
          if (mediaEl.tagName === 'IFRAME') {
            const src = mediaEl.src || mediaEl.dataset.src || mediaSource;
            if (src && !mediaEl.src) mediaEl.src = src;
          } else {
            mediaEl.play().catch(() => {
              const errDiv = document.createElement('div');
              errDiv.className = 'testimonialcards-media-error';
              errDiv.textContent = mediaErrorMsg;
              mediaWrap.appendChild(errDiv);
            });
          }
        } else if (mediaSource) {
          const video = document.createElement('video');
          video.src = mediaSource;
          video.controls = true;
          video.onerror = () => {
            const errDiv = document.createElement('div');
            errDiv.className = 'testimonialcards-media-error';
            errDiv.textContent = mediaErrorMsg;
            mediaWrap.appendChild(errDiv);
          };
          mediaWrap.appendChild(video);
          video.play().catch(() => {});
        }
      });
      bar.appendChild(barInfo);
      bar.appendChild(playBtn);
      overlay.appendChild(bar);
      mediaWrap.appendChild(overlay);
      card.appendChild(mediaWrap);
    } else {
      const simpleWrap = document.createElement('div');
      simpleWrap.classList.add('testimonialcards-simple');
      if (imgSrc) {
        const pic = createOptimizedPicture(
          imgSrc,
          altText || name,
          false,
          [{ media: '(min-width: 900px)', width: '740' }, { width: '630' }],
        );
        const picImg = pic.querySelector('img');
        if (picImg) {
          picImg.onerror = function onImgError() {
            this.onerror = null;
            this.src = PLACEHOLDER_IMG;
          };
        }
        simpleWrap.appendChild(pic);
      }
      const bar = document.createElement('div');
      bar.classList.add('testimonialcards-simple-bar');
      const info = document.createElement('div');
      info.classList.add('testimonialcards-profile-info');
      if (name) {
        const nameEl = document.createElement('div');
        nameEl.classList.add('testimonialcards-name');
        nameEl.textContent = name;
        info.appendChild(nameEl);
      }
      if (role) {
        const roleEl = document.createElement('div');
        roleEl.classList.add('testimonialcards-role');
        roleEl.textContent = role;
        info.appendChild(roleEl);
      }
      bar.appendChild(info);
      simpleWrap.appendChild(bar);
      card.appendChild(simpleWrap);
    }

    if (row) moveInstrumentation(row, slide);
    slide.appendChild(card);
    swiperWrapper.appendChild(slide);
    cards.push(slide);
  });

  carouselWrap.appendChild(swiperDiv);
  wrapper.appendChild(carouselWrap);

  if (description) {
    const descEl = document.createElement('p');
    descEl.classList.add('testimonialcards-description');
    descEl.textContent = description;
    wrapper.appendChild(descEl);
  }

  if (ctaLink) {
    const ctaBtn = document.createElement('a');
    ctaBtn.href = ctaLink;
    ctaBtn.classList.add('testimonialcards-cta');
    ctaBtn.textContent = ctaLabel || 'Learn more';
    ctaBtn.setAttribute('aria-label', ctaLabel || 'Learn more');
    if (rows[4]?.children?.[0]) moveInstrumentation(rows[4].children[0], ctaBtn);
    wrapper.appendChild(ctaBtn);
  }

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);

  if (cards.length > 0) {
    await initSwiper(swiperDiv, cards);
  }
}
