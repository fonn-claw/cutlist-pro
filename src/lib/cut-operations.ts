import type { CutPiece, UnitSystem } from '@/lib/types';
import { getNextColor } from '@/lib/color-palette';
import { toInternal } from '@/lib/units';

export interface ParsedPiece {
  dimensions: { length: number; width: number };
  quantity: number;
  label: string;
}

/**
 * Add a new cut piece with auto-assigned id and color.
 */
export function addCutPiece(pieces: CutPiece[], newPiece: Omit<CutPiece, 'id' | 'color'>): CutPiece[] {
  return [...pieces, { ...newPiece, id: crypto.randomUUID(), color: getNextColor(pieces.length) }];
}

/**
 * Update a cut piece by id. Returns same array if id not found.
 */
export function updateCutPiece(pieces: CutPiece[], id: string, updates: Partial<Omit<CutPiece, 'id'>>): CutPiece[] {
  return pieces.map(p => p.id === id ? { ...p, ...updates } : p);
}

/**
 * Remove a cut piece by id. Returns same array if id not found.
 */
export function removeCutPiece(pieces: CutPiece[], id: string): CutPiece[] {
  return pieces.filter(p => p.id !== id);
}

/**
 * Duplicate a cut piece with new id and ' (copy)' label suffix.
 * Preserves source color. Returns same array if id not found.
 */
export function duplicateCutPiece(pieces: CutPiece[], id: string): CutPiece[] {
  const source = pieces.find(p => p.id === id);
  if (!source) return pieces;
  const copy: CutPiece = {
    ...source,
    id: crypto.randomUUID(),
    label: source.label ? `${source.label} (copy)` : '',
  };
  return [...pieces, copy];
}

/**
 * Parse bulk text input (tab or comma separated) into cut pieces.
 * Format per line: length, width, [quantity], [label]
 * Tabs take priority as delimiter (preserves commas in labels).
 */
export function parseBulkInput(text: string, units: UnitSystem): { pieces: ParsedPiece[]; errors: string[] } {
  const pieces: ParsedPiece[] = [];
  const errors: string[] = [];

  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Use tabs if present, otherwise commas
    const parts = line.includes('\t')
      ? line.split('\t').map(s => s.trim())
      : line.split(',').map(s => s.trim());

    const length = parseFloat(parts[0]);
    const width = parseFloat(parts[1]);

    if (isNaN(length) || isNaN(width)) {
      errors.push(`Line ${i + 1}: invalid dimensions "${line}"`);
      continue;
    }

    const quantity = parts.length >= 3 && parts[2] !== '' ? parseInt(parts[2], 10) : 1;
    const label = parts.length >= 4 ? parts.slice(3).join('\t').trim() : '';

    pieces.push({
      dimensions: {
        length: toInternal(length, units),
        width: toInternal(width, units),
      },
      quantity: isNaN(quantity) ? 1 : quantity,
      label,
    });
  }

  return { pieces, errors };
}
