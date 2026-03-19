# Phase 4: Optimization Engine - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the guillotine bin-packing optimization algorithm. Given a list of boards and cut pieces, it computes optimal layouts using only guillotine (straight-through) cuts, respecting kerf width and grain direction constraints. No visualization — just the algorithm producing layout data that Phase 5 will render.

</domain>

<decisions>
## Implementation Decisions

### Algorithm Approach
- Guillotine bin-packing: pieces placed via recursive splitting of available rectangles
- First Fit Decreasing heuristic: sort pieces by area (largest first), place each in first board with space
- If a piece doesn't fit any existing board, start a new board from the available stock
- Kerf accounted for by expanding piece dimensions during placement (piece + kerf on each cut side)

### Kerf Configuration
- Default kerf: 1/8" (3.175mm) — standard table saw blade width
- User-configurable via a settings input (stored in mm internally)
- Kerf applied between cuts, not on board edges

### Grain Direction
- Pieces marked with grainDirection=true cannot be rotated during placement
- Pieces with grainDirection=false can be rotated 90 degrees if it produces a better fit
- Algorithm tries both orientations for rotatable pieces

### Output Data Structure
- Result contains: array of board layouts, each with placed pieces (position x,y + dimensions) and waste regions
- Unplaced pieces tracked separately (if boards run out)
- Total waste calculation per board and overall

### Claude's Discretion
- Specific placement algorithm variant (shelf-based vs recursive guillotine)
- Tie-breaking heuristics when multiple placements score equally
- Performance optimization details
- Exact data structure field names for layout results

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/types.ts` — Board, CutPiece, Settings interfaces (with kerf field)
- `src/lib/units.ts` — Unit conversion utilities
- All dimensions already stored in mm internally

### Established Patterns
- Pure functions in lib/ with TDD tests
- No UI dependencies — algorithm is pure TypeScript

### Integration Points
- Algorithm takes Board[] and CutPiece[] as input (from page.tsx state)
- Output feeds Phase 5 (Static Visualization) — SVG rendering of layouts
- Output feeds Phase 7 (Summary Dashboard) — waste calculations, board counts
- "Optimize" button will be added in Phase 5 to trigger the algorithm

</code_context>

<specifics>
## Specific Ideas

- Algorithm must produce layouts using ONLY guillotine cuts (no irregular nesting)
- Must handle real-world scenarios: 20+ pieces across multiple boards
- Performance should be fast enough for interactive use (<1 second for typical projects)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
