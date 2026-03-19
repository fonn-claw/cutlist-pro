# Phase 3: Cut List Input - Research

**Researched:** 2026-03-19
**Domain:** React CRUD UI, color palette system, text parsing
**Confidence:** HIGH

## Summary

Phase 3 follows the exact CRUD pattern established in Phase 2 (Board Input) -- pure functions in `lib/`, UI components in `components/cuts/`, state lifted to `page.tsx`. The existing `board-operations.ts`, `BoardForm.tsx`, `BoardEntry.tsx`, and `BoardList.tsx` provide a proven template to replicate for cut pieces.

The three novel aspects are: (1) a color auto-assignment system with manual override, (2) a bulk paste parser for tab/comma-separated text, and (3) a duplicate operation. None require external libraries. The color palette is a static array of hex strings; the bulk parser is a pure function splitting text lines; duplicate is a shallow copy with new ID. All three are testable pure functions.

**Primary recommendation:** Mirror the Phase 2 pattern exactly for CRUD, add `cut-operations.ts` with the three new pure functions (addCutPiece with auto-color, duplicateCutPiece, parseBulkCutPieces), and build UI components following the established BoardForm/BoardEntry/BoardList structure.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Form in sidebar below board section -- same inline pattern as board input
- Cut piece entries as card list with inline edit -- consistent with board entries
- Color auto-assigned from a palette on creation, with manual override via color picker
- Duplicate button on each entry -- creates a copy with new ID
- Delete via icon button with no confirmation -- consistent with boards
- Paste tab/comma-separated list into a textarea -- parsed on submit
- Format: "length, width, quantity, label" per line (quantity and label optional)
- Parsed values create individual CutPiece entries with auto-assigned colors
- Show a toggle/button to switch between single-add form and bulk-add textarea
- 10-color palette with distinct, visible colors on both dark and light themes
- Colors auto-assigned in order (cycling through palette)
- Manual override via a simple color picker (click swatch to open palette)
- Color stored as hex string in CutPiece.color field (already in types.ts)
- React useState at page level -- same pattern as boards (lifted state)
- Cut piece operations as pure functions in lib/cut-operations.ts
- CutPiece type already defined in types.ts with id, dimensions, quantity, label, color, grainDirection

### Claude's Discretion
- Exact color palette hex values
- Quick-add textarea placeholder text
- Form field ordering and spacing
- Color picker UI details (inline swatches vs dropdown)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CUT-01 | User can add cut pieces with length and width dimensions | Mirror BoardForm pattern with dimensions inputs; addCutPiece pure function |
| CUT-02 | User can set quantity per cut piece | Quantity field in form, same as Board quantity pattern |
| CUT-03 | User can assign an optional label to each cut piece | Text input field in CutPieceForm; label stored on CutPiece.label |
| CUT-04 | User can assign colors per piece type (auto-assigned with manual override) | Color palette system: auto-assign on add, swatch picker for override |
| CUT-05 | User can quick-add pieces by pasting tab/comma-separated list | parseBulkCutPieces pure function; textarea UI with toggle |
| CUT-06 | User can duplicate existing cut piece entries | duplicateCutPiece pure function: shallow copy + new ID + next color |
| CUT-07 | User can remove or edit existing cut piece entries | Mirror BoardEntry/BoardList inline edit + remove pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI components | Already in project |
| Next.js | 16.2.0 | Framework | Already in project |
| Tailwind CSS | 4.x | Styling | Already in project |
| Vitest | 4.1.x | Testing | Already in project |

### Supporting
No new libraries needed. All functionality is implemented with vanilla TypeScript pure functions and React state.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom swatch picker | react-colorful | Overkill -- only picking from 10 predefined colors |
| Manual parsing | papaparse | Overkill -- format is simple 4-column CSV with known schema |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── cut-operations.ts        # Pure CRUD + color + parse + duplicate
│   ├── cut-operations.test.ts   # Tests for all pure functions
│   └── color-palette.ts         # Palette constants and getNextColor helper
├── components/
│   └── cuts/
│       ├── CutPieceForm.tsx     # Single-add form (mirrors BoardForm)
│       ├── CutPieceEntry.tsx    # Inline edit card (mirrors BoardEntry)
│       ├── CutPieceList.tsx     # List with empty state (mirrors BoardList)
│       ├── BulkAddForm.tsx      # Textarea for paste-to-add
│       └── ColorSwatch.tsx      # Small color dot + picker popover
```

### Pattern 1: Pure Function CRUD (Established)
**What:** Stateless array transform functions, identical to board-operations.ts
**When to use:** All state mutations
**Example:**
```typescript
// Mirrors board-operations.ts exactly
import type { CutPiece } from '@/lib/types';
import { getNextColor } from '@/lib/color-palette';

export function addCutPiece(
  pieces: CutPiece[],
  newPiece: Omit<CutPiece, 'id' | 'color'>
): CutPiece[] {
  return [
    ...pieces,
    {
      ...newPiece,
      id: crypto.randomUUID(),
      color: getNextColor(pieces.length),
    },
  ];
}

