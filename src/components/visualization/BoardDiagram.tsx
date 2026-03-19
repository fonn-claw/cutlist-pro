'use client';

import type { BoardLayout } from '@/lib/types';
import { formatDimension } from '@/lib/units';
import { calculateViewBox } from '@/lib/visualization-utils';
import { useUnits } from '@/contexts/UnitContext';
import { PieceRect } from './PieceRect';
import { WasteRect } from './WasteRect';

interface BoardDiagramProps {
  layout: BoardLayout;
  boardIndex: number;
  totalBoards: number;
}

export function BoardDiagram({ layout, boardIndex, totalBoards }: BoardDiagramProps) {
  const { units } = useUnits();
  const viewBox = calculateViewBox(layout.width, layout.height);

  return (
    <div>
      <h3 className="text-sm font-medium text-text-primary mb-2">
        Board {boardIndex + 1} of {totalBoards} &mdash;{' '}
        {formatDimension(layout.width, units)} x {formatDimension(layout.height, units)}{' '}
        <span className="text-text-secondary">
          ({layout.utilizationPercent.toFixed(1)}% used)
        </span>
      </h3>
      <div className="overflow-hidden border border-border rounded-lg bg-surface relative">
        <div>
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
              <PieceRect key={`${piece.pieceId}-${piece.instanceIndex}-${i}`} piece={piece} units={units} />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
