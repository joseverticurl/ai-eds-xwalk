/**
 * Hero block unit tests.
 *
 * Hero structure: rows[0]=image, rows[1]=imageAlt, rows[2]=text
 */
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import { createBlockFromRows, createPictureElement } from '../../test/helpers.js';

import decorate from './hero.js';

// Mock aem.js - createOptimizedPicture returns a simple picture element
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

// Mock scripts.js - moveInstrumentation is a no-op in tests
vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: () => {},
}));

describe('Hero block', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('decorates block with image and text', () => {
    const picture = createPictureElement('/img.jpg', 'Hero image');
    const block = createBlockFromRows('hero', [
      [picture],
      ['Hero image alt'],
      ['<h1>Welcome</h1><p>Hero description</p>'],
    ]);

    decorate(block);

    const wrapper = block.querySelector('.hero');
    expect(wrapper).toBeTruthy();
    expect(wrapper.querySelector('picture img')).toBeTruthy();
    expect(wrapper.querySelector('picture img').src).toContain('/img.jpg');
    expect(wrapper.querySelector('h1')?.textContent).toBe('Welcome');
    expect(wrapper.querySelector('p')?.textContent).toBe('Hero description');
  });

  it('handles block with only text (no image)', () => {
    const block = createBlockFromRows('hero', [
      [document.createElement('div')], // empty image cell
      [''],
      ['<h1>Text Only</h1>'],
    ]);

    decorate(block);

    const wrapper = block.querySelector('.hero');
    expect(wrapper).toBeTruthy();
    expect(wrapper.querySelector('h1')?.textContent).toBe('Text Only');
    expect(wrapper.querySelector('picture')).toBeFalsy();
  });

  it('wraps plain text in h1 when no heading present', () => {
    const block = createBlockFromRows('hero', [
      [document.createElement('div')],
      [''],
      ['Plain text content'],
    ]);

    decorate(block);

    const h1 = block.querySelector('.hero h1');
    expect(h1).toBeTruthy();
    expect(h1.textContent).toBe('Plain text content');
  });

  it('replaces block children with wrapper', () => {
    const block = createBlockFromRows('hero', [
      [document.createElement('div')],
      [''],
      ['<h1>Title</h1>'],
    ]);

    const originalChildCount = block.children.length;
    decorate(block);

    expect(block.children.length).toBe(1);
    expect(block.querySelector('.hero')).toBeTruthy();
    expect(originalChildCount).toBeGreaterThan(0);
  });
});
