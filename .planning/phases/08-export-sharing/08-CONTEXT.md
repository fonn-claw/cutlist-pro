# Phase 8: Export & Sharing - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds three export capabilities: PNG image download, print-friendly view, and URL-based project sharing. All client-side — no backend. These are the final features before v1 is complete.

</domain>

<decisions>
## Implementation Decisions

### PNG Export (EXP-01)
- Serialize SVG diagrams to PNG using Canvas API (no external libraries)
- Clone SVG, inline all computed styles, create Image from SVG data URI, draw to canvas, trigger download
- Export all boards as a single vertical PNG with summary stats at top
- Download button in the main area toolbar, only visible when optimization result exists
- Filename: "cutlist-pro-layout.png"

### Print-Friendly View (EXP-02)
- CSS @media print stylesheet approach — no separate page needed
- Print hides sidebar, header theme toggle, buttons; shows only summary + diagrams
- Force light background for print (dark backgrounds waste ink)
- Add a "Print" button next to the PNG export button
- Use window.print() — simple and universal

### URL Sharing (EXP-03)
- Encode project state (boards, cutPieces, kerf) as JSON, compress with base64, put in URL hash
- State includes: boards array, cutPieces array, kerf value
- On page load, check for hash, decode and restore state, auto-run optimization
- "Copy Link" button copies URL to clipboard with visual feedback
- Use lz-string or similar compression to keep URLs manageable for ~20 pieces
- Actually, use built-in btoa/atob for simplicity — test URL length with realistic data

### Export Toolbar
- Horizontal bar with 3 buttons (Export PNG, Print, Copy Link) above summary dashboard
- Only visible when optimizationResult exists
- Buttons use consistent styling: small, secondary appearance

### Claude's Discretion
- Exact button styling and icons
- Toast/feedback duration for "Link copied"
- PNG resolution and padding
- Whether to include summary stats in PNG or just diagrams

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- SVG diagrams in src/components/visualization/ — BoardDiagram renders complete SVG elements
- SummaryDashboard component — could be included in print view
- page.tsx has all state (boards, cutPieces, kerf, optimizationResult)

### Integration Points
- Export toolbar goes in MainArea, above SummaryDashboard
- URL restore needs to set boards, cutPieces, kerf state on page load
- Print CSS goes in globals.css

</code_context>
