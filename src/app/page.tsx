'use client';

import { useState, useCallback } from 'react';
import type { Board } from '@/lib/types';
import { addBoard, updateBoard, removeBoard } from '@/lib/board-operations';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainArea } from '@/components/layout/MainArea';
import { BoardPresets } from '@/components/boards/BoardPresets';
import { BoardForm } from '@/components/boards/BoardForm';
import { BoardList } from '@/components/boards/BoardList';

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [prefilledLength, setPrefilledLength] = useState<number | undefined>();
  const [prefilledWidth, setPrefilledWidth] = useState<number | undefined>();

  const handleAdd = useCallback((board: Omit<Board, 'id'>) => {
    setBoards(prev => addBoard(prev, board));
    setPrefilledLength(undefined);
    setPrefilledWidth(undefined);
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Omit<Board, 'id'>>) => {
    setBoards(prev => updateBoard(prev, id, updates));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setBoards(prev => removeBoard(prev, id));
  }, []);

  const handlePresetSelect = useCallback((lengthMm: number, widthMm: number) => {
    setPrefilledLength(lengthMm);
    setPrefilledWidth(widthMm);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar>
          <BoardPresets onSelect={handlePresetSelect} />
          <BoardForm
            onAdd={handleAdd}
            prefilledLength={prefilledLength}
            prefilledWidth={prefilledWidth}
          />
          <BoardList
            boards={boards}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
          />
        </Sidebar>
        <MainArea />
      </div>
    </div>
  );
}
