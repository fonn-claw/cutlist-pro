export interface BoardPreset {
  name: string;
  lengthIn: number;  // Actual length in inches
  widthIn: number;   // Actual width in inches
}

export const BOARD_PRESETS: BoardPreset[] = [
  { name: '4x8 Plywood', lengthIn: 96, widthIn: 48 },
  { name: '1x6', lengthIn: 96, widthIn: 5.5 },
  { name: '1x8', lengthIn: 96, widthIn: 7.25 },
  { name: '1x10', lengthIn: 96, widthIn: 9.25 },
  { name: '1x12', lengthIn: 96, widthIn: 11.25 },
  { name: '2x4', lengthIn: 96, widthIn: 3.5 },
  { name: '2x6', lengthIn: 96, widthIn: 5.5 },
  { name: '2x8', lengthIn: 96, widthIn: 7.5 },
  { name: '2x10', lengthIn: 96, widthIn: 9.25 },
  { name: '2x12', lengthIn: 96, widthIn: 11.25 },
];
