# Phase 7: Summary Dashboard - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds a summary dashboard that shows optimization results at a glance: total boards needed vs available, overall waste percentage, per-board waste breakdown, and optional cost estimate. It supplements the existing cutting diagrams — providing the numbers while diagrams show the visuals. No new optimization logic — purely aggregation and display of data already in OptimizationResult.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- Summary appears above the cutting diagrams in the main area, only after Optimize is clicked
- Not visible before optimization — when no result exists, main area shows existing empty state
- Summary section and cutting diagrams are both inside the existing MainArea component
- Existing summary card from Phase 4 (boards used, pieces placed, waste%, utilization%) should be replaced/enhanced by this proper dashboard

### Stats Presentation
- Horizontal stat cards in a row showing key metrics: boards needed vs available, total waste %, pieces placed
- Waste percentage color-coded: green <10%, amber 10-25%, red >25%
- Stats use large prominent numbers with small labels below
- Use existing semantic color tokens for theming

### Per-Board Breakdown
- Compact table below the stat cards — one row per board showing: board number, dimensions (formatted per unit), pieces count, waste area, waste %, utilization visual bar
- Flat table, no expandable rows — the cutting diagrams below provide visual detail
- Table should work in both dark and light themes

### Price Input & Cost Estimate
- Small number input field inline in the summary section with $ prefix
- Label: "Price per board" — user enters a single price that applies to all boards
- Cost display shows: total cost = boards needed × price per board
- When price is 0 or empty, hide the cost display entirely
- No currency selector for v1 — just plain dollar amounts

### Claude's Discretion
- Exact stat card styling (padding, border-radius, shadows)
- Utilization bar color and width
- Table responsive behavior
- Whether to show a "boards saved" or "waste saved" metric
- Price input step value and width

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.

### Project references
- `.planning/ROADMAP.md` — Phase 7 success criteria (SUM-01 through SUM-04)
- `.planning/REQUIREMENTS.md` — SUM-01: boards needed vs available, SUM-02: waste %, SUM-03: per-board breakdown, SUM-04: price/cost estimate

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `OptimizationResult.summary` — already has totalBoards, totalPieces, placedPieces, totalArea, usedArea, wasteArea, wastePercentage
- `OptimizationResult.boards[]` — BoardLayout with per-board utilizationPercent, wasteArea, pieces.length
- `formatDimension()` from `src/lib/units.ts` — for displaying board dimensions
- `useUnits()` from `src/contexts/UnitContext.tsx` — current unit system
- Existing summary card in `page.tsx` — shows basic stats after optimization, will be replaced by this dashboard

### Established Patterns
- Components use 'use client' directive with Tailwind CSS
- Semantic color tokens: bg-surface, border-border, text-text-primary, text-text-secondary, text-accent
- State managed at page.tsx level, passed as props to components

### Integration Points
- `page.tsx` already has `optimizationResult` state and renders it in MainArea
- Dashboard components will replace/enhance the existing inline summary stats card
- Boards array in page state provides "boards available" count (sum of quantities)
- Price state needs to be added to page.tsx (new useState)

</code_context>

<specifics>
## Specific Ideas

- Dashboard should feel like a "results summary" — the first thing you see after clicking Optimize
- Numbers should be large and scannable — this is a glance-and-go feature
- The existing inline summary card (4 stats in a grid) is a good starting point to enhance

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
