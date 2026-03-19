# Phase 3: Cut List Input - Research

**Researched:** 2026-03-19
**Domain:** React CRUD UI, color palette system, text parsing
**Confidence:** HIGH

## Summary

Phase 3 follows the exact CRUD pattern established in Phase 2 (Board Input) -- pure functions in `lib/`, UI components in `components/pieces/`, state lifted to `page.tsx`. The existing `board-operations.ts`, `BoardForm.tsx`, `BoardEntry.tsx`, and `BoardList.tsx` provide a proven template to replicate for cut pieces.

The three novel aspects beyond Phase 2 are: (1) a color auto-assignment system with manual override via a 12-color swatch picker, (2) a bulk paste parser for tab/comma-separated text in "label, length, width, quantity" format, and (3) a duplicate operation. None require external libraries. The color palette is a static array of 12 hex strings; the bulk parser is a pure function splitting text lines; duplicate is a shallow copy with new ID. All three are testable pure functions.

**Primary recommendation:** Mirror the Phase 2 pattern exactly (PieceForm, PieceEntry, PieceList + piece-operations.ts), adding color-palette.ts for color cycling and paste-parser.ts for bulk input parsing. TDD the pure logic first, then build UI components.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Cut piece form below the board section in sidebar -- length, width, quantity, label fields with "Add" button
- Piece entries display as compact colored cards -- show dimensions, label, quantity, color swatch, and action buttons
- Edit mode: clicking a piece entry makes it inline-editable (same pattern as BoardEntry) -- no modals
- Delete: icon button on each entry, no confirmation
- Duplicate: icon button that creates a copy with same dimensions/label/color but new ID
- Auto-assign colors from a predefined palette when pieces are added -- cycle through 10-12 distinct colors
- Color swatch displayed on each piece card -- small circle or square indicator
- Manual override: clicking the color swatch shows a small color picker (simple palette of 12 colors, not a full color picker)
- Colors are stored as hex strings in the CutPiece.color field
- Paste button or textarea that accepts tab/comma-separated data
- Format: "label, length, width, quantity" per line -- flexible parsing (tab or comma)
- Parsed pieces get auto-assigned colors and added to the list
- Show count of added pieces after paste
- Checkbox or toggle on each piece entry -- "Has grain (no rotation)"
- Default: unchecked (pieces can rotate freely)
- Visual indicator on piece card when grain is set
- Cut piece list stored in useState at page level -- matches board state pattern
- Each piece gets unique ID via crypto.randomUUID()
- Dimensions entered in display units, stored as mm internally
- Default quantity is 1, default label is empty string

### Claude's Discretion
- Specific color palette choices (aim for distinguishable, muted workshop tones)
- Exact styling of color picker popup
- Paste textarea sizing and positioning
- Animation on add/remove/duplicate

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CUT-01 | User can add cut pieces with length and width dimensions | PieceForm component mirrors BoardForm; addPiece pure function |
| CUT-02 | User can set quantity per cut piece | Quantity field in PieceForm, default 1, same validation as BoardForm |
| CUT-03 | User can assign an optional label to each cut piece | Label text field in PieceForm; stored as string, default empty |
| CUT-04 | User can assign colors per piece type (auto-assigned with manual override) | Color palette module + color swatch picker on PieceEntry |
| CUT-05 | User can quick-add pieces by pasting tab/comma-separated list | parseBulkPieces pure function + BulkAddPieces textarea component |
| CUT-06 | User can duplicate existing cut piece entries | duplicatePiece pure function in piece-operations.ts |
| CUT-07 | User can remove or edit existing cut piece entries | PieceEntry inline edit (mirrors BoardEntry) + remove button |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI components | Already in project |
| Next.js | 16.2.0 | Framework | Already in project |
| Tailwind CSS | 4.x | Styling | Already in project |
| Vitest | 4.1.0 | Testing | Already in project |

### Supporting
No new libraries needed. All functionality is implemented with vanilla TypeScript pure functions and React state.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom swatch picker | react-colorful | Overkill -- only picking from 12 predefined colors |
| Manual line parsing | papaparse | Overkill -- format is simple 4-column CSV with known schema |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/
    piece-operations.ts       # addPiece, updatePiece, removePiece, duplicatePiece
    piece-operations.test.ts  # TDD for all CRUD operations
    color-palette.ts          # PIECE_COLORS array + getNextColor(index)
    color-palette.test.ts     # Color cycling tests
    paste-parser.ts           # parseBulkPieces(text, units) -> parsed pieces
    paste-parser.test.ts      # Parser edge case tests
  components/
    pieces/
      PieceForm.tsx           # Add form: length, width, quantity, label, grain
      PieceEntry.tsx          # Display/inline-edit card with color swatch
      PieceList.tsx           # List with editingId state management
      BulkAddPieces.tsx       # Paste textarea with parse + add flow
      ColorPicker.tsx         # Simple 12-color palette popup
