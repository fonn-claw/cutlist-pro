/**
 * 10-color palette for cut pieces at Tailwind 500 level.
 * Colors cycle via getNextColor as pieces are added.
 */
export const CUT_PIECE_PALETTE: string[] = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
];

/**
 * Get the next color from the palette, cycling by index.
 */
export function getNextColor(currentCount: number): string {
  return CUT_PIECE_PALETTE[currentCount % CUT_PIECE_PALETTE.length];
}
