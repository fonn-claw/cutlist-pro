# Phase 4: Optimization Engine - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the guillotine bin-packing optimization algorithm. Takes boards and cut pieces as input, produces cutting layouts as output. Includes kerf width setting, grain direction support, and an "Optimize" button. No visualization — just the computation engine and the trigger.

</domain>

<decisions>
## Implementation Decisions

### Algorithm Approach
- Guillotine bin-packing: recursively split available space with horizontal or vertical cuts
- First-fit decreasing heuristic: sort pieces by area (largest first), try each board before opening a new one
- Try both orientations (horizontal-first and vertical-first splits) and keep the better result
- Pieces with grainDirection=true are never rotated — only placed in their original orientation

### Kerf Handling
- Kerf width stored in Settings.kerf (already defined in types.ts, in mm)
- Default kerf: 1/8" (3.175mm) — standard table saw blade
- Kerf is subtracted from available space after each cut — pieces cannot overlap the kerf gap
- Kerf setting input in the sidebar settings area (simple number input)

### Data Flow
- Input: Board[] (from Phase 2 state) + CutPiece[] (from Phase 3 state) + Settings (kerf)
- Output: CuttingLayout — array of BoardLayout, each containing placed pieces with x,y positions
- "Optimize" button in the main area or header — triggers computation
- Results stored in React state at page level for visualization phases to consume

### Output Types
- PlacedPiece: CutPiece reference + x, y position + rotated boolean + board index
- BoardLayout: board reference + array of PlacedPieces + waste area
- CuttingLayout: array of BoardLayouts + summary stats (total boards used, total waste)

### Claude's Discretion
- Specific algorithm implementation details and optimizations
- Whether to use a web worker for computation (recommended if >100 pieces)
- Exact placement of the kerf input and optimize button
- Error handling for edge cases (pieces larger than any board, etc.)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Board` and `CutPiece` types from `src/lib/types.ts`
- `Settings` type with `kerf: number` field already defined
- Board state (useState<Board[]>) and CutPiece state (useState<CutPiece[]>) in page.tsx
- `useUnits()` for displaying kerf value in current unit

### Established Patterns
- Pure functions in src/lib/ with TDD tests
- Page-level state lifting
- Inline form elements in sidebar

### Integration Points
- Algorithm consumes Board[] and CutPiece[] from page state
- Output feeds Phase 5 (Static Visualization) and Phase 7 (Summary Dashboard)
- Kerf setting may go in sidebar or header settings area
- "Optimize" button triggers computation and stores result in page state

</code_context>

<specifics>
## Specific Ideas

- Algorithm must produce valid guillotine cuts — every cut goes edge-to-edge (no L-shaped cuts)
- Performance target: <1 second for typical project (10 boards, 50 pieces)
- Should handle edge case where pieces don't fit on any available board gracefully

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
