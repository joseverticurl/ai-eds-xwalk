/**
 * Homepage carousel — structure: rows 0–5 = config, rows 6+ = slides
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlockFromRows, createPictureElement } from '../../test/helpers.js';

const mockSwiperInstance = {
  activeIndex: 0,
  slideTo: vi.fn(),
  on: vi.fn(),
  autoplay: { stop: vi.fn(), start: vi.fn() },
};

vi.mock('../../scripts/aem.js', () => ({
  createOptimizedPicture: (src, alt = '') => {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    picture.appendChild(img);
    return picture;
  },
  loadCSS: vi.fn().mockResolvedValue(undefined),
  loadScript: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: () => {},
}));

import decorate from './homepagecarousel.js';

function baseConfigRows() {
  return [
    ['<p>We refresh</p><p>the world</p>'],
    ['5'],
    ['true'],
    ['true'],
    ['true'],
    [''],
  ];
}

function slideRow(media, bgPic, videoCell, tag, body, cta, label, brandPic) {
  return [media, bgPic, videoCell, tag, body, cta, label, brandPic, ''];
}

describe('Homepage carousel block', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSwiperInstance.activeIndex = 0;
    globalThis.Swiper = vi.fn().mockImplementation(() => mockSwiperInstance);
  });

  it('returns early when fewer than 2 slides', () => {
    const block = createBlockFromRows('homepagecarousel', [
      ...baseConfigRows(),
      slideRow(
        'image',
        createPictureElement('/a.png', 'alt'),
        '<a href="/v.mp4">v</a>',
        'brands',
        'Body',
        '<a href="/b">#</a>',
        'Read',
        createPictureElement('/icon.png', 'icon'),
      ),
    ]);
    document.body.appendChild(block);
    return decorate(block).then(() => {
      expect(block.querySelector('.homepagecarousel-wrapper')).toBeFalsy();
    });
  });

  it('builds wrapper with headline and swiper when 2+ slides', async () => {
    const block = createBlockFromRows('homepagecarousel', [
      ...baseConfigRows(),
      slideRow(
        'image',
        createPictureElement('/a.png', 'a'),
        '<a href="/v.mp4">v</a>',
        'brands',
        'First body',
        '<a href="/b">#</a>',
        'Read',
        createPictureElement('/i.png', ''),
      ),
      slideRow(
        'image',
        createPictureElement('/a2.png', 'a2'),
        '<a href="/v.mp4">v</a>',
        'brands',
        'Second body',
        '<a href="/b2">#</a>',
        'Read',
        createPictureElement('/i2.png', ''),
      ),
    ]);
    document.body.appendChild(block);
    await decorate(block);
    const wrapper = block.querySelector('.homepagecarousel-wrapper');
    expect(wrapper).toBeTruthy();
    expect(block.querySelector('.homepagecarousel-headline')).toBeTruthy();
    expect(block.querySelector('.swiper.homepagecarousel-swiper')).toBeTruthy();
    expect(block.querySelectorAll('.homepagecarousel-brand').length).toBe(2);
  });
});
