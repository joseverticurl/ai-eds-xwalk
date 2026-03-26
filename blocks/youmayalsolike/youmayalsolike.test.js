import {
  describe, it, expect, vi, beforeEach, beforeAll,
} from 'vitest';
import { createBlockFromRows, createPictureElement } from '../../test/helpers.js';

vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: () => {},
}));

let decorate;

function createCardRow(title = 'Sample title') {
  return [
    createPictureElement('/image.jpg', 'Image alt'),
    'Sustainability',
    title,
    '<a href="/article">Article</a>',
    'Readmore',
  ];
}

describe('youmayalsolike block', () => {
  beforeAll(async () => {
    ({ default: decorate } = await import('./youmayalsolike.js'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders two-card layout when exactly 2 cards exist', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['You may also like'],
      ['aura-creative'],
      createCardRow('Card one'),
      createCardRow('Card two'),
    ]);

    decorate(block);

    expect(block.classList.contains('aura-creative')).toBe(true);
    expect(block.classList.contains('is-two-cards')).toBe(true);
    expect(block.querySelectorAll('.youmayalsolike-card').length).toBe(2);
  });

  it('caps rendered cards to 3 when more than 3 are authored', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['You may also like'],
      ['aura-creative'],
      createCardRow('One'),
      createCardRow('Two'),
      createCardRow('Three'),
      createCardRow('Four'),
    ]);

    decorate(block);

    expect(block.classList.contains('is-three-cards')).toBe(true);
    expect(block.querySelectorAll('.youmayalsolike-card').length).toBe(3);
    expect(block.textContent.includes('Four')).toBe(false);
  });

  it('does not render when fewer than 2 valid cards are available', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['You may also like'],
      ['aura-creative'],
      createCardRow('Only one'),
    ]);

    decorate(block);

    expect(block.children.length).toBe(0);
  });
});
