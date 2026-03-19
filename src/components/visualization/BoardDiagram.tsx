'use client';

import { useState } from 'react';
import type { BoardLayout, PlacedPiece } from '@/lib/types';
import { formatDimension } from '@/lib/units';
import { calculateViewBox } from '@/lib/visualization-utils';
import { useUnits } from '@/contexts/UnitContext';
import { useZoomPan } from '@/hooks/useZoomPan';
import { PieceRect } from './PieceRect';
import { PieceTooltip } from './PieceTooltip';
import { WasteRect } from './WasteRect';

interface BoardDiagramProps {
  layout: BoardLayout;
  boardIndex: number;
  totalBoards: number;
}

export function BoardDiagram({ layout, boardIndex, totalBoards }: BoardDiagramProps) {
  const { units } = useUnits();
  const viewBox = calculateViewBox(layout.width, layout.height);
  const { zoom, panX, panY, containerRef, handlePointerDown, handlePointerMove, handlePointerUp, reset } = useZoomPan();

  const [tooltip, setTooltip] = useState<{ piece: PlacedPiece; x: number; y: number } | null>(null);

  const handlePieceEnter = (e: React.MouseEvent, piece: PlacedPiece) => {
    setTooltip({ piece, x: e.clientX, y: e.clientY });
  };

  const handlePieceMove = (e: React.MouseEvent) => {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  };

  const handlePieceLeave = () => {
    setTooltip(null);
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-text-primary mb-2">
        Board {boardIndex + 1} of {totalBoards} &mdash;{' '}
        {formatDimension(layout.width, units)} x {formatDimension(layout.height, units)}{' '}
        <span className="text-text-secondary">
          ({layout.utilizationPercent.toFixed(1)}% used)
        </span>
      </h3>
      <div
        ref={containerRef}
        className="overflow-hidden border border-border rounded-lg bg-surface relative"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {zoom > 1 && (
          <button
            onClick={reset}
            className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-surface border border-border rounded hover:bg-surface-alt text-text-secondary"
          >
            Reset Zoom
          </button>
        )}
        <div
          style={{
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: '0 0',
            cursor: zoom > 1 ? 'grab' : 'default',
          }}
        >
          <svg
            viewBox={viewBox}
            className="w-full h-auto"
            style={{ maxHeight: '600px' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern
                id={`waste-hatch-${boardIndex}`}
                patternUnits="userSpaceOnUse"
                width={8}
                height={8}
                patternTransform="rotate(45)"
              >
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={8}
                  style={{ stroke: 'var(--text-secondary)' }}
                  strokeWidth={0.5}
                  strokeOpacity={0.3}
                />
              </pattern>
            </defs>
            <rect
              x={0}
              y={0}
              width={layout.width}
              height={layout.height}
              fill="none"
              className="stroke-border"
              strokeWidth={1}
            />
            {layout.waste.map((region, i) => (
              <WasteRect key={i} region={region} boardIndex={boardIndex} />
            ))}
            {layout.pieces.map((piece, i) => (
              <PieceRect
                key={`${piece.pieceId}-${piece.instanceIndex}-${i}`}
                piece={piece}
                units={units}
                onMouseEnter={handlePieceEnter}
                onMouseMove={handlePieceMove}
                onMouseLeave={handlePieceLeave}
              />
            ))}
          </svg>
        </div>
        {tooltip && (
          <PieceTooltip piece={tooltip.piece} x={tooltip.x} y={tooltip.y} units={units} />
        )}
      </div>
    </div>
  );
}
