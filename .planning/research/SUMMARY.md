# Project Research Summary

**Project:** CutList Pro - Woodworking Cut Optimizer
**Domain:** Client-side 2D guillotine bin-packing tool with SVG visualization
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

CutList Pro is a stateless, client-side woodworking cut list optimizer that takes stock board dimensions and desired piece dimensions as input, runs a guillotine bin-packing algorithm, and outputs an animated SVG cutting diagram showing optimal piece placement. The competitive landscape consists of dated-looking web tools with artificial usage limits (CutList Optimizer, OptiCutter) and expensive desktop software (MaxCut). The opportunity is clear: a modern, dark-themed, fully free tool with animated visualization and URL-based sharing would be immediately differentiated. No competitor offers animated cut diagrams or stateless URL sharing.

The recommended approach is a deliberately minimal Next.js 15.5 app with only 4 runtime dependencies (Motion, nuqs, lz-string, html-to-image). The optimization engine should be a custom guillotine packer written from scratch -- existing npm packages are stale and lack kerf/grain support. All state lives in React Context with useReducer, synced to the URL via nuqs and lz-string for zero-backend sharing. SVG rendering uses native React JSX elements animated with Motion. The architecture has four clean layers: Input Management, Optimization Engine, Visualization Renderer, and State Serialization.

The primary risks are algorithmic correctness (kerf accumulation errors and grain direction constraints), floating-point precision in unit conversion, and URL state size limits for large projects. All three must be addressed in the foundational phases -- they are not things that can be retrofitted. The algorithm should use integer-based internal units (mm), treat grain direction as a rotation constraint from day one, and apply lz-string compression with compact serialization keys to keep URLs under 2000 characters.

## Key Findings

### Recommended Stack

The stack is minimal by design: Next.js 15.5 with TypeScript and Tailwind CSS 4.2 as the framework layer, plus exactly 4 runtime dependencies. No UI component libraries (per project constraints), no state management libraries (useReducer + Context is sufficient), no charting/visualization libraries (native SVG in JSX is better for this use case).

**Core technologies:**
- **Next.js 15.5 + React 19 + TypeScript:** Production framework with file-based routing and Vercel deploy. v15.5 over v16 to avoid breaking changes with no upside for a client-side app.
- **Tailwind CSS 4.2:** Utility-first styling with built-in dark mode support via `dark:` variant. CSS-first config in v4.
- **Motion 12.x (formerly Framer Motion):** SVG animation library for the "pieces slide into place" hero moment. `motion.rect` animates SVG elements directly.
- **nuqs + lz-string:** Type-safe URL state management (nuqs) combined with URL-safe compression (lz-string) for stateless sharing.
- **Custom guillotine packer:** ~200-400 lines of TypeScript. Existing npm packages are unmaintained and lack kerf/grain support.
- **html-to-image:** Client-side PNG export from DOM/SVG nodes. Print via native `@media print` CSS.

### Expected Features

**Must have (table stakes):**
- Stock board input with dimensions, quantity, and common presets (4x8 plywood, standard lumber)
- Cut piece input with dimensions, quantity, and label
- Kerf (blade width) setting, defaulting to 1/8"
- Imperial/metric unit toggle
- Guillotine bin-packing optimization algorithm
- Static SVG cutting diagram with color-coded, labeled pieces
- Waste percentage and board count summary
- Dark theme UI, responsive to tablet

**Should have (differentiators):**
- Animated optimization visualization -- no competitor has this; it is the signature feature
- Share via URL (stateless, no account required) -- novel in this space
- Grain direction support -- critical for real woodworking but adds algorithm complexity
- Hover tooltips, zoom/pan, PNG export, print view, cost estimates
- Quick-add/paste for bulk piece entry

**Defer (v2+):**
- Edge banding, offcut/remnant tracking, localStorage persistence, CSV import, manual piece rearrangement, multiple optimization strategies
- User accounts, 3D visualization, CNC integration, CAD import -- explicitly anti-features

### Architecture Approach

The app is a four-layer client-side architecture with no backend. All dimensions are stored internally in millimeters (integers to avoid floating-point drift) and converted to display units only at the UI boundary. The optimization engine is a pure function with serializable inputs and outputs, making it testable, replaceable, and offloadable to a Web Worker. SVG rendering maps algorithm output coordinates directly to SVG viewBox coordinates with no intermediate transformation.

**Major components:**
1. **Input Panel** -- Board CRUD, piece CRUD, settings (kerf, units, grain). Dispatches actions to app state.
2. **Optimization Engine** -- Pure function: `(boards, pieces, settings) => OptimizationResult`. Handles kerf pre-processing, grain constraints, quantity expansion.
3. **Visualization Panel** -- SVG renderer using viewBox-based scaling. Motion animations for piece placement. Zoom/pan via pointer events.
4. **Summary Dashboard** -- Derived statistics: waste %, board count, cost estimate.
5. **State Serialization** -- nuqs for URL param management, lz-string for compression, html-to-image for PNG export.

