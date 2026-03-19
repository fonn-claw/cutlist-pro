import { describe, it, expect } from 'vitest';
import { CUT_PIECE_PALETTE, getNextColor } from '@/lib/color-palette';
import { addCutPiece, updateCutPiece, removeCutPiece, duplicateCutPiece, parseBulkInput } from '@/lib/cut-operations';
import type { CutPiece } from '@/lib/types';

describe('CUT_PIECE_PALETTE', () => {
  it('has exactly 10 entries', () => {
    expect(CUT_PIECE_PALETTE).toHaveLength(10);
  });

  it('all entries are valid hex color strings', () => {
    for (const color of CUT_PIECE_PALETTE) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('getNextColor', () => {
  it('returns first palette color for index 0', () => {
    expect(getNextColor(0)).toBe('#ef4444');
  });

  it('wraps around to first color at palette length (10)', () => {
    expect(getNextColor(10)).toBe('#ef4444');
  });

  it('returns 4th color (amber) for index 3', () => {
    expect(getNextColor(3)).toBe('#f59e0b');
  });
});

describe('addCutPiece', () => {
  it('given empty array, returns array of length 1 with auto-assigned color and id', () => {
    const result = addCutPiece([], {
      dimensions: { length: 100, width: 50 },
      quantity: 2,
      label: 'shelf',
      grainDirection: false,
    });
    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('string');
    expect(result[0].id.length).toBeGreaterThan(0);
    expect(result[0].color).toBe('#ef4444');
    expect(result[0].grainDirection).toBe(false);
    expect(result[0].dimensions).toEqual({ length: 100, width: 50 });
    expect(result[0].quantity).toBe(2);
    expect(result[0].label).toBe('shelf');
  });

  it('assigns 3rd palette color when adding to array of 2 pieces', () => {
    const existing: CutPiece[] = [
      { id: 'p1', dimensions: { length: 100, width: 50 }, quantity: 1, label: 'a', color: '#ef4444', grainDirection: false },
      { id: 'p2', dimensions: { length: 200, width: 60 }, quantity: 1, label: 'b', color: '#3b82f6', grainDirection: false },
    ];
    const result = addCutPiece(existing, {
      dimensions: { length: 300, width: 70 },
      quantity: 1,
      label: 'c',
      grainDirection: false,
    });
    expect(result).toHaveLength(3);
    expect(result[2].color).toBe('#22c55e');
  });

  it('each call produces a unique id', () => {
    const r1 = addCutPiece([], { dimensions: { length: 100, width: 50 }, quantity: 1, label: '', grainDirection: false });
    const r2 = addCutPiece([], { dimensions: { length: 100, width: 50 }, quantity: 1, label: '', grainDirection: false });
    expect(r1[0].id).not.toBe(r2[0].id);
  });
});

describe('updateCutPiece', () => {
  const piece1: CutPiece = { id: 'p1', dimensions: { length: 100, width: 50 }, quantity: 1, label: 'shelf', color: '#ef4444', grainDirection: false };
  const piece2: CutPiece = { id: 'p2', dimensions: { length: 200, width: 60 }, quantity: 2, label: 'side', color: '#3b82f6', grainDirection: true };

  it('changes only the target piece', () => {
    const result = updateCutPiece([piece1, piece2], 'p1', { quantity: 5 });
    expect(result[0].quantity).toBe(5);
    expect(result[0].dimensions).toEqual(piece1.dimensions);
    expect(result[1]).toEqual(piece2);
  });

  it('returns same array if id not found', () => {
    const result = updateCutPiece([piece1, piece2], 'nonexistent', { quantity: 99 });
    expect(result).toEqual([piece1, piece2]);
  });
});

describe('removeCutPiece', () => {
  const piece1: CutPiece = { id: 'p1', dimensions: { length: 100, width: 50 }, quantity: 1, label: 'shelf', color: '#ef4444', grainDirection: false };
  const piece2: CutPiece = { id: 'p2', dimensions: { length: 200, width: 60 }, quantity: 2, label: 'side', color: '#3b82f6', grainDirection: true };

  it('filters out target piece, leaves others', () => {
    const result = removeCutPiece([piece1, piece2], 'p1');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(piece2);
  });

  it('returns same-length array if id not found', () => {
    const result = removeCutPiece([piece1, piece2], 'nonexistent');
    expect(result).toHaveLength(2);
  });
});

describe('duplicateCutPiece', () => {
  const piece1: CutPiece = { id: 'p1', dimensions: { length: 100, width: 50 }, quantity: 1, label: 'shelf', color: '#ef4444', grainDirection: false };
  const piece2: CutPiece = { id: 'p2', dimensions: { length: 200, width: 60 }, quantity: 2, label: '', color: '#3b82f6', grainDirection: true };

  it('creates copy with new id and (copy) label suffix', () => {
    const result = duplicateCutPiece([piece1], 'p1');
    expect(result).toHaveLength(2);
    expect(result[1].id).not.toBe(piece1.id);
    expect(result[1].label).toBe('shelf (copy)');
    expect(result[1].dimensions).toEqual(piece1.dimensions);
    expect(result[1].quantity).toBe(piece1.quantity);
    expect(result[1].grainDirection).toBe(piece1.grainDirection);
  });

  it('preserves color from source (does NOT reassign)', () => {
    const result = duplicateCutPiece([piece1], 'p1');
    expect(result[1].color).toBe('#ef4444');
  });

  it('with empty label produces empty label on copy', () => {
    const result = duplicateCutPiece([piece2], 'p2');
    expect(result[1].label).toBe('');
  });

  it('with nonexistent id returns same array', () => {
    const result = duplicateCutPiece([piece1], 'nonexistent');
    expect(result).toEqual([piece1]);
  });
});

describe('parseBulkInput', () => {
  it('parses tab-separated line with imperial conversion', () => {
    const result = parseBulkInput('24\t12\t2\tShelf', 'imperial');
    expect(result.pieces).toHaveLength(1);
    expect(result.pieces[0].dimensions.length).toBeCloseTo(24 * 25.4);
    expect(result.pieces[0].dimensions.width).toBeCloseTo(12 * 25.4);
    expect(result.pieces[0].quantity).toBe(2);
    expect(result.pieces[0].label).toBe('Shelf');
    expect(result.errors).toHaveLength(0);
  });

  it('parses comma-separated line', () => {
    const result = parseBulkInput('24, 12, 2, Shelf', 'imperial');
    expect(result.pieces).toHaveLength(1);
    expect(result.pieces[0].dimensions.length).toBeCloseTo(24 * 25.4);
    expect(result.pieces[0].quantity).toBe(2);
    expect(result.pieces[0].label).toBe('Shelf');
  });

  it('defaults quantity to 1 when missing', () => {
    const result = parseBulkInput('24\t12', 'imperial');
    expect(result.pieces[0].quantity).toBe(1);
  });

  it('defaults label to empty string when missing', () => {
    const result = parseBulkInput('24\t12\t2', 'imperial');
    expect(result.pieces[0].label).toBe('');
  });

  it('returns error for invalid line', () => {
    const result = parseBulkInput('abc, 12', 'imperial');
    expect(result.errors).toHaveLength(1);
    expect(result.pieces).toHaveLength(0);
  });

  it('parses multiple lines', () => {
    const result = parseBulkInput('24\t12\t2\tShelf\n36\t6\t1\tRail', 'imperial');
    expect(result.pieces).toHaveLength(2);
    expect(result.pieces[0].label).toBe('Shelf');
    expect(result.pieces[1].label).toBe('Rail');
  });

  it('skips blank lines', () => {
    const result = parseBulkInput('24\t12\t2\tShelf\n\n36\t6\t1\tRail', 'imperial');
    expect(result.pieces).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('uses tab delimiter when tabs present, preserving commas in labels', () => {
    const result = parseBulkInput('24\t12\t1\tShelf, left side', 'imperial');
    expect(result.pieces[0].label).toBe('Shelf, left side');
  });
});
