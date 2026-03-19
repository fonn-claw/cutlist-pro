# Phase 1: Foundation & Design System - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the app shell, design system (dark/light themes), responsive sidebar/main layout, and the unit system (imperial/metric toggle with internal mm storage). No input forms or optimization logic — just the structural foundation everything else builds on.

</domain>

<decisions>
## Implementation Decisions

### Theme & Visual Style
- Dark theme uses slate/zinc neutrals with amber accent color for warmth — woodworking aesthetic, modern feel
- Theme toggle is a sun/moon icon button in the header bar — standard and discoverable
- Tailwind CSS dark: variant with CSS custom properties for theming — aligns with project constraint (no UI libs)
- Inter/system font stack for typography — clean, no extra font downloads

### Layout & Responsiveness
- Sidebar is 320px fixed width on desktop — sufficient for input forms
- Breakpoint at 768px for stacking — inputs stack above visualization on tablet/mobile per requirements
- Sidebar scrolls independently from main visualization area — keeps viz visible while editing
- Empty main area shows friendly message: "Add boards and pieces to get started"

### Unit System
- Internal storage in millimeters (float) — lossless metric base per STATE.md decision
- Imperial display at 1/16" precision — standard woodworking precision
- Unit toggle in header bar next to theme toggle — always accessible
- Users type decimal inches, displayed as proper fractions (e.g., type "15.75" → displays "15-3/4")

### Claude's Discretion
- Specific shade values for the color palette
- Animation/transition details for theme toggle
- Exact empty state illustration or icon choice
- Tailwind config structure and file organization

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing codebase — greenfield Next.js project

### Established Patterns
- Next.js App Router (per PROJECT.md constraint)
- Tailwind CSS (per PROJECT.md constraint)
- No external UI component libraries

### Integration Points
- This phase creates the shell that all subsequent phases build into
- Sidebar will host Board Input (Phase 2) and Cut List Input (Phase 3)
- Main area will host Visualization (Phase 5/6) and Summary Dashboard (Phase 7)
- Header will host unit toggle, theme toggle, and later export actions (Phase 8)

</code_context>

<specifics>
## Specific Ideas

- Dark theme default is critical — workshop use case with screen glare
- Must look "clean modern UI — not typical ugly woodworking software" (from PROJECT.md)
- Animated visualization is the hero moment — main area should showcase it prominently

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
