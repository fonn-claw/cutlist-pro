import { describe, it, expect } from 'vitest';
import { optimizeCutLayout } from '@/lib/optimizer';
import type { Board, CutPiece, Settings } from '@/lib/types';

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: 'b1',
    dimensions: { length: 1000, width: 500 },
    quantity: 1,
    ...overrides,
  };
}

function makePiece(overrides: Partial<CutPiece> = {}): CutPiece {
  return {
    id: 'p1',
    dimensions: { length: 200, width: 100 },
    quantity: 1,
    label: 'A',
    color: '#ff0000',
    grainDirection: false,
    ...overrides,
  };
}

const defaultSettings: Settings = { units: 'metric', kerf: 3.175 };
const noKerfSettings: Settings = { units: 'metric', kerf: 0 };

describe('basic placement', () => {
  it('1 board + 1 small piece => 1 board layout with 1 placed piece at (0,0)', () => {
    const result = optimizeCutLayout([makeBoard()], [makePiece()], noKerfSettings);

    expect(result.boards).toHaveLength(1);
    expect(result.boards[0].pieces).toHaveLength(1);
    expect(result.boards[0].pieces[0].x).toBe(0);
    expect(result.boards[0].pieces[0].y).toBe(0);
    expect(result.boards[0].pieces[0].pieceId).toBe('p1');
    expect(result.unplacedPieces).toHaveLength(0);
  });

  it('1 board + 2 pieces => both placed, no overlaps', () => {
    const pieces = [
      makePiece({ id: 'p1', dimensions: { length: 400, width: 200 } }),
      makePiece({ id: 'p2', dimensions: { length: 300, width: 150 }, label: 'B', color: '#00ff00' }),
    ];
    const result = optimizeCutLayout([makeBoard()], pieces, noKerfSettings);

    expect(result.boards).toHaveLength(1);
    expect(result.boards[0].pieces).toHaveLength(2);
    expect(result.unplacedPieces).toHaveLength(0);

    // no overlaps: check bounding boxes
    const [a, b] = result.boards[0].pieces;
    const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
    const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
    expect(overlapX && overlapY).toBe(false);
  });
});

describe('kerf handling', () => {
  it('2 pieces on same board have at least kerf distance between them', () => {
    const board = makeBoard({ dimensions: { length: 500, width: 500 } });
    const pieces = [
      makePiece({ id: 'p1', dimensions: { length: 200, width: 200 } }),
      makePiece({ id: 'p2', dimensions: { length: 200, width: 200 }, label: 'B', color: '#00ff00' }),
    ];
    const result = optimizeCutLayout([board], pieces, defaultSettings);

    expect(result.boards[0].pieces).toHaveLength(2);
    const [a, b] = result.boards[0].pieces;

    // At least one axis must have kerf gap
    const gapX = Math.abs((a.x + a.width) - b.x);
    const gapY = Math.abs((a.y + a.height) - b.y);
    // If they share the same row/column, the gap along the shared axis must be >= kerf
    if (Math.abs(a.y - b.y) < 0.01) {
      // same row
      expect(Math.max(a.x + a.width, b.x + b.width) - Math.min(a.x, b.x)).toBeLessThanOrEqual(500);
      const gap = Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width);
      expect(gap).toBeGreaterThanOrEqual(defaultSettings.kerf - 0.01);
    } else if (Math.abs(a.x - b.x) < 0.01) {
      // same column
      const gap = Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height);
      expect(gap).toBeGreaterThanOrEqual(defaultSettings.kerf - 0.01);
    }
    // Either way, pieces must not overlap
    const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
    const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
    expect(overlapX && overlapY).toBe(false);
  });
});

describe('grain direction', () => {
  it('piece with grainDirection=true is never rotated', () => {
    const board = makeBoard({ dimensions: { length: 1000, width: 1000 } });
    const piece = makePiece({ grainDirection: true, dimensions: { length: 300, width: 100 } });
    const result = optimizeCutLayout([board], [piece], noKerfSettings);

    expect(result.boards[0].pieces[0].rotated).toBe(false);
    expect(result.boards[0].pieces[0].width).toBe(300);
    expect(result.boards[0].pieces[0].height).toBe(100);
  });

  it('grain-locked piece that only fits rotated goes to unplacedPieces', () => {
    // Board is 100 wide, piece length=200 width=50
    // Normal: needs 200 in board length and 50 in width => fine if board is 200+ long
    // But board is only 100 long and 300 wide
    // So piece (200x50) doesn't fit normal (200 > 100 length), would fit rotated (50x200, 50<=100, 200<=300)
    // But grain=true prevents rotation
    const board = makeBoard({ dimensions: { length: 100, width: 300 } });
    const piece = makePiece({ grainDirection: true, dimensions: { length: 200, width: 50 } });
    const result = optimizeCutLayout([board], [piece], noKerfSettings);

    expect(result.unplacedPieces).toHaveLength(1);
    expect(result.unplacedPieces[0].pieceId).toBe('p1');
  });

  it('piece with grainDirection=false IS rotated when it only fits rotated', () => {
    // Board: length=100, width=300 => free rect width=100, height=300
    // Piece: length=200, width=50 => normal: w=200, h=50. 200 > 100 doesn't fit.
    // Rotated: w=50, h=200. 50<=100, 200<=300 fits!
    const board = makeBoard({ dimensions: { length: 100, width: 300 } });
    const piece = makePiece({ grainDirection: false, dimensions: { length: 200, width: 50 } });
    const result = optimizeCutLayout([board], [piece], noKerfSettings);

    expect(result.boards[0].pieces).toHaveLength(1);
    expect(result.boards[0].pieces[0].rotated).toBe(true);
    expect(result.boards[0].pieces[0].width).toBe(50);
    expect(result.boards[0].pieces[0].height).toBe(200);
  });
});

