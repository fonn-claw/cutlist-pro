# Phase 2: Board Input - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the Board Input UI: a form in the sidebar where users can add, edit, and remove stock boards with dimensions and quantities, plus a preset selector for common board sizes. No cut pieces, no optimization — just board management.

</domain>

<decisions>
## Implementation Decisions

### Board Form Layout
- Inline form with add button at bottom of sidebar — compact, always visible
- Board entries displayed as card list with inline edit — click to edit dimensions
- Preset selector as a dropdown/select above the form — pick preset to auto-fill dimensions
- Delete via icon button with no confirmation — boards are easy to re-add

### Presets & Data
- Default presets: 4x8 plywood, 2x4, 1x6, 1x8, 1x10, 1x12 — covers 90% of projects
- Presets stored as const array in lib/presets.ts — simple, no fetching
- No name field for boards — dimensions + quantity are sufficient (Board type already defined)
- Default quantity is 1

### State Management
- React useState in a BoardContext provider — matches UnitContext pattern from Phase 1
- Board IDs via crypto.randomUUID()
- Inline validation on blur — dimensions must be > 0, quantity >= 1
- Empty state shows "No boards added" with prompt to add or use preset

### Claude's Discretion
- Exact form field sizing and spacing
- Add button icon/style
- Preset dropdown styling details
- Animation on add/remove

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/types.ts` — Board interface already defined with id, dimensions (mm), quantity
- `src/contexts/UnitContext.tsx` — UnitProvider and useUnits hook for display formatting
- `src/lib/units.ts` — formatImperial, formatMetric, parseToMm, formatDimension utilities
- `src/components/layout/Sidebar.tsx` — Empty sidebar shell ready for board input content
- `src/components/layout/Header.tsx` — Header with theme/unit toggles

### Established Patterns
- Client components use "use client" directive
- Context pattern: createContext + Provider + useX hook (see UnitContext)
- Semantic color tokens: bg-surface, text-text-primary, border-border, text-accent
- Tailwind utility classes for styling, no external UI libraries

### Integration Points
- Board input form lives inside the Sidebar component
- BoardContext wraps app in layout.tsx alongside UnitProvider and ThemeProvider
- Board data feeds Phase 4 (Optimization Engine) — must expose boards array
- useUnits().formatValue() for displaying dimensions, useUnits().toMm() for parsing input

</code_context>

<specifics>
## Specific Ideas

- Users type decimal inches (e.g., "48"), displayed as proper fractions via formatImperial
- Preset dimensions should be stored in mm internally, displayed in current unit
- Board type already has id, dimensions, quantity — no schema changes needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
