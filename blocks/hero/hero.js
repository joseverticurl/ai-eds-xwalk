/**
 * Hero Block
 *
 * Structure contract (index-based):
 * block.children[0] = image row (picture)
 * block.children[1] = imageAlt row
 * block.children[2] = text row (richtext)
 *
 * @param {Element} block The block element
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(el) {
  return el?.textContent?.trim() ?? el?.querySelector?.('p')?.innerHTML ?? '';
}

export default function decorate(block) {
  const rows = [...block.children];
  const imageCell = rows[0]?.children?.[0];
  const imageAlt = getText(rows[1]?.children?.[0]);
  const textHTML = rows[2]?.innerHTML ?? '';

  const img = imageCell?.querySelector?.('img');
  const picture = imageCell?.querySelector?.('picture');
  const imgSrc = img?.getAttribute?.('src') || img?.src || '';

  const wrapper = document.createElement('div');
  wrapper.className = 'hero';

  if (imgSrc) {
    const optimizedPic = createOptimizedPicture(
      imgSrc,
      imageAlt,
      false,
      [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }],
    );
    if (picture || img) moveInstrumentation(picture || img, optimizedPic);
    wrapper.appendChild(optimizedPic);
  }

  if (textHTML) {
    const textEl = document.createElement('div');
    textEl.innerHTML = textHTML;
    const h1 = textEl.querySelector('h1') || document.createElement('h1');
    if (!textEl.querySelector('h1')) {
      h1.innerHTML = textHTML;
      textEl.replaceChildren(h1);
    }
    wrapper.appendChild(textEl);
  }

  block.replaceChildren(wrapper);
}
