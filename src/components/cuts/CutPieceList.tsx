'use client';

import { useState } from 'react';
import type { CutPiece } from '@/lib/types';
import { CutPieceEntry } from '@/components/cuts/CutPieceEntry';

interface CutPieceListProps {
  pieces: CutPiece[];
  onUpdate: (id: string, updates: Partial<Omit<CutPiece, 'id'>>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function CutPieceList({ pieces, onUpdate, onRemove, onDuplicate }: CutPieceListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (pieces.length === 0) {
    return (
      <p className="text-sm text-text-secondary italic">
        No cut pieces added yet. Add one above or use bulk add.
      </p>
    );
  }

  return (
    <div>
      {pieces.map(piece => (
        <CutPieceEntry
          key={piece.id}
          piece={piece}
          isEditing={editingId === piece.id}
          onStartEdit={() => setEditingId(piece.id)}
          onSave={updates => {
            onUpdate(piece.id, updates);
            setEditingId(null);
          }}
          onCancelEdit={() => setEditingId(null)}
          onRemove={() => {
            onRemove(piece.id);
            if (editingId === piece.id) setEditingId(null);
          }}
          onDuplicate={() => onDuplicate(piece.id)}
        />
      ))}
    </div>
  );
}
