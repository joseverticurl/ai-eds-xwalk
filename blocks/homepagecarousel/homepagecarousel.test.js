/**
 * Homepage Carousel block unit tests.
 * Parent rows 0–5; slide rows from index 6.
 */
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import { createBlockFromRows, createPictureElement } from '../../test/helpers.js';

import decorate from './homepagecarousel.js';

function mockSlideRow(mediaImage = true) {
  const heroPic = createPictureElement('/hero.png', 'hero alt');
  const brandPic = createPictureElement('/brand.jpg', 'brand');
  return [
    mediaImage ? 'image' : 'video',
    mediaImage ? heroPic : '<a href="/video.mp4">v</a>',
    '<a href="/video.mp4">v</a>',
    'brands',
    'Story text here',
    '<a href="#">#</a>',
    'Read Article',
    brandPic,
    '',
  ];
}

const mockSwiperInstance = {
  realIndex: 0,
  slideTo: vi.fn(),
  slideToLoop: vi.fn(),
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

describe('Homepage Carousel block', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSwiperInstance.realIndex = 0;
    mockSwiperInstance.slideTo.mockClear();
    mockSwiperInstance.slideToLoop.mockClear();
    mockSwiperInstance.autoplay.stop.mockClear();
    mockSwiperInstance.autoplay.start.mockClear();
    window.Swiper = vi.fn().mockImplementation(() => mockSwiperInstance);
  });

  function baseParentRows() {
    return [
      ['<div><div><p>We refresh</p><p>the world</p></div></div>'],
      ['5'],
      ['true'],
      ['true'],
      ['true'],
      [''],
    ];
  }

  it('returns early when fewer than 8 rows', async () => {
    const block = createBlockFromRows('homepagecarousel', baseParentRows().slice(0, 6));
    await decorate(block);
    expect(block.querySelector('.homepagecarousel-root')).toBeFalsy();
  });

  it('returns early when fewer than 2 slides', async () => {
    const block = createBlockFromRows('homepagecarousel', [
      ...baseParentRows(),
      mockSlideRow(true),
    ]);
    await decorate(block);
    expect(block.querySelector('.homepagecarousel-root')).toBeFalsy();
  });

  it('decorates with headline, swiper, and brand icons when 2+ slides', async () => {
    const block = createBlockFromRows('homepagecarousel', [
      ...baseParentRows(),
      mockSlideRow(true),
      mockSlideRow(false),
    ]);

    await decorate(block);

    const root = block.querySelector('.homepagecarousel-root');
    expect(root).toBeTruthy();
    expect(block.querySelector('.homepagecarousel-headline p')?.textContent).toBe('We refresh');
    expect(block.querySelector('.homepagecarousel-swiper .swiper-wrapper')).toBeTruthy();
    expect(block.querySelectorAll('.homepagecarousel-icon-btn').length).toBe(2);
    expect(block.querySelector('.homepagecarousel-slide-video')).toBeTruthy();
  });
});
