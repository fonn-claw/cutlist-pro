export interface SlideOffset {
  dx: number;
  dy: number;
}

export function computeSlideOrigin(
  piece: { x: number; y: number; width: number; height: number },
  boardWidth: number,
  boardHeight: number,
  slideDistance = 80
): SlideOffset {
  const cx = piece.x + piece.width / 2;
  const cy = piece.y + piece.height / 2;
  const distances = [
    { dx: -slideDistance, dy: 0, d: cx },                    // left
    { dx: slideDistance, dy: 0, d: boardWidth - cx },        // right
    { dx: 0, dy: -slideDistance, d: cy },                    // top
    { dx: 0, dy: slideDistance, d: boardHeight - cy },       // bottom
  ];
  const nearest = distances.reduce((min, cur) => cur.d < min.d ? cur : min);
  return { dx: nearest.dx, dy: nearest.dy };
}

export function sortPiecesForAnimation<T extends { width: number; height: number }>(
  pieces: T[]
): T[] {
  return [...pieces].sort((a, b) => (b.width * b.height) - (a.width * a.height));
}

export function computeStaggerDelay(
  pieceCount: number,
  maxBoardDuration = 1500,
  minDelay = 30,
  maxDelay = 100
): number {
  if (pieceCount <= 1) return 0;
  const computed = Math.floor(maxBoardDuration / pieceCount);
  return Math.max(minDelay, Math.min(maxDelay, computed));
}
