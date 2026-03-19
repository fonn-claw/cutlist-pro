'use client';

import { useState } from 'react';
import type { CutPiece } from '@/lib/types';
import { useUnits } from '@/contexts/UnitContext';
import { parseBulkInput } from '@/lib/cut-operations';

interface BulkAddFormProps {
  onBulkAdd: (pieces: Omit<CutPiece, 'id' | 'color'>[]) => void;
}

export function BulkAddForm({ onBulkAdd }: BulkAddFormProps) {
  const { units } = useUnits();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const result = parseBulkInput(text, units);
    setErrors(result.errors);

    if (result.pieces.length > 0) {
      const piecesWithGrain = result.pieces.map(p => ({
        ...p,
        grainDirection: false,
      }));
      onBulkAdd(piecesWithGrain);
      setSuccessCount(result.pieces.length);
      setText('');
      setTimeout(() => setSuccessCount(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={text}
        onChange={e => {
          setText(e.target.value);
          setErrors([]);
          setSuccessCount(null);
        }}
        placeholder={`Paste cut list (one per line):\nlength, width, quantity, label\n\nExample:\n24, 12, 2, Shelf\n36, 6, 4, Rail`}
        className="w-full p-2 rounded bg-surface-alt border border-border text-text-primary text-sm h-32 resize-y"
      />
      {errors.length > 0 && (
        <div className="mt-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-500">{err}</p>
          ))}
        </div>
      )}
      {successCount !== null && (
        <p className="text-xs text-green-500 mt-1">{successCount} pieces added</p>
      )}
      <button
        type="submit"
        disabled={!text.trim()}
        className="w-full mt-2 bg-accent text-surface font-medium px-4 py-2 rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Pieces
      </button>
    </form>
  );
}
