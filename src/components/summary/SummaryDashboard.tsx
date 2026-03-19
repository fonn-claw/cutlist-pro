'use client';

import type { Board, OptimizationResult } from '@/lib/types';
import { computeSummaryStats } from '@/lib/summary-utils';
import { BoardBreakdownList } from '@/components/summary/BoardBreakdownList';
import { CostEstimateInput } from '@/components/summary/CostEstimateInput';

interface SummaryDashboardProps {
  boards: Board[];
  result: OptimizationResult;
}

function wasteColor(percent: number): string {
  if (percent < 10) return 'text-green-400';
  if (percent <= 25) return 'text-amber-400';
  return 'text-red-400';
}

export function SummaryDashboard({ boards, result }: SummaryDashboardProps) {
  const stats = computeSummaryStats(boards, result);

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-3">Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-text-secondary">Boards Used</div>
          <div className="text-xl font-bold text-text-primary">
            {stats.boardsNeeded} / {stats.boardsAvailable}
          </div>
        </div>
        <div>
          <div className="text-text-secondary">Pieces Placed</div>
          <div className="text-xl font-bold text-text-primary">
            {result.summary.placedPieces} / {result.summary.totalPieces}
          </div>
        </div>
        <div>
          <div className="text-text-secondary">Overall Waste</div>
          <div className={`text-xl font-bold ${wasteColor(stats.overallWastePercent)}`}>
            {stats.overallWastePercent.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-text-secondary">Utilization</div>
          <div className="text-xl font-bold text-accent">
            {(100 - stats.overallWastePercent).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-4 pt-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Per-Board Breakdown</h3>
        <BoardBreakdownList breakdowns={stats.boardBreakdowns} />
      </div>

      <div className="border-t border-border mt-4 pt-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Cost Estimate</h3>
        <CostEstimateInput boardsNeeded={stats.boardsNeeded} />
      </div>
    </div>
  );
}
