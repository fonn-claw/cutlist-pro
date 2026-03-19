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
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | None — Wave 0 creates vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

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
| 01-01-01 | 01 | 1 | DES-01, DES-02 | unit | `npx vitest run src/__tests__/theme.test.tsx` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | DES-03 | unit | `npx vitest run src/__tests__/layout.test.tsx` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | DES-04, DES-05 | manual | Visual inspection at 768px | N/A | ⬜ pending |
| 01-02-01 | 02 | 1 | UNIT-01, UNIT-02, UNIT-03 | unit | `npx vitest run src/__tests__/units.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration with jsdom environment and @vitejs/plugin-react
- [ ] `src/setupTests.ts` — Import @testing-library/jest-dom
- [ ] `src/__tests__/units.test.ts` — Unit conversion and fraction formatting tests (UNIT-01, UNIT-02, UNIT-03)
- [ ] `src/__tests__/theme.test.tsx` — Theme provider and toggle tests (DES-01, DES-02)
- [ ] `src/__tests__/layout.test.tsx` — Layout structure tests (DES-03)
- [ ] Dev dependencies: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stacked layout at mobile | DES-04 | CSS responsive breakpoints not testable in jsdom | Resize browser to 768px, verify inputs stack above viz |
| Usable at 768px | DES-05 | Visual/interactive check | Open at 768px, verify no horizontal scroll, no overlap |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
