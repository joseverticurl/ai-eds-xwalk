import ImageComponent from '../../shared-components/ImageComponent.js';
import Heading from '../../shared-components/Heading.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import SvgIcon from '../../shared-components/SvgIcon.js';
import stringToHTML from '../../shared-components/Utility.js';

const currentIndex = [];
const isAnimating = [];
const CAROUSEL_SIZE = 4;
let countCarousel = 0;

const nextDisableCta = SvgIcon({
  name: 'disableRightArrow',
  className: 'carousel-next-cta',
  size: '16px',
});
const prevCta = SvgIcon({
  name: 'LeftArrow',
  className: 'carousel-next-cta',
  size: '16px',
});
const nextCta = SvgIcon({
  name: 'RightArrow',
  className: 'carousel-next-cta',
  size: '16px',
});

function moveSlide(direction, block, currentCarousel) {
  if (isAnimating[currentCarousel]) return; // prevent if already animating
  isAnimating[currentCarousel] = true;

  const carouselContainer = block.querySelector('.carousel-container');
  const totalGroups = block.querySelectorAll('.card-pair').length;

  currentIndex[currentCarousel] += direction;
  carouselContainer.style.transition = 'transform 0.5s ease-in-out';
  const offset = -currentIndex[currentCarousel] * 100;
  carouselContainer.style.transform = `translateX(${offset}%)`;

  const maxRealIndex = totalGroups - 2;

  const handleTransition = () => {
    carouselContainer.removeEventListener('transitionend', handleTransition);

    if (currentIndex[currentCarousel] === 0) {
      carouselContainer.style.transition = 'none';
      currentIndex[currentCarousel] = maxRealIndex;
      carouselContainer.style.transform = `translateX(-${currentIndex[currentCarousel] * 100}%)`;
    } else if (currentIndex[currentCarousel] === totalGroups - 1) {
      carouselContainer.style.transition = 'none';
      currentIndex[currentCarousel] = 1;
      carouselContainer.style.transform = `translateX(-${currentIndex[currentCarousel] * 100}%)`;
    }

    // Re-enable animation
    setTimeout(() => {
      isAnimating[currentCarousel] = false;
    }, 20); // small timeout to ensure transform completes
  };

  carouselContainer.addEventListener('transitionend', handleTransition);
}


