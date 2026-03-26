import {
  describe, it, expect, vi, beforeAll,
} from 'vitest';
import { createBlockFromRows, createPictureElement } from '../../test/helpers.js';

vi.mock('../../scripts/aem.js', () => ({
  createOptimizedPicture: (src, alt = '') => {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    picture.appendChild(img);
    return picture;
  },
}));

vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: () => {},
}));
let decorate;

function createRows(cardCount) {
  const rows = [
    ['You may also like'],
    ['aura-creative'],
  ];

  for (let i = 1; i <= cardCount; i += 1) {
    rows.push([
      createPictureElement(`/img-${i}.jpg`, `Image ${i}`),
      `Category ${i}`,
      `Title ${i}`,
      `<a href="/article-${i}">Link</a>`,
      'Readmore',
    ]);
  }

  return rows;
}

describe('youmayalsolike block', () => {
  beforeAll(async () => {
    decorate = (await import('./youmayalsolike.js')).default;
  });

  it('does not render when fewer than 2 cards', () => {
    const block = createBlockFromRows('youmayalsolike', createRows(1));
    decorate(block);
    expect(block.children.length).toBe(0);
  });

  it('renders 2 cards layout class', () => {
    const block = createBlockFromRows('youmayalsolike', createRows(2));
    decorate(block);
    expect(block.querySelector('.youmayalsolike-wrapper.is-two-cards')).toBeTruthy();
    expect(block.querySelectorAll('.youmayalsolike-card-link')).toHaveLength(2);
  });

  it('caps cards at 3 and applies three-card class', () => {
    const block = createBlockFromRows('youmayalsolike', createRows(4));
    decorate(block);
    expect(block.querySelector('.youmayalsolike-wrapper.is-three-cards')).toBeTruthy();
    expect(block.querySelectorAll('.youmayalsolike-card-link')).toHaveLength(3);
  });
});
