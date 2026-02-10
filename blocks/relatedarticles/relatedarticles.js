import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Related Articles Block
 * 
 * Structure contract (index-based):
 * - block.children[0] = Title row (title cell 0)
 * - block.children[1+] = Related article item rows (each row = one item)
 * 
 * For each article item row:
 * - row.children[0] = Image cell
 * - row.children[1] = Alt text cell
 * - row.children[2] = Badge text cell
 * - row.children[3] = Title cell
 * - row.children[4] = Link URL cell
 * - row.children[5] = Link target cell (optional)
 * 
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  
  // Extract section title: first row, first cell
  const titleRow = rows[0];
  const titleElement = titleRow?.children?.[0];
  const title = titleElement?.textContent?.trim() || '';
  
  // Extract article items: remaining rows (index 1+)
  const articleRows = rows.slice(1);
  
  // Build container structure
  const container = document.createElement('div');
  container.classList.add('related-articles__container');
  
  // Add section title
  if (title && titleElement) {
    const heading = document.createElement('h2');
    heading.classList.add('related-articles__title');
    heading.textContent = title;
    moveInstrumentation(titleElement, heading);
    container.appendChild(heading);
  }
  
  // Create articles wrapper
  const articlesWrapper = document.createElement('div');
  articlesWrapper.classList.add('related-articles__items');
  
  // Process each article row
  articleRows.forEach((row) => {
    const cells = [...row.children];
    
    // Extract data using index-based access
    const imageCell = cells[0];
    const altCell = cells[1];
    const badgeCell = cells[2];
    const titleCell = cells[3];
    const linkCell = cells[4];
    const targetCell = cells[5];
    
    // Extract image
    const imageSrc = imageCell?.querySelector?.('img')?.getAttribute?.('src')
      || imageCell?.querySelector?.('a')?.getAttribute?.('href')
      || imageCell?.querySelector?.('picture')?.querySelector?.('img')?.getAttribute?.('src');
    const imageAlt = altCell?.textContent?.trim() || '';
    
    // Extract badge text
    const badgeText = badgeCell?.textContent?.trim() || '';
    
    // Extract title
    const articleTitle = titleCell?.textContent?.trim() || '';
    
    // Extract link
    const linkUrl = linkCell?.querySelector?.('a')?.getAttribute?.('href')
      || linkCell?.textContent?.trim() || '';
    const linkTarget = targetCell?.textContent?.trim() || '_self';
    
    // Build card structure
    const card = document.createElement('a');
    card.classList.add('related-article__card');
    card.href = linkUrl || '#';
    card.target = linkTarget;
    if (linkTarget === '_blank') {
      card.rel = 'noopener noreferrer';
    }
    
    // Image wrapper with gradient overlay
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('related-article__image-wrapper');
    
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
    gradientOverlay.classList.add('related-article__gradient');
    imageWrapper.appendChild(gradientOverlay);
    
    // Content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('related-article__content');
    
    // Badge
    if (badgeText && badgeCell) {
      const badge = document.createElement('div');
      badge.classList.add('related-article__badge');
      badge.textContent = badgeText;
      moveInstrumentation(badgeCell, badge);
      contentWrapper.appendChild(badge);
    }
    
    // Title
    if (articleTitle && titleCell) {
      const titleElement = document.createElement('h3');
      titleElement.classList.add('related-article__title');
      titleElement.textContent = articleTitle;
      moveInstrumentation(titleCell, titleElement);
      contentWrapper.appendChild(titleElement);
    }
    
    imageWrapper.appendChild(contentWrapper);
    card.appendChild(imageWrapper);
    
    // Move instrumentation from row to card
    moveInstrumentation(row, card);
    articlesWrapper.appendChild(card);
  });
  
  container.appendChild(articlesWrapper);
  
  // Replace block content
  moveInstrumentation(block, container);
  block.innerHTML = '';
  block.appendChild(container);
}