```

### Pattern 1: Pure Function CRUD (mirror board-operations.ts)
**What:** Stateless array transform functions for CRUD + duplicate
**When to use:** All piece state mutations
**Example:**
```typescript
// src/lib/piece-operations.ts
import type { CutPiece } from '@/lib/types';

export function addPiece(pieces: CutPiece[], newPiece: Omit<CutPiece, 'id'>): CutPiece[] {
  return [...pieces, { ...newPiece, id: crypto.randomUUID() }];
}

export function updatePiece(pieces: CutPiece[], id: string, updates: Partial<Omit<CutPiece, 'id'>>): CutPiece[] {
  return pieces.map(p => p.id === id ? { ...p, ...updates } : p);
}

export function removePiece(pieces: CutPiece[], id: string): CutPiece[] {
  return pieces.filter(p => p.id !== id);
}

export function duplicatePiece(pieces: CutPiece[], id: string): CutPiece[] {
  const original = pieces.find(p => p.id === id);
  if (!original) return pieces;
  const copy: CutPiece = { ...original, id: crypto.randomUUID() };
  const index = pieces.indexOf(original);
  const result = [...pieces];
  result.splice(index + 1, 0, copy);
  return result;
}
```

### Pattern 2: Color Auto-Assignment with Cycling
**What:** Predefined palette of 12 visually distinct muted workshop-tone colors, cycling via modulo
**When to use:** When adding new pieces (form or bulk)
**Example:**
```typescript
// src/lib/color-palette.ts
// Muted workshop tones -- distinguishable on both dark and light themes
export const PIECE_COLORS = [
  '#5B8C5A', // sage green
  '#4A90B8', // steel blue
  '#C4703E', // warm copper
  '#8E6FBA', // dusty purple
  '#B85C5C', // muted red
  '#5AABA0', // teal
  '#C4A23E', // golden
  '#7A8C5A', // olive
  '#B87A4A', // terracotta
  '#5A7AB8', // cornflower
  '#BA6F8E', // rose
  '#6FB8A0', // mint
] as const;

export function getNextColor(currentCount: number): string {
  return PIECE_COLORS[currentCount % PIECE_COLORS.length];
}
```

### Pattern 3: Bulk Paste Parser
**What:** Pure function that parses multiline text into piece data
**When to use:** Quick-add textarea submission
**Important:** Format is "label, length, width, quantity" per line (label first, per CONTEXT.md)
**Example:**
```typescript
// src/lib/paste-parser.ts
import type { UnitSystem } from '@/lib/types';
import { toInternal } from '@/lib/units';

export interface ParsedPiece {
  label: string;
  length: number; // mm
  width: number;  // mm
  quantity: number;
  grainDirection: boolean;
}

export interface ParseResult {
  pieces: ParsedPiece[];
  errors: string[];
}

export function parseBulkPieces(text: string, units: UnitSystem): ParseResult {
  const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
  const pieces: ParsedPiece[] = [];
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Tab delimiter takes priority over comma
    const parts = line.includes('\t')
      ? line.split('\t').map(s => s.trim())
      : line.split(',').map(s => s.trim());

    // Format: label, length, width[, quantity]
    if (parts.length < 3) {
      errors.push(`Line ${i + 1}: not enough fields (need label, length, width)`);
      continue;
    }

    const label = parts[0];
    const length = parseFloat(parts[1]);
    const width = parseFloat(parts[2]);
    const quantity = parts.length >= 4 ? parseInt(parts[3], 10) : 1;

    if (isNaN(length) || length <= 0 || isNaN(width) || width <= 0) {
      errors.push(`Line ${i + 1}: invalid dimensions`);
      continue;
    }

    pieces.push({
      label,
      length: toInternal(length, units),
      width: toInternal(width, units),
      quantity: isNaN(quantity) || quantity < 1 ? 1 : quantity,
      grainDirection: false,
    });
  }

  return { pieces, errors };
}
```

### Pattern 4: Page-Level State Integration
**What:** Cut piece state lifted to page.tsx alongside board state
**When to use:** Integrating pieces into the app
**Example:**
```typescript
// In page.tsx, add alongside existing board state:
const [pieces, setPieces] = useState<CutPiece[]>([]);

const handleAddPiece = useCallback((piece: Omit<CutPiece, 'id'>) => {
  setPieces(prev => addPiece(prev, piece));
}, []);

