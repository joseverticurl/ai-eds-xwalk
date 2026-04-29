/**
 * Feature Cards Carousel block unit tests.
 *
 * Structure: rows 0-9 = metadata, rows 10+ = card items
 */
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import { createBlockFromRows, createPictureElement } from '../../test/helpers.js';

import decorate from './featurecardscarousel.js';

// Mock Swiper constructor
const mockSwiperInstance = {
  activeIndex: 0,
  slides: [],
  slideTo: vi.fn(),
  on: vi.fn(),
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

describe('Feature Cards Carousel block', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSwiperInstance.activeIndex = 0;
    mockSwiperInstance.slideTo.mockClear();
    mockSwiperInstance.on.mockClear();

    // Inject mock Swiper
    window.Swiper = vi.fn().mockImplementation(() => mockSwiperInstance);
  });

  it('returns early when fewer than 2 cards', () => {
    const block = createBlockFromRows('featurecardscarousel', [
      ['Title'],
      ['Tag'],
      ['Subheading'],
      [''],
      [''],
      [''],
      [''],
      [''],
      [''],
      ['4'],
      [createPictureElement('/c1.jpg'), createPictureElement('/l1.png'), 'Card 1', 'Desc 1'],
    ]);

    decorate(block);

    expect(block.querySelector('.featurecardscarousel-wrapper')).toBeFalsy();
  });

  it('decorates block when 2 or more cards', async () => {
    const block = createBlockFromRows('featurecardscarousel', [
      ['Section Title'],
      ['Tag'],
      ['Subheading'],
      ['<a href="https://example.com/cta1">Link</a>'],
      ['CTA 1 Text'],
      ['primary'],
      [''],
      [''],
      [''],
      ['3'],
      [createPictureElement('/c1.jpg'), createPictureElement('/l1.png'), 'Card 1', 'Desc 1'],
      [createPictureElement('/c2.jpg'), createPictureElement('/l2.png'), 'Card 2', 'Desc 2'],
    ]);

    await decorate(block);

    const wrapper = block.querySelector('.featurecardscarousel-wrapper');
    expect(wrapper).toBeTruthy();
    expect(block.querySelector('.featurecardscarousel-title-section')).toBeTruthy();
    expect(block.querySelector('.featurecardscarousel-heading')?.textContent).toBe('Section Title');
    expect(block.querySelector('.featurecardscarousel-tag')?.textContent).toBe('Tag');
    const cta = block.querySelector('.featurecardscarousel-cta');
    expect(cta).toBeTruthy();
    expect(cta.getAttribute('href')).toContain('example.com/cta1');
  });

  it('builds desktop and mobile carousel sections', async () => {
    const block = createBlockFromRows('featurecardscarousel', [
      ['Title'],
      [''],
      [''],
      [''],
      [''],
      [''],
      [''],
      [''],
      [''],
      ['4'],
      [createPictureElement('/c1.jpg'), createPictureElement('/l1.png'), 'Card 1', 'Desc 1'],
      [createPictureElement('/c2.jpg'), createPictureElement('/l2.png'), 'Card 2', 'Desc 2'],
    ]);

    await decorate(block);

    expect(block.querySelector('.featurecardscarousel-desktop')).toBeTruthy();
    expect(block.querySelector('.featurecardscarousel-mobile')).toBeTruthy();
    expect(block.querySelectorAll('.featurecardscarousel-card').length).toBeGreaterThanOrEqual(2);
  });
});
