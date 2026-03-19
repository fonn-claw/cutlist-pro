---
phase: 5
slug: static-visualization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 5 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (from Phase 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Max feedback latency:** 15 seconds

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SVG board rendering | VIS-01 | Visual rendering | Run optimize, verify SVG boards appear |
| Color-coded labeled pieces | VIS-02 | Visual rendering | Verify colors match, labels readable |
| Waste areas distinct | VIS-03 | Visual rendering | Verify hatched pattern on unused areas |
| Hover tooltips | VIS-05 | Interactive | Hover piece, verify tooltip with dims |
| Zoom and pan | VIS-06 | Interactive | Scroll to zoom, drag to pan, reset button |

**Approval:** pending
