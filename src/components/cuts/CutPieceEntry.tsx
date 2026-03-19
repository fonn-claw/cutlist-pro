'use client';

import { useState } from 'react';
import type { CutPiece } from '@/lib/types';
import { useUnits } from '@/contexts/UnitContext';
import { formatDimension, toDisplay, toInternal } from '@/lib/units';
import { ColorSwatch } from '@/components/cuts/ColorSwatch';

interface CutPieceEntryProps {
  piece: CutPiece;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (updates: Partial<Omit<CutPiece, 'id'>>) => void;
  onCancelEdit: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export function CutPieceEntry({
  piece,
  isEditing,
  onStartEdit,
  onSave,
  onCancelEdit,
  onRemove,
  onDuplicate,
}: CutPieceEntryProps) {
  const { units } = useUnits();
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [quantity, setQuantity] = useState('');
  const [label, setLabel] = useState('');
  const [grainDirection, setGrainDirection] = useState(false);
  const [editColor, setEditColor] = useState('');

  const startEdit = () => {
    setLength(String(toDisplay(piece.dimensions.length, units)));
    setWidth(String(toDisplay(piece.dimensions.width, units)));
    setQuantity(String(piece.quantity));
    setLabel(piece.label);
    setGrainDirection(piece.grainDirection);
    setEditColor(piece.color);
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
      label: label.trim(),
      grainDirection,
      color: editColor,
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
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
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
          <div className="flex-1">
            <label className="text-xs text-text-secondary block mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full p-1.5 rounded bg-surface border border-border text-text-primary text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={grainDirection}
              onChange={e => setGrainDirection(e.target.checked)}
              className="rounded border-border"
            />
            Has grain
          </label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-text-secondary">Color:</span>
            <ColorSwatch value={editColor} onChange={setEditColor} />
          </div>
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
      className="p-3 rounded border border-border bg-surface-alt mb-2 cursor-pointer hover:border-accent flex items-center gap-2"
      onClick={startEdit}
    >
      <ColorSwatch
        value={piece.color}
        onChange={(color) => onSave({ color })}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-primary">
            {formatDimension(piece.dimensions.length, units)} x {formatDimension(piece.dimensions.width, units)}
          </span>
          <span className="text-xs text-text-secondary">qty: {piece.quantity}</span>
          {piece.grainDirection && (
            <span className="text-xs text-text-secondary italic">grain</span>
          )}
        </div>
        {piece.label && (
          <span className="text-xs text-text-secondary block truncate">{piece.label}</span>
        )}
      </div>
      <button
        onClick={e => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="text-text-secondary hover:text-accent text-sm px-1"
        aria-label="Duplicate piece"
      >
        +
      </button>
      <button
        onClick={e => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-text-secondary hover:text-red-500 text-sm px-1"
        aria-label="Remove piece"
      >
        X
      </button>
    </div>
  );
}
