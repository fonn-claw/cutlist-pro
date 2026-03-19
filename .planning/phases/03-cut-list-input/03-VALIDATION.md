---
phase: 3
slug: cut-list-input
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (from Phase 1) |
| **Config file** | vitest.config.ts (exists) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

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
| 03-01-01 | 01 | 1 | CUT-01..07 | unit | `npx vitest run src/lib/cut-operations.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | CUT-01..07 | build+manual | `npx next build` | N/A | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/lib/cut-operations.test.ts` — Cut piece CRUD, color, bulk parse, duplicate tests
- [ ] Dev dependencies already installed from Phase 1

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Color picker swatch display | CUT-04 | Visual rendering | Verify swatches visible on dark/light |
| Bulk paste textarea | CUT-05 | Interactive behavior | Paste multi-line, verify pieces created |
| Inline edit/delete | CUT-07 | Interactive behavior | Edit dims, delete entry |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity
- [ ] Wave 0 covers all MISSING references
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
