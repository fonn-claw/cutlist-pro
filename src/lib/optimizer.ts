import type {
  Board,
  CutPiece,
  Settings,
  OptimizationResult,
  PlacedPiece,
  WasteRegion,
  BoardLayout,
} from '@/lib/types';

interface FreeRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlacementResult {
  rectIndex: number;
  rotated: boolean;
  score: number;
}

const EPSILON = 0.01;

function effectiveDimensions(
  piece: CutPiece,
  kerf: number
): { width: number; height: number } {
  return {
    width: piece.dimensions.length + kerf,
    height: piece.dimensions.width + kerf,
  };
}

function placePieceInRect(
  freeRects: FreeRectangle[],
  pieceWidth: number,
  pieceHeight: number,
  canRotate: boolean
): PlacementResult | null {
  let best: PlacementResult | null = null;

  for (let i = 0; i < freeRects.length; i++) {
    const rect = freeRects[i];

    // Normal orientation
    if (
      pieceWidth <= rect.width + EPSILON &&
      pieceHeight <= rect.height + EPSILON
    ) {
      const score = Math.min(
        rect.width - pieceWidth,
        rect.height - pieceHeight
      );
      if (best === null || score < best.score) {
        best = { rectIndex: i, rotated: false, score };
      }
    }

    // Rotated orientation
    if (
      canRotate &&
      pieceHeight <= rect.width + EPSILON &&
      pieceWidth <= rect.height + EPSILON
    ) {
      const score = Math.min(
        rect.width - pieceHeight,
        rect.height - pieceWidth
      );
      if (best === null || score < best.score) {
        best = { rectIndex: i, rotated: true, score };
      }
    }
  }

  return best;
}

function splitFreeRect(
  rect: FreeRectangle,
  placedWidth: number,
  placedHeight: number
): FreeRectangle[] {
  const results: FreeRectangle[] = [];
  const rightWidth = rect.width - placedWidth;
  const bottomHeight = rect.height - placedHeight;

  if (rightWidth > EPSILON && bottomHeight > EPSILON) {
    // Short axis split
    if (rightWidth < bottomHeight) {
      // Vertical cut: right remainder is short
      results.push({
        x: rect.x + placedWidth,
        y: rect.y,
        width: rightWidth,
        height: placedHeight,
      });
      results.push({
        x: rect.x,
        y: rect.y + placedHeight,
        width: rect.width,
        height: bottomHeight,
      });
    } else {
      // Horizontal cut: bottom remainder is short
      results.push({
        x: rect.x + placedWidth,
        y: rect.y,
        width: rightWidth,
        height: rect.height,
      });
      results.push({
        x: rect.x,
        y: rect.y + placedHeight,
        width: placedWidth,
        height: bottomHeight,
      });
    }
  } else if (rightWidth > EPSILON) {
    results.push({
      x: rect.x + placedWidth,
      y: rect.y,
      width: rightWidth,
      height: rect.height,
    });
  } else if (bottomHeight > EPSILON) {
    results.push({
      x: rect.x,
      y: rect.y + placedHeight,
      width: rect.width,
      height: bottomHeight,
    });
  }

  return results.filter((r) => r.width > EPSILON && r.height > EPSILON);
}

interface ActiveBoard {
  boardId: string;
  instanceIndex: number;
  width: number;
  height: number;
  freeRects: FreeRectangle[];
  pieces: PlacedPiece[];
}

interface ExpandedPiece {
  piece: CutPiece;
  instanceIndex: number;
  area: number;
}

