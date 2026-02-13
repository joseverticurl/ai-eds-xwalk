import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * TCCC Highlight Block
 * 
 * Structure contract (index-based):
 * - block.children[0] = Image row (image cell 0, alt cell 1)
 * - block.children[1] = Title row (title cell 0)
 * - block.children[2] = Description row (description cell 0)
 * - block.children[3] = CTA row (link cell 0, text cell 1, target cell 2)
 * 
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Extract data using index-based access
  const rows = [...block.children];
  
  // Image row: first row, first cell = image, second cell = alt text
  const imageRow = rows[0];
  const imageCell = imageRow?.children?.[0];
  const altCell = imageRow?.children?.[1];
  
  // Extract image source - handle wrapped elements and use .href fallback
  const pictureOrImg = imageCell?.querySelector?.('picture, img');
  const imageSrc = pictureOrImg?.tagName === 'IMG' 
    ? pictureOrImg?.getAttribute?.('src') || pictureOrImg?.src
    : pictureOrImg?.querySelector?.('img')?.getAttribute?.('src') || pictureOrImg?.querySelector?.('img')?.src
    || imageCell?.querySelector?.('a')?.getAttribute?.('href') || imageCell?.querySelector?.('a')?.href || '';
  const altText = altCell?.textContent?.trim() || '';
  
  // Title row: second row, first cell = title
  const titleRow = rows[1];
  const titleElement = titleRow?.children?.[0];
  const title = titleElement?.textContent?.trim() || '';
  
  // Description row: third row, first cell = description
  const descriptionRow = rows[2];
  const descriptionElement = descriptionRow?.children?.[0];
  const description = descriptionElement?.innerHTML?.trim() || '';
  
  // CTA row: fourth row, first cell = link, second cell = text, third cell = target
  const ctaRow = rows[3];
  const ctaLinkCell = ctaRow?.children?.[0];
  const ctaTextCell = ctaRow?.children?.[1];
  const ctaTargetCell = ctaRow?.children?.[2];
  
  // Extract CTA link - handle wrapped elements and use .href fallback
  const ctaLinkElement = ctaLinkCell?.querySelector?.('a') || ctaLinkCell?.querySelector?.('p a');
  const ctaLink = ctaLinkElement?.getAttribute?.('href') || ctaLinkElement?.href || '';
  
  // Extract CTA text with multiple fallbacks
  let ctaText = ctaTextCell?.textContent?.trim() || 
                ctaTextCell?.querySelector?.('p')?.textContent?.trim() || '';
  if (!ctaText && ctaLinkElement) {
    const linkText = ctaLinkElement.textContent?.trim() || '';
    // Only use link text if it's not a URL (avoid using "/path/to/page" as button text)
    ctaText = (linkText.startsWith('/') || linkText.includes('http')) ? '' : linkText;
  }
  
  const ctaTarget = ctaTargetCell?.textContent?.trim() || '_self';
  
  // Build the new structure
  const container = document.createElement('div');
  container.classList.add('tccchighlight__container');
  
  // Image section
  if (imageSrc) {
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('tccchighlight__image-wrapper');
    
    // Use existing picture if available, otherwise create optimized picture
    const existingPicture = imageCell?.querySelector?.('picture');
    if (existingPicture) {
      const img = existingPicture.querySelector('img');
      if (img) {
        const optimizedPic = createOptimizedPicture(
          img.src || img.getAttribute('src'),
          altText,
          false,
          [{ width: '750' }, { width: '1440' }]
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
        altText,
        false,
        [{ width: '750' }, { width: '1440' }]
      );
      imageWrapper.appendChild(optimizedPic);
    }
    
    container.appendChild(imageWrapper);
  }
  
  // Content section
  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('tccchighlight__content');
  
  // Title
  if (title && titleElement) {
    const heading = document.createElement('h2');
    heading.classList.add('tccchighlight__title');
    heading.textContent = title;
    moveInstrumentation(titleElement, heading);
    contentWrapper.appendChild(heading);
  }
  
  // Description
  if (description && descriptionElement) {
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('tccchighlight__description');
    descriptionDiv.innerHTML = description;
    moveInstrumentation(descriptionElement, descriptionDiv);
    contentWrapper.appendChild(descriptionDiv);
  }
  
  // CTA Button - render if we have a link (text is optional, will use fallbacks)
  if (ctaLink) {
    const ctaButton = document.createElement('a');
    ctaButton.classList.add('tccchighlight__cta');
    ctaButton.href = ctaLink;
    // Use provided text, or fallback to link text, or default to "Learn more"
    ctaButton.textContent = ctaText || 'Learn more';
    ctaButton.target = ctaTarget || '_self';
    if (ctaTarget === '_blank') {
      ctaButton.rel = 'noopener noreferrer';
    }
    if (ctaLinkCell) {
      moveInstrumentation(ctaLinkCell, ctaButton);
    }
    contentWrapper.appendChild(ctaButton);
  }
  
  container.appendChild(contentWrapper);
  
  // Replace block content
  moveInstrumentation(block, container);
  block.innerHTML = '';
  block.appendChild(container);
}
