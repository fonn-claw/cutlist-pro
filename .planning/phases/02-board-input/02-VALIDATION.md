---
phase: 2
slug: board-input
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (already installed) |
| **Config file** | `vitest.config.ts` (exists from Phase 1) |
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

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | BOARD-03 | unit | `npx vitest run src/lib/board-presets.test.ts` | No W0 | pending |
| 02-01-02 | 01 | 1 | BOARD-01, BOARD-02, BOARD-04 | manual | Visual: CRUD operations | N/A | pending |

---

## Wave 0 Requirements

- [ ] `src/lib/board-presets.test.ts` — Preset data validation tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Add board with dimensions | BOARD-01 | Form interaction | Enter 48x96, click Add, verify board appears |
| Set quantity | BOARD-02 | Form interaction | Add board, set qty to 3, verify display |
| Preset auto-fill | BOARD-03 | Dropdown + form | Select 4x8 Plywood, verify dimensions fill |
| Edit/remove board | BOARD-04 | UI interaction | Click edit, change dims; click delete, verify |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity maintained
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] nyquist_compliant: true set in frontmatter

**Approval:** pending
