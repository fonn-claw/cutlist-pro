'use client';

import type { PlacedPiece, UnitSystem } from '@/lib/types';
import { formatDimension } from '@/lib/units';

interface PieceTooltipProps {
  piece: PlacedPiece;
  x: number;
  y: number;
  units: UnitSystem;
}

export function PieceTooltip({ piece, x, y, units }: PieceTooltipProps) {
  // Viewport boundary checks
  const flippedX = typeof window !== 'undefined' && x + 200 > window.innerWidth;
  const flippedY = typeof window !== 'undefined' && y - 60 < 0;

  const left = flippedX ? x - 200 : x + 12;
  const top = flippedY ? y + 20 : y - 12;

  return (
    <div
      className="fixed z-50 bg-surface border border-border rounded px-3 py-2 shadow-lg text-sm pointer-events-none"
      style={{ left, top }}
    >
      <div className="font-semibold text-text-primary">
        {piece.label || 'Unnamed piece'}
      </div>
      <div className="text-text-secondary">
        {formatDimension(piece.width, units)} x {formatDimension(piece.height, units)}
      </div>
      {piece.rotated && (
        <div className="text-xs text-accent">Rotated 90&deg;</div>
      )}
    </div>
  );
}