const handleDuplicatePiece = useCallback((id: string) => {
  setPieces(prev => duplicatePiece(prev, id));
}, []);
// ... same pattern for update, remove
```

### Anti-Patterns to Avoid
- **Deriving color from array index at render time:** Color MUST be stored on the CutPiece object itself. If you derive it from position, deleting a piece causes all subsequent pieces to change color.
- **Separate context provider for pieces:** The board state is lifted to page.tsx (useState), NOT a BoardContext. Pieces follow the same pattern -- page-level useState, not a PieceContext.
- **Full color picker library:** A 12-color fixed palette is a simple grid of buttons. No need for a color wheel/picker library.
- **Complex CSV parsing library:** The paste format is simple enough for string splitting. Papaparse adds a dependency for a 30-line function.
- **Parsing in the component:** Bulk parse logic must be a pure function in lib/ for testability, not inline in a component.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUIDs | Custom ID generator | `crypto.randomUUID()` | Browser-native, established pattern |
| Unit conversion | Custom math | `toInternal()` / `toDisplay()` from units.ts | Already exists, tested |
| Dimension formatting | Custom formatter | `formatDimension()` from units.ts | Already exists, tested |

**Key insight:** This phase primarily reuses existing infrastructure. The only new logic is color cycling, paste parsing, and the duplicate operation -- all simple pure functions.

## Common Pitfalls

### Pitfall 1: Color Reassignment on Delete
**What goes wrong:** Deleting a cut piece causes colors to shift if colors are derived from array index at render time.
**Why it happens:** Using `pieces.indexOf(piece)` to determine color instead of storing it on the object.
**How to avoid:** Store color as a property of CutPiece at creation time. Never re-derive colors from position.
**Warning signs:** Colors changing on existing pieces when another piece is added or removed.

### Pitfall 2: Color Picker Click Propagation
**What goes wrong:** Clicking the color swatch to open the picker also triggers the card's click-to-edit handler.
**Why it happens:** Event bubbling from the swatch to the parent card div.
**How to avoid:** Use `e.stopPropagation()` on the color swatch click handler (same pattern as the delete button in BoardEntry).
**Warning signs:** Clicking the color swatch opens edit mode instead of (or in addition to) the color picker.

### Pitfall 3: Bulk Paste Unit Mismatch
**What goes wrong:** User pastes values in inches but the parser stores them as raw numbers without converting to mm.
**Why it happens:** Forgetting to run `toInternal()` on parsed values.
**How to avoid:** `parseBulkPieces` must accept `units` parameter and convert all dimensions through `toInternal()`.
**Warning signs:** Pasted values displaying as tiny numbers (1 inch showing as 1mm = 0.04").

### Pitfall 4: Bulk Add Color Assignment
**What goes wrong:** All bulk-added pieces get the same color because `getNextColor` is called with the same count for all.
**Why it happens:** Color assignment based on array length before adding, not accounting for batch offset.
**How to avoid:** When adding N bulk pieces, use `existingPieces.length + batchIndex` for each piece's color index.
**Warning signs:** All pasted pieces have the same color.

### Pitfall 5: Tab vs Comma Ambiguity in Labels
**What goes wrong:** Labels containing commas break comma-delimited parsing.
**Why it happens:** Naive splitting on commas when label field might contain commas.
**How to avoid:** Tab delimiter takes priority when detected. With comma delimiter, label is the first field (least likely to contain commas vs dimensions). Document the format clearly in the UI placeholder text.
**Warning signs:** Labels getting truncated, dimensions parsing as NaN.

### Pitfall 6: grainDirection Default
**What goes wrong:** Forgetting to set `grainDirection: false` as default for new cut pieces.
**Why it happens:** The CutPiece type requires it but it's easy to omit.
**How to avoid:** Set `grainDirection: false` as default in addPiece, in parseBulkPieces, and in the form's onSubmit.
**Warning signs:** TypeScript compile error (good) or undefined grain direction causing issues in Phase 4.

### Pitfall 7: Empty State After Form Clear
**What goes wrong:** Form does not clear after successful add, or clears on failed validation.
**Why it happens:** Reset logic not tied to the success path.
**How to avoid:** Follow BoardForm pattern: reset fields inside handleSubmit after calling onAdd.
**Warning signs:** Stale values remaining in form inputs after adding a piece.

## Code Examples

### PieceEntry with Color Swatch and Action Buttons
```typescript
// Source: derived from existing BoardEntry pattern
// Key additions vs BoardEntry: color swatch, label display, duplicate button, grain indicator
return (
  <div className="p-3 rounded border border-border bg-surface-alt mb-2 flex items-center gap-2">
    <button
      className="w-4 h-4 rounded-full flex-shrink-0 border border-border"
      style={{ backgroundColor: piece.color }}
      onClick={(e) => { e.stopPropagation(); toggleColorPicker(); }}
      aria-label="Change color"
    />
    <div className="flex-1 cursor-pointer" onClick={startEdit}>
      {piece.label && (
        <span className="text-xs text-text-secondary block">{piece.label}</span>
      )}
      <span className="text-sm text-text-primary">
        {formatDimension(piece.dimensions.length, units)} x{' '}
        {formatDimension(piece.dimensions.width, units)}
      </span>
      <span className="text-xs text-text-secondary ml-2">qty: {piece.quantity}</span>
      {piece.grainDirection && (
        <span className="text-xs text-accent ml-1" title="Has grain direction">G</span>
      )}
    </div>
    <button onClick={() => onDuplicate(piece.id)} aria-label="Duplicate piece">D</button>
    <button onClick={() => onRemove(piece.id)} aria-label="Remove piece">X</button>
  </div>
);
```

### ColorPicker Component
```typescript
// Source: project convention -- no external library
'use client';
import { useState, useRef, useEffect } from 'react';
import { PIECE_COLORS } from '@/lib/color-palette';

