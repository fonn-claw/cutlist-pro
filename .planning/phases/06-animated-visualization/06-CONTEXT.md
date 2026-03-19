# Phase 6: Animated Visualization - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds animation to the existing SVG cutting diagrams. When the user clicks "Optimize", pieces animate (slide/fade) into their final positions rather than appearing instantly. This is the hero moment — designed to look great in a 15-second demo video.

</domain>

<decisions>
## Implementation Decisions

### Animation Approach
- CSS transitions/keyframes on SVG elements — no animation library needed
- Pieces start at an off-board position (or scale 0) and slide/fade to their computed position
- Staggered timing — pieces animate one at a time or in small groups, not all at once
- Total animation duration: ~3-5 seconds for a typical project (8-15 pieces)

### Animation Trigger
- Animation plays when "Optimize" is clicked (new result computed)
- No animation on page load or when viewing saved results
- User can skip/cancel animation to see final state immediately

### Performance
- Must run at 60fps without jank
- Use CSS transform and opacity for GPU-accelerated animations
- Avoid triggering layout recalculations during animation

### Claude's Discretion
- Exact easing curves and timing functions
- Whether pieces slide from top, from sides, or scale up from center
- Stagger delay between pieces
- Whether to animate waste regions appearing too
- Skip/cancel animation button placement

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/visualization/PieceRect.tsx` — SVG piece rectangle to animate
- `src/components/visualization/BoardDiagram.tsx` — Board container
- `src/components/visualization/CuttingDiagramList.tsx` — Renders all boards
- `src/lib/types.ts` — PlacedPiece with x, y, width, height coordinates
- `src/app/page.tsx` — Has optimizationResult state, triggers optimize

### Established Patterns
- React client components with hooks
- CSS-first styling with Tailwind/custom properties

### Integration Points
- Animation adds to existing PieceRect — enhance with CSS animation classes
- OptimizationResult state change in page.tsx triggers animation
- Phase 8 (Export) PNG capture should use final (post-animation) state

</code_context>

<specifics>
## Specific Ideas

- The animation should be "visually compelling in a 15-second screen recording" (from success criteria)
- Think of it like a puzzle being assembled — pieces sliding into place one by one
- Should feel satisfying and demonstrate the value of the optimization

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
