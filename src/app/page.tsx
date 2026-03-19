'use client';

import { useState, useCallback } from 'react';
import type { Board, CutPiece } from '@/lib/types';
import { addBoard, updateBoard, removeBoard } from '@/lib/board-operations';
import { addCutPiece, updateCutPiece, removeCutPiece, duplicateCutPiece } from '@/lib/cut-operations';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainArea } from '@/components/layout/MainArea';
import { BoardPresets } from '@/components/boards/BoardPresets';
import { BoardForm } from '@/components/boards/BoardForm';
import { BoardList } from '@/components/boards/BoardList';
import { CutPieceForm } from '@/components/cuts/CutPieceForm';
import { CutPieceList } from '@/components/cuts/CutPieceList';
import { BulkAddForm } from '@/components/cuts/BulkAddForm';

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [prefilledLength, setPrefilledLength] = useState<number | undefined>();
  const [prefilledWidth, setPrefilledWidth] = useState<number | undefined>();
  const [cutPieces, setCutPieces] = useState<CutPiece[]>([]);
  const [cutInputMode, setCutInputMode] = useState<'single' | 'bulk'>('single');

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

  const handleAddCutPiece = useCallback((piece: Omit<CutPiece, 'id' | 'color'>) => {
    setCutPieces(prev => addCutPiece(prev, piece));
  }, []);

  const handleUpdateCutPiece = useCallback((id: string, updates: Partial<Omit<CutPiece, 'id'>>) => {
    setCutPieces(prev => updateCutPiece(prev, id, updates));
  }, []);

  const handleRemoveCutPiece = useCallback((id: string) => {
    setCutPieces(prev => removeCutPiece(prev, id));
  }, []);

  const handleDuplicateCutPiece = useCallback((id: string) => {
    setCutPieces(prev => duplicateCutPiece(prev, id));
  }, []);

  const handleBulkAddCutPieces = useCallback((pieces: Omit<CutPiece, 'id' | 'color'>[]) => {
    setCutPieces(prev => pieces.reduce((acc, p) => addCutPiece(acc, p), prev));
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
          <div className="border-t border-border my-4 pt-4">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Cut Pieces</h3>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setCutInputMode('single')}
                className={`text-xs px-2 py-1 rounded ${cutInputMode === 'single' ? 'bg-accent text-surface' : 'bg-surface-alt text-text-secondary border border-border'}`}
              >
                Single Add
              </button>
              <button
                onClick={() => setCutInputMode('bulk')}
                className={`text-xs px-2 py-1 rounded ${cutInputMode === 'bulk' ? 'bg-accent text-surface' : 'bg-surface-alt text-text-secondary border border-border'}`}
              >
                Bulk Add
              </button>
            </div>
            {cutInputMode === 'single' ? (
              <CutPieceForm onAdd={handleAddCutPiece} />
            ) : (
              <BulkAddForm onBulkAdd={handleBulkAddCutPieces} />
            )}
            <CutPieceList
              pieces={cutPieces}
              onUpdate={handleUpdateCutPiece}
              onRemove={handleRemoveCutPiece}
              onDuplicate={handleDuplicateCutPiece}
            />
          </div>
        </Sidebar>
        <MainArea />
      </div>
    </div>
  );
}