### Critical Pitfalls

1. **Kerf accumulation errors** -- Kerf must be modeled as gaps between adjacent placements, not added to piece dimensions. The last piece in a row has no trailing kerf. Write exact-fit test cases (e.g., 4 x 100mm pieces + 3 x 4mm kerf = 412mm board).
2. **Grain direction as afterthought** -- The algorithm data model must include `canRotate: boolean` from day one. Bolting grain constraints onto a rotation-free algorithm requires a near-complete rewrite.
3. **Floating-point unit conversion drift** -- Store all measurements in millimeters internally. Convert only at display boundaries. Display imperial as proper fractions (15-3/4"), not decimals.
4. **URL state exceeding browser limits** -- Use compact serialization keys, lz-string compression, and warn users when approaching 2000 characters. Have a clipboard fallback for large projects.
5. **Main-thread algorithm blocking** -- Design the Web Worker boundary from the start. The algorithm is a pure function with serializable I/O, making Worker extraction trivial if done early.
6. **SVG-algorithm coordinate mismatch** -- SVG viewBox must exactly match board dimensions. Pieces render at exact algorithm output coordinates. No intermediate coordinate transforms.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Data Model
**Rationale:** Everything depends on correct data types, unit handling, and app state structure. Getting the internal representation wrong (e.g., floats instead of integers, no grain field) is HIGH recovery cost.
**Delivers:** TypeScript types, unit conversion utilities, React Context + useReducer state management, input panel UI (board forms, piece forms, kerf/unit settings, board presets).
**Addresses:** Board input, piece input, kerf setting, unit toggle, dark theme, responsive layout (all P1 features).
**Avoids:** Floating-point unit conversion drift (Pitfall 4), grain direction afterthought (Pitfall 2 -- data model includes `canRotate` even if UI toggle ships later).

### Phase 2: Optimization Engine
**Rationale:** Cannot build visualization or summary without algorithm output. The engine is the core value proposition and the highest-complexity piece. Must be built against real input data from Phase 1.
**Delivers:** Custom guillotine bin-packing algorithm with kerf pre-processing, grain direction constraints, quantity expansion. Comprehensive unit tests.
**Addresses:** Guillotine bin-packing optimization (P1), waste calculation, board count.
**Avoids:** Kerf accumulation errors (Pitfall 1), main-thread blocking (Pitfall 5 -- establish Worker boundary here).

### Phase 3: SVG Visualization
**Rationale:** Depends on algorithm output format from Phase 2. This is the primary user-facing output and the basis for the hero animation feature.
**Delivers:** Static SVG cutting diagrams with color-coded pieces, waste area rendering, per-board breakdown. Hover tooltips. Zoom and pan.
**Addresses:** Static SVG cutting diagram (P1), hover tooltips (P2), zoom/pan (P2), color assignment (P2).
**Avoids:** SVG-algorithm coordinate mismatch (Pitfall 6 -- viewBox matches board dimensions exactly, no coordinate transforms).

### Phase 4: Animation and Polish
**Rationale:** Animation layers on top of working static visualization. Summary dashboard is a parallel workstream that only needs algorithm output. This phase delivers the "hero moment" differentiator.
**Delivers:** Animated piece placement using Motion, summary dashboard (waste %, board count, cost estimate), light theme toggle.
**Addresses:** Animated visualization (P2), cost estimate (P2), light theme (P2).
**Avoids:** Animation performance trap -- stagger animations, memoize board SVGs individually.

### Phase 5: Sharing and Export
**Rationale:** Sharing and export depend on all other components being stable. URL state encoding requires the data model to be finalized. PNG export requires the SVG to be complete.
**Delivers:** URL-based sharing via nuqs + lz-string, PNG export via html-to-image, print-friendly view via @media print CSS.
**Addresses:** Share via URL (P2), PNG export (P2), print view (P2), quick-add/paste (P2), board presets library (P2).
**Avoids:** URL state overflow (Pitfall 3 -- compact keys, compression, size warning, clipboard fallback).

### Phase Ordering Rationale

- **Strict dependency chain:** Input types -> Algorithm -> Visualization -> Animation -> Export. Each phase produces the data the next phase consumes.
- **Pitfall mitigation front-loaded:** The highest-recovery-cost pitfalls (unit precision, grain direction data model, kerf math) are all addressed in Phases 1-2, before any UI depends on them.
- **Differentiators build on foundations:** The animated visualization (Phase 4) and URL sharing (Phase 5) are the features that set CutList Pro apart, but they cannot exist without correct algorithm output and accurate SVG rendering.
- **Algorithm quality is the real competition:** MaxCut uses 10 sheets where web competitors use 12 for the same project. The optimization engine must be competitive, which means investing in algorithm quality and testing in Phase 2 before moving to polish.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Optimization Engine):** Guillotine bin-packing heuristic selection (Best Fit Decreasing vs. Best Short Side) significantly affects output quality. Need to research and benchmark multiple strategies against real woodworking project data. The ARCHITECTURE.md mentions `guillotine-packer` library but STACK.md explicitly rejects it as stale -- the custom implementation needs careful algorithm design.
- **Phase 5 (Sharing and Export):** URL length limits vary by browser and context (QR codes, messaging apps). Need to test compressed state sizes against real project data to validate the lz-string approach at scale.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js app setup, React Context, TypeScript types, Tailwind styling -- all well-documented, established patterns.
- **Phase 3 (SVG Visualization):** SVG-in-React is thoroughly documented. Motion SVG animation has official examples.
- **Phase 4 (Animation and Polish):** Motion staggered animations are a documented pattern. Summary dashboard is derived calculations.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies are mature, well-documented, and version-pinned. Minimal dependency count (4 runtime) reduces risk. |
| Features | HIGH | Competitor analysis is thorough with direct feature comparisons. MVP scope is clear and well-prioritized. |
| Architecture | HIGH | Four-layer client-side architecture is straightforward. Data models are fully typed. Build order follows natural dependencies. |
| Pitfalls | HIGH | Domain-specific pitfalls (kerf, grain, units) are well-documented in woodworking optimizer literature. Recovery costs are assessed. |

