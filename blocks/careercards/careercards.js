/**
 * CareerCards Block
 *
 * Structure contract (index-based) - TO BE VALIDATED with user-provided HTML from Universal Editor:
 * - block.children[0] = Section heading row (parent)
 * - block.children[1+] = CareerCard item rows (children)
 *
 * Per card row (assumed - verify with actual HTML):
 * - row.children[0] = image, [1] = imageAlt, [2] = category, [3] = title, [4] = link, [5] = linkText, [6] = linkTarget
 *
 * Design: Only "Read more" CTA is clickable (not entire card).
 * Category pill: same style on all viewports.
 *
 * @param {Element} block The block element
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const wrapper = document.createElement('div');
  wrapper.classList.add('careercards-wrapper');

  // Parent: section heading (block.children[0])
  const headingRow = rows[0];
  const headingText = headingRow?.children?.[0]?.textContent?.trim()
    || headingRow?.children?.[0]?.querySelector?.('p')?.textContent?.trim() || '';
  if (headingText) {
    const heading = document.createElement('h2');
    heading.classList.add('careercards-heading');
    heading.textContent = headingText;
    if (headingRow) moveInstrumentation(headingRow, heading);
    wrapper.appendChild(heading);
  }

  // Children: card rows (block.children[1+])
  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add('careercards-cards');

  const cardRows = rows.slice(1);
  cardRows.forEach((row) => {
    const card = document.createElement('div');
    card.classList.add('careercards-card');
    moveInstrumentation(row, card);

    const imageCell = row?.children?.[0];
    const altCell = row?.children?.[1];
    const categoryCell = row?.children?.[2];
    const titleCell = row?.children?.[3];
    const linkCell = row?.children?.[4];
    const linkTextCell = row?.children?.[5];
    const linkTargetCell = row?.children?.[6];

    const altText = altCell?.textContent?.trim() || altCell?.querySelector?.('p')?.textContent?.trim() || '';
    const category = categoryCell?.textContent?.trim() || categoryCell?.querySelector?.('p')?.textContent?.trim() || '';
    const title = titleCell?.textContent?.trim() || titleCell?.querySelector?.('p')?.textContent?.trim() || '';

    const linkEl = linkCell?.querySelector?.('a') || linkCell?.querySelector?.('p a');
    const linkUrl = linkEl?.getAttribute?.('href') || linkEl?.href || '';
    let linkText = linkTextCell?.textContent?.trim() || linkTextCell?.querySelector?.('p')?.textContent?.trim() || '';
    if (!linkText && linkEl) {
      const lt = linkEl.textContent?.trim() || '';
      linkText = (lt.startsWith('/') || lt.includes('http')) ? '' : lt;
    }
    linkText = linkText || 'Read more';
    const linkTarget = linkTargetCell?.textContent?.trim() || '_self';

    // Image area with gradient overlay
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('careercards-card-image');
    const pictureOrImg = imageCell?.querySelector?.('picture, img');
    const imgAnchor = imageCell?.querySelector?.('a');
    let imageSrc = null;
    if (pictureOrImg) {
      const img = pictureOrImg.tagName === 'IMG' ? pictureOrImg : pictureOrImg.querySelector('img');
      imageSrc = img?.src;
    }
    if (!imageSrc && imgAnchor) {
      imageSrc = imgAnchor?.getAttribute?.('href') || imgAnchor?.href;
    }
    if (imageSrc) {
      const optimizedPic = createOptimizedPicture(imageSrc, altText, false, [{ width: '750' }, { width: '1440' }]);
      const newImg = optimizedPic.querySelector('img');
      if (pictureOrImg && newImg) {
        const origImg = pictureOrImg.tagName === 'IMG' ? pictureOrImg : pictureOrImg.querySelector('img');
        if (origImg) moveInstrumentation(origImg, newImg);
      }
      imageWrapper.appendChild(optimizedPic);
    }
    const overlay = document.createElement('div');
    overlay.classList.add('careercards-card-overlay');
    imageWrapper.appendChild(overlay);

    if (category) {
      const pill = document.createElement('span');
      pill.classList.add('careercards-card-category');
      pill.textContent = category;
      imageWrapper.appendChild(pill);
    }

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.classList.add('careercards-card-title');
      titleEl.textContent = title;
      imageWrapper.appendChild(titleEl);
    }

    card.appendChild(imageWrapper);

    if (linkUrl) {
      const cta = document.createElement('a');
      cta.href = linkUrl;
      cta.textContent = `${linkText} →`;
      cta.classList.add('careercards-card-cta');
      cta.target = linkTarget;
      if (linkTarget === '_blank') cta.rel = 'noopener noreferrer';
      card.appendChild(cta);
    }

    cardsContainer.appendChild(card);
  });

  wrapper.appendChild(cardsContainer);
  block.replaceChildren(wrapper);
}
