---
phase: 01-foundation-design-system
plan: 02
subsystem: ui
tags: [tailwind-v4, next-themes, dark-mode, responsive-layout, css-custom-properties]

# Dependency graph
requires:
  - phase: 01-foundation-design-system/01
    provides: UnitSystem type, UnitContext/UnitProvider, project scaffold
provides:
  - Themed app shell with dark/light toggle via next-themes
  - Responsive sidebar (320px) + main area layout
  - Header with branding, UnitToggle, ThemeToggle
  - Semantic color token system via Tailwind v4 @theme inline
  - Empty state placeholder in main area
affects: [02-board-input, 03-cut-list-input, 05-visualization, 06-animation, 07-summary-dashboard, 08-export]

# Tech tracking
tech-stack:
  added: [next-themes]
  patterns: [css-custom-properties-theming, semantic-color-tokens, client-component-wrappers]

key-files:
  created:
    - src/components/ThemeProvider.tsx
    - src/components/ui/ThemeToggle.tsx
    - src/components/ui/UnitToggle.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/Sidebar.tsx
    - src/components/layout/MainArea.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx

key-decisions:
  - "ThemeProvider client wrapper for server component layout compatibility"
  - "Tailwind v4 @theme inline for dynamic CSS variable tokens"
  - "Slate/zinc neutrals with amber accent for woodworking aesthetic"

patterns-established:
  - "Semantic color tokens: use bg-surface, text-text-primary, border-border instead of raw colors"
  - "Client component wrapper pattern: ThemeProvider.tsx wraps next-themes for server layout"
  - "Hydration safety: mounted state guard pattern for theme-dependent UI"

requirements-completed: [DES-01, DES-02, DES-03, DES-04, DES-05]

# Metrics
duration: 2min
completed: 2026-03-19
---

# Phase 01 Plan 02: App Shell Summary

**Dark/light themed app shell with Tailwind v4 semantic tokens, responsive sidebar/main layout, and unit/theme toggle controls**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-19T00:43:18Z
- **Completed:** 2026-03-19T00:45:29Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 9

## Accomplishments
- Tailwind v4 CSS-first theme system with @theme inline semantic color tokens (surface, text-primary, accent, border) that auto-switch between dark and light themes via CSS custom properties
- Responsive sidebar (320px desktop, full-width mobile) + main area layout with independent scrolling and 768px breakpoint stacking
- Header with CutList Pro branding in accent color, UnitToggle (in/mm), and ThemeToggle (sun/moon icons) with hydration safety

## Task Commits

Each task was committed atomically:

1. **Task 1: Theme system** - `c147a1a` (feat)
2. **Task 2: Responsive layout** - `3886b3a` (feat)
3. **Task 3: Visual verification** - auto-approved (no code changes)

## Files Created/Modified
- `src/app/globals.css` - Tailwind v4 @theme inline with semantic color tokens and dark/light CSS variables
- `src/app/layout.tsx` - Root layout with ThemeProvider (dark default) and UnitProvider
- `src/app/page.tsx` - Responsive sidebar/main layout composition replacing Next.js boilerplate
- `src/components/ThemeProvider.tsx` - Client wrapper for next-themes ThemeProvider
- `src/components/ui/ThemeToggle.tsx` - Sun/moon toggle with hydration safety via mounted state
- `src/components/ui/UnitToggle.tsx` - Imperial/metric toggle displaying 'in' or 'mm'
- `src/components/layout/Header.tsx` - App header with branding, UnitToggle, ThemeToggle
- `src/components/layout/Sidebar.tsx` - 320px scrollable sidebar with placeholder content
- `src/components/layout/MainArea.tsx` - Main visualization area with empty state message

## Decisions Made
- Created ThemeProvider.tsx client wrapper since next-themes provider needs 'use client' but layout.tsx is a server component
- Used @theme inline (not @theme) so Tailwind generates utility classes that reference CSS variables without adding default values
- Slate/zinc neutrals with amber accent per CONTEXT.md locked decision for woodworking aesthetic

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- App shell complete and ready for Phase 2 (Board Input) to add forms into the Sidebar
- All semantic color tokens established for consistent theming across future components
- Layout structure supports future visualization in MainArea and export actions in Header

## Self-Check: PASSED

- All 9 files verified present on disk
- Commit c147a1a (Task 1) verified in git log
- Commit 3886b3a (Task 2) verified in git log

---
*Phase: 01-foundation-design-system*
*Completed: 2026-03-19*
