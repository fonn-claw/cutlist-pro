# Phase 6: Animated Visualization - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds animation to the static SVG cutting diagrams from Phase 5. When the user clicks "Optimize", pieces animate into their positions (slide/fade) rather than appearing instantly. This is the hero differentiator — the visual payoff that makes CutList Pro memorable. No new data models, no new layout logic — purely visual animation on top of existing components.

</domain>

<decisions>
## Implementation Decisions

### Animation Trigger & Timing
- Animation plays on each Optimize click — every new optimization result triggers the animation
- Re-optimization always replays animation (shows the hero moment every time)
- Total animation duration: 2-3 seconds for a typical project (~10-15 pieces)
- Animation must play smoothly at 60fps without jank or layout shifts

### Piece Entrance Style
- Pieces slide in from the nearest board edge + fade in simultaneously
- Use ease-out easing for natural deceleration (pieces "arrive" and settle)
- Waste regions appear after all pieces are placed (fade in together)
- Board outline/header visible immediately — animation is only for pieces

### Stagger Sequencing
- Pieces animate board-by-board: first board completes, then second board starts
- Within each board, pieces stagger with 50-100ms delay between each
- Short pause (~200ms) between boards for visual separation
- Larger pieces animate first (sorted by area descending) for dramatic effect

### Animation Controls
- Click anywhere during animation to skip to final state instantly
- No play/pause/replay buttons — keep UI clean
- If user modifies inputs while animation is playing, animation stops and result clears

### Claude's Discretion
- Exact slide distance and direction calculation per piece
- Whether to use CSS transitions, CSS animations, or requestAnimationFrame
- Waste region fade timing and opacity curve
- Whether board headers animate or appear instantly

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above and ROADMAP.md Phase 6 description.

### Project references
- `.planning/ROADMAP.md` — Phase 6 success criteria (VIS-04, 60fps, 15-second screen recording)
- `.planning/REQUIREMENTS.md` — VIS-04: "Animated optimization — pieces slide/fade into position when user clicks Optimize"
- `.planning/phases/05-static-visualization/05-CONTEXT.md` — Phase 5 decisions on SVG rendering approach

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PieceRect` component (`src/components/visualization/PieceRect.tsx`) — renders individual pieces, will need animation state props
- `BoardDiagram` component (`src/components/visualization/BoardDiagram.tsx`) — renders single board SVG, orchestrates piece rendering
- `CuttingDiagramList` component (`src/components/visualization/CuttingDiagramList.tsx`) — maps OptimizationResult to BoardDiagrams
- `useZoomPan` hook (`src/hooks/useZoomPan.ts`) — zoom/pan state, animation should work alongside it

### Established Patterns
- SVG inline rendering with React JSX — pieces are `<rect>` elements in SVG coordinate space
- CSS transform on wrapper div for zoom/pan — animation approach should be compatible
- `PlacedPiece` type has x, y, width, height for final positions — animation needs start positions

### Integration Points
- `page.tsx` passes `optimizationResult` to `CuttingDiagramList` — animation triggers when this prop changes
- `BoardDiagram` already wraps pieces in overflow-hidden container — provides animation boundary
- Tooltip interaction should work after animation completes (not during)

</code_context>

<specifics>
## Specific Ideas

- "The animated visualization is the hero moment — designed to look great in a 15-second demo video" (from PROJECT.md)
- Animation should feel satisfying — like a puzzle solving itself
- Pieces sliding into a board should feel like a Tetris board filling up
- Keep it clean and modern — no bouncing, no spring physics, just smooth deceleration

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
