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
