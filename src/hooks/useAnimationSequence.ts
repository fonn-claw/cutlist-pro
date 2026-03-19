'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { sortPiecesForAnimation, computeStaggerDelay } from '@/lib/animation-utils';
import type { BoardLayout } from '@/lib/types';

export type AnimationPhase = 'idle' | 'playing' | 'complete';

export interface UseAnimationSequenceReturn {
  phase: AnimationPhase;
  activePieceKeys: Set<string>;
  wasteVisible: boolean;
  skipToEnd: () => void;
}

function pieceKey(piece: { pieceId: string; instanceIndex: number }): string {
  return `${piece.pieceId}-${piece.instanceIndex}`;
}

function getAllPieceKeys(boards: BoardLayout[]): Set<string> {
  const keys = new Set<string>();
  for (const board of boards) {
    for (const piece of board.pieces) {
      keys.add(pieceKey(piece));
    }
  }
  return keys;
}

export function useAnimationSequence(
  boards: BoardLayout[] | null,
  resultKey: number
): UseAnimationSequenceReturn {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [activePieceKeys, setActivePieceKeys] = useState<Set<string>>(new Set());
  const [wasteVisible, setWasteVisible] = useState(false);
  const timersRef = useRef<number[]>([]);
  const skippedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const skipToEnd = useCallback(() => {
    clearTimers();
    skippedRef.current = true;
    if (boards && boards.length > 0) {
      setActivePieceKeys(getAllPieceKeys(boards));
      setWasteVisible(true);
      setPhase('complete');
    }
  }, [boards, clearTimers]);

  useEffect(() => {
    // Reset skip flag for new animation
    skippedRef.current = false;

    if (!boards || boards.length === 0) {
      setPhase('idle');
      setActivePieceKeys(new Set());
      setWasteVisible(false);
      return;
    }

    // Clear previous timers
    clearTimers();

    // Start playing
    setPhase('playing');
    setActivePieceKeys(new Set());
    setWasteVisible(false);

    const TRANSITION_DURATION = 400; // ms, matches CSS transition
    const INTER_BOARD_PAUSE = 200;   // ms between boards
    const WASTE_DELAY = 200;         // ms after last piece before waste
    const COMPLETE_DELAY = 500;      // ms after waste before 'complete'

    // Build stagger schedule
    let boardStartTime = 0;

    for (let boardIdx = 0; boardIdx < boards.length; boardIdx++) {
      const board = boards[boardIdx];
      const sorted = sortPiecesForAnimation(board.pieces);
      const staggerDelay = computeStaggerDelay(sorted.length);

      for (let pieceIdx = 0; pieceIdx < sorted.length; pieceIdx++) {
        const key = pieceKey(sorted[pieceIdx]);
        const absoluteDelay = boardStartTime + pieceIdx * staggerDelay;

        const timer = window.setTimeout(() => {
          if (skippedRef.current) return;
          setActivePieceKeys((prev) => new Set([...prev, key]));
        }, absoluteDelay);
        timersRef.current.push(timer);
      }

      // Next board starts after last piece finishes its transition + pause
      const lastPieceDelay = boardStartTime + (sorted.length - 1) * staggerDelay;
      boardStartTime = lastPieceDelay + TRANSITION_DURATION + INTER_BOARD_PAUSE;
    }

    // Waste fade-in after all boards complete
    const wasteTimer = window.setTimeout(() => {
      if (skippedRef.current) return;
      setWasteVisible(true);
    }, boardStartTime - INTER_BOARD_PAUSE + WASTE_DELAY);
    timersRef.current.push(wasteTimer);

    // Phase complete after waste fade
    const completeTimer = window.setTimeout(() => {
      if (skippedRef.current) return;
      setPhase('complete');
    }, boardStartTime - INTER_BOARD_PAUSE + WASTE_DELAY + COMPLETE_DELAY);
    timersRef.current.push(completeTimer);

    // Two-phase mount: wrap in rAF so browser paints offset positions first
    // The timers above are already deferred via setTimeout, ensuring the initial
    // render with empty activePieceKeys paints before the first piece activates.
    // We use rAF as an additional safety measure for the first frame.
    const rafId = requestAnimationFrame(() => {
      // No-op: ensures browser has painted the initial offset state.
      // The setTimeout chain is already running and will fire after this frame.
    });

    return () => {
      clearTimers();
      cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey]);

  return { phase, activePieceKeys, wasteVisible, skipToEnd };
}
