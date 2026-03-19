# Phase 5: Static Visualization - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers SVG cutting diagrams — each board rendered as an SVG with placed pieces at their computed positions. Pieces are color-coded and labeled, waste areas are visually distinct, tooltips show piece details on hover, and users can zoom/pan. No animation — that's Phase 6.

</domain>

<decisions>
## Implementation Decisions

### SVG Rendering
- Each BoardLayout from OptimizationResult renders as a separate SVG diagram
- SVG viewBox matches board dimensions (in mm internally, scaled for display)
- Pieces rendered as filled rectangles at their x,y positions with the piece's assigned color
- Piece labels (name + dimensions) rendered as text inside or beside the rectangle
- Scale factor computed to fit board SVG within the main area width

### Waste Display
- Waste/unused areas shown with a distinct crosshatch or diagonal line pattern
- Use a lighter, muted color (e.g., zinc-800 in dark mode, zinc-200 in light mode) for waste areas
- Waste regions come from OptimizationResult.boardLayouts[].wasteRegions

### Tooltips
- Hovering over a piece shows a tooltip with: label, dimensions (in current units), quantity info
- Tooltip positioned near the mouse cursor, not overlapping the piece
- Simple div tooltip, not a library — positioned absolutely relative to the SVG container

### Zoom & Pan
- Mouse wheel zooms in/out centered on cursor position
- Click-and-drag pans the view when zoomed in
- Reset zoom button to return to fit-to-container view
- Implement via SVG viewBox manipulation or CSS transform on a wrapper

### Layout
- Board diagrams displayed vertically in the main area, one below another
- Board label above each diagram (e.g., "Board 1: 48" × 96"")
- When no optimization result exists, keep the existing empty state message

### Claude's Discretion
- Exact crosshatch pattern for waste areas
- Tooltip styling details
- Zoom step size and animation smoothness
- Whether to use SVG viewBox or CSS transform for zoom/pan
- Board diagram spacing and margins

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `OptimizationResult` type with `boardLayouts[]` containing `placedPieces[]` and `wasteRegions[]`
- `PlacedPiece` has x, y, dimensions, rotated, color, label fields
- `formatDimension()` for displaying dimensions in current unit system
- `useUnits()` for accessing current unit system
- `MainArea` component — currently shows empty state, will host visualizations
- Page-level `optimizationResult` state from Phase 4

### Established Patterns
- Components in src/components/ with 'use client' directive
- Tailwind dark: variant for theme styling
- Semantic color tokens

### Integration Points
- Visualization renders inside MainArea component
- Consumes OptimizationResult from page state (passed as prop)
- Phase 6 will add animation on top of these static SVGs
- Phase 7 summary dashboard will appear alongside or below visualization

</code_context>

<specifics>
## Specific Ideas

- SVG is the right choice — native browser support, scalable, will be animatable in Phase 6
- Pieces should use their CutPiece.color for fills — these are the auto-assigned or user-chosen colors from Phase 3
- Keep diagrams clean and readable — this is the hero feature area
- Kerf gaps should be visible between pieces (thin lines of background showing through)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
