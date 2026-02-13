import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Related Cards Block
 * 
 * Structure contract (index-based):
 * - block.children[0] = Section title row (title cell 0)
 * - block.children[1+] = Related card item rows (each row = one item)
 * 
 * For each card item row:
 * - row.children[0] = Image cell
 * - row.children[1] = Alt text cell
 * - row.children[2] = Badge text cell
 * - row.children[3] = Title cell
 * - row.children[4] = Link URL cell
 * - row.children[5] = Link target cell
 * 
 * Interaction patterns:
 * - Desktop: Title is clickable (not entire card)
 * - Mobile: Title + "Read more" button are clickable (not entire card)
 * 
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  
  // Extract section title: first row, first cell
  const titleRow = rows[0];
  const titleElement = titleRow?.children?.[0];
  const title = titleRow?.children?.[0]?.textContent?.trim() || '';
  
  // Extract card items: remaining rows (index 1+)
  const cardRows = rows.slice(1);
  
  // Build container structure
  const container = document.createElement('div');
  container.classList.add('related-cards__container');
  
  // Add section title
  if (title && titleElement) {
    const heading = document.createElement('h2');
    heading.classList.add('related-cards__title');
    heading.textContent = title;
    moveInstrumentation(titleElement, heading);
    container.appendChild(heading);
  }
  
  // Create cards wrapper
  const cardsWrapper = document.createElement('div');
  cardsWrapper.classList.add('related-cards__items');
  
  // Process each card row (child items)
  cardRows.forEach((row) => {
    const cells = [...row.children];
    
    // Extract data using index-based access
    const imageCell = cells[0];
    const altCell = cells[1];
    const badgeCell = cells[2];
    const titleCell = cells[3];
    const linkCell = cells[4];
    const targetCell = cells[5];
    
    // Extract image - handle wrapped elements
    const pictureOrImg = imageCell?.querySelector?.('picture, img');
    const imageSrc = pictureOrImg?.tagName === 'IMG' 
      ? pictureOrImg?.getAttribute?.('src') || pictureOrImg?.src
      : pictureOrImg?.querySelector?.('img')?.getAttribute?.('src') || pictureOrImg?.querySelector?.('img')?.src
      || imageCell?.querySelector?.('a')?.getAttribute?.('href') || imageCell?.querySelector?.('a')?.href || '';
    const imageAlt = altCell?.textContent?.trim() || '';
    
    // Extract badge text
    const badgeText = badgeCell?.textContent?.trim() || '';
    
    // Extract title
    const titleText = titleCell?.textContent?.trim() || '';
    
    // Extract link - handle wrapped elements and use .href fallback
    const linkElement = linkCell?.querySelector?.('a') || linkCell?.querySelector?.('p a');
    const linkUrl = linkElement?.getAttribute?.('href') || linkElement?.href || '';
    const linkTarget = targetCell?.textContent?.trim() || '_self';
    
    // Build card structure (div, not anchor - card is not fully clickable)
    const card = document.createElement('div');
    card.classList.add('related-card');
    
    // Image wrapper with gradient overlay
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('related-card__image-wrapper');
    
    if (imageSrc) {
      const existingPicture = imageCell?.querySelector?.('picture');
      if (existingPicture) {
        const img = existingPicture.querySelector('img');
        if (img) {
          const optimizedPic = createOptimizedPicture(
            img.src,
            imageAlt,
            false,
            [{ width: '440' }, { width: '880' }]
          );
          moveInstrumentation(existingPicture, optimizedPic);
          existingPicture.replaceWith(optimizedPic);
          imageWrapper.appendChild(optimizedPic);
        } else {
          imageWrapper.appendChild(existingPicture);
        }
      } else if (imageSrc) {
        const optimizedPic = createOptimizedPicture(
          imageSrc,
          imageAlt,
          false,
          [{ width: '440' }, { width: '880' }]
        );
        imageWrapper.appendChild(optimizedPic);
      }
    }
    
    // Gradient overlay
    const gradientOverlay = document.createElement('div');
    gradientOverlay.classList.add('related-card__gradient');
    imageWrapper.appendChild(gradientOverlay);
    
    // Content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('related-card__content');
    
    // Badge
    if (badgeText && badgeCell) {
      const badge = document.createElement('div');
      badge.classList.add('related-card__badge');
      badge.textContent = badgeText;
      moveInstrumentation(badgeCell, badge);
      contentWrapper.appendChild(badge);
    }
    
    // Title wrapper (will contain clickable title)
    const titleWrapper = document.createElement('div');
    titleWrapper.classList.add('related-card__title-wrapper');
    
    // Title - clickable on both desktop and mobile
    if (titleText && titleCell && linkUrl) {
      const titleLink = document.createElement('a');
      titleLink.classList.add('related-card__title-link');
      titleLink.href = linkUrl;
      titleLink.target = linkTarget;
      if (linkTarget === '_blank') {
        titleLink.rel = 'noopener noreferrer';
      }
      titleLink.textContent = titleText;
      moveInstrumentation(titleCell, titleLink);
      titleWrapper.appendChild(titleLink);
    } else if (titleText && titleCell) {
      // Title without link (fallback)
      const titleElement = document.createElement('h3');
      titleElement.classList.add('related-card__title');
      titleElement.textContent = titleText;
      moveInstrumentation(titleCell, titleElement);
      titleWrapper.appendChild(titleElement);
    }
    
    // "Read more" button - visible only on mobile
    if (linkUrl) {
      const readMoreButton = document.createElement('a');
      readMoreButton.classList.add('related-card__read-more');
      readMoreButton.href = linkUrl;
      readMoreButton.target = linkTarget;
      if (linkTarget === '_blank') {
        readMoreButton.rel = 'noopener noreferrer';
      }
      readMoreButton.textContent = 'Read more';
      readMoreButton.setAttribute('aria-label', `Read more: ${titleText}`);
      if (linkCell) {
        moveInstrumentation(linkCell, readMoreButton);
      }
      titleWrapper.appendChild(readMoreButton);
    }
    
    contentWrapper.appendChild(titleWrapper);
    imageWrapper.appendChild(contentWrapper);
    card.appendChild(imageWrapper);
    
    // Move instrumentation from row to card
    moveInstrumentation(row, card);
    cardsWrapper.appendChild(card);
  });
  
  container.appendChild(cardsWrapper);
  
  // Replace block content
  moveInstrumentation(block, container);
  block.innerHTML = '';
  block.appendChild(container);
}
