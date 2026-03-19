---
phase: 1
slug: foundation-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vitest.config.ts` — Wave 0 installs |
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
| 01-01-01 | 01 | 0 | UNIT-01, UNIT-02, UNIT-03 | unit | `npx vitest run src/lib/units.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | DES-01 | manual-only | Visual: dark theme default | N/A | ⬜ pending |
| 01-02-02 | 02 | 1 | DES-02 | manual-only | Visual: theme toggle works | N/A | ⬜ pending |
| 01-02-03 | 02 | 1 | DES-03 | manual-only | Visual: sidebar/main layout | N/A | ⬜ pending |
| 01-02-04 | 02 | 1 | DES-04 | manual-only | Visual: stacked on mobile | N/A | ⬜ pending |
| 01-02-05 | 02 | 1 | DES-05 | manual-only | Visual: responsive at 768px | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration for Next.js project
- [ ] `src/lib/units.test.ts` — Unit conversion and fraction formatting tests (covers UNIT-01, UNIT-02, UNIT-03)
- [ ] `npm install -D vitest` — Install test framework

*Wave 0 creates test infrastructure before feature work begins.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark theme loads by default | DES-01 | Visual rendering | Load app fresh — background should be dark zinc |
| Theme toggle switches themes | DES-02 | Visual rendering | Click sun/moon icon — theme should flip |
| Sidebar/main layout on desktop | DES-03 | Layout rendering | View at >768px — sidebar left, main right |
| Stacked layout on mobile | DES-04 | Layout rendering | View at <768px — sidebar above main |
| Responsive at 768px | DES-05 | Layout rendering | Set viewport to 768px — no horizontal scroll |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
