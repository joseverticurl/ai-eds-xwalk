import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * CareerCards Block
 *
 * Structure contract (from Universal Editor HTML - specs/requirements/semantichtml.html):
 * - block.children[0] = Section heading row (parent)
 *   - row.children[0] = heading text
 * - block.children[1+] = Card item rows (children)
 *   Per card row (4 cells):
 *   - row.children[0] = image (picture with img; alt in img.alt)
 *   - row.children[1] = category (text)
 *   - row.children[2] = title (text)
 *   - row.children[3] = link (empty div or anchor; linkText is anchor textContent)
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const container = document.createElement('div');
  container.classList.add('careercards-container');

  // Section heading (block.children[0])
  const headingRow = rows[0];
  const headingCell = headingRow?.children?.[0];
  let headingText = headingCell?.textContent?.trim() || '';
  if (!headingText && headingCell?.querySelector?.('p')) {
    headingText = headingCell.querySelector('p').textContent?.trim() || '';
  }
  if (headingText) {
    const heading = document.createElement('h2');
    heading.classList.add('careercards-heading');
    heading.textContent = headingText;
    if (headingCell) moveInstrumentation(headingCell, heading);
    container.appendChild(heading);
  }

  // Cards list (block.children[1+])
  const cardsList = document.createElement('ul');
  cardsList.classList.add('careercards-list');

  const cardRows = rows.slice(1);
  cardRows.forEach((row) => {
    const imageCell = row?.children?.[0];
    const categoryCell = row?.children?.[1];
    const titleCell = row?.children?.[2];
    const linkCell = row?.children?.[3];

    const pictureOrImg = imageCell?.querySelector?.('picture, img');
    const img = pictureOrImg?.tagName === 'IMG' ? pictureOrImg : pictureOrImg?.querySelector?.('img');
    const altText = img?.getAttribute?.('alt') || img?.alt || '';

    let category = categoryCell?.textContent?.trim() || '';
    if (!category && categoryCell?.querySelector?.('p')) {
      category = categoryCell.querySelector('p').textContent?.trim() || '';
    }

    let title = titleCell?.textContent?.trim() || '';
    if (!title && titleCell?.querySelector?.('p')) {
      title = titleCell.querySelector('p').textContent?.trim() || '';
    }

    const linkEl = linkCell?.querySelector?.('a') || linkCell?.querySelector?.('p a');
    const linkUrl = linkEl?.getAttribute?.('href') || linkEl?.href || '';
    let linkText = linkEl?.textContent?.trim() || '';
    if (!linkText || linkText.startsWith('/') || linkText.includes('http')) {
      linkText = 'Read more';
    }

    const li = document.createElement('li');
    li.classList.add('careercards-card');

    const cardContent = document.createElement('div');
    cardContent.classList.add('careercards-card-inner');

    if (pictureOrImg && img) {
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('careercards-card-image');
      const optimizedPic = createOptimizedPicture(
        img.src,
        altText,
        false,
        [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }],
      );
      moveInstrumentation(pictureOrImg, optimizedPic);
      imageWrapper.appendChild(optimizedPic);
      cardContent.appendChild(imageWrapper);
    }

    if (category) {
      const tag = document.createElement('span');
      tag.classList.add('careercards-card-tag');
      tag.textContent = category;
      if (categoryCell) moveInstrumentation(categoryCell, tag);
      cardContent.appendChild(tag);
    }

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.classList.add('careercards-card-title');
      titleEl.textContent = title;
      if (titleCell) moveInstrumentation(titleCell, titleEl);
      cardContent.appendChild(titleEl);
    }

    if (linkUrl) {
      const cardWrapper = document.createElement('a');
      cardWrapper.href = linkUrl;
      cardWrapper.classList.add('careercards-card-link');
      cardWrapper.setAttribute('aria-label', title || linkText);

      const ctaSpan = document.createElement('span');
      ctaSpan.classList.add('careercards-card-cta');
      ctaSpan.textContent = linkText;

      cardWrapper.appendChild(cardContent);
      cardWrapper.appendChild(ctaSpan);
      if (linkCell) moveInstrumentation(linkCell, cardWrapper);
      li.appendChild(cardWrapper);
    } else {
      li.appendChild(cardContent);
    }

    moveInstrumentation(row, li);
    cardsList.appendChild(li);
  });

  container.appendChild(cardsList);
  block.replaceChildren(container);
}
