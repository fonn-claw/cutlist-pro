'use client';

import { useUnits } from '@/contexts/UnitContext';
import { toDisplay, toInternal } from '@/lib/units';

interface KerfInputProps {
  kerfMm: number;
  onKerfChange: (mm: number) => void;
}

export function KerfInput({ kerfMm, onKerfChange }: KerfInputProps) {
  const { units } = useUnits();
  const displayValue = toDisplay(kerfMm, units);
  const step = units === 'imperial' ? 0.0625 : 0.5;
  const unitLabel = units === 'imperial' ? 'in' : 'mm';

  return (
    <div>
      <label className="text-xs text-text-secondary block mb-1">
        Kerf (blade width)
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step={step}
          min={0}
          value={Math.round(displayValue * 10000) / 10000}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0) {
              onKerfChange(toInternal(val, units));
            }
          }}
          className="w-full px-2 py-1.5 text-sm bg-surface border border-border rounded text-text-primary"
        />
        <span className="text-xs text-text-secondary whitespace-nowrap">{unitLabel}</span>
      </div>
    </div>
  );
}
