'use client';

import { useUnits } from '@/contexts/UnitContext';

export function UnitToggle() {
  const { units, toggleUnits } = useUnits();

  return (
    <button
      onClick={toggleUnits}
      className="px-3 py-1.5 text-sm font-medium rounded-lg
                 text-text-secondary hover:text-text-primary
                 hover:bg-surface-alt transition-colors"
      aria-label={`Switch to ${units === 'imperial' ? 'metric' : 'imperial'} units`}
    >
      {units === 'imperial' ? 'in' : 'mm'}
    </button>
  );
}
