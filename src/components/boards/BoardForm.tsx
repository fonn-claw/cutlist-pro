'use client';

import { useState, useEffect } from 'react';
import type { Board } from '@/lib/types';
import { useUnits } from '@/contexts/UnitContext';
import { toInternal, toDisplay } from '@/lib/units';

interface BoardFormProps {
  onAdd: (board: Omit<Board, 'id'>) => void;
  prefilledLength?: number;
  prefilledWidth?: number;
}

function isValidDimension(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

function isValidQuantity(value: string): boolean {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 1;
}

export function BoardForm({ onAdd, prefilledLength, prefilledWidth }: BoardFormProps) {
  const { units } = useUnits();
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (prefilledLength !== undefined) {
      setLength(String(toDisplay(prefilledLength, units)));
    }
  }, [prefilledLength, units]);

  useEffect(() => {
    if (prefilledWidth !== undefined) {
      setWidth(String(toDisplay(prefilledWidth, units)));
    }
  }, [prefilledWidth, units]);

  const isValid = isValidDimension(length) && isValidDimension(width) && isValidQuantity(quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const lengthMm = toInternal(parseFloat(length), units);
    const widthMm = toInternal(parseFloat(width), units);
    const qty = parseInt(quantity, 10);

    onAdd({
      dimensions: { length: lengthMm, width: widthMm },
      quantity: qty,
    });

    setLength('');
    setWidth('');
    setQuantity('1');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <label className="text-xs text-text-secondary block mb-1">
            Length ({units === 'imperial' ? 'in' : 'mm'})
          </label>
          <input
            type="number"
            min="0.01"
            step="any"
            value={length}
            onChange={e => setLength(e.target.value)}
            placeholder="Length"
            className="w-full p-2 rounded bg-surface-alt border border-border text-text-primary text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-secondary block mb-1">
            Width ({units === 'imperial' ? 'in' : 'mm'})
          </label>
          <input
            type="number"
            min="0.01"
            step="any"
            value={width}
            onChange={e => setWidth(e.target.value)}
            placeholder="Width"
            className="w-full p-2 rounded bg-surface-alt border border-border text-text-primary text-sm"
          />
        </div>
      </div>
      <div className="mb-2">
        <label className="text-xs text-text-secondary block mb-1">Quantity</label>
        <input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-full p-2 rounded bg-surface-alt border border-border text-text-primary text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-accent text-surface font-medium px-4 py-2 rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Board
      </button>
    </form>
  );
}
