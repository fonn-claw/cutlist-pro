'use client';

import { useState, useCallback } from 'react';
import type { OptimizationResult } from '@/lib/types';
import { useAnimationSequence } from '@/hooks/useAnimationSequence';
import { BoardDiagram } from './BoardDiagram';

interface CuttingDiagramListProps {
  result: OptimizationResult;
  resultKey: number;
}

export function CuttingDiagramList({ result, resultKey }: CuttingDiagramListProps) {
  const activeBoards = result.boards.filter(b => b.pieces.length > 0);
  const { phase, activePieceKeys, wasteVisible, skipToEnd } = useAnimationSequence(
    activeBoards.length > 0 ? activeBoards : null,
    resultKey
  );

  const [skipMode, setSkipMode] = useState(false);

  const handleSkip = useCallback(() => {
    if (phase !== 'playing') return;
    setSkipMode(true);
    skipToEnd();
    requestAnimationFrame(() => setSkipMode(false));
  }, [phase, skipToEnd]);

  return (
    <div
      className="space-y-6"
      onClick={handleSkip}
      style={{ cursor: phase === 'playing' ? 'pointer' : undefined }}
    >
      {activeBoards.map((layout, index) => (
        <BoardDiagram
          key={`${layout.boardId}-${layout.instanceIndex}`}
          layout={layout}
          boardIndex={index}
          totalBoards={activeBoards.length}
          activePieceKeys={activePieceKeys}
          wasteVisible={wasteVisible}
          animPhase={phase}
          skipMode={skipMode}
        />
      ))}
    </div>
  );
}