**Overall confidence:** HIGH

### Gaps to Address

- **Algorithm quality benchmarking:** No concrete data on how a custom guillotine packer will perform against MaxCut's results. Need to build and test against known benchmark projects during Phase 2. Consider implementing multiple heuristic strategies and selecting the best result.
- **ARCHITECTURE.md vs STACK.md conflict on guillotine-packer:** ARCHITECTURE.md recommends using the `guillotine-packer` npm library while STACK.md explicitly rejects it as stale (last published 5 years ago, no kerf, no grain, no TypeScript types). Resolution: go with STACK.md recommendation -- build custom. The library can be studied for algorithm design reference but should not be a dependency.
- **Web Worker implementation approach:** PITFALLS.md says "never skip Web Worker" but ARCHITECTURE.md suggests it is optional for typical workloads. Resolution: design the pure function boundary for Worker compatibility from the start, but defer actual Worker implementation until performance testing shows it is needed (likely Phase 2 testing will determine this).
- **Pan/zoom implementation:** STACK.md recommends custom pointer-event hook (~50 LOC). ARCHITECTURE.md mentions `react-zoom-pan-pinch` as an option. Resolution: start with the custom hook approach per STACK.md to avoid dependency conflicts with Motion animations.
- **Imperial fraction display:** Users expect 15-3/4" not 15.75". Need a fraction formatting utility that snaps to standard woodworking increments (1/16" or 1/32"). This is a small but important UX detail to address in Phase 1.

## Sources

### Primary (HIGH confidence)
- [Next.js 15 vs 16 comparison](https://www.descope.com/blog/post/nextjs15-vs-nextjs16) -- version selection rationale
- [Tailwind CSS v4.0/4.2 releases](https://tailwindcss.com/blog/tailwindcss-v4) -- v4 architecture
- [Motion docs](https://motion.dev/) -- SVG animation patterns
- [nuqs official site](https://nuqs.dev) and [Next.js Conf 2025 talk](https://nextjs.org/conf/session/type-safe-url-state-in-nextjs-with-nuqs) -- URL state management
- [CutPlan optimization guide](https://cutplan.ai/en/blog/complete-guide-cut-list-optimization.html) -- domain-specific algorithm pitfalls
- [Guillotine cutting (Wikipedia)](https://en.wikipedia.org/wiki/Guillotine_cutting) -- algorithm fundamentals

### Secondary (MEDIUM confidence)
- [CutList Optimizer](https://www.cutlistoptimizer.com/), [OptiCutter](https://www.opticutter.com/), [MaxCut](https://maxcutsoftware.com/) -- competitor feature analysis
- [FineWoodworking Forum](https://www.finewoodworking.com/forum/cut-list-programs-review) -- real user benchmarks
- [Defusco comparison](https://www.defusco.com/cutting-optimization-software/) -- market landscape
- [lz-string npm](https://www.npmjs.com/package/lz-string) -- URL compression approach
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image) -- PNG export

### Tertiary (LOW confidence)
- [guillotine-packer GitHub](https://github.com/tyschroed/guillotine-packer) -- algorithm reference only (not using as dependency)
- [opcut GitHub](https://github.com/bozokopic/opcut) -- alternative optimizer reference

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
