import type { Board, CutPiece } from './types';

export interface ShareableState {
  boards: Array<{ dimensions: { length: number; width: number }; quantity: number }>;
  pieces: Array<{
    dimensions: { length: number; width: number };
    quantity: number;
    label: string;
    color: string;
    grainDirection: boolean;
  }>;
  kerf: number;
}

export function encodeState(boards: Board[], pieces: CutPiece[], kerf: number): string {
  const state: ShareableState = {
    boards: boards.map(b => ({
      dimensions: { length: b.dimensions.length, width: b.dimensions.width },
      quantity: b.quantity,
    })),
    pieces: pieces.map(p => ({
      dimensions: { length: p.dimensions.length, width: p.dimensions.width },
      quantity: p.quantity,
      label: p.label,
      color: p.color,
      grainDirection: p.grainDirection,
    })),
    kerf,
  };
  return btoa(JSON.stringify(state));
}

export function decodeState(encoded: string): ShareableState | null {
  try {
    const json = atob(encoded);
    const parsed = JSON.parse(json);

    // Validate shape
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.boards) ||
      !Array.isArray(parsed.pieces) ||
      typeof parsed.kerf !== 'number'
    ) {
      return null;
    }

    for (const b of parsed.boards) {
      if (
        !b.dimensions ||
        typeof b.dimensions.length !== 'number' ||
        typeof b.dimensions.width !== 'number' ||
        typeof b.quantity !== 'number'
      ) {
        return null;
      }
    }

    for (const p of parsed.pieces) {
      if (
        !p.dimensions ||
        typeof p.dimensions.length !== 'number' ||
        typeof p.dimensions.width !== 'number' ||
        typeof p.quantity !== 'number' ||
        typeof p.label !== 'string' ||
        typeof p.color !== 'string' ||
        typeof p.grainDirection !== 'boolean'
      ) {
        return null;
      }
    }

    return parsed as ShareableState;
  } catch {
    return null;
  }
}

export function buildShareUrl(boards: Board[], pieces: CutPiece[], kerf: number): string {
  const encoded = encodeState(boards, pieces, kerf);
  return `${window.location.origin}${window.location.pathname}#state=${encoded}`;
}

export function parseShareUrl(url: string): ShareableState | null {
  try {
    const urlObj = new URL(url);
    const hash = urlObj.hash;
    if (!hash.startsWith('#state=')) {
      return null;
    }
    const encoded = hash.slice('#state='.length);
    return decodeState(encoded);
  } catch {
    return null;
  }
}
