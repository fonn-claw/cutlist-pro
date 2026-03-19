---
phase: 5
slug: static-visualization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (already installed) |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 05-01-01 | 01 | 1 | VIS-01,VIS-02,VIS-03 | build | `npx tsc --noEmit && npx vitest run` | pending |
| 05-01-02 | 01 | 1 | VIS-05,VIS-06 | build | `npx tsc --noEmit && npx vitest run` | pending |
| 05-02-01 | 02 | 2 | VIS-01 to VIS-06 | manual | Visual verification | pending |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SVG boards render with pieces | VIS-01 | Visual rendering | Add boards+pieces, optimize, verify SVG diagrams appear |
| Pieces color-coded and labeled | VIS-02 | Visual rendering | Verify colors match piece colors, labels visible |
| Waste areas distinct | VIS-03 | Visual rendering | Verify crosshatch/pattern on unused areas |
| Hover tooltips | VIS-05 | Mouse interaction | Hover over piece, verify tooltip with dims/label |
| Zoom and pan | VIS-06 | Mouse interaction | Scroll to zoom, drag to pan, verify smooth |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity maintained
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] nyquist_compliant: true set in frontmatter

**Approval:** pending