interface ColorPickerProps {
  currentColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({ currentColor, onSelect, onClose }: ColorPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-10 p-2 bg-surface border border-border rounded shadow-lg grid grid-cols-4 gap-1">
      {PIECE_COLORS.map(color => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className={`w-6 h-6 rounded-full border-2 ${color === currentColor ? 'border-accent' : 'border-transparent'}`}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useReducer for complex state | useState + pure functions | Project convention | Keep consistency with Phase 2 |
| External color picker libs | Predefined palette swatch grid | Project decision | No dependency, simpler UX |
| Class-based state | Pure function transforms | Phase 2 decision | Testable, immutable, React-friendly |

## Open Questions

1. **Grain direction toggle in Phase 3 vs Phase 4**
   - What we know: CutPiece type has `grainDirection: boolean`. OPT-03 is Phase 4 ("User can mark pieces with grain direction constraint"). CONTEXT.md for Phase 3 explicitly includes a grain direction checkbox.
   - What's unclear: Whether Phase 3's grain toggle fully satisfies OPT-03 or if Phase 4 adds more.
   - Recommendation: Include the grain direction checkbox in Phase 3 as specified in CONTEXT.md. Phase 4 will consume this field for optimization -- it does not need to re-implement the UI.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CUT-01 | addPiece creates piece with dimensions | unit | `npx vitest run src/lib/piece-operations.test.ts -t "addPiece"` | No -- Wave 0 |
| CUT-02 | addPiece stores quantity | unit | `npx vitest run src/lib/piece-operations.test.ts -t "quantity"` | No -- Wave 0 |
| CUT-03 | addPiece stores label | unit | `npx vitest run src/lib/piece-operations.test.ts -t "label"` | No -- Wave 0 |
| CUT-04 | getNextColor cycles through palette | unit | `npx vitest run src/lib/color-palette.test.ts` | No -- Wave 0 |
| CUT-05 | parseBulkPieces parses CSV/TSV correctly | unit | `npx vitest run src/lib/paste-parser.test.ts` | No -- Wave 0 |
| CUT-06 | duplicatePiece copies with new ID | unit | `npx vitest run src/lib/piece-operations.test.ts -t "duplicatePiece"` | No -- Wave 0 |
| CUT-07 | updatePiece/removePiece work correctly | unit | `npx vitest run src/lib/piece-operations.test.ts -t "updatePiece\|removePiece"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/piece-operations.test.ts` -- covers CUT-01, CUT-02, CUT-03, CUT-06, CUT-07
- [ ] `src/lib/color-palette.test.ts` -- covers CUT-04
- [ ] `src/lib/paste-parser.test.ts` -- covers CUT-05

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/board-operations.ts`, `BoardForm.tsx`, `BoardEntry.tsx`, `BoardList.tsx` -- direct patterns to mirror
- Existing codebase: `src/lib/types.ts` -- CutPiece interface already fully defined
- Existing codebase: `src/lib/board-operations.test.ts` -- test style and structure to follow
- Existing codebase: `src/app/page.tsx` -- page-level state lifting pattern

### Secondary (MEDIUM confidence)
- None needed -- this phase uses only existing project patterns and vanilla React/TypeScript

### Tertiary (LOW confidence)
- Color palette choices are aesthetic recommendations, will need visual validation against both themes

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing libraries
- Architecture: HIGH -- direct mirror of Phase 2 board input pattern, established in codebase
- Pitfalls: HIGH -- based on actual code review of BoardEntry event handling patterns

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- no external dependencies or fast-moving APIs)
