import { describe, it, expect } from 'vitest';
import { toInternal, toDisplay, formatFraction, formatDimension } from '@/lib/units';

describe('toInternal', () => {
  it('converts inches to mm', () => {
    expect(toInternal(15.75, 'imperial')).toBeCloseTo(400.05, 5);
  });

  it('passes through metric values', () => {
    expect(toInternal(400, 'metric')).toBe(400);
  });

  it('converts 1 inch to 25.4 mm', () => {
    expect(toInternal(1, 'imperial')).toBeCloseTo(25.4, 5);
  });
});

describe('toDisplay', () => {
  it('converts mm to inches', () => {
    expect(toDisplay(400.05, 'imperial')).toBeCloseTo(15.75, 5);
  });

  it('passes through metric values', () => {
    expect(toDisplay(400, 'metric')).toBe(400);
  });

  it('converts 25.4 mm to 1 inch', () => {
    expect(toDisplay(25.4, 'imperial')).toBeCloseTo(1, 5);
  });
});

describe('round-trip precision', () => {
  it('preserves value through imperial round-trip', () => {
    const original = 15.75;
    const roundTrip = toDisplay(toInternal(original, 'imperial'), 'imperial');
    expect(roundTrip).toBeCloseTo(original, 10);
  });

  it('preserves value through metric round-trip', () => {
    const original = 400;
    const roundTrip = toDisplay(toInternal(original, 'metric'), 'metric');
    expect(roundTrip).toBe(original);
  });
});

describe('formatFraction', () => {
  it('formats mixed number fraction (15-3/4")', () => {
    expect(formatFraction(15.75)).toBe('15-3/4"');
  });

  it('formats whole number without fraction (24")', () => {
    expect(formatFraction(24.0)).toBe('24"');
  });

  it('formats fraction-only value (1/2")', () => {
    expect(formatFraction(0.5)).toBe('1/2"');
  });

  it('formats sixteenths precision (1/16")', () => {
    expect(formatFraction(0.0625)).toBe('1/16"');
  });

  it('formats eighth fraction (15-1/8")', () => {
    expect(formatFraction(15.125)).toBe('15-1/8"');
  });

  it('formats quarter fraction (1/4")', () => {
    expect(formatFraction(0.25)).toBe('1/4"');
  });

  it('formats 1 inch as whole number (1")', () => {
    expect(formatFraction(1.0)).toBe('1"');
  });
});

describe('formatDimension', () => {
  it('formats imperial value from mm', () => {
    expect(formatDimension(400.05, 'imperial')).toBe('15-3/4"');
  });

  it('formats metric value with mm suffix', () => {
    expect(formatDimension(400, 'metric')).toBe('400mm');
  });

  it('formats 25.4mm as 1" in imperial', () => {
    expect(formatDimension(25.4, 'imperial')).toBe('1"');
  });

  it('formats decimal mm value', () => {
    expect(formatDimension(12.7, 'metric')).toBe('12.7mm');
  });
});
