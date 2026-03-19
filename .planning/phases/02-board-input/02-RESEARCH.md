# Phase 2: Board Input - Research

**Researched:** 2026-03-19
**Domain:** React form CRUD, state management, preset data
**Confidence:** HIGH

## Summary

Phase 2 is a well-scoped React CRUD interface for stock board management. The existing codebase from Phase 1 provides all the foundational pieces: the `Board` type with id/dimensions/quantity, unit conversion utilities (`toInternal`/`toDisplay`/`formatDimension`), the `useUnits` hook, the `Sidebar` component container, and the semantic color token system. The work is entirely standard React state management and form handling -- no external libraries needed.

The main technical considerations are: (1) lifting board state to the page level so future phases can access it, (2) correct unit conversion on input/display (users type in display units, stored as mm internally), (3) preset data with nominal vs actual lumber dimensions, and (4) inline editing UX without modal dialogs.

**Primary recommendation:** Build three components -- `BoardForm` (add/edit form), `BoardList` (renders entries), and `BoardPresets` (dropdown selector) -- with board state managed via `useState<Board[]>` lifted to `page.tsx`. Use a static preset data array in a dedicated `src/lib/board-presets.ts` file.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Inline add form at top of board list in sidebar -- length, width, quantity fields with an "Add" button
- Board entries display as compact cards below the form -- show dimensions (formatted per unit system), quantity, and action buttons
- Edit mode: clicking a board entry makes it inline-editable (same fields as add form) -- no modal dialogs
- Delete: icon button on each entry with no confirmation for single items (undo would be v2)
- Preset dropdown/select above the manual entry form -- selecting a preset auto-fills length and width
- Common presets: 4x8 Plywood (48"x96"), 1x6 (0.75"x5.5"), 1x8 (0.75"x7.25"), 1x10 (0.75"x9.25"), 1x12 (0.75"x11.25"), 2x4 (1.5"x3.5"), 2x6 (1.5"x5.5"), 2x8 (1.5"x7.5"), 2x10 (1.5"x9.25"), 2x12 (1.5"x11.25")
- Preset names use nominal sizes (e.g., "2x4") but fill in actual dimensions
- After preset selection, user can still modify dimensions before adding
- Board list stored in React state (useState) at page level -- lifted to parent for future optimization access
- Each board gets a unique ID via crypto.randomUUID()
- Dimensions entered in current display unit (in or mm), converted to internal mm on add/edit
- Default quantity is 1

### Claude's Discretion
- Specific styling of board entry cards (padding, borders, hover states)
- Input field widths and number input behavior (step values, min/max)
- Exact preset list ordering
- Empty state message when no boards added yet

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BOARD-01 | User can add stock boards with length and width dimensions | BoardForm component with length/width number inputs, toInternal() conversion on submit |
| BOARD-02 | User can set quantity per stock board | Quantity number input in BoardForm, default value 1, min 1 |
| BOARD-03 | User can select from common board presets | BoardPresets dropdown with static preset data array, auto-fills form fields |
| BOARD-04 | User can remove or edit existing board entries | BoardList with inline edit toggle and delete button per entry |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Component framework | Already in project |
| Next.js | 16.2.0 | App framework | Already in project |
| Tailwind CSS | 4.x | Styling | Already in project, established design tokens |
| Vitest | 4.1.0 | Testing | Already configured with path aliases |

### Supporting
No additional libraries needed. This phase uses only React built-ins (useState, useCallback) and existing project utilities.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useState for boards | useReducer | Overkill for simple CRUD on a flat array; useState + helper functions is cleaner |
| Raw number inputs | Form library (react-hook-form) | Project constraint: no UI libs; simple form doesn't justify adding one |

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/
    board-presets.ts       # Static preset data array
    types.ts               # Board type (already exists)
    units.ts               # Conversion utils (already exists)
  components/
    boards/
      BoardForm.tsx        # Add form (length, width, quantity + Add button)
      BoardList.tsx        # Renders board entries with edit/delete
      BoardEntry.tsx       # Single board card (display + inline edit mode)
      BoardPresets.tsx      # Preset dropdown that auto-fills form
    layout/
      Sidebar.tsx          # Container (already exists)
  app/
    page.tsx               # Lifts board state, passes to Sidebar children
```

### Pattern 1: State Lifting to Page Level
**What:** Board array state lives in `page.tsx`, passed down as props to sidebar board components.
**When to use:** When state needs to be shared across sidebar and main area in future phases.
**Example:**
```typescript
// page.tsx -- 'use client' needed since it now has state
'use client';

