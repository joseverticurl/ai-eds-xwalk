/*
 * Text with Image/GIF block - Structure contract from user-provided HTML:
 * Row 0: sectionTitle | Row 1: description | Row 2: image (picture) | Row 3: imageBadge
 * Row 4: backgroundVector (picture) | Row 5-7: tag1, tag2, tag3 | Row 8: ctaLink (a) | Row 9: ctaText
 * Display: If ctaLink+ctaText present, show CTA; else show tags.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getTextContent(row) {
  const cell = row?.querySelector('div');
  return cell ? cell.textContent.trim() : '';
}

function buildBackground(backgroundRow) {
  const bgContainer = document.createElement('div');
  bgContainer.className = 'text-with-image-gif-bg';
  if (backgroundRow) {
    const bgPicture = backgroundRow.querySelector('picture');
    if (bgPicture) {
      const bgImg = bgPicture.querySelector('img');
      if (bgImg) {
        const optimizedBg = createOptimizedPicture(bgImg.src, bgImg.alt, false, [{ width: '800' }]);
        moveInstrumentation(bgImg, optimizedBg.querySelector('img'));
        bgContainer.appendChild(optimizedBg);
      } else {
        bgContainer.appendChild(bgPicture.cloneNode(true));
      }
    }
  }
  return bgContainer;
}

function buildImageSection(imageRow, imageBadge) {
  const imageSection = document.createElement('div');
  imageSection.className = 'text-with-image-gif-image-section';
  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    const img = picture?.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 768px)', width: '1200' },
        { width: '750' },
      ]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'text-with-image-gif-image';
      imgWrapper.appendChild(optimizedPic);
      if (imageBadge) {
        const badge = document.createElement('span');
        badge.className = 'text-with-image-gif-badge';
        badge.textContent = imageBadge;
        imgWrapper.appendChild(badge);
      }
      imageSection.appendChild(imgWrapper);
    }
  }
  return imageSection;
}

function buildTextSection(sectionTitle, description, ctaLink, ctaText, tags) {
  const textSection = document.createElement('div');
  textSection.className = 'text-with-image-gif-text-section';
  if (sectionTitle) {
    const title = document.createElement('h2');
    title.className = 'text-with-image-gif-title';
    title.textContent = sectionTitle;
    textSection.appendChild(title);
  }
  if (description) {
    const desc = document.createElement('div');
    desc.className = 'text-with-image-gif-description';
    desc.innerHTML = description;
    textSection.appendChild(desc);
  }
  if (ctaLink && ctaText) {
    const cta = document.createElement('a');
    cta.href = ctaLink.href;
    cta.className = 'text-with-image-gif-cta button primary';
    cta.textContent = ctaText;
    if (ctaLink.title) cta.title = ctaLink.title;
    textSection.appendChild(cta);
  } else if (tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'text-with-image-gif-tags';
    tags.forEach((tag) => {
      const tagEl = document.createElement('span');
      tagEl.className = 'text-with-image-gif-tag';
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });
    textSection.appendChild(tagsContainer);
  }
  return textSection;
}

export default function decorate(block) {
  const rows = [...block.children];
  const sectionTitle = rows[0] ? getTextContent(rows[0]) : '';
  const description = rows[1] ? getTextContent(rows[1]) : '';
  const imageBadge = rows[3] ? getTextContent(rows[3]) : '';
  const tags = [rows[5], rows[6], rows[7]].map((r) => (r ? getTextContent(r) : '')).filter(Boolean);
  const ctaLink = rows[8]?.querySelector('a');
  const ctaText = rows[9] ? getTextContent(rows[9]) : '';

  const wrapper = document.createElement('div');
  wrapper.className = 'text-with-image-gif-inner';
  wrapper.appendChild(buildBackground(rows[4]));

  const content = document.createElement('div');
  content.className = 'text-with-image-gif-content';
  content.appendChild(buildImageSection(rows[2], imageBadge));
  content.appendChild(buildTextSection(sectionTitle, description, ctaLink, ctaText, tags));
  wrapper.appendChild(content);
  block.replaceChildren(wrapper);
}
