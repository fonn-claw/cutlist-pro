import { describe, it, expect } from 'vitest';
import { getContrastTextColor, calculateViewBox } from './visualization-utils';
import { CUT_PIECE_PALETTE } from './color-palette';

describe('getContrastTextColor', () => {
  it('returns white text for dark red (#ef4444)', () => {
    expect(getContrastTextColor('#ef4444')).toBe('#ffffff');
  });

  it('returns white text for blue (#3b82f6)', () => {
    expect(getContrastTextColor('#3b82f6')).toBe('#ffffff');
  });

  it('returns black text for green (#22c55e)', () => {
    expect(getContrastTextColor('#22c55e')).toBe('#000000');
  });

  it('returns black text for amber (#f59e0b)', () => {
    expect(getContrastTextColor('#f59e0b')).toBe('#000000');
  });

  it('returns white text for violet (#8b5cf6)', () => {
    expect(getContrastTextColor('#8b5cf6')).toBe('#ffffff');
  });

  it('returns black text for pink (#ec4899)', () => {
    expect(getContrastTextColor('#ec4899')).toBe('#000000');
  });

  it('returns black text for cyan (#06b6d4)', () => {
    expect(getContrastTextColor('#06b6d4')).toBe('#000000');
  });

  it('returns black text for orange (#f97316)', () => {
    expect(getContrastTextColor('#f97316')).toBe('#000000');
  });

  it('returns black text for teal (#14b8a6)', () => {
    expect(getContrastTextColor('#14b8a6')).toBe('#000000');
  });

  it('returns black text for purple (#a855f7)', () => {
    expect(getContrastTextColor('#a855f7')).toBe('#000000');
  });

  it('covers all 10 palette colors', () => {
    expect(CUT_PIECE_PALETTE).toHaveLength(10);
    for (const color of CUT_PIECE_PALETTE) {
      const result = getContrastTextColor(color);
      expect(['#000000', '#ffffff']).toContain(result);
    }
  });

  it('returns white text for pure black', () => {
    expect(getContrastTextColor('#000000')).toBe('#ffffff');
  });

  it('returns black text for pure white', () => {
    expect(getContrastTextColor('#ffffff')).toBe('#000000');
  });

  it('handles hex without # prefix', () => {
    expect(getContrastTextColor('ef4444')).toBe('#ffffff');
  });
});

describe('calculateViewBox', () => {
  it('calculates viewBox with explicit padding', () => {
    expect(calculateViewBox(1220, 2440, 20)).toBe('-20 -20 1260 2480');
  });

  it('uses default padding of 20', () => {
    expect(calculateViewBox(600, 300)).toBe('-20 -20 640 340');
  });

  it('handles 4x8ft board (1220x2440mm)', () => {
    expect(calculateViewBox(1220, 2440)).toBe('-20 -20 1260 2480');
  });

  it('handles 1x6 board (150x1220mm)', () => {
    expect(calculateViewBox(150, 1220)).toBe('-20 -20 190 1260');
  });

  it('handles zero padding', () => {
    expect(calculateViewBox(100, 200, 0)).toBe('0 0 100 200');
  });
});