import { useState, useCallback } from 'react';
import type { Board } from '@/lib/types';

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);

  const addBoard = useCallback((board: Omit<Board, 'id'>) => {
    setBoards(prev => [...prev, { ...board, id: crypto.randomUUID() }]);
  }, []);

  const updateBoard = useCallback((id: string, updates: Partial<Omit<Board, 'id'>>) => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const removeBoard = useCallback((id: string) => {
    setBoards(prev => prev.filter(b => b.id !== id));
  }, []);

  // Pass boards + handlers to Sidebar children
}
```

### Pattern 2: Inline Edit Toggle
**What:** Each board entry has a boolean `editingId` state (tracked in BoardList). Clicking an entry switches it to editable mode using the same form fields as the add form.
**When to use:** For edit-in-place without modals.
**Example:**
```typescript
// BoardList.tsx
const [editingId, setEditingId] = useState<string | null>(null);

// BoardEntry renders either display or edit mode based on editingId
```

### Pattern 3: Unit-Aware Input/Display
**What:** Form inputs accept values in the user's current display unit. On submit/save, values are converted to mm via `toInternal()`. Display uses `formatDimension()` to show mm values in the current unit system.
**When to use:** Every dimension input/output in the app.
**Example:**
```typescript
// On form submit:
const lengthMm = toInternal(parseFloat(lengthInput), units);
const widthMm = toInternal(parseFloat(widthInput), units);
const board: Omit<Board, 'id'> = {
  dimensions: { length: lengthMm, width: widthMm },
  quantity: parseInt(quantityInput) || 1,
};

// On display:
formatDimension(board.dimensions.length, units) // "48" or "1219.2mm"
```

### Pattern 4: Preset Data Structure
**What:** Static array of preset objects with nominal name, actual length/width in inches.
**Example:**
```typescript
// src/lib/board-presets.ts
export interface BoardPreset {
  name: string;        // Nominal name: "2x4", "4x8 Plywood"
  lengthIn: number;    // Actual length in inches
  widthIn: number;     // Actual width in inches
}

export const BOARD_PRESETS: BoardPreset[] = [
  { name: '4x8 Plywood', lengthIn: 96, widthIn: 48 },
  { name: '1x6', lengthIn: 96, widthIn: 5.5 },
  { name: '1x8', lengthIn: 96, widthIn: 7.25 },
  { name: '1x10', lengthIn: 96, widthIn: 9.25 },
  { name: '1x12', lengthIn: 96, widthIn: 11.25 },
  { name: '2x4', lengthIn: 96, widthIn: 3.5 },
  { name: '2x6', lengthIn: 96, widthIn: 5.5 },
  { name: '2x8', lengthIn: 96, widthIn: 7.5 },
  { name: '2x10', lengthIn: 96, widthIn: 9.25 },
  { name: '2x12', lengthIn: 96, widthIn: 11.25 },
];
```

**Note on preset dimensions:** The CONTEXT.md specifies 1x6 as 0.75"x5.5", but lumber boards also have a length. Standard lumber comes in 8-foot (96") lengths. The preset should fill both length AND width. The "thickness" dimension (0.75" for 1x, 1.5" for 2x) is not relevant for 2D cut optimization -- we use width (the face width) and length. The widthIn values above use the actual face widths from the CONTEXT.md preset list.

### Anti-Patterns to Avoid
- **Storing display-unit values:** Always store mm internally. Never persist inches.
- **Direct state mutation:** Always use setBoards with a new array (spread/map/filter).
- **Modal edit dialogs:** Decision says inline editing, not modals.
- **Overcomplicating with useReducer:** For a flat Board[] with 3 operations (add/update/remove), useState + callbacks is simpler and sufficient.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique IDs | Custom UUID generator | `crypto.randomUUID()` | Built into modern browsers, cryptographically random |
| Unit conversion | Custom math per component | `toInternal()`/`toDisplay()` from `src/lib/units.ts` | Already tested, centralizes conversion logic |
| Dimension formatting | Custom string formatting | `formatDimension()` from `src/lib/units.ts` | Already handles imperial fractions and metric |

## Common Pitfalls

### Pitfall 1: Forgetting Unit Conversion on Edit
**What goes wrong:** When editing an existing board, the form pre-fills with mm values instead of display units, causing user to see "1219.2" instead of "48".
**Why it happens:** Board stores mm internally; forgetting to call `toDisplay()` when populating edit form.
**How to avoid:** Always call `toDisplay(board.dimensions.length, units)` when populating edit form fields.
**Warning signs:** Large numbers appearing in form fields when unit is set to imperial.

### Pitfall 2: Unit System Change During Edit
**What goes wrong:** User starts editing in inches, toggles to mm, and the raw input value (e.g., "48") is now interpreted as mm instead of inches.
**Why it happens:** Form input holds a string/number in the current display unit, but unit can change mid-edit.
**How to avoid:** On unit toggle, if a board is being edited, either (a) cancel the edit, or (b) convert the in-progress input values. Simplest approach: cancel active edits on unit change.

### Pitfall 3: NaN/Empty Input Handling
**What goes wrong:** User clears an input field and clicks Add, creating a board with NaN dimensions.
**Why it happens:** `parseFloat("")` returns NaN.
**How to avoid:** Validate inputs before submit. Disable Add button when fields are empty or invalid. Use `|| 0` fallback or explicit validation.
**Warning signs:** NaN appearing in board cards or passed to optimization later.

### Pitfall 4: page.tsx Losing Server Component Status
**What goes wrong:** Adding `useState` to page.tsx requires `'use client'` directive, which makes the page a client component.
**Why it happens:** State hooks require client components.
**How to avoid:** This is intentional and acceptable. The page is a thin shell. The layout.tsx remains a server component (metadata stays there). Just add `'use client'` to page.tsx.
**Warning signs:** Next.js error about useState in server component if you forget the directive.

### Pitfall 5: Preset Dimensions in Wrong Unit System
**What goes wrong:** Presets are defined in inches, but user has metric selected. Auto-filling "96" when metric is active would be wrong.
**Why it happens:** Presets use inch values but form interprets input as current display unit.
**How to avoid:** When a preset is selected, convert preset inch values to the current display unit before filling the form. Or: convert preset inches directly to mm and set them as internal values, bypassing the form input entirely.

## Code Examples

### Board CRUD Operations (Pure Functions for Testing)
```typescript
// These can be tested without React -- pure array operations
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
```

### Preset Selection Handler
```typescript
import { BOARD_PRESETS, type BoardPreset } from '@/lib/board-presets';
import { toDisplay } from '@/lib/units';
import type { UnitSystem } from '@/lib/types';