export function updateCutPiece(
  pieces: CutPiece[],
  id: string,
  updates: Partial<Omit<CutPiece, 'id'>>
): CutPiece[] {
  return pieces.map(p => (p.id === id ? { ...p, ...updates } : p));
}

export function removeCutPiece(pieces: CutPiece[], id: string): CutPiece[] {
  return pieces.filter(p => p.id !== id);
}

export function duplicateCutPiece(pieces: CutPiece[], id: string): CutPiece[] {
  const source = pieces.find(p => p.id === id);
  if (!source) return pieces;
  return [
    ...pieces,
    {
      ...source,
      id: crypto.randomUUID(),
      label: source.label ? `${source.label} (copy)` : '',
    },
  ];
}
```

### Pattern 2: Color Palette System
**What:** Static array of 10 hex colors, cycled by index
**When to use:** Auto-assigning color on piece creation
**Example:**
```typescript
// src/lib/color-palette.ts
export const CUT_PIECE_PALETTE = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
] as const;

export function getNextColor(currentCount: number): string {
  return CUT_PIECE_PALETTE[currentCount % CUT_PIECE_PALETTE.length];
}
```
These colors are Tailwind standard palette values at the 500 level -- they provide good contrast on both dark (bg-surface ~slate-900) and light (bg-surface ~white) backgrounds.

### Pattern 3: Bulk Paste Parser
**What:** Pure function that parses multiline text into CutPiece data
**When to use:** Quick-add textarea submission
**Example:**
```typescript
interface ParsedPiece {
  dimensions: { length: number; width: number };
  quantity: number;
  label: string;
}

export function parseBulkInput(
  text: string,
  units: UnitSystem
): { pieces: ParsedPiece[]; errors: string[] } {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const pieces: ParsedPiece[] = [];
  const errors: string[] = [];

  lines.forEach((line, i) => {
    // Split on tab or comma
    const parts = line.split(/[\t,]/).map(s => s.trim());
    const length = parseFloat(parts[0]);
    const width = parseFloat(parts[1]);

    if (isNaN(length) || length <= 0 || isNaN(width) || width <= 0) {
      errors.push(`Line ${i + 1}: invalid dimensions`);
      return;
    }

    const quantity = parts[2] ? parseInt(parts[2], 10) : 1;
    const label = parts[3] || '';

    pieces.push({
      dimensions: {
        length: toInternal(length, units),
        width: toInternal(width, units),
      },
      quantity: isNaN(quantity) || quantity < 1 ? 1 : quantity,
      label,
    });
  });

  return { pieces, errors };
}
```

### Pattern 4: Lifted State (Established)
**What:** Cut piece state alongside board state in page.tsx
**Example:**
```typescript
// In page.tsx, alongside existing board state:
const [cutPieces, setCutPieces] = useState<CutPiece[]>([]);

