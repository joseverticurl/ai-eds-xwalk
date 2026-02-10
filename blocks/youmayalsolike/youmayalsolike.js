import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * You May Also Like Block
 * 
 * Structure contract (index-based):
 * - block.children[0] = Title row (title cell 0)
 * - block.children[1+] = Recommendation item rows (each row = one item)
 * 
 * For each item row:
 * - row.children[0] = Image cell
 * - row.children[1] = Alt text cell
 * - row.children[2] = Supporting text cell (optional)
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
  
  // Extract recommendation items: remaining rows (index 1+)
  const itemRows = rows.slice(1);
  
  if (itemRows.length === 0) {
    // No items, just show title if available
    if (title && titleElement) {
      const heading = document.createElement('h2');
      heading.classList.add('youmayalsolike__title');
      heading.textContent = title;
      moveInstrumentation(titleElement, heading);
      moveInstrumentation(block, heading);
      block.innerHTML = '';
      block.appendChild(heading);
    }
    return;
  }
  
  // Build container structure
  const container = document.createElement('div');
  container.classList.add('youmayalsolike__container');
  
  // Add section title
  if (title && titleElement) {
    const heading = document.createElement('h2');
    heading.classList.add('youmayalsolike__title');
    heading.textContent = title;
    moveInstrumentation(titleElement, heading);
    container.appendChild(heading);
  }
  
  // Create carousel wrapper
  const carouselWrapper = document.createElement('div');
  carouselWrapper.classList.add('youmayalsolike__carousel-wrapper');
  
  // Create carousel container
  const carousel = document.createElement('div');
  carousel.classList.add('youmayalsolike__carousel');
  
  // Process each item row
  itemRows.forEach((row) => {
    const cells = [...row.children];
    
    // Extract data using index-based access
    const imageCell = cells[0];
    const altCell = cells[1];
    const supportingTextCell = cells[2];
    const titleCell = cells[3];
    const linkCell = cells[4];
    const targetCell = cells[5];
    
    // Extract image
    const imageSrc = imageCell?.querySelector?.('img')?.getAttribute?.('src')
      || imageCell?.querySelector?.('a')?.getAttribute?.('href')
      || imageCell?.querySelector?.('picture')?.querySelector?.('img')?.getAttribute?.('src');
    const imageAlt = altCell?.textContent?.trim() || '';
    
    // Extract supporting text
    const supportingText = supportingTextCell?.textContent?.trim() || '';
    
    // Extract title
    const itemTitle = titleCell?.textContent?.trim() || '';
    
    // Extract link
    const linkUrl = linkCell?.querySelector?.('a')?.getAttribute?.('href')
      || linkCell?.textContent?.trim() || '';
    const linkTarget = targetCell?.textContent?.trim() || '_self';
    
    // Build card structure
    const card = document.createElement('a');
    card.classList.add('youmayalsolike__card');
    card.href = linkUrl || '#';
    card.target = linkTarget;
    if (linkTarget === '_blank') {
      card.rel = 'noopener noreferrer';
    }
    
    // Image wrapper with gradient overlay
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('youmayalsolike__image-wrapper');
    
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
    gradientOverlay.classList.add('youmayalsolike__gradient');
    imageWrapper.appendChild(gradientOverlay);
    
    // Content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('youmayalsolike__content');
    
    // Supporting text
    if (supportingText && supportingTextCell) {
      const supportingTextEl = document.createElement('p');
      supportingTextEl.classList.add('youmayalsolike__supporting-text');
      supportingTextEl.textContent = supportingText;
      moveInstrumentation(supportingTextCell, supportingTextEl);
      contentWrapper.appendChild(supportingTextEl);
    }
    
    // Title row (title + arrow button)
    const titleRowEl = document.createElement('div');
    titleRowEl.classList.add('youmayalsolike__title-row');
    
    // Title
    if (itemTitle && titleCell) {
      const titleEl = document.createElement('h3');
      titleEl.classList.add('youmayalsolike__item-title');
      titleEl.textContent = itemTitle;
      moveInstrumentation(titleCell, titleEl);
      titleRowEl.appendChild(titleEl);
    }
    
    // Arrow button (visual indicator)
    const arrowButton = document.createElement('button');
    arrowButton.classList.add('youmayalsolike__arrow-button');
    arrowButton.type = 'button';
    arrowButton.setAttribute('aria-label', 'Navigate');
    arrowButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    titleRowEl.appendChild(arrowButton);
    
    contentWrapper.appendChild(titleRowEl);
    imageWrapper.appendChild(contentWrapper);
    card.appendChild(imageWrapper);
    
    // Move instrumentation from row to card
    moveInstrumentation(row, card);
    carousel.appendChild(card);
  });
  
  // Carousel navigation state
  let currentIndex = 0;
  const isDesktop = window.matchMedia('(min-width: 900px)');
  let cardsPerView = isDesktop.matches ? 2 : 1;
  const totalCards = itemRows.length;
  const totalSets = Math.ceil(totalCards / cardsPerView);
  
  // Create navigation arrows
  const navContainer = document.createElement('div');
  navContainer.classList.add('youmayalsolike__navigation');
  
  const leftArrow = document.createElement('button');
  leftArrow.classList.add('youmayalsolike__arrow', 'youmayalsolike__arrow--left');
  leftArrow.type = 'button';
  leftArrow.setAttribute('aria-label', 'Previous');
  leftArrow.setAttribute('aria-disabled', 'true');
  leftArrow.disabled = true;
  leftArrow.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  const rightArrow = document.createElement('button');
  rightArrow.classList.add('youmayalsolike__arrow', 'youmayalsolike__arrow--right');
  rightArrow.type = 'button';
  rightArrow.setAttribute('aria-label', 'Next');
  rightArrow.setAttribute('aria-disabled', totalSets <= 1 ? 'true' : 'false');
  rightArrow.disabled = totalSets <= 1;
  rightArrow.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  navContainer.appendChild(leftArrow);
  navContainer.appendChild(rightArrow);
  
  // Update carousel position
  function updateCarousel() {
    const translateX = -(currentIndex * (100 / cardsPerView));
    carousel.style.transform = `translateX(${translateX}%)`;
    updateArrowStates();
  }
  
  // Update arrow states
  function updateArrowStates() {
    leftArrow.disabled = currentIndex === 0;
    leftArrow.setAttribute('aria-disabled', currentIndex === 0 ? 'true' : 'false');
    rightArrow.disabled = currentIndex >= totalSets - 1;
    rightArrow.setAttribute('aria-disabled', currentIndex >= totalSets - 1 ? 'true' : 'false');
  }
  
  // Navigation functions
  function goToNext() {
    if (currentIndex < totalSets - 1) {
      currentIndex++;
      updateCarousel();
    }
  }
  
  function goToPrevious() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }
  
  // Handle window resize
  function handleResize() {
    const wasDesktop = cardsPerView === 2;
    cardsPerView = isDesktop.matches ? 2 : 1;
    const newTotalSets = Math.ceil(totalCards / cardsPerView);
    
    // Recalculate current index if needed
    if (currentIndex >= newTotalSets) {
      currentIndex = Math.max(0, newTotalSets - 1);
    }
    
    updateCarousel();
  }
  
  // Swipe gesture support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50;
  
  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }
  
  function handleTouchMove(e) {
    // Prevent page scroll during horizontal swipe
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.screenX - touchStartX);
    const deltaY = Math.abs(touch.screenY - (e.touches[0]?.screenY || touch.screenY));
    
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }
  
  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe left - next
        goToNext();
      } else {
        // Swipe right - previous
        goToPrevious();
      }
    }
  }
  
  // Add event listeners
  leftArrow.addEventListener('click', goToPrevious);
  rightArrow.addEventListener('click', goToNext);
  
  // Touch events for swipe
  carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
  carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
  carousel.addEventListener('touchend', handleTouchEnd);
  
  // Resize handler
  isDesktop.addEventListener('change', handleResize);
  
  // Initial update
  updateCarousel();
  
  // Assemble carousel
  carouselWrapper.appendChild(carousel);
  carouselWrapper.appendChild(navContainer);
  container.appendChild(carouselWrapper);
  
  // Replace block content
  moveInstrumentation(block, container);
  block.innerHTML = '';
  block.appendChild(container);
}
