---
phase: 4
slug: optimization-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 4 — Validation Strategy

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

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | OPT-01,OPT-02,OPT-03,OPT-04 | unit | `npx vitest run src/lib/optimizer.test.ts` | No W0 | pending |
| 04-02-01 | 02 | 2 | OPT-01,OPT-02 | build+test | `npx tsc --noEmit && npx vitest run` | N/A | pending |

---

## Wave 0 Requirements

- [ ] `src/lib/optimizer.test.ts` — Created as part of TDD in Plan 01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Optimize button click triggers layout | OPT-01 | UI interaction | Add boards+pieces, click Optimize, verify layout appears |
| Kerf setting changes results | OPT-02 | UI interaction | Change kerf, re-optimize, verify different result |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity maintained
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] nyquist_compliant: true set in frontmatter

**Approval:** pending
