/**
 * You May Also Like block unit tests.
 */
import {
  describe,
  it,
  expect,
  vi,
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

/* eslint-disable-next-line import/first --
  mocks must load before the module under test */
import decorate from './youmayalsolike.js';

function rowForCard(picture, category, title, href) {
  return [
    picture,
    category,
    title,
    `<a href="${href}">Article</a>`,
  ];
}

describe('You May Also Like block', () => {
  it('does not render when fewer than 2 cards', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['You may also like'],
      ['aura-light'],
      rowForCard(createPictureElement('/a.jpg', ''), 'Cat', 'Title A', '/a'),
    ]);

    decorate(block);

    expect(block.querySelector('.youmayalsolike-wrapper')).toBeFalsy();
  });

  it('renders two cards and applies aura class', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['You may also like'],
      ['aura-sustainability'],
      rowForCard(createPictureElement('/a.jpg', 'Alt A'), 'Sustainability', 'Title A', '/article-a'),
      rowForCard(createPictureElement('/b.jpg', 'Alt B'), 'Career', 'Title B', '/article-b'),
    ]);

    decorate(block);

    const wrapper = block.querySelector('.youmayalsolike-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.classList.contains('aura-sustainability')).toBe(true);
    expect(block.querySelector('.youmayalsolike-heading')?.textContent).toBe('You may also like');
    expect(block.querySelectorAll('.youmayalsolike-card').length).toBe(2);
    expect(block.querySelector('.youmayalsolike-card')?.getAttribute('href')).toBe('/article-a');
  });

  it('caps at three cards', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['Section'],
      ['aura-light'],
      rowForCard(createPictureElement('/1.jpg'), 'A', 'T1', '/1'),
      rowForCard(createPictureElement('/2.jpg'), 'B', 'T2', '/2'),
      rowForCard(createPictureElement('/3.jpg'), 'C', 'T3', '/3'),
      rowForCard(createPictureElement('/4.jpg'), 'D', 'T4', '/4'),
    ]);

    decorate(block);

    expect(block.querySelectorAll('.youmayalsolike-card').length).toBe(3);
  });

  it('drops cards without a link href', () => {
    const block = createBlockFromRows('youmayalsolike', [
      ['Title'],
      ['aura-light'],
      rowForCard(createPictureElement('/a.jpg'), 'A', 'T1', '/ok'),
      [createPictureElement('/b.jpg'), 'B', 'T2', ''],
    ]);

    decorate(block);

    expect(block.querySelector('.youmayalsolike-wrapper')).toBeFalsy();
  });
});
