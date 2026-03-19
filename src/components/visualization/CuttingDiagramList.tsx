'use client';

import type { OptimizationResult } from '@/lib/types';
import { BoardDiagram } from './BoardDiagram';

interface CuttingDiagramListProps {
  result: OptimizationResult;
}

export function CuttingDiagramList({ result }: CuttingDiagramListProps) {
  const activeBoards = result.boards.filter(b => b.pieces.length > 0);

  return (
    <div className="space-y-6">
      {activeBoards.map((layout, index) => (
        <BoardDiagram
          key={`${layout.boardId}-${layout.instanceIndex}`}
          layout={layout}
          boardIndex={index}
          totalBoards={activeBoards.length}
        />
      ))}
    </div>
  );
}
