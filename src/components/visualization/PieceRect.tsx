'use client';

import type { PlacedPiece, UnitSystem } from '@/lib/types';
import { formatDimension } from '@/lib/units';
import { getContrastTextColor } from '@/lib/visualization-utils';

interface PieceRectProps {
  piece: PlacedPiece;
  units: UnitSystem;
  animated?: boolean;
  slideFrom?: { dx: number; dy: number };
  skipMode?: boolean;
  onMouseEnter?: (e: React.MouseEvent, piece: PlacedPiece) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

export function PieceRect({ piece, units, animated, slideFrom, skipMode, onMouseEnter, onMouseMove, onMouseLeave }: PieceRectProps) {
  const showLabel = piece.width >= 40 && piece.height >= 20;
  const fontSize = Math.min(piece.width / 8, piece.height / 3, 12);
  const textColor = getContrastTextColor(piece.color);
  const centerX = piece.x + piece.width / 2;
  const centerY = piece.y + piece.height / 2;

  const hasAnimation = animated !== undefined && slideFrom !== undefined;
  const translateX = hasAnimation ? (animated ? 0 : slideFrom.dx) : 0;
  const translateY = hasAnimation ? (animated ? 0 : slideFrom.dy) : 0;
  const opacity = hasAnimation ? (animated ? 1 : 0) : 1;

  return (
    <g style={{
      transform: `translate(${translateX}px, ${translateY}px)`,
      opacity,
      transition: skipMode ? 'none' : 'transform 400ms ease-out, opacity 300ms ease-out',
      willChange: hasAnimation && !animated ? 'transform, opacity' : 'auto',
    }}>
      <rect
        x={piece.x}
        y={piece.y}
        width={piece.width}
        height={piece.height}
        fill={piece.color}
        fillOpacity={0.7}
        stroke={piece.color}
        strokeWidth={1}
        cursor="pointer"
        onMouseEnter={(e) => onMouseEnter?.(e, piece)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      {showLabel && (
        <>
          <text
            x={centerX}
            y={centerY - fontSize * 0.3}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            fontSize={fontSize}
          >
            {piece.label}
          </text>
          <text
            x={centerX}
            y={centerY + fontSize * 0.8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            fillOpacity={0.8}
            fontSize={fontSize * 0.75}
          >
            {formatDimension(piece.width, units)} x {formatDimension(piece.height, units)}
          </text>
        </>
      )}
    </g>
  );
}
