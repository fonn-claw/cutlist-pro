'use client';

import { useState } from 'react';
import type { CutPiece } from '@/lib/types';
import { useUnits } from '@/contexts/UnitContext';
import { toInternal } from '@/lib/units';

interface CutPieceFormProps {
  onAdd: (piece: Omit<CutPiece, 'id' | 'color'>) => void;
}

function isValidDimension(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

function isValidQuantity(value: string): boolean {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 1;
}

export function CutPieceForm({ onAdd }: CutPieceFormProps) {
  const { units } = useUnits();
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [label, setLabel] = useState('');
  const [grainDirection, setGrainDirection] = useState(false);

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
      label: label.trim(),
      grainDirection,
    });

    setLength('');
    setWidth('');
    setQuantity('1');
    setLabel('');
    setGrainDirection(false);
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
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
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
        <div className="flex-1">
          <label className="text-xs text-text-secondary block mb-1">Label (optional)</label>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="e.g. Shelf"
            className="w-full p-2 rounded bg-surface-alt border border-border text-text-primary text-sm"
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={grainDirection}
            onChange={e => setGrainDirection(e.target.checked)}
            className="rounded border-border"
          />
          Has grain (no rotation)
        </label>
      </div>
      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-accent text-surface font-medium px-4 py-2 rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Piece
      </button>
    </form>
  );
}
