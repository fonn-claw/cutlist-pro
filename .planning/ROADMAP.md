# Roadmap: CutList Pro

## Overview

CutList Pro delivers a complete client-side woodworking cut optimizer in 8 phases, progressing from foundational scaffolding and design system through input forms, the optimization algorithm, SVG visualization (static then animated), summary statistics, and finally export/sharing. The dependency chain is strict: inputs feed the algorithm, the algorithm feeds visualization, and export depends on everything being stable. The animated visualization in Phase 6 is the hero differentiator and gets its own phase to ensure it ships with full attention.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Design System** - App shell with dark/light theme, responsive layout, unit system, and data model
- [ ] **Phase 2: Board Input** - Stock board CRUD with dimensions, quantities, and common presets
- [ ] **Phase 3: Cut List Input** - Cut piece CRUD with dimensions, labels, colors, quick-add, and duplication
- [ ] **Phase 4: Optimization Engine** - Guillotine bin-packing algorithm with kerf and grain direction support
- [ ] **Phase 5: Static Visualization** - SVG cutting diagrams with color-coded pieces, waste display, tooltips, zoom/pan
- [ ] **Phase 6: Animated Visualization** - Pieces slide and fade into position on optimize, delivering the hero moment
- [ ] **Phase 7: Summary Dashboard** - Board count, waste percentage, per-board breakdown, and cost estimate
- [ ] **Phase 8: Export & Sharing** - PNG download, print-friendly view, and URL-based project sharing

## Phase Details

### Phase 1: Foundation & Design System
**Goal**: Users see a polished, themed app shell with sidebar/main layout that correctly handles unit display and responsive breakpoints
**Depends on**: Nothing (first phase)
**Requirements**: DES-01, DES-02, DES-03, DES-04, DES-05, UNIT-01, UNIT-02, UNIT-03
**Success Criteria** (what must be TRUE):
  1. App loads with dark theme by default; user can toggle to light theme and back
  2. Layout shows sidebar panel and main visualization area on desktop; inputs stack above visualization on tablet/mobile
  3. App is usable on a 768px-wide screen without horizontal scrolling or overlapping elements
  4. Unit toggle switches all displayed values between inches and millimeters without data loss
  5. Imperial values display as proper fractions (e.g., 15-3/4") not decimals
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold, Vitest setup, unit conversion system with tests
- [ ] 01-02-PLAN.md — Theme system, responsive sidebar/main layout, visual verification

### Phase 2: Board Input
**Goal**: Users can define their available stock boards with all needed properties
**Depends on**: Phase 1
**Requirements**: BOARD-01, BOARD-02, BOARD-03, BOARD-04
**Success Criteria** (what must be TRUE):
  1. User can add a stock board by entering length and width dimensions
  2. User can set a quantity for each board entry (e.g., "I have 3 of these")
  3. User can select from a preset list of common boards (4x8 plywood, 1x6, 2x4, etc.) that auto-fills dimensions
  4. User can edit or remove any existing board entry
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Board presets data and CRUD pure functions with TDD tests
- [ ] 02-02-PLAN.md — Board UI components (form, list, presets dropdown) and page state wiring

### Phase 3: Cut List Input
**Goal**: Users can define all the pieces they need to cut, with labels, colors, and bulk entry
**Depends on**: Phase 1
**Requirements**: CUT-01, CUT-02, CUT-03, CUT-04, CUT-05, CUT-06, CUT-07
**Success Criteria** (what must be TRUE):
  1. User can add a cut piece with length and width dimensions, and set its quantity
  2. User can assign an optional text label and a color to each piece type (color auto-assigned, with manual override)
  3. User can paste a tab/comma-separated list of pieces to bulk-add them
  4. User can duplicate an existing piece entry to create a copy
  5. User can edit or remove any existing cut piece entry
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Optimization Engine
**Goal**: The app can compute optimal guillotine cut layouts that respect kerf width and grain direction
**Depends on**: Phase 2, Phase 3
**Requirements**: OPT-01, OPT-02, OPT-03, OPT-04
**Success Criteria** (what must be TRUE):
  1. User clicks "Optimize" and the algorithm produces a cutting layout that places all pieces on boards using only guillotine (straight through) cuts
  2. Kerf (blade width) is configurable with a sensible default (1/8") and the algorithm accounts for kerf gaps between pieces
  3. User can mark pieces with grain direction constraint, and those pieces are never rotated in the layout
  4. Algorithm minimizes board usage -- produces fewer or equal boards compared to naive placement
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Static Visualization
**Goal**: Users see clear, interactive SVG cutting diagrams showing how pieces fit on each board
**Depends on**: Phase 4
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-05, VIS-06
**Success Criteria** (what must be TRUE):
  1. Each board displays as an SVG diagram with pieces laid out at their computed positions
  2. Pieces are color-coded by type and labeled with their name and dimensions
  3. Waste/unused areas are visually distinct from placed pieces (different pattern or color)
  4. Hovering over a piece shows a tooltip with its dimensions and label
  5. User can zoom in/out and pan across large layouts
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Animated Visualization
**Goal**: The optimization result plays as an animated sequence where pieces slide into position -- the hero moment
**Depends on**: Phase 5
**Requirements**: VIS-04
**Success Criteria** (what must be TRUE):
  1. When user clicks "Optimize", pieces animate into their positions (slide/fade) rather than appearing instantly
  2. Animation plays smoothly at 60fps without jank or layout shifts
  3. Animation sequence is visually compelling in a 15-second screen recording
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Summary Dashboard
**Goal**: Users see at a glance how many boards they need, how much waste they have, and what it will cost
**Depends on**: Phase 4
**Requirements**: SUM-01, SUM-02, SUM-03, SUM-04
**Success Criteria** (what must be TRUE):
  1. Dashboard shows total boards needed versus boards available
  2. Dashboard shows overall waste percentage across all boards
  3. Dashboard shows per-board breakdown with individual waste amounts
  4. User can enter an optional price-per-board and see a total cost estimate
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Export & Sharing
**Goal**: Users can save, print, and share their optimized cutting plans
**Depends on**: Phase 5, Phase 7
**Requirements**: EXP-01, EXP-02, EXP-03
**Success Criteria** (what must be TRUE):
  1. User can download the cutting layout as a PNG image
  2. User can open a print-friendly view that renders cleanly on paper (no dark background, proper margins)
  3. User can generate a shareable URL that encodes the full project state; opening that URL restores all inputs and the optimized layout
  4. URL sharing works for typical projects (up to ~20 pieces) without exceeding browser URL length limits
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
(Phases 2 and 3 can execute in parallel; Phases 6 and 7 can execute in parallel)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Design System | 0/2 | Planning complete | - |
| 2. Board Input | 1/2 | In Progress|  |
| 3. Cut List Input | 0/0 | Not started | - |
| 4. Optimization Engine | 0/0 | Not started | - |
| 5. Static Visualization | 0/0 | Not started | - |
| 6. Animated Visualization | 0/0 | Not started | - |
| 7. Summary Dashboard | 0/0 | Not started | - |
| 8. Export & Sharing | 0/0 | Not started | - |
