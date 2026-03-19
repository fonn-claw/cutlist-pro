import type { Board, OptimizationResult } from '@/lib/types';

export interface BoardBreakdown {
  boardId: string;
  instanceIndex: number;
  widthMm: number;
  heightMm: number;
  usedArea: number;    // mm^2
  wasteArea: number;   // mm^2
  wastePercent: number; // 0-100
  pieceCount: number;
}

export interface SummaryStats {
  boardsNeeded: number;
  boardsAvailable: number;
  overallWastePercent: number; // 0-100
  boardBreakdowns: BoardBreakdown[];
}

export interface CostEstimate {
  totalCost: number;
  boardsNeeded: number;
  pricePerBoard: number;
}

export function computeSummaryStats(boards: Board[], result: OptimizationResult): SummaryStats {
  const boardsAvailable = boards.reduce((sum, b) => sum + b.quantity, 0);
  const boardsNeeded = result.summary.totalBoards;
  const overallWastePercent = result.summary.wastePercentage;

  const boardBreakdowns: BoardBreakdown[] = result.boards.map((layout) => ({
    boardId: layout.boardId,
    instanceIndex: layout.instanceIndex,
    widthMm: layout.width,
    heightMm: layout.height,
    usedArea: layout.usedArea,
    wasteArea: layout.wasteArea,
    wastePercent: 100 - layout.utilizationPercent,
    pieceCount: layout.pieces.length,
  }));

  return {
    boardsNeeded,
    boardsAvailable,
    overallWastePercent,
    boardBreakdowns,
  };
}

export function computeCostEstimate(
  boardsNeeded: number,
  pricePerBoard: number | undefined,
): CostEstimate | null {
  if (pricePerBoard === undefined || pricePerBoard === null || pricePerBoard === 0) {
    return null;
  }

  return {
    totalCost: boardsNeeded * pricePerBoard,
    boardsNeeded,
    pricePerBoard,
  };
}
