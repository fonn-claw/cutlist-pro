import type { Board } from '@/lib/types';

export function addBoard(boards: Board[], newBoard: Omit<Board, 'id'>): Board[] {
  return [...boards, { ...newBoard, id: crypto.randomUUID() }];
}

export function updateBoard(boards: Board[], id: string, updates: Partial<Omit<Board, 'id'>>): Board[] {
  return boards.map(b => b.id === id ? { ...b, ...updates } : b);
}

export function removeBoard(boards: Board[], id: string): Board[] {
  return boards.filter(b => b.id !== id);
}