function handlePresetSelect(preset: BoardPreset, units: UnitSystem) {
  // Convert preset inches to mm first, then to display units
  const lengthMm = preset.lengthIn * 25.4;
  const widthMm = preset.widthIn * 25.4;
  setLengthInput(String(toDisplay(lengthMm, units)));
  setWidthInput(String(toDisplay(widthMm, units)));
}
```

### Input Validation
```typescript
function isValidDimension(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

function isFormValid(length: string, width: string, quantity: string): boolean {
  return isValidDimension(length) && isValidDimension(width) &&
    Number.isInteger(Number(quantity)) && Number(quantity) >= 1;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `uuid` npm package | `crypto.randomUUID()` | 2022+ (baseline browser support) | No dependency needed |
| Controlled forms with onChange per field | Same (React standard) | Still current | Simple, well-understood pattern |

No deprecated APIs or patterns are relevant to this phase.

## Open Questions

1. **Default board length for 1x and 2x presets**
   - What we know: CONTEXT.md specifies width values (actual dimensions) but not length for dimensional lumber
   - What's unclear: Should presets assume 8-foot (96") boards or leave length blank for user to fill?
   - Recommendation: Default to 96" (8 feet) as that's the most common lumber length. Users can edit before adding.

2. **Number input step values**
   - What we know: Users type decimal inches (e.g., 48.5); metric users type mm
   - What's unclear: What step increment for the number input?
   - Recommendation: Use `step="any"` for maximum flexibility, or `step="0.125"` (1/8") for imperial. This is Claude's discretion per CONTEXT.md.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BOARD-01 | Add board with length/width dimensions | unit | `npx vitest run src/lib/board-operations.test.ts -t "add board"` | No - Wave 0 |
| BOARD-02 | Set quantity per board | unit | `npx vitest run src/lib/board-operations.test.ts -t "quantity"` | No - Wave 0 |
| BOARD-03 | Preset selection auto-fills dimensions | unit | `npx vitest run src/lib/board-presets.test.ts` | No - Wave 0 |
| BOARD-04 | Edit and remove board entries | unit | `npx vitest run src/lib/board-operations.test.ts -t "update\|remove"` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/board-operations.test.ts` -- covers BOARD-01, BOARD-02, BOARD-04 (add/update/remove pure functions)
- [ ] `src/lib/board-presets.test.ts` -- covers BOARD-03 (preset data validation, dimension correctness)

Note: Vitest environment is `node` (no jsdom), so tests focus on pure logic functions (board CRUD operations, preset data integrity, unit conversion with presets). Component rendering tests are not in scope given the test environment constraint.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/types.ts`, `src/lib/units.ts`, `src/contexts/UnitContext.tsx`, `src/components/layout/Sidebar.tsx`, `src/app/page.tsx`
- Phase CONTEXT.md: locked decisions, preset list, state management approach
- Phase 1 CONTEXT.md: design system tokens, layout patterns

### Secondary (MEDIUM confidence)
- Standard React patterns for useState, useCallback, controlled forms -- well-established, no version concerns

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and working from Phase 1
- Architecture: HIGH -- straightforward React CRUD, patterns well established in codebase
- Pitfalls: HIGH -- unit conversion edge cases are well-understood from Phase 1 unit system work

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable domain, no moving parts)
