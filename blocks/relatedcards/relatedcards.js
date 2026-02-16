import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Related Cards Block
 * 
 * Structure contract (index-based):
 * - block.children[0] = Section title row (if title field is provided, optional)
 *   - Detection: If first row has image cell (picture/img), it's a card row, not title row
 * - block.children[1+] = Related card item rows (each row = one item)
 * 
 * For each card item row (actual AEM structure - 5 cells, NOT 6):
 * - row.children[0] = Image cell (contains picture/img)
 * - row.children[1] = Badge text cell (NOT alt text - alt text is in img tag)
 * - row.children[2] = Title cell
 * - row.children[3] = Link URL cell (contains anchor tag)
 * - row.children[4] = Link target cell (text: "_self" or "_blank")
 * 
 * CRITICAL - Alt Text Extraction:
 * - Alt text is NOT a separate cell - it's in the <img> tag's alt attribute
 * - Extract using: imgElement?.getAttribute?.('alt') || ''
 * - Do NOT try to extract from cells[1] - that's the badge field
 * 
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  
  if (rows.length === 0) {
    return;
  }
  
  // Detect if first row is title row or card row
  // If first row has image cell (picture/img), it's a card row, not title row
  const firstRow = rows[0];
  const firstRowHasImage = firstRow?.querySelector?.('picture, img') !== null;
  
  let titleRow = null;
  let cardRows = [];
  
  if (firstRowHasImage) {
    // First row is a card row (title field is empty/optional)
    cardRows = rows;
  } else {
    // First row is title row
    titleRow = firstRow;
    cardRows = rows.slice(1);
  }
  
  // Extract section title
  const titleElement = titleRow?.children?.[0];
  const title = titleElement?.textContent?.trim() || '';
  
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
  
  // Process each card row
  cardRows.forEach((row) => {
    const cells = [...row.children];
    
    // Extract data using index-based access
    const imageCell = cells[0];
    const badgeCell = cells[1];
    const titleCell = cells[2];
    const linkCell = cells[3];
    const targetCell = cells[4];
    
    // Extract image and alt text
    const imgElement = imageCell?.querySelector?.('img');
    const imageSrc = imgElement?.getAttribute?.('src')
      || imageCell?.querySelector?.('a')?.getAttribute?.('href')
      || imageCell?.querySelector?.('picture')?.querySelector?.('img')?.getAttribute?.('src');
    // CRITICAL: Alt text is in img tag's alt attribute, NOT a separate cell
    const imageAlt = imgElement?.getAttribute?.('alt') || '';
    
    // Extract badge text
    const badgeText = badgeCell?.textContent?.trim() || '';
    
    // Extract title
    const cardTitle = titleCell?.textContent?.trim() || '';
    
    // Extract link
    const linkUrl = linkCell?.querySelector?.('a')?.getAttribute?.('href')
      || linkCell?.textContent?.trim() || '';
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
    
    // Title link (clickable on desktop and mobile)
    if (cardTitle && titleCell && linkUrl) {
      const titleLink = document.createElement('a');
      titleLink.classList.add('related-card__title-link');
      titleLink.href = linkUrl;
      titleLink.target = linkTarget;
      if (linkTarget === '_blank') {
        titleLink.rel = 'noopener noreferrer';
      }
      titleLink.textContent = cardTitle;
      moveInstrumentation(titleCell, titleLink);
      contentWrapper.appendChild(titleLink);
    } else if (cardTitle && titleCell) {
      // Title without link (fallback)
      const titleElement = document.createElement('h3');
      titleElement.classList.add('related-card__title');
      titleElement.textContent = cardTitle;
      moveInstrumentation(titleCell, titleElement);
      contentWrapper.appendChild(titleElement);
    }
    
    // "Read more" button (visible on mobile only)
    if (linkUrl) {
      const readMoreButton = document.createElement('a');
      readMoreButton.classList.add('related-card__read-more');
      readMoreButton.href = linkUrl;
      readMoreButton.target = linkTarget;
      if (linkTarget === '_blank') {
        readMoreButton.rel = 'noopener noreferrer';
      }
      readMoreButton.textContent = 'Read more';
      if (linkCell) {
        moveInstrumentation(linkCell, readMoreButton);
      }
      contentWrapper.appendChild(readMoreButton);
    }
    
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
