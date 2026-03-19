import { describe, it, expect } from 'vitest';
import {
  computeSlideOrigin,
  sortPiecesForAnimation,
  computeStaggerDelay,
} from './animation-utils';

describe('computeSlideOrigin', () => {
  const boardWidth = 1000;
  const boardHeight = 500;

  it('returns negative dx when piece is nearest left edge', () => {
    // piece center at (50, 250) -- closest to left (50)
    const piece = { x: 0, y: 200, width: 100, height: 100 };
    const result = computeSlideOrigin(piece, boardWidth, boardHeight);
    expect(result).toEqual({ dx: -80, dy: 0 });
  });

  it('returns positive dx when piece is nearest right edge', () => {
    // piece center at (950, 250) -- closest to right (50)
    const piece = { x: 900, y: 200, width: 100, height: 100 };
    const result = computeSlideOrigin(piece, boardWidth, boardHeight);
    expect(result).toEqual({ dx: 80, dy: 0 });
  });

  it('returns negative dy when piece is nearest top edge', () => {
    // piece center at (500, 50) -- closest to top (50)
    const piece = { x: 450, y: 0, width: 100, height: 100 };
    const result = computeSlideOrigin(piece, boardWidth, boardHeight);
    expect(result).toEqual({ dx: 0, dy: -80 });
  });

  it('returns positive dy when piece is nearest bottom edge', () => {
    // piece center at (500, 450) -- closest to bottom (50)
    const piece = { x: 450, y: 400, width: 100, height: 100 };
    const result = computeSlideOrigin(piece, boardWidth, boardHeight);
    expect(result).toEqual({ dx: 0, dy: 80 });
  });

  it('returns consistent direction at exact center (first-wins tie)', () => {
    // piece center at (500, 250) -- all distances equal on 1000x500 board
    // left=500, right=500, top=250, bottom=250
    // top wins (smallest at 250, and comes before bottom in array)
    const piece = { x: 450, y: 200, width: 100, height: 100 };
    const result = computeSlideOrigin(piece, boardWidth, boardHeight);
    expect(result).toEqual({ dx: 0, dy: -80 });
  });

  it('respects custom slideDistance parameter', () => {
    const piece = { x: 0, y: 200, width: 100, height: 100 };
    const result = computeSlideOrigin(piece, boardWidth, boardHeight, 120);
    expect(result).toEqual({ dx: -120, dy: 0 });
  });
});

describe('sortPiecesForAnimation', () => {
  it('returns pieces sorted by area descending', () => {
    const pieces = [
      { width: 10, height: 10, id: 'small' },
      { width: 100, height: 50, id: 'large' },
      { width: 30, height: 20, id: 'medium' },
    ];
    const sorted = sortPiecesForAnimation(pieces);
    expect(sorted.map((p) => p.id)).toEqual(['large', 'medium', 'small']);
  });

  it('does not mutate original array', () => {
    const pieces = [
      { width: 10, height: 10 },
      { width: 100, height: 50 },
    ];
    const original = [...pieces];
    sortPiecesForAnimation(pieces);
    expect(pieces).toEqual(original);
  });

  it('returns empty array for empty input', () => {
    expect(sortPiecesForAnimation([])).toEqual([]);
  });

  it('returns single-element array for single piece', () => {
    const pieces = [{ width: 50, height: 30 }];
    const sorted = sortPiecesForAnimation(pieces);
    expect(sorted).toEqual([{ width: 50, height: 30 }]);
  });
});

describe('computeStaggerDelay', () => {
  it('returns 0 for 1 piece', () => {
    expect(computeStaggerDelay(1)).toBe(0);
  });

  it('returns 100 for 5 pieces (clamped to maxDelay)', () => {
    // 1500/5 = 300, clamped to max 100
    expect(computeStaggerDelay(5)).toBe(100);
  });

  it('returns 30 for 50 pieces (clamped to minDelay)', () => {
    // 1500/50 = 30, clamped to min 30
    expect(computeStaggerDelay(50)).toBe(30);
  });

  it('returns 100 for 3 pieces (clamped to maxDelay)', () => {
    // 1500/3 = 500, clamped to max 100
    expect(computeStaggerDelay(3)).toBe(100);
  });

  it('always returns between minDelay and maxDelay inclusive', () => {
    for (const count of [2, 5, 10, 15, 20, 30, 50, 100]) {
      const delay = computeStaggerDelay(count);
      expect(delay).toBeGreaterThanOrEqual(30);
      expect(delay).toBeLessThanOrEqual(100);
    }
  });

  it('returns 0 for 0 pieces', () => {
    expect(computeStaggerDelay(0)).toBe(0);
  });
});
