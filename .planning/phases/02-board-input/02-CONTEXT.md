# Phase 2: Board Input - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the stock board CRUD interface in the sidebar — users can add boards with dimensions, set quantities, select from presets, and edit/remove entries. No cut pieces, no optimization, no visualization — just board management.

</domain>

<decisions>
## Implementation Decisions

### Form Layout & Interaction
- Inline add form at top of board list in sidebar — length, width, quantity fields with an "Add" button
- Board entries display as compact cards below the form — show dimensions (formatted per unit system), quantity, and action buttons
- Edit mode: clicking a board entry makes it inline-editable (same fields as add form) — no modal dialogs
- Delete: icon button on each entry with no confirmation for single items (undo would be v2)

### Board Presets
- Preset dropdown/select above the manual entry form — selecting a preset auto-fills length and width
- Common presets: 4×8 Plywood (48"×96"), 1×6 (0.75"×5.5"), 1×8 (0.75"×7.25"), 1×10 (0.75"×9.25"), 1×12 (0.75"×11.25"), 2×4 (1.5"×3.5"), 2×6 (1.5"×5.5"), 2×8 (1.5"×7.5"), 2×10 (1.5"×9.25"), 2×12 (1.5"×11.25")
- Preset names use nominal sizes (e.g., "2×4") but fill in actual dimensions
- After preset selection, user can still modify dimensions before adding

### State Management
- Board list stored in React state (useState) at page level — lifted to parent for future optimization access
- Each board gets a unique ID via crypto.randomUUID()
- Dimensions entered in current display unit (in or mm), converted to internal mm on add/edit
- Default quantity is 1

### Claude's Discretion
- Specific styling of board entry cards (padding, borders, hover states)
- Input field widths and number input behavior (step values, min/max)
- Exact preset list ordering
- Empty state message when no boards added yet

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Board` type from `src/lib/types.ts` — already has id, dimensions (mm), quantity
- `toInternal()` / `toDisplay()` from `src/lib/units.ts` — convert between display and storage units
- `formatDimension()` from `src/lib/units.ts` — format mm values for display in current unit
- `useUnits()` from `src/contexts/UnitContext.tsx` — access current unit system
- `Sidebar` component from `src/components/layout/Sidebar.tsx` — container for board input

### Established Patterns
- `'use client'` directive on interactive components
- Tailwind dark: variant for theme-aware styling
- Zinc neutrals + amber accent color palette

### Integration Points
- Board input lives inside `Sidebar` component
- Board state needs to be accessible from page level (for future optimization in Phase 4)
- Dimensions display using `formatDimension()` respecting current unit toggle

</code_context>

<specifics>
## Specific Ideas

- Preset dimensions use actual lumber dimensions, not nominal (e.g., 2×4 is actually 1.5"×3.5")
- Board entries should feel lightweight and fast — woodworkers are adding multiple boards quickly
- Number inputs should allow fractional inches for custom sizes (parsed as decimal, stored as mm)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
