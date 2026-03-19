# Phase 5: Static Visualization - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers SVG cutting diagrams that render the optimization results. Each board displays as an SVG with pieces laid out at their computed positions, color-coded and labeled. Waste areas are visually distinct. Users can hover for tooltips, zoom and pan. No animation — that's Phase 6.

</domain>

<decisions>
## Implementation Decisions

### SVG Rendering
- One SVG per board — each board renders as a separate diagram
- Pieces rendered as colored rectangles at computed x,y positions from OptimizationResult
- Piece colors come from CutPiece.color (already assigned in Phase 3)
- Labels show piece name and dimensions inside each rectangle (if space allows)
- Waste/unused areas rendered as hatched/crosshatch pattern rectangles in a muted color

### Tooltips
- Hover over any piece shows tooltip with: label, dimensions (in current unit), and quantity info
- Use a simple positioned div tooltip (no library needed)
- Tooltip follows cursor or anchors to piece

### Zoom and Pan
- Mouse wheel to zoom, click-drag to pan on the SVG container
- Use CSS transform (scale + translate) on a wrapper div — simple, no library needed
- Reset zoom button to return to fit-all view
- Minimum zoom: fit entire board, maximum zoom: 4x

### Layout
- Board diagrams stack vertically in the main area
- Each board has a header showing "Board N of M" with board dimensions
- Boards with no placed pieces are not shown

### Claude's Discretion
- Exact waste area pattern (hatching angle, density)
- Tooltip positioning logic
- Zoom/pan interaction details (smooth vs discrete)
- SVG viewBox calculation approach
- Label font size scaling with zoom

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/types.ts` — OptimizationResult, BoardLayout, PlacedPiece, WasteRegion types
- `src/lib/optimizer.ts` — optimize() function producing layout data
- `src/lib/units.ts` — formatDimension for tooltip display
- `src/contexts/UnitContext.tsx` — useUnits for current unit system
- `src/components/layout/MainArea.tsx` — Container for visualization
- `src/app/page.tsx` — Has optimizationResult state from Phase 4

### Established Patterns
- React client components with "use client"
- Semantic color tokens for theming
- Props-based data flow from page.tsx

### Integration Points
- BoardLayout[] from optimizationResult.boardLayouts drives the SVG rendering
- MainArea currently shows basic result summary — replace with SVG diagrams
- Phase 6 will add animation on top of these static SVGs
- Phase 7 (Summary Dashboard) will also use optimization result data
- Phase 8 (Export) will need to capture these SVGs for PNG export

</code_context>

<specifics>
## Specific Ideas

- SVG should look clean and professional — the "wow" moment for the app
- Colors must work on both dark and light themes
- Waste areas should be clearly distinguishable but not visually overwhelming
- Labels inside pieces should be readable at default zoom

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
