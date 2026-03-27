/**
 * You May Also Like block — UE index-based structure.
 */
import {
  describe, it, expect, vi, beforeEach,
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

// eslint-disable-next-line import/first -- vi.mock is hoisted; load block after mocks
import decorate from './youmayalsolike.js';

function titleRow(text = 'You may also like') {
  return [`<div><div>${text}</div></div>`];
}

function auraRow(aura = 'aura-creative') {
  return [`<div><div>${aura}</div></div>`];
}

function cardRow(src, category, articleTitle, href, readMore = 'Readmore') {
  const pic = createPictureElement(src, 'alt');
  const picWrap = document.createElement('div');
  picWrap.appendChild(pic);
  return [
    picWrap,
    `<div>${category}</div>`,
    `<div>${articleTitle}</div>`,
    `<div><a href="${href}">Link</a></div>`,
    `<div>${readMore}</div>`,
  ];
}

describe('youmayalsolike block', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, grid, and cards', () => {
    const block = createBlockFromRows('youmayalsolike', [
      titleRow(),
      auraRow('aura-light'),
      cardRow('/a.jpg', 'Sustainability', 'Title one', '/one'),
      cardRow('/b.jpg', 'Career', 'Title two', '/two'),
    ]);

    decorate(block);

    expect(block.querySelector('.container')).toBeTruthy();
    expect(block.querySelector('.youmayalsolike-title')?.textContent).toBe('You may also like');
    expect(block.querySelectorAll('.youmayalsolike-cards > .youmayalsolike-card')).toHaveLength(2);
    expect(block.querySelector('.row.youmayalsolike-cards')).toBeTruthy();
    const col = block.querySelector('.youmayalsolike-cards > .youmayalsolike-card');
    expect(col?.classList.contains('col-s-4')).toBe(true);
    expect(col?.classList.contains('col-m-4')).toBe(true);
    expect(col?.classList.contains('col-xl-6')).toBe(true);
    const link = block.querySelector('.youmayalsolike-card-link');
    expect(link?.getAttribute('href')).toBe('/one');
  });

  it('applies known aura class to block', () => {
    const block = createBlockFromRows('youmayalsolike', [
      titleRow(),
      auraRow('aura-sustainability'),
      cardRow('/a.jpg', 'A', 'T1', '/1'),
      cardRow('/b.jpg', 'B', 'T2', '/2'),
    ]);

    decorate(block);

    expect(block.classList.contains('aura-sustainability')).toBe(true);
  });

  it('ignores unknown aura token', () => {
    const block = createBlockFromRows('youmayalsolike', [
      titleRow(),
      ['<div><div>not-an-aura</div></div>'],
      cardRow('/a.jpg', 'A', 'T1', '/1'),
      cardRow('/b.jpg', 'B', 'T2', '/2'),
    ]);

    decorate(block);

    expect(block.classList.contains('not-an-aura')).toBe(false);
  });

  it('does not render when fewer than two cards', () => {
    const block = createBlockFromRows('youmayalsolike', [
      titleRow(),
      auraRow(),
      cardRow('/a.jpg', 'A', 'T1', '/1'),
    ]);

    decorate(block);

    expect(block.children.length).toBe(0);
  });

  it('renders at most three cards', () => {
    const block = createBlockFromRows('youmayalsolike', [
      titleRow(),
      auraRow(),
      cardRow('/1.jpg', 'A', 'T1', '/1'),
      cardRow('/2.jpg', 'B', 'T2', '/2'),
      cardRow('/3.jpg', 'C', 'T3', '/3'),
      cardRow('/4.jpg', 'D', 'T4', '/4'),
    ]);

    decorate(block);

    expect(block.querySelectorAll('.youmayalsolike-cards > .youmayalsolike-card')).toHaveLength(3);
    const col = block.querySelector('.youmayalsolike-cards > .youmayalsolike-card');
    expect(col?.classList.contains('col-xl-4')).toBe(true);
  });

  it('normalizes Readmore label on CTA', () => {
    const block = createBlockFromRows('youmayalsolike', [
      titleRow(),
      auraRow(),
      cardRow('/a.jpg', 'A', 'T1', '/1'),
      cardRow('/b.jpg', 'B', 'T2', '/2', 'Readmore'),
    ]);

    decorate(block);

    const ctas = block.querySelectorAll('.youmayalsolike-card-cta');
    expect(ctas[1]?.textContent).toBe('Read more');
  });
});