export function optimizeCutLayout(
  boards: Board[],
  pieces: CutPiece[],
  settings: Settings
): OptimizationResult {
  // Handle empty inputs
  if (boards.length === 0 || pieces.length === 0) {
    return {
      boards: [],
      unplacedPieces: [],
      summary: {
        totalBoards: 0,
        totalPieces: 0,
        placedPieces: 0,
        totalArea: 0,
        usedArea: 0,
        wasteArea: 0,
        wastePercentage: 0,
      },
    };
  }

  // Expand board quantities into individual board stock entries
  const boardStock: Array<{ boardId: string; instanceIndex: number; width: number; height: number }> = [];
  for (const board of boards) {
    for (let i = 0; i < board.quantity; i++) {
      boardStock.push({
        boardId: board.id,
        instanceIndex: i,
        width: board.dimensions.length,
        height: board.dimensions.width,
      });
    }
  }

  // Expand piece quantities
  const expandedPieces: ExpandedPiece[] = [];
  for (const piece of pieces) {
    for (let i = 0; i < piece.quantity; i++) {
      expandedPieces.push({
        piece,
        instanceIndex: i,
        area: piece.dimensions.length * piece.dimensions.width,
      });
    }
  }

  // Sort pieces by area descending (First Fit Decreasing)
  expandedPieces.sort((a, b) => b.area - a.area);

  const totalPieceInstances = expandedPieces.length;
  const activeBoards: ActiveBoard[] = [];
  const unplacedPieces: Array<{ pieceId: string; instanceIndex: number }> = [];
  let boardStockIndex = 0;

  for (const expanded of expandedPieces) {
    const { piece, instanceIndex } = expanded;
    const kerf = settings.kerf;
    const effDims = effectiveDimensions(piece, kerf);
    const canRotate = !piece.grainDirection;

    // Try to place on existing active boards
    let bestBoard: { boardIdx: number; placement: PlacementResult } | null = null;

    for (let bi = 0; bi < activeBoards.length; bi++) {
      const ab = activeBoards[bi];
      const placement = placePieceInRect(
        ab.freeRects,
        effDims.width,
        effDims.height,
        canRotate
      );
      if (placement !== null) {
        if (bestBoard === null || placement.score < bestBoard.placement.score) {
          bestBoard = { boardIdx: bi, placement };
        }
      }
    }

    if (bestBoard === null && boardStockIndex < boardStock.length) {
      // Allocate new board
      const stock = boardStock[boardStockIndex];
      boardStockIndex++;
      const newBoard: ActiveBoard = {
        boardId: stock.boardId,
        instanceIndex: stock.instanceIndex,
        width: stock.width,
        height: stock.height,
        freeRects: [{ x: 0, y: 0, width: stock.width, height: stock.height }],
        pieces: [],
      };
      activeBoards.push(newBoard);

      const placement = placePieceInRect(
        newBoard.freeRects,
        effDims.width,
        effDims.height,
        canRotate
      );
      if (placement !== null) {
        bestBoard = { boardIdx: activeBoards.length - 1, placement };
      }
    }

    if (bestBoard !== null) {
      const ab = activeBoards[bestBoard.boardIdx];
      const placement = bestBoard.placement;
      const rect = ab.freeRects[placement.rectIndex];

      const placedWidth = placement.rotated
        ? piece.dimensions.width
        : piece.dimensions.length;
      const placedHeight = placement.rotated
        ? piece.dimensions.length
        : piece.dimensions.width;

      const effPlacedWidth = placement.rotated ? effDims.height : effDims.width;
      const effPlacedHeight = placement.rotated ? effDims.width : effDims.height;

      const placedPiece: PlacedPiece = {
        pieceId: piece.id,
        instanceIndex,
        x: rect.x,
        y: rect.y,
        width: placedWidth,
        height: placedHeight,
        rotated: placement.rotated,
        label: piece.label,
        color: piece.color,
      };

      ab.pieces.push(placedPiece);

      // Split the free rect and replace it
      const newRects = splitFreeRect(rect, effPlacedWidth, effPlacedHeight);
      ab.freeRects.splice(placement.rectIndex, 1, ...newRects);
    } else {
      unplacedPieces.push({ pieceId: piece.id, instanceIndex });
    }
  }

  // Build final board layouts (only boards that have pieces)
  const boardLayouts: BoardLayout[] = activeBoards
    .filter((ab) => ab.pieces.length > 0)
    .map((ab) => {
      const boardArea = ab.width * ab.height;
      const usedArea = ab.pieces.reduce(
        (sum, p) => sum + p.width * p.height,
        0
      );
      const wasteArea = boardArea - usedArea;
      const utilizationPercent =
        boardArea > 0 ? (usedArea / boardArea) * 100 : 0;

      const waste: WasteRegion[] = ab.freeRects.map((r) => ({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
      }));

      return {
        boardId: ab.boardId,
        instanceIndex: ab.instanceIndex,
        width: ab.width,
        height: ab.height,
        pieces: ab.pieces,
        waste,
        usedArea,
        wasteArea,
        utilizationPercent,
      };
    });

  // Build summary
  const totalArea = boardLayouts.reduce(
    (sum, bl) => sum + bl.width * bl.height,
    0
  );
  const usedArea = boardLayouts.reduce((sum, bl) => sum + bl.usedArea, 0);
  const wasteArea = totalArea - usedArea;
  const wastePercentage = totalArea > 0 ? (wasteArea / totalArea) * 100 : 0;
  const placedPieces = totalPieceInstances - unplacedPieces.length;

  return {
    boards: boardLayouts,
    unplacedPieces,
    summary: {
      totalBoards: boardLayouts.length,
      totalPieces: totalPieceInstances,
      placedPieces,
      totalArea,
      usedArea,
      wasteArea,
      wastePercentage,
    },
  };
}
