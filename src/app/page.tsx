'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Board, CutPiece, OptimizationResult, Settings } from '@/lib/types';
import { optimizeCutLayout } from '@/lib/optimizer';
import { addBoard, updateBoard, removeBoard } from '@/lib/board-operations';
import { addCutPiece, updateCutPiece, removeCutPiece, duplicateCutPiece } from '@/lib/cut-operations';
import { parseShareUrl } from '@/lib/url-state';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainArea } from '@/components/layout/MainArea';
import { BoardPresets } from '@/components/boards/BoardPresets';
import { BoardForm } from '@/components/boards/BoardForm';
import { BoardList } from '@/components/boards/BoardList';
import { CutPieceForm } from '@/components/cuts/CutPieceForm';
import { CutPieceList } from '@/components/cuts/CutPieceList';
import { BulkAddForm } from '@/components/cuts/BulkAddForm';
import { KerfInput } from '@/components/settings/KerfInput';
import { CuttingDiagramList } from '@/components/visualization/CuttingDiagramList';
import { SummaryDashboard } from '@/components/summary/SummaryDashboard';
import { ExportToolbar } from '@/components/export/ExportToolbar';

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [prefilledLength, setPrefilledLength] = useState<number | undefined>();
  const [prefilledWidth, setPrefilledWidth] = useState<number | undefined>();
  const [cutPieces, setCutPieces] = useState<CutPiece[]>([]);
  const [cutInputMode, setCutInputMode] = useState<'single' | 'bulk'>('single');
  const [kerf, setKerf] = useState<number>(3.175);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [resultKey, setResultKey] = useState(0);

  const canOptimize = boards.length > 0 && cutPieces.length > 0;

  const handleOptimize = useCallback(() => {
    const settings: Settings = { units: 'metric', kerf };
    const result = optimizeCutLayout(boards, cutPieces, settings);
    setOptimizationResult(result);
    setResultKey(prev => prev + 1);
  }, [boards, cutPieces, kerf]);

  const handleKerfChange = useCallback((newKerf: number) => {
    setKerf(newKerf);
    setOptimizationResult(null);
  }, []);

  const handleAdd = useCallback((board: Omit<Board, 'id'>) => {
    setOptimizationResult(null);
    setBoards(prev => addBoard(prev, board));
    setPrefilledLength(undefined);
    setPrefilledWidth(undefined);
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Omit<Board, 'id'>>) => {
    setOptimizationResult(null);
    setBoards(prev => updateBoard(prev, id, updates));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setOptimizationResult(null);
    setBoards(prev => removeBoard(prev, id));
  }, []);

  const handlePresetSelect = useCallback((lengthMm: number, widthMm: number) => {
    setPrefilledLength(lengthMm);
    setPrefilledWidth(widthMm);
  }, []);

  const handleAddCutPiece = useCallback((piece: Omit<CutPiece, 'id' | 'color'>) => {
    setOptimizationResult(null);
    setCutPieces(prev => addCutPiece(prev, piece));
  }, []);

  const handleUpdateCutPiece = useCallback((id: string, updates: Partial<Omit<CutPiece, 'id'>>) => {
    setOptimizationResult(null);
    setCutPieces(prev => updateCutPiece(prev, id, updates));
  }, []);

  const handleRemoveCutPiece = useCallback((id: string) => {
    setOptimizationResult(null);
    setCutPieces(prev => removeCutPiece(prev, id));
  }, []);

  const handleDuplicateCutPiece = useCallback((id: string) => {
    setOptimizationResult(null);
    setCutPieces(prev => duplicateCutPiece(prev, id));
  }, []);

  const handleBulkAddCutPieces = useCallback((pieces: Omit<CutPiece, 'id' | 'color'>[]) => {
    setOptimizationResult(null);
    setCutPieces(prev => pieces.reduce((acc, p) => addCutPiece(acc, p), prev));
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#state=')) {
      const state = parseShareUrl(window.location.href);
      if (state) {
        const restoredBoards = state.boards.map(b => ({
          id: crypto.randomUUID(),
          dimensions: b.dimensions,
          quantity: b.quantity,
        }));
        const restoredPieces = state.pieces.map(p => ({
          id: crypto.randomUUID(),
          dimensions: p.dimensions,
          quantity: p.quantity,
          label: p.label,
          color: p.color,
          grainDirection: p.grainDirection,
        }));
        setBoards(restoredBoards);
        setCutPieces(restoredPieces);
        setKerf(state.kerf);
        const settings: Settings = { units: 'metric', kerf: state.kerf };
        const result = optimizeCutLayout(restoredBoards, restoredPieces, settings);
        setOptimizationResult(result);
        setResultKey(prev => prev + 1);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
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
            <h3 className="text-sm font-semibold text-text-primary mb-2">Settings</h3>
            <KerfInput kerfMm={kerf} onKerfChange={handleKerfChange} />
          </div>
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
          <div className="border-t border-border my-4 pt-4">
            <button
              onClick={handleOptimize}
              disabled={!canOptimize}
              className="w-full py-2.5 px-4 rounded font-semibold text-sm bg-accent text-surface hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Optimize Layout
            </button>
          </div>
        </Sidebar>
        <MainArea>
          {optimizationResult && (
            <div className="space-y-4">
              <SummaryDashboard boards={boards} result={optimizationResult} />
              <ExportToolbar boards={boards} pieces={cutPieces} kerf={kerf} />
              {optimizationResult.unplacedPieces.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                  Warning: {optimizationResult.unplacedPieces.length} piece(s) could not be placed. Check that your boards are large enough.
                </div>
              )}
              <div id="cutting-diagrams">
                <CuttingDiagramList result={optimizationResult} resultKey={resultKey} />
              </div>
            </div>
          )}
        </MainArea>
      </div>
    </div>
  );
}
