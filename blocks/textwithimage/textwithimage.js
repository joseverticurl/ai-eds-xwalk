import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getTextContent(cell) {
  return cell?.textContent?.trim() || cell?.querySelector?.('p')?.textContent?.trim() || '';
}

function buildCopySection({
  tag, title, descriptionHTML, tagCell, titleCell, descriptionCell,
}) {
  const copySection = document.createElement('div');
  copySection.classList.add('textwithimage-copy');

  if (tag) {
    const tagEl = document.createElement('p');
    tagEl.classList.add('textwithimage-tag');
    tagEl.textContent = tag;
    if (tagCell) moveInstrumentation(tagCell, tagEl);
    copySection.appendChild(tagEl);
  }

  if (title) {
    const titleEl = document.createElement('h2');
    titleEl.classList.add('textwithimage-title');
    titleEl.textContent = title;
    if (titleCell) moveInstrumentation(titleCell, titleEl);
    copySection.appendChild(titleEl);
  }

  if (descriptionHTML) {
    const descEl = document.createElement('div');
    descEl.classList.add('textwithimage-description');
    descEl.innerHTML = descriptionHTML;
    if (descriptionCell) moveInstrumentation(descriptionCell, descEl);
    copySection.appendChild(descEl);
  }

  return copySection;
}

function buildVideoMedia(mediaUrl, mediaAlt, mediaCell) {
  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('textwithimage-video-wrapper');

  const video = document.createElement('video');
  video.src = mediaUrl;
  video.controls = false;
  video.playsInline = true;
  video.setAttribute('aria-label', mediaAlt || 'Video');
  if (mediaCell) moveInstrumentation(mediaCell, video);

  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.classList.add('textwithimage-play-button');
  playButton.setAttribute('aria-label', 'Play video');
  playButton.innerHTML = `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="36" cy="36" r="36" fill="rgba(0,0,0,0.5)"/>
    <path d="M28 22v28l22-14L28 22z" fill="white"/>
  </svg>`;

  playButton.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      playButton.classList.add('is-playing');
    } else {
      video.pause();
      playButton.classList.remove('is-playing');
    }
  });

  video.addEventListener('play', () => playButton.classList.add('is-playing'));
  video.addEventListener('pause', () => playButton.classList.remove('is-playing'));
  video.addEventListener('ended', () => playButton.classList.remove('is-playing'));

  videoWrapper.appendChild(video);
  videoWrapper.appendChild(playButton);
  return videoWrapper;
}

/**
 * Structure contract (index-based):
 * block.children[0] = tag row
 * block.children[1] = title row
 * block.children[2] = description row
 * block.children[3] = media row (cells: media URL, optional mediaAlt)
 * block.children[4] = mediaType row ("image" | "video")
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const tagCell = rows[0]?.children?.[0];
  const titleCell = rows[1]?.children?.[0];
  const descriptionCell = rows[2]?.children?.[0];
  const mediaCell = rows[3]?.children?.[0];
  const altCell = rows[3]?.children?.[1];
  const mediaTypeCell = rows[4]?.children?.[0];

  const tag = getTextContent(tagCell);
  const title = getTextContent(titleCell);
  const descriptionHTML = descriptionCell?.innerHTML ?? '';
  const mediaAlt = getTextContent(altCell);
  const mediaType = mediaTypeCell?.textContent?.trim()?.toLowerCase() || 'image';

  const linkElement = mediaCell?.querySelector?.('a') || mediaCell?.querySelector?.('p a');
  const imgElement = mediaCell?.querySelector?.('img');
  const mediaUrl = linkElement?.getAttribute?.('href') || linkElement?.href
    || imgElement?.getAttribute?.('src') || imgElement?.src || '';

  const container = document.createElement('div');
  container.classList.add('textwithimage-container');

  container.appendChild(buildCopySection({
    tag, title, descriptionHTML, tagCell, titleCell, descriptionCell,
  }));

  const mediaSection = document.createElement('div');
  mediaSection.classList.add('textwithimage-media');

  if (mediaUrl) {
    if (mediaType === 'video') {
      mediaSection.appendChild(buildVideoMedia(mediaUrl, mediaAlt, mediaCell));
    } else {
      const optimizedPic = createOptimizedPicture(
        mediaUrl,
        mediaAlt,
        false,
        [{ media: '(min-width: 600px)', width: '1200' }, { width: '750' }],
      );
      if (mediaCell) moveInstrumentation(mediaCell, optimizedPic);
      mediaSection.appendChild(optimizedPic);
    }
  }

  container.appendChild(mediaSection);
  block.replaceChildren(container);
}
