'use client';

import { useState } from 'react';
import { computeCostEstimate } from '@/lib/summary-utils';

interface CostEstimateInputProps {
  boardsNeeded: number;
}

export function CostEstimateInput({ boardsNeeded }: CostEstimateInputProps) {
  const [pricePerBoard, setPricePerBoard] = useState<string>('');

  const parsed = parseFloat(pricePerBoard);
  const costEstimate = computeCostEstimate(boardsNeeded, isNaN(parsed) ? undefined : parsed);

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-text-secondary whitespace-nowrap">
        Price per Board
      </label>
      <div className="flex items-center gap-1">
        <span className="text-text-secondary text-sm">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={pricePerBoard}
          onChange={(e) => setPricePerBoard(e.target.value)}
          placeholder="0.00"
          className="w-20 px-2 py-1.5 text-sm bg-surface-alt border border-border rounded text-text-primary"
        />
      </div>
      {costEstimate && (
        <div className="text-sm text-text-primary font-semibold">
          Estimated Total: ${costEstimate.totalCost.toFixed(2)}
        </div>
      )}
    </div>
  );
}
