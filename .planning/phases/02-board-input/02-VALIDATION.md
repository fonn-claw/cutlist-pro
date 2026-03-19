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
| **Framework** | Vitest (from Phase 1) + @testing-library/react |
| **Config file** | vitest.config.ts (exists from Phase 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | BOARD-01, BOARD-02 | unit | `npx vitest run src/__tests__/board-context.test.tsx` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | BOARD-03 | unit | `npx vitest run src/__tests__/presets.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | BOARD-04 | unit | `npx vitest run src/__tests__/board-context.test.tsx` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | BOARD-01..04 | manual | Visual inspection of form | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/board-context.test.tsx` — Board CRUD operations tests (BOARD-01, BOARD-02, BOARD-04)
- [ ] `src/__tests__/presets.test.ts` — Board presets data tests (BOARD-03)
- [ ] Dev dependencies already installed from Phase 1

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Board form renders in sidebar | BOARD-01 | Visual layout check | Open app, verify form appears in sidebar |
| Preset dropdown populates | BOARD-03 | Visual/interactive | Click preset dropdown, verify options appear |
| Edit/remove board entries | BOARD-04 | Interactive behavior | Add board, edit dims, delete entry |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