const handleAddCutPiece = useCallback(
  (piece: Omit<CutPiece, 'id' | 'color'>) => {
    setCutPieces(prev => addCutPiece(prev, piece));
  },
  []
);
```

### Anti-Patterns to Avoid
- **Class-based state management:** Project uses pure functions + useState, not classes or reducers
- **Color in component state only:** Color MUST be stored on the CutPiece object itself (CutPiece.color), not derived at render time, because it needs to persist through edits and be used by visualization in Phase 5
- **Parsing in the component:** Bulk parse logic must be a pure function in lib/ for testability, not inline in the textarea onChange handler

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom ID generator | `crypto.randomUUID()` | Browser-native, established pattern |
| Unit conversion | Manual math in components | `toInternal()`/`toDisplay()` from lib/units.ts | Already exists, handles both systems |
| Dimension formatting | Template string formatting | `formatDimension()` from lib/units.ts | Already handles fractions for imperial |

**Key insight:** Nearly everything in this phase already has a pattern in Phase 2. The only truly new code is the color palette, bulk parser, and duplicate function -- all simple pure functions.

## Common Pitfalls

### Pitfall 1: Color Reassignment on Delete
**What goes wrong:** Deleting a cut piece could cause colors to shift if colors are derived from array index at render time.
**Why it happens:** If color assignment uses `pieces.indexOf(piece)` instead of storing color on the piece object.
**How to avoid:** Store color as a property of CutPiece at creation time. Never re-derive colors from position.
**Warning signs:** Colors changing on existing pieces when another piece is added or removed.

### Pitfall 2: Bulk Paste Unit Mismatch
**What goes wrong:** User pastes values in inches but the parser stores them as raw numbers (not converting to mm).
**Why it happens:** Forgetting to run `toInternal()` on parsed values.
**How to avoid:** `parseBulkInput` must accept `units` parameter and convert all dimensions through `toInternal()`.
**Warning signs:** Pasted values displaying as tiny numbers (1 inch showing as 1mm = 0.04").

### Pitfall 3: grainDirection Default
**What goes wrong:** Forgetting to set `grainDirection: false` as default for new cut pieces.
**Why it happens:** The CutPiece type requires it but it is easy to omit in the add function.
**How to avoid:** Set `grainDirection: false` as default in `addCutPiece` and in `parseBulkInput`.
**Warning signs:** TypeScript compile error (good) or undefined grain direction causing issues in Phase 4.

### Pitfall 4: Tab vs Comma Ambiguity
**What goes wrong:** Labels containing commas break the parser.
**Why it happens:** Splitting on comma when label is the last field and might contain commas.
**How to avoid:** Tab is the primary delimiter when detected; fall back to comma only when no tabs present. Or: label is always the last field, so join remaining parts after the first 3 columns.
**Warning signs:** Labels getting truncated or extra pieces being created.

### Pitfall 5: Empty State After Form Clear
**What goes wrong:** Form does not clear after successful add, or clears on failed validation.
**Why it happens:** Reset logic not tied to the success path.
**How to avoid:** Follow BoardForm pattern: reset fields inside handleSubmit after calling onAdd.
**Warning signs:** Stale values remaining in form inputs after adding a piece.

## Code Examples

### CutPieceEntry with Color Swatch and Duplicate Button
```typescript
// Key addition vs BoardEntry: color indicator + duplicate button
return (
  <div className="p-3 rounded border border-border bg-surface-alt mb-2 flex items-center gap-2">
    <div
      className="w-4 h-4 rounded-full flex-shrink-0"
      style={{ backgroundColor: piece.color }}
    />
    <div className="flex-1">
      <span className="text-sm text-text-primary">
        {formatDimension(piece.dimensions.length, units)} x{' '}
        {formatDimension(piece.dimensions.width, units)}
      </span>
      {piece.label && (
        <span className="text-xs text-text-secondary ml-2">{piece.label}</span>
      )}
      <span className="text-xs text-text-secondary ml-2">qty: {piece.quantity}</span>
    </div>
    <button onClick={() => onDuplicate(piece.id)} aria-label="Duplicate piece">
      {/* duplicate icon */}
    </button>
    <button onClick={() => onRemove(piece.id)} aria-label="Remove piece">
      X
    </button>
  </div>
);
```

### Color Swatch Picker (Manual Override)
```typescript
// Simple inline swatch grid -- no external library needed
function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="w-6 h-6 rounded-full border border-border"
        style={{ backgroundColor: value }}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="absolute z-10 mt-1 p-2 bg-surface border border-border rounded shadow-lg grid grid-cols-5 gap-1">
          {CUT_PIECE_PALETTE.map(color => (
            <button
              key={color}
              type="button"
              className={`w-6 h-6 rounded-full ${color === value ? 'ring-2 ring-accent' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => { onChange(color); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useReducer for complex state | useState + pure functions | Project convention | Keep consistency with Phase 2 |
| External color picker libs | Predefined palette swatch grid | Project decision | No dependency, simpler UX |

## Open Questions

1. **Grain direction toggle in Phase 3 vs Phase 4**
   - What we know: CutPiece type has `grainDirection: boolean`, OPT-03 is Phase 4
   - What's unclear: Should the grain direction toggle appear in the cut piece form now, or wait for Phase 4?
   - Recommendation: Include it as a disabled/hidden field now (default false), expose the toggle in Phase 4 when optimization needs it. Or include a simple checkbox now since the type already supports it -- low effort, good UX.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.x |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/cut-operations.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CUT-01 | Add cut piece with dimensions | unit | `npx vitest run src/lib/cut-operations.test.ts -t "addCutPiece"` | No -- Wave 0 |
| CUT-02 | Set quantity per cut piece | unit | `npx vitest run src/lib/cut-operations.test.ts -t "quantity"` | No -- Wave 0 |
| CUT-03 | Assign optional label | unit | `npx vitest run src/lib/cut-operations.test.ts -t "label"` | No -- Wave 0 |
| CUT-04 | Auto-assign and override color | unit | `npx vitest run src/lib/cut-operations.test.ts -t "color"` | No -- Wave 0 |
| CUT-05 | Bulk paste parsing | unit | `npx vitest run src/lib/cut-operations.test.ts -t "parseBulk"` | No -- Wave 0 |
| CUT-06 | Duplicate cut piece | unit | `npx vitest run src/lib/cut-operations.test.ts -t "duplicate"` | No -- Wave 0 |
| CUT-07 | Edit and remove cut pieces | unit | `npx vitest run src/lib/cut-operations.test.ts -t "update\|remove"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/cut-operations.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/cut-operations.test.ts` -- covers CUT-01 through CUT-07
- [ ] `src/lib/color-palette.test.ts` -- covers color cycling and palette validation (optional, can be in cut-operations tests)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/board-operations.ts`, `BoardForm.tsx`, `BoardEntry.tsx`, `BoardList.tsx` -- direct pattern to replicate
- Existing codebase: `src/lib/types.ts` -- CutPiece interface already defined
- Existing codebase: `src/lib/board-operations.test.ts` -- test pattern to replicate

### Secondary (MEDIUM confidence)
- Tailwind CSS color palette (500 level values) -- well-known, stable across versions

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all patterns established in Phase 2
- Architecture: HIGH -- direct replication of board input pattern with minor additions
- Pitfalls: HIGH -- pitfalls are straightforward and derive from the known codebase patterns

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- no external dependencies or fast-moving libraries)
