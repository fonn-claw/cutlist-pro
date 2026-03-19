'use client';

import { useState } from 'react';
import type { Board } from '@/lib/types';
import { BoardEntry } from '@/components/boards/BoardEntry';

interface BoardListProps {
  boards: Board[];
  onUpdate: (id: string, updates: Partial<Omit<Board, 'id'>>) => void;
  onRemove: (id: string) => void;
}

export function BoardList({ boards, onUpdate, onRemove }: BoardListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (boards.length === 0) {
    return (
      <p className="text-sm text-text-secondary italic">
        No boards added yet. Use a preset or add one manually.
      </p>
    );
  }

  return (
    <div>
      {boards.map(board => (
        <BoardEntry
          key={board.id}
          board={board}
          isEditing={editingId === board.id}
          onStartEdit={() => setEditingId(board.id)}
          onSave={updates => {
            onUpdate(board.id, updates);
            setEditingId(null);
          }}
          onCancelEdit={() => setEditingId(null)}
          onRemove={() => {
            onRemove(board.id);
            if (editingId === board.id) setEditingId(null);
          }}
        />
      ))}
    </div>
  );
}
