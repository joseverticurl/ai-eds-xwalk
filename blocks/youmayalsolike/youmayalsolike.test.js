/**
 * You May Also Like block unit tests.
 *
 * UE structure: [heading row], [style row], [card rows × 5 cells]
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

import decorate from './youmayalsolike.js';

function cardRow(imgSrc, category, title, href, readmore = 'Readmore') {
  const pic = createPictureElement(imgSrc, 'alt');
  return [
    pic,
    category,
    title,
    `<div><a href="${href}">#</a></div>`,
    readmore,
  ];
}

describe('You May Also Like block', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes block when fewer than 2 cards', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['You may also like'],
      ['aura-creative'],
      cardRow('/a.jpg', 'A', 'Title A', '/a'),
    ]);
    document.body.appendChild(block);
    decorate(block);
    expect(document.querySelector('.youmayalsolike')).toBeNull();
    document.body.replaceChildren();
  });

  it('renders when 2 or more cards', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['You may also like'],
      ['aura-creative'],
      cardRow('/1.jpg', 'Sustainability', 'First title', '/one'),
      cardRow('/2.jpg', 'Career', 'Second title', '/two'),
    ]);
    decorate(block);
    expect(block.querySelector('.youmayalsolike-inner')).toBeTruthy();
    expect(block.querySelector('.youmayalsolike-heading')?.textContent).toBe('You may also like');
    expect(block.classList.contains('aura-creative')).toBe(true);
    const cards = block.querySelectorAll('.youmayalsolike-card');
    expect(cards.length).toBe(2);
    const links = block.querySelectorAll('.youmayalsolike-card-link');
    expect(links[0].getAttribute('href')).toBe('/one');
    expect(links[1].getAttribute('href')).toBe('/two');
  });

  it('caps at 3 cards when more items are authored', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['Heading'],
      [''],
      cardRow('/1.jpg', 'A', 'T1', '/1'),
      cardRow('/2.jpg', 'B', 'T2', '/2'),
      cardRow('/3.jpg', 'C', 'T3', '/3'),
      cardRow('/4.jpg', 'D', 'T4', '/4'),
    ]);
    decorate(block);
    expect(block.querySelectorAll('.youmayalsolike-card').length).toBe(3);
  });

  it('uses default section heading when first row is empty', () => {
    const block = createBlockFromRows('youmayalsolike', [
      [''],
      [''],
      cardRow('/1.jpg', 'A', 'T1', '/1'),
      cardRow('/2.jpg', 'B', 'T2', '/2'),
    ]);
    decorate(block);
    expect(block.querySelector('.youmayalsolike-heading')?.textContent).toBe('You may also like');
  });
});
