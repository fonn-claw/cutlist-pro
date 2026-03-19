import { describe, it, expect } from 'vitest';
import { addBoard, updateBoard, removeBoard } from '@/lib/board-operations';
import type { Board } from '@/lib/types';

describe('addBoard', () => {
  it('given empty array, returns array of length 1 with correct board', () => {
    const result = addBoard([], { dimensions: { length: 2438.4, width: 1219.2 }, quantity: 1 });
    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('string');
    expect(result[0].id.length).toBeGreaterThan(0);
    expect(result[0].dimensions).toEqual({ length: 2438.4, width: 1219.2 });
    expect(result[0].quantity).toBe(1);
  });

  it('given array with 1 board, returns array of length 2 with new board appended', () => {
    const existing: Board = { id: 'existing-1', dimensions: { length: 2438.4, width: 1219.2 }, quantity: 1 };
    const result = addBoard([existing], { dimensions: { length: 1828.8, width: 88.9 }, quantity: 2 });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(existing);
    expect(result[1].dimensions).toEqual({ length: 1828.8, width: 88.9 });
  });

  it('each call produces a unique id', () => {
    const r1 = addBoard([], { dimensions: { length: 2438.4, width: 1219.2 }, quantity: 1 });
    const r2 = addBoard([], { dimensions: { length: 2438.4, width: 1219.2 }, quantity: 1 });
    expect(r1[0].id).not.toBe(r2[0].id);
  });

  it('given quantity 3, returned board has quantity 3', () => {
    const result = addBoard([], { dimensions: { length: 2438.4, width: 1219.2 }, quantity: 3 });
    expect(result[0].quantity).toBe(3);
  });
});

describe('updateBoard', () => {
  const board1: Board = { id: 'b1', dimensions: { length: 2438.4, width: 1219.2 }, quantity: 1 };
  const board2: Board = { id: 'b2', dimensions: { length: 1828.8, width: 88.9 }, quantity: 2 };

  it('update quantity from 1 to 5, dimensions unchanged', () => {
    const result = updateBoard([board1], 'b1', { quantity: 5 });
    expect(result[0].quantity).toBe(5);
    expect(result[0].dimensions).toEqual(board1.dimensions);
  });

  it('update dimensions.length to 1828.8, width unchanged', () => {
    const result = updateBoard([board1], 'b1', {
      dimensions: { ...board1.dimensions, length: 1828.8 },
    });
    expect(result[0].dimensions.length).toBe(1828.8);
    expect(result[0].dimensions.width).toBe(1219.2);
  });

  it('does not modify other boards in the array', () => {
    const result = updateBoard([board1, board2], 'b1', { quantity: 10 });
    expect(result[1]).toEqual(board2);
  });

  it('returns same array (by value) if id not found', () => {
    const result = updateBoard([board1, board2], 'nonexistent', { quantity: 99 });
    expect(result).toEqual([board1, board2]);
  });
});

describe('removeBoard', () => {
  const board1: Board = { id: 'b1', dimensions: { length: 2438.4, width: 1219.2 }, quantity: 1 };
  const board2: Board = { id: 'b2', dimensions: { length: 1828.8, width: 88.9 }, quantity: 2 };

  it('given array with 2 boards, remove first, returns array with only second', () => {
    const result = removeBoard([board1, board2], 'b1');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(board2);
  });

  it('returns same-length array if id not found', () => {
    const result = removeBoard([board1, board2], 'nonexistent');
    expect(result).toHaveLength(2);
  });
});
