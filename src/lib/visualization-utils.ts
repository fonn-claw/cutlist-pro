/**
 * Visualization utility functions for SVG cutting diagrams.
 */

/**
 * Calculate contrasting text color (black or white) for a given background hex color.
 * Uses relative luminance formula to determine readability.
 */
export function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Calculate SVG viewBox string with padding around a board.
 */
export function calculateViewBox(
  boardWidth: number,
  boardHeight: number,
  padding: number = 20
): string {
  return `${-padding} ${-padding} ${boardWidth + padding * 2} ${boardHeight + padding * 2}`;
}
