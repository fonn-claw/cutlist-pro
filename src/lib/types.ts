export type UnitSystem = 'imperial' | 'metric';

export interface Dimensions {
  length: number; // always in mm
  width: number;  // always in mm
}

export interface Board {
  id: string;
  dimensions: Dimensions;
  quantity: number;
}

export interface CutPiece {
  id: string;
  dimensions: Dimensions;
  quantity: number;
  label: string;
  color: string;
  grainDirection: boolean; // true = has grain, cannot rotate
}

export interface Settings {
  units: UnitSystem;
  kerf: number; // in mm
}

export interface PlacedPiece {
  pieceId: string;        // original CutPiece.id
  instanceIndex: number;  // which instance of this piece (0-based)
  x: number;              // mm from board left edge
  y: number;              // mm from board top edge
  width: number;          // as-placed dimension (may differ from original if rotated)
  height: number;         // as-placed dimension
  rotated: boolean;
  label: string;
  color: string;
}

export interface WasteRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoardLayout {
  boardId: string;          // original Board.id
  instanceIndex: number;    // which instance of this board type
  width: number;            // board dimensions in mm
  height: number;
  pieces: PlacedPiece[];
  waste: WasteRegion[];     // unused areas for visualization
  usedArea: number;         // mm^2
  wasteArea: number;        // mm^2
  utilizationPercent: number; // 0-100
}

export interface OptimizationResult {
  boards: BoardLayout[];
  unplacedPieces: Array<{ pieceId: string; instanceIndex: number }>;
  summary: {
    totalBoards: number;
    totalPieces: number;
    placedPieces: number;
    totalArea: number;
    usedArea: number;
    wasteArea: number;
    wastePercentage: number;
  };
}
