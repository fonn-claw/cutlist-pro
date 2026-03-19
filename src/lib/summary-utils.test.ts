import { describe, it, expect } from 'vitest';
import { computeSummaryStats, computeCostEstimate } from '@/lib/summary-utils';
import type { Board, OptimizationResult, BoardLayout } from '@/lib/types';

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: 'b1',
    dimensions: { length: 1000, width: 500 },
    quantity: 1,
    ...overrides,
  };
}

function makeBoardLayout(overrides: Partial<BoardLayout> = {}): BoardLayout {
  return {
    boardId: 'b1',
    instanceIndex: 0,
    width: 1000,
    height: 500,
    pieces: [],
    waste: [],
    usedArea: 400000,
    wasteArea: 100000,
    utilizationPercent: 80,
    ...overrides,
  };
}

function makeResult(overrides: Partial<OptimizationResult> = {}): OptimizationResult {
  return {
    boards: [makeBoardLayout()],
    unplacedPieces: [],
    summary: {
      totalBoards: 1,
      totalPieces: 1,
      placedPieces: 1,
      totalArea: 500000,
      usedArea: 400000,
      wasteArea: 100000,
      wastePercentage: 20,
    },
    ...overrides,
  };
}

describe('computeSummaryStats', () => {
  it('returns boardsNeeded and boardsAvailable counts', () => {
    const boards = [
      makeBoard({ id: 'b1', quantity: 3 }),
      makeBoard({ id: 'b2', quantity: 2 }),
    ];
    const result = makeResult({
      boards: [makeBoardLayout(), makeBoardLayout({ boardId: 'b2', instanceIndex: 0 })],
      summary: {
        totalBoards: 2,
        totalPieces: 2,
        placedPieces: 2,
        totalArea: 1000000,
        usedArea: 800000,
        wasteArea: 200000,
        wastePercentage: 20,
      },
    });

    const stats = computeSummaryStats(boards, result);
    expect(stats.boardsNeeded).toBe(2);
    expect(stats.boardsAvailable).toBe(5);
  });

  it('returns overallWastePercent matching result.summary.wastePercentage', () => {
    const boards = [makeBoard({ quantity: 2 })];
    const result = makeResult();

    const stats = computeSummaryStats(boards, result);
    expect(stats.overallWastePercent).toBe(20);
  });

  it('returns boardBreakdowns array with one entry per BoardLayout', () => {
    const boards = [makeBoard({ quantity: 3 })];
    const layout1 = makeBoardLayout({
      boardId: 'b1',
      instanceIndex: 0,
      width: 1000,
      height: 500,
      usedArea: 400000,
      wasteArea: 100000,
      utilizationPercent: 80,
      pieces: [
        { pieceId: 'p1', instanceIndex: 0, x: 0, y: 0, width: 200, height: 100, rotated: false, label: 'A', color: '#ff0000' },
        { pieceId: 'p2', instanceIndex: 0, x: 200, y: 0, width: 200, height: 100, rotated: false, label: 'B', color: '#00ff00' },
      ],
    });
    const layout2 = makeBoardLayout({
      boardId: 'b1',
      instanceIndex: 1,
      width: 1000,
      height: 500,
      usedArea: 300000,
      wasteArea: 200000,
      utilizationPercent: 60,
      pieces: [
        { pieceId: 'p3', instanceIndex: 0, x: 0, y: 0, width: 300, height: 100, rotated: false, label: 'C', color: '#0000ff' },
      ],
    });
    const result = makeResult({
      boards: [layout1, layout2],
      summary: {
        totalBoards: 2,
        totalPieces: 3,
        placedPieces: 3,
        totalArea: 1000000,
        usedArea: 700000,
        wasteArea: 300000,
        wastePercentage: 30,
      },
    });

    const stats = computeSummaryStats(boards, result);
    expect(stats.boardBreakdowns).toHaveLength(2);

    expect(stats.boardBreakdowns[0]).toEqual({
      boardId: 'b1',
      instanceIndex: 0,
      widthMm: 1000,
      heightMm: 500,
      usedArea: 400000,
      wasteArea: 100000,
      wastePercent: 20,
      pieceCount: 2,
    });

    expect(stats.boardBreakdowns[1]).toEqual({
      boardId: 'b1',
      instanceIndex: 1,
      widthMm: 1000,
      heightMm: 500,
      usedArea: 300000,
      wasteArea: 200000,
      wastePercent: 40,
      pieceCount: 1,
    });
  });

  it('returns zeros and empty breakdowns for empty result', () => {
    const boards = [makeBoard({ quantity: 2 })];
    const result = makeResult({
      boards: [],
      summary: {
        totalBoards: 0,
        totalPieces: 0,
        placedPieces: 0,
        totalArea: 0,
        usedArea: 0,
        wasteArea: 0,
        wastePercentage: 0,
      },
    });

    const stats = computeSummaryStats(boards, result);
    expect(stats.boardsNeeded).toBe(0);
    expect(stats.overallWastePercent).toBe(0);
    expect(stats.boardBreakdowns).toEqual([]);
  });
});

describe('computeCostEstimate', () => {
  it('returns total cost as boardsNeeded * pricePerBoard', () => {
    const estimate = computeCostEstimate(2, 25);
    expect(estimate).toEqual({
      totalCost: 50,
      boardsNeeded: 2,
      pricePerBoard: 25,
    });
  });

  it('returns null when pricePerBoard is 0', () => {
    const estimate = computeCostEstimate(2, 0);
    expect(estimate).toBeNull();
  });

  it('returns null when pricePerBoard is undefined', () => {
    const estimate = computeCostEstimate(2, undefined);
    expect(estimate).toBeNull();
  });
});
