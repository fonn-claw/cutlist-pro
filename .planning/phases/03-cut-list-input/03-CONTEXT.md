# Phase 3: Cut List Input - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the cut piece CRUD interface in the sidebar — users can add pieces with dimensions, quantity, label, color, and grain direction. Includes bulk-add via paste and duplicate functionality. No optimization, no visualization — just cut piece management.

</domain>

<decisions>
## Implementation Decisions

### Form Layout & Interaction
- Cut piece form below the board section in sidebar — length, width, quantity, label fields with "Add" button
- Piece entries display as compact colored cards — show dimensions, label, quantity, color swatch, and action buttons
- Edit mode: clicking a piece entry makes it inline-editable (same pattern as BoardEntry) — no modals
- Delete: icon button on each entry, no confirmation
- Duplicate: icon button that creates a copy with same dimensions/label/color but new ID

### Color System
- Auto-assign colors from a predefined palette when pieces are added — cycle through 10-12 distinct colors
- Color swatch displayed on each piece card — small circle or square indicator
- Manual override: clicking the color swatch shows a small color picker (simple palette of 12 colors, not a full color picker)
- Colors are stored as hex strings in the CutPiece.color field

### Bulk Add (Quick-Add)
- Paste button or textarea that accepts tab/comma-separated data
- Format: "label, length, width, quantity" per line — flexible parsing (tab or comma)
- Parsed pieces get auto-assigned colors and added to the list
- Show count of added pieces after paste

### Grain Direction
- Checkbox or toggle on each piece entry — "Has grain (no rotation)"
- Default: unchecked (pieces can rotate freely)
- Visual indicator on piece card when grain is set

### State Management
- Cut piece list stored in useState at page level — matches board state pattern
- Each piece gets unique ID via crypto.randomUUID()
- Dimensions entered in display units, stored as mm internally
- Default quantity is 1, default label is empty string

### Claude's Discretion
- Specific color palette choices (aim for distinguishable, muted workshop tones)
- Exact styling of color picker popup
- Paste textarea sizing and positioning
- Animation on add/remove/duplicate

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CutPiece` type from `src/lib/types.ts` — already has id, dimensions, quantity, label, color, grainDirection
- `toInternal()` / `toDisplay()` / `formatDimension()` from `src/lib/units.ts`
- `useUnits()` from `src/contexts/UnitContext.tsx`
- Board component pattern: BoardForm, BoardEntry, BoardList, BoardPresets — follow same structure
- `addBoard` / `updateBoard` / `removeBoard` pattern from `src/lib/board-operations.ts`

### Established Patterns
- TDD for pure logic (presets, operations) then UI components
- Client components with 'use client' directive
- Inline edit pattern from BoardEntry
- Page-level state lifting
- Semantic color tokens: bg-surface, text-text-primary, border-border, text-accent

### Integration Points
- Cut piece input lives in Sidebar below board section
- Cut piece state accessible from page level for Phase 4 optimization
- Colors will be used in Phase 5 visualization for piece identification

</code_context>

<specifics>
## Specific Ideas

- Follow the exact same component structure as boards: PieceForm, PieceEntry, PieceList
- Piece operations: addPiece, updatePiece, removePiece, duplicatePiece — same pure function pattern
- Color palette should be visually distinct colors that work on both dark and light themes
- Bulk paste should be forgiving — handle extra whitespace, missing fields, etc.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