describe('quantity expansion', () => {
  it('Board qty:2 provides 2 board instances; CutPiece qty:3 produces 3 placed pieces', () => {
    // Each board is 200x100, each piece is 150x80, so 1 piece per board
    // 2 boards available, 3 pieces needed => 2 placed, 1 unplaced
    const board = makeBoard({ dimensions: { length: 200, width: 100 }, quantity: 2 });
    const piece = makePiece({ dimensions: { length: 150, width: 80 }, quantity: 3 });
    const result = optimizeCutLayout([board], [piece], noKerfSettings);

    expect(result.summary.totalPieces).toBe(3);
    expect(result.summary.placedPieces).toBe(2);
    expect(result.unplacedPieces).toHaveLength(1);
    expect(result.boards).toHaveLength(2);
  });
});

describe('edge cases', () => {
  it('pieces larger than any board go to unplacedPieces', () => {
    const board = makeBoard({ dimensions: { length: 100, width: 100 } });
    const piece = makePiece({ dimensions: { length: 500, width: 500 } });
    const result = optimizeCutLayout([board], [piece], noKerfSettings);

    expect(result.unplacedPieces).toHaveLength(1);
    expect(result.boards).toHaveLength(0);
  });

  it('no boards returns empty result', () => {
    const result = optimizeCutLayout([], [makePiece()], noKerfSettings);

    expect(result.boards).toHaveLength(0);
    expect(result.unplacedPieces).toHaveLength(0);
    expect(result.summary.totalBoards).toBe(0);
    expect(result.summary.totalPieces).toBe(0);
  });

  it('no pieces returns empty result', () => {
    const result = optimizeCutLayout([makeBoard()], [], noKerfSettings);

    expect(result.boards).toHaveLength(0);
    expect(result.summary.totalPieces).toBe(0);
  });
});

describe('guillotine validity', () => {
  it('no pieces overlap on any board, all pieces within board bounds', () => {
    const board = makeBoard({ dimensions: { length: 1000, width: 500 } });
    const pieces = [
      makePiece({ id: 'p1', dimensions: { length: 300, width: 200 } }),
      makePiece({ id: 'p2', dimensions: { length: 250, width: 150 }, label: 'B', color: '#00ff00' }),
      makePiece({ id: 'p3', dimensions: { length: 200, width: 100 }, label: 'C', color: '#0000ff' }),
      makePiece({ id: 'p4', dimensions: { length: 150, width: 100 }, label: 'D', color: '#ffff00' }),
    ];
    const result = optimizeCutLayout([board], pieces, noKerfSettings);

    for (const boardLayout of result.boards) {
      for (const piece of boardLayout.pieces) {
        // within board bounds
        expect(piece.x).toBeGreaterThanOrEqual(0);
        expect(piece.y).toBeGreaterThanOrEqual(0);
        expect(piece.x + piece.width).toBeLessThanOrEqual(boardLayout.width + 0.01);
        expect(piece.y + piece.height).toBeLessThanOrEqual(boardLayout.height + 0.01);
      }

      // no overlaps between any pair
      const placed = boardLayout.pieces;
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          const a = placed[i];
          const b = placed[j];
          const overlapX = a.x < b.x + b.width - 0.01 && a.x + a.width > b.x + 0.01;
          const overlapY = a.y < b.y + b.height - 0.01 && a.y + a.height > b.y + 0.01;
          expect(overlapX && overlapY).toBe(false);
        }
      }
    }
  });
});

describe('waste calculation', () => {
  it('wastePercentage = (wasteArea / totalArea) * 100', () => {
    // Board: 1000x500 = 500000 mm^2
    // Piece: 500x250 = 125000 mm^2
    // Waste = 375000, wastePercentage = 75%
    const board = makeBoard({ dimensions: { length: 1000, width: 500 } });
    const piece = makePiece({ dimensions: { length: 500, width: 250 } });
    const result = optimizeCutLayout([board], [piece], noKerfSettings);

    expect(result.summary.totalArea).toBe(500000);
    expect(result.summary.usedArea).toBe(125000);
    expect(result.summary.wasteArea).toBe(375000);
    expect(result.summary.wastePercentage).toBeCloseTo(75, 1);
  });
});

describe('multiple boards', () => {
  it('when pieces exceed one board capacity, algorithm opens additional boards', () => {
    // Board: 200x100 = 20000mm^2 each, qty 3
    // Pieces: 3 pieces of 150x80 = 12000mm^2 each, 1 per board
    const board = makeBoard({ dimensions: { length: 200, width: 100 }, quantity: 3 });
    const pieces = [
      makePiece({ id: 'p1', dimensions: { length: 150, width: 80 }, quantity: 1 }),
      makePiece({ id: 'p2', dimensions: { length: 150, width: 80 }, quantity: 1, label: 'B', color: '#00ff00' }),
      makePiece({ id: 'p3', dimensions: { length: 150, width: 80 }, quantity: 1, label: 'C', color: '#0000ff' }),
    ];
    const result = optimizeCutLayout([board], pieces, noKerfSettings);

    expect(result.boards.length).toBeGreaterThanOrEqual(2);
    expect(result.summary.placedPieces).toBe(3);
    expect(result.unplacedPieces).toHaveLength(0);
  });
});
