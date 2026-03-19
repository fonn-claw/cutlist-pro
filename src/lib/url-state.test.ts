import { describe, it, expect } from 'vitest';
import type { Board, CutPiece } from './types';
import { encodeState, decodeState, parseShareUrl } from './url-state';

const sampleBoards: Board[] = [
  { id: 'b1', dimensions: { length: 2440, width: 1220 }, quantity: 2 },
];

const samplePieces: CutPiece[] = [
  {
    id: 'p1',
    dimensions: { length: 600, width: 400 },
    quantity: 3,
    label: 'Shelf',
    color: '#ff0000',
    grainDirection: true,
  },
  {
    id: 'p2',
    dimensions: { length: 300, width: 200 },
    quantity: 1,
    label: 'Door',
    color: '#00ff00',
    grainDirection: false,
  },
];

const kerf = 3.175;

describe('url-state', () => {
  it('encodeState produces a base64 string', () => {
    const encoded = encodeState(sampleBoards, samplePieces, kerf);
    expect(typeof encoded).toBe('string');
    // Should be valid base64 — atob should not throw
    expect(() => atob(encoded)).not.toThrow();
  });

  it('decodeState(encodeState(...)) roundtrips correctly', () => {
    const encoded = encodeState(sampleBoards, samplePieces, kerf);
    const decoded = decodeState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.kerf).toBe(kerf);
    expect(decoded!.boards).toHaveLength(1);
    expect(decoded!.boards[0].dimensions.length).toBe(2440);
    expect(decoded!.boards[0].dimensions.width).toBe(1220);
    expect(decoded!.boards[0].quantity).toBe(2);
    expect(decoded!.pieces).toHaveLength(2);
    expect(decoded!.pieces[0].label).toBe('Shelf');
    expect(decoded!.pieces[0].grainDirection).toBe(true);
    expect(decoded!.pieces[1].label).toBe('Door');
    // IDs should be stripped
    expect((decoded!.boards[0] as Record<string, unknown>).id).toBeUndefined();
    expect((decoded!.pieces[0] as Record<string, unknown>).id).toBeUndefined();
  });

  it('decodeState with invalid string returns null', () => {
    expect(decodeState('not-valid-base64!!!')).toBeNull();
  });

  it('decodeState with valid base64 but invalid JSON returns null', () => {
    const encoded = btoa('this is not json');
    expect(decodeState(encoded)).toBeNull();
  });

  it('decodeState with valid JSON but wrong shape returns null', () => {
    const encoded = btoa(JSON.stringify({ foo: 'bar' }));
    expect(decodeState(encoded)).toBeNull();
  });

  it('parseShareUrl extracts state from hash', () => {
    const encoded = encodeState(sampleBoards, samplePieces, kerf);
    const url = `https://example.com/app#state=${encoded}`;
    const state = parseShareUrl(url);
    expect(state).not.toBeNull();
    expect(state!.kerf).toBe(kerf);
    expect(state!.boards).toHaveLength(1);
    expect(state!.pieces).toHaveLength(2);
  });

  it('parseShareUrl returns null when no hash', () => {
    expect(parseShareUrl('https://example.com/app')).toBeNull();
  });

  it('parseShareUrl returns null when hash has no state param', () => {
    expect(parseShareUrl('https://example.com/app#other=value')).toBeNull();
  });
});
