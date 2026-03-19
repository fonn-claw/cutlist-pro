'use client';

import { useState } from 'react';
import type { Board } from '@/lib/types';
import { useUnits } from '@/contexts/UnitContext';
import { formatDimension, toDisplay, toInternal } from '@/lib/units';

interface BoardEntryProps {
  board: Board;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (updates: Partial<Omit<Board, 'id'>>) => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}

export function BoardEntry({ board, isEditing, onStartEdit, onSave, onCancelEdit, onRemove }: BoardEntryProps) {
  const { units } = useUnits();
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [quantity, setQuantity] = useState('');

  const startEdit = () => {
    setLength(String(toDisplay(board.dimensions.length, units)));
    setWidth(String(toDisplay(board.dimensions.width, units)));
    setQuantity(String(board.quantity));
    onStartEdit();
  };

  const handleSave = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const q = parseInt(quantity, 10);
    if (isNaN(l) || l <= 0 || isNaN(w) || w <= 0 || isNaN(q) || q < 1) return;

    onSave({
      dimensions: { length: toInternal(l, units), width: toInternal(w, units) },
      quantity: q,
    });
  };

  if (isEditing) {
    return (
      <div className="p-3 rounded border border-accent bg-surface-alt mb-2">
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="text-xs text-text-secondary block mb-1">Length</label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={length}
              onChange={e => setLength(e.target.value)}
              className="w-full p-1.5 rounded bg-surface border border-border text-text-primary text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-text-secondary block mb-1">Width</label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={width}
              onChange={e => setWidth(e.target.value)}
              className="w-full p-1.5 rounded bg-surface border border-border text-text-primary text-sm"
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
            className="w-full p-1.5 rounded bg-surface border border-border text-text-primary text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-accent text-surface text-sm font-medium px-3 py-1.5 rounded hover:bg-amber-600"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 bg-surface text-text-secondary text-sm font-medium px-3 py-1.5 rounded border border-border hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-3 rounded border border-border bg-surface-alt mb-2 cursor-pointer hover:border-accent flex items-center justify-between"
      onClick={startEdit}
    >
      <div>
        <span className="text-sm text-text-primary">
          {formatDimension(board.dimensions.length, units)} x {formatDimension(board.dimensions.width, units)}
        </span>
        <span className="text-xs text-text-secondary ml-2">qty: {board.quantity}</span>
      </div>
      <button
        onClick={e => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-text-secondary hover:text-red-500 text-sm px-1"
        aria-label="Remove board"
      >
        X
      </button>
    </div>
  );
}
