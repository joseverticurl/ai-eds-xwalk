/**
 * Cards block unit tests.
 *
 * Cards structure: each row is a card with cells for image, title, etc.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

import decorate from './cards.js';

describe('Cards block', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('decorates block into ul/li structure', () => {
    const block = createBlockFromRows('cards', [
      [createPictureElement('/card1.jpg', 'Card 1'), '<h3>Card 1</h3>', '<p>Description 1</p>'],
      [createPictureElement('/card2.jpg', 'Card 2'), '<h3>Card 2</h3>', '<p>Description 2</p>'],
    ]);

    decorate(block);

    const ul = block.querySelector('ul');
    expect(ul).toBeTruthy();
    const lis = ul.querySelectorAll('li');
    expect(lis.length).toBe(2);
  });

  it('assigns cards-card-image and cards-card-body classes', () => {
    const block = createBlockFromRows('cards', [
      [createPictureElement('/img.jpg'), '<h3>Title</h3>', '<p>Desc</p>'],
    ]);

    decorate(block);

    const imageEl = block.querySelector('.cards-card-image');
    const bodyEl = block.querySelector('.cards-card-body');
    expect(imageEl).toBeTruthy();
    expect(bodyEl).toBeTruthy();
  });

  it('replaces block children with ul', () => {
    const block = createBlockFromRows('cards', [
      ['<p>Content</p>'],
    ]);

    decorate(block);

    expect(block.children.length).toBe(1);
    expect(block.querySelector('ul')).toBeTruthy();
  });
});
