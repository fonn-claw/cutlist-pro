'use client';

import type { BoardBreakdown } from '@/lib/summary-utils';
import { useUnits } from '@/contexts/UnitContext';
import { formatDimension } from '@/lib/units';

interface BoardBreakdownListProps {
  breakdowns: BoardBreakdown[];
}

export function BoardBreakdownList({ breakdowns }: BoardBreakdownListProps) {
  const { units } = useUnits();

  if (breakdowns.length === 0) return null;

  return (
    <div>
      {breakdowns.map((breakdown, i) => (
        <div
          key={`${breakdown.boardId}-${breakdown.instanceIndex}`}
          className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
        >
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-primary font-medium">Board {i + 1}</span>
            <span className="text-text-secondary text-xs">
              {formatDimension(breakdown.widthMm, units)} x {formatDimension(breakdown.heightMm, units)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-text-secondary">{breakdown.pieceCount} pieces</span>
            <span className="text-text-secondary">{breakdown.wastePercent.toFixed(1)}% waste</span>
            <div className="w-20 h-2 rounded-full bg-surface-alt overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${100 - breakdown.wastePercent}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
