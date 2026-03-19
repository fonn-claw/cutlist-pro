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
| 03-01-01 | 01 | 1 | CUT-04 | unit | `npx vitest run src/lib/piece-colors.test.ts` | No W0 | pending |
| 03-01-02 | 01 | 1 | CUT-01,CUT-02,CUT-06,CUT-07 | unit | `npx vitest run src/lib/piece-operations.test.ts` | No W0 | pending |
| 03-01-03 | 01 | 1 | CUT-05 | unit | `npx vitest run src/lib/paste-parser.test.ts` | No W0 | pending |
| 03-02-01 | 02 | 2 | CUT-03,CUT-04 | manual | Visual: form, color picker | N/A | pending |

---

## Wave 0 Requirements

- [ ] Test files created as part of TDD tasks in Plan 01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Add piece with label/color | CUT-03, CUT-04 | Form interaction | Add piece, verify label shows, color swatch visible |
| Bulk paste | CUT-05 | Textarea interaction | Paste multi-line data, verify pieces added |
| Duplicate piece | CUT-06 | UI interaction | Click duplicate, verify copy appears |
| Edit/remove piece | CUT-07 | UI interaction | Click edit, change fields; click delete |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity maintained
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] nyquist_compliant: true set in frontmatter

**Approval:** pending