export default function decorate(block) {
  let projectCardsContainer = block.querySelector('.projectcards-container');
  if (!projectCardsContainer) {
    projectCardsContainer = document.createElement('div');
    projectCardsContainer.className = 'projectcards-container container';
    moveInstrumentation(block, projectCardsContainer);
  }


  // Create header section
  const headerContainer = document.createElement('div');
  headerContainer.className = 'projectcards-header';

  // Handle title
  const titleElements = block.querySelectorAll(
    '[data-aue-prop="title"], [data-gen-prop="title"]',
  );
  const titleField = titleElements[0];
  if (titleField) {
    const titleDiv = document.createElement('div');
    moveInstrumentation(titleField, titleDiv);
    titleDiv.className = 'projectcards-title';
    titleDiv.textContent = titleField.textContent;
    headerContainer.appendChild(titleDiv);
    titleField.remove();
  }

  // Handle main heading
  const headingElement = block.querySelector('[data-aue-prop="heading"]') || titleElements[1];
  if (headingElement) {
    const headingHtml = Heading({
      text: headingElement.textContent,
      level: 2,
      className: 'projectcards-heading',
      attributes: {
        'data-aue-prop': 'heading',
        'data-aue-label': 'Heading',
        'data-aue-type': 'text',
      },
    });
    // Convert HTML string to DOM node
    const tempDiv = document.createElement('div');
    tempDiv.insertAdjacentHTML('beforeend', headingHtml);
    const headingNode = tempDiv.firstElementChild;

    headerContainer.appendChild(headingNode);
    headingElement.remove();
  }

  // Handle description
  const descElement = block.querySelector(
    '[data-aue-prop="description"], [data-gen-prop="description"]',
  );
  if (descElement) {
    const descriptionDiv = document.createElement('div');
    moveInstrumentation(descElement, descriptionDiv);
    descriptionDiv.className = 'projectcards-description';
    descriptionDiv.textContent = descElement.textContent;
    headerContainer.appendChild(descriptionDiv);
    descElement.remove();
  }

  projectCardsContainer.appendChild(headerContainer);

  // Create cards grid container
  const cardsGridContainer = document.createElement('div');
  cardsGridContainer.className = 'projectcards-grid row carousel-container';

  const projectCards = Array.from(block.querySelectorAll('[data-aue-model="projectcard"],[data-gen-model="featureItem"]'))

  let lastElement = null;
  if (window.location.hostname.includes('author')) {
    lastElement = block.querySelector('[data-aue-model="linkField"]');
  } else {
    lastElement = projectCards.length > 0 &&
      projectCards[projectCards.length - 1].firstElementChild.querySelector('.button-container')
      ? projectCards.pop()
      : null;
  }

  // Step 1: Create actual card elements and store them in an array
  const cardElements = Array.from(projectCards).map((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'project-card col-xl-3 col-md-3 col-sm-2';
    moveInstrumentation(card, cardElement);

    // Handle image
    const imageLink = card.querySelector('a[href]');
    if (imageLink) {
      const imageContainer = document.createElement('div');
      imageContainer.setAttribute('data-aue-prop', 'image');
      imageContainer.setAttribute('data-aue-label', 'Image');
      imageContainer.setAttribute('data-aue-type', 'image');

      const imageUrl = imageLink.getAttribute('href');
      const imageAlt = card.querySelectorAll('a[href]')[1]?.getAttribute('title') ||
        card.querySelector('[data-aue-prop="title"]')?.textContent || 'Project Image';

      const imageHtml = ImageComponent({
        src: imageUrl,
        alt: imageAlt,
        className: 'project-card-image',
        asImageName: 'projectcards.webp',
        breakpoints: {
          mobile: {
            width: 768,
            src: `${imageUrl}`,
            imgWidth: 350,
            imgHeight: 350,
          },
          tablet: {
            width: 993,
            src: `${imageUrl}`,
            imgWidth: 750,
            imgHeight: 750,
          },
          desktop: {
            width: 1920,
            src: `${imageUrl}`,
            imgWidth: 750,
            imgHeight: 750,
          },
        },
        lazy: true,
      });

      imageContainer.insertAdjacentHTML('beforeend', imageHtml);
      cardElement.appendChild(imageContainer);
      imageLink.remove();
    }

    // Handle content
    const cardContent = document.createElement('div');
    cardContent.className = 'project-card-content';

    const cardTitle = card.querySelector('[data-aue-prop="projectText"], .button-container .button');
    if (cardTitle) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'project-card-title';
      cardTitle.className = '';
      if(cardTitle?.getAttribute('href') === '#') {
        titleDiv.textContent = cardTitle?.textContent || '';
      } else {
        const linkTarget = card.querySelector('[data-aue-prop="projectTarget"], [data-gen-prop="feature-title"]')?.textContent || '_self';
        cardTitle.setAttribute('target', linkTarget);
        cardTitle.setAttribute('data', index);
        titleDiv.appendChild(cardTitle);
      }
      

      cardContent.appendChild(titleDiv);
    }

    const locationElement = card.querySelector('[data-aue-prop="location"], div:last-child');
    if (locationElement) {
      const locationDiv = document.createElement('div');
      locationDiv.setAttribute('data-aue-prop', 'location');
      locationDiv.setAttribute('data-aue-label', 'Location');
      locationDiv.setAttribute('data-aue-type', 'text');
      locationDiv.className = 'project-card-location';
      locationDiv.innerHTML = locationElement.innerHTML;
      cardContent.appendChild(locationDiv);
      locationElement.remove();
    }

    cardElement.appendChild(cardContent);
    return cardElement;
  });
  const totalCards = cardElements.length;
  const cardGroups = [];
  const isAuthorInstance = document.referrer.includes('canvas');
  if (!isAuthorInstance && (totalCards > CAROUSEL_SIZE)) {
    const seenCombos = new Set();
    let w = 0;
    while (true) {
      const startIndex = (w * CAROUSEL_SIZE) % totalCards;
      const indexes = [];
      for (let j = 0; j < CAROUSEL_SIZE; j += 1) {
        indexes.push((startIndex + j) % totalCards);
      }
      const key = indexes.join(',');
      if (seenCombos.has(key)) break;
      seenCombos.add(key);

      const cardPair = document.createElement('div');
      cardPair.className = 'card-pair';
      indexes.forEach(i => cardPair.appendChild(cardElements[i].cloneNode(true)));
      cardGroups.push(cardPair);
      w += 1;
    }
  } else {
    const cardPair = document.createElement('div');
    cardPair.className = 'card-pair';
    cardElements.forEach(card => cardPair.appendChild(card.cloneNode(true)));
    cardGroups.push(cardPair);
  }

  // Clone first & last groups
  if (cardGroups.length > 1) {
    const firstClone = cardGroups[0].cloneNode(true);
    const lastClone = cardGroups[cardGroups.length - 1].cloneNode(true);
    cardsGridContainer.appendChild(lastClone); // Prepend at the end
    cardGroups.forEach(group => cardsGridContainer.appendChild(group));
    cardsGridContainer.appendChild(firstClone); // Append at the end
  } else {
    cardGroups.forEach(group => cardsGridContainer.appendChild(group));
  }

  projectCardsContainer.appendChild(cardsGridContainer);

  const carouselContaier = document.createElement('div');
  carouselContaier.setAttribute('class', 'carousel');
  carouselContaier.appendChild(cardsGridContainer);

  const prevButton = document.createElement('button');
  prevButton.setAttribute('class', 'carousel-prev');
  prevButton.append(stringToHTML(prevCta));

  const nextButton = document.createElement('button');
  nextButton.setAttribute('class', 'carousel-next');
  nextButton.append(stringToHTML(totalCards <= CAROUSEL_SIZE ? nextDisableCta : nextCta));

  const buttonGroup = document.createElement('div');
  buttonGroup.setAttribute('class', 'button-group');
  buttonGroup.append(prevButton, nextButton);
  carouselContaier.appendChild(buttonGroup);
  projectCardsContainer.appendChild(carouselContaier);

  if (lastElement) {
    const linkContainer = document.createElement('div');
    moveInstrumentation(lastElement, linkContainer);
    linkContainer.className = 'projectcards-view-all';
    const linkElement = lastElement.querySelector('a');
    if (linkElement) {
      const linkDiv = document.createElement('div');
      linkElement.className = 'view-all-link';
      linkDiv.appendChild(linkElement);
      linkContainer.appendChild(linkDiv);
    }
    projectCardsContainer.appendChild(linkContainer);
    lastElement.remove();
  }

  block.textContent = '';
  block.appendChild(projectCardsContainer);

  const cards = block.querySelectorAll('.project-card');
  cards.forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Project ${index + 1}`);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') card.click();
    });
  });

  countCarousel += 1;
  for (let i = 0; i < countCarousel; i += 1) {
    currentIndex[i] = 1;
  }

  cardsGridContainer.style.transition = 'none';
  const cardpairs=block.querySelectorAll('.card-pair').length
  cardsGridContainer.style.transform = cardpairs > 1 ? `translateX(-100%)` : `translateX(0%)`; // Start at the first real group

  document.querySelectorAll('.carousel-prev').forEach((element, index) => {
    if (!element.hasAttribute('data-listener-added')) {
      element.addEventListener('click', () => moveSlide(-1, block, index));
      element.setAttribute('data-listener-added', 'true');
    }
  });

  document.querySelectorAll('.carousel-next').forEach((element, index) => {
    if (!element.hasAttribute('data-listener-added')) {
      element.addEventListener('click', () => moveSlide(1, block, index));
      element.setAttribute('data-listener-added', 'true');
    }
  });

  if (totalCards <= CAROUSEL_SIZE) {
    block.querySelector('.button-group').style.display = 'none';
  }
}