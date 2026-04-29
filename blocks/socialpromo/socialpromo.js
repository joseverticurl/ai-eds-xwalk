/**
 * Social Promo Block
 * Marquee-style carousel of social promo cards with title and CTA.
 *
 * Structure contract (from user-provided HTML):
 * - block.children[0]: title row (cells[0] = title text)
 * - block.children[1]: ctaLabel row (cells[0] = CTA label text)
 * - block.children[2]: ctaLink row (cells[0] = <a href="...">)
 * - block.children[3..N]: card rows, each with:
 *   - cells[0]: picture
 *   - cells[1]: caption (may be empty)
 *   - cells[2]: tag (may be <a> or text, may be empty)
 *   - cells[3]: theme (text, e.g. "green", "light-yellow")
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/** Instagram icon SVG (24x24) */
const INSTAGRAM_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>';

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 4) return;

  const titleRow = rows[0];
  const ctaLabelRow = rows[1];
  const ctaLinkRow = rows[2];
  const cardRows = rows.slice(3);

  const title = titleRow?.children?.[0]?.textContent?.trim() || '';
  const ctaLabel = ctaLabelRow?.children?.[0]?.textContent?.trim() || '';
  const ctaLinkEl = ctaLinkRow?.children?.[0]?.querySelector('a');
  const ctaLink = ctaLinkEl?.getAttribute('href') || '';

  const header = document.createElement('div');
  header.className = 'social-promo-header';

  const titleEl = document.createElement('h2');
  titleEl.className = 'social-promo-title';
  titleEl.textContent = title;
  header.appendChild(titleEl);

  if (ctaLabel && ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'social-promo-cta';
    cta.href = ctaLink;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.innerHTML = `${INSTAGRAM_ICON_SVG}<span>${ctaLabel}</span>`;
    header.appendChild(cta);
  }

  const track = document.createElement('div');
  track.className = 'social-promo-track';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const pictureCell = cells[0];
    const captionCell = cells[1];
    const tagCell = cells[2];
    const themeCell = cells[3];

    const theme = themeCell?.textContent?.trim()?.toLowerCase().replaceAll(/\s+/g, '-') || 'green';
    const caption = captionCell?.textContent?.trim() || '';
    const tagText = tagCell?.querySelector('a')?.textContent?.trim()
      || tagCell?.textContent?.trim() || '';

    const img = pictureCell?.querySelector('img');
    let imgSrc = img?.getAttribute('src') || img?.src || '';
    if (imgSrc) imgSrc = imgSrc.replaceAll('&#x26;', '&');
    const imgAlt = img?.getAttribute('alt') || '';

    const card = document.createElement('div');
    card.className = `social-promo-card social-promo-card--${theme}`;

    const imageWrap = document.createElement('div');
    imageWrap.className = 'social-promo-card-image';
    if (imgSrc) {
      const optimizedPic = createOptimizedPicture(imgSrc, imgAlt, false, [
        { media: '(min-width: 600px)', width: '395' },
        { width: '347' },
      ]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      imageWrap.appendChild(optimizedPic);
    }

    if (tagText) {
      const tag = document.createElement('span');
      tag.className = 'social-promo-card-tag';
      tag.textContent = tagText.startsWith('#') ? tagText : `#${tagText}`;
      imageWrap.appendChild(tag);
    }

    card.appendChild(imageWrap);

    if (caption) {
      const captionEl = document.createElement('p');
      captionEl.className = 'social-promo-card-caption';
      captionEl.textContent = caption;
      card.appendChild(captionEl);
    }

    const cardWrapper = document.createElement('div');
    moveInstrumentation(row, cardWrapper);
    cardWrapper.appendChild(card);
    track.appendChild(cardWrapper);
  });

  const marqueeInner = document.createElement('div');
  marqueeInner.className = 'social-promo-marquee-inner';
  marqueeInner.appendChild(track);
  marqueeInner.appendChild(track.cloneNode(true));

  const marquee = document.createElement('div');
  marquee.className = 'social-promo-marquee';
  marquee.appendChild(marqueeInner);

  const wrapper = document.createElement('div');
  wrapper.className = 'social-promo-wrapper';
  wrapper.appendChild(header);
  wrapper.appendChild(marquee);

  block.replaceChildren(wrapper);
}
