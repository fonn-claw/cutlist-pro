# Requirements: CutList Pro

**Defined:** 2026-03-19
**Core Value:** Animated cut layout visualization that clearly shows optimized piece placement on boards, minimizing waste and saving money.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Board Input

- [ ] **BOARD-01**: User can add stock boards with length and width dimensions
- [ ] **BOARD-02**: User can set quantity per stock board
- [ ] **BOARD-03**: User can select from common board presets (4×8 plywood, 1×6 board, etc.)
- [ ] **BOARD-04**: User can remove or edit existing board entries

### Cut List Input

- [ ] **CUT-01**: User can add cut pieces with length and width dimensions
- [ ] **CUT-02**: User can set quantity per cut piece
- [ ] **CUT-03**: User can assign an optional label to each cut piece
- [ ] **CUT-04**: User can assign colors per piece type (auto-assigned with manual override)
- [ ] **CUT-05**: User can quick-add pieces by pasting a tab/comma-separated list
- [ ] **CUT-06**: User can duplicate existing cut piece entries
- [ ] **CUT-07**: User can remove or edit existing cut piece entries

### Units

- [x] **UNIT-01**: App displays imperial units (inches) by default
- [x] **UNIT-02**: User can toggle between imperial and metric (mm) units
- [x] **UNIT-03**: Unit toggle converts all displayed values without losing precision

### Optimization

- [ ] **OPT-01**: User can run guillotine bin-packing optimization on button click
- [ ] **OPT-02**: User can configure kerf (blade width) setting with sensible default (1/8")
- [ ] **OPT-03**: User can mark pieces with grain direction constraint (no rotation)
- [ ] **OPT-04**: Algorithm produces layouts using only guillotine (straight through) cuts

### Visualization

- [ ] **VIS-01**: SVG visualization shows each board with pieces laid out
- [ ] **VIS-02**: Pieces are color-coded by type and labeled with name/dimensions
- [ ] **VIS-03**: Waste areas shown in distinct pattern/color
- [ ] **VIS-04**: Animated optimization — pieces slide/fade into position when user clicks "Optimize"
- [ ] **VIS-05**: User can hover over a piece to see its dimensions and label in a tooltip
- [ ] **VIS-06**: User can zoom and pan on large layouts

### Summary

- [ ] **SUM-01**: Dashboard shows total boards needed vs available
- [ ] **SUM-02**: Dashboard shows total waste percentage
- [ ] **SUM-03**: Dashboard shows per-board waste breakdown
- [ ] **SUM-04**: User can enter optional price-per-board for cost estimate

### Export

- [ ] **EXP-01**: User can download cut layout as PNG image
- [ ] **EXP-02**: User can view and use a print-friendly layout
- [ ] **EXP-03**: User can share project via URL (full state encoded in URL)

### Design

- [x] **DES-01**: App uses dark theme by default
- [x] **DES-02**: User can toggle between dark and light themes
- [x] **DES-03**: Layout uses sidebar for inputs, main area for visualization
- [x] **DES-04**: On mobile/tablet, inputs stack above visualization
- [x] **DES-05**: App is responsive and usable on tablet (768px+)

## v2 Requirements

### Advanced Features

- **ADV-01**: User can manually rearrange pieces by dragging after optimization
- **ADV-02**: User can choose between optimization strategies (minimize waste vs minimize boards vs minimize cost)
- **ADV-03**: User can save recent projects to localStorage
- **ADV-04**: User can undo/redo input changes
- **ADV-05**: User can import cut list from CSV/spreadsheet file

### Enhanced Summary

- **ESUM-01**: Offcut summary with dimensions for leftover tracking

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | 100% client-side, no backend architecture |
| Database / server storage | State lives in URL, no infrastructure |
| 3D visualization | 2D SVG is sufficient; 3D is a different domain entirely |
| Non-rectangular / irregular cuts | Guillotine cuts only — reflects real woodworking constraints |
| CNC / G-code export | Tiny audience, massive complexity — CNC users have CAM software |
| Edge banding support | Narrows audience to cabinet makers, adds UI complexity |
| SketchUp / CAD file import | Complex parsing, fragile, version-dependent |
| Material / wood species database | Prices vary by region and season — user enters their own price |
| Phone-optimized design | Cut diagrams need spatial display; tablet (768px+) is the floor |
| Multi-material simultaneous optimization | Confusing combined output — run separate optimizations per material |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DES-01 | Phase 1: Foundation & Design System | Complete |
| DES-02 | Phase 1: Foundation & Design System | Complete |
| DES-03 | Phase 1: Foundation & Design System | Complete |
| DES-04 | Phase 1: Foundation & Design System | Complete |
| DES-05 | Phase 1: Foundation & Design System | Complete |
| UNIT-01 | Phase 1: Foundation & Design System | Complete |
| UNIT-02 | Phase 1: Foundation & Design System | Complete |
| UNIT-03 | Phase 1: Foundation & Design System | Complete |
| BOARD-01 | Phase 2: Board Input | Pending |
| BOARD-02 | Phase 2: Board Input | Pending |
| BOARD-03 | Phase 2: Board Input | Pending |
| BOARD-04 | Phase 2: Board Input | Pending |
| CUT-01 | Phase 3: Cut List Input | Pending |
| CUT-02 | Phase 3: Cut List Input | Pending |
| CUT-03 | Phase 3: Cut List Input | Pending |
| CUT-04 | Phase 3: Cut List Input | Pending |
| CUT-05 | Phase 3: Cut List Input | Pending |
| CUT-06 | Phase 3: Cut List Input | Pending |
| CUT-07 | Phase 3: Cut List Input | Pending |
| OPT-01 | Phase 4: Optimization Engine | Pending |
| OPT-02 | Phase 4: Optimization Engine | Pending |
| OPT-03 | Phase 4: Optimization Engine | Pending |
| OPT-04 | Phase 4: Optimization Engine | Pending |
| VIS-01 | Phase 5: Static Visualization | Pending |
| VIS-02 | Phase 5: Static Visualization | Pending |
| VIS-03 | Phase 5: Static Visualization | Pending |
| VIS-05 | Phase 5: Static Visualization | Pending |
| VIS-06 | Phase 5: Static Visualization | Pending |
| VIS-04 | Phase 6: Animated Visualization | Pending |
| SUM-01 | Phase 7: Summary Dashboard | Pending |
| SUM-02 | Phase 7: Summary Dashboard | Pending |
| SUM-03 | Phase 7: Summary Dashboard | Pending |
| SUM-04 | Phase 7: Summary Dashboard | Pending |
| EXP-01 | Phase 8: Export & Sharing | Pending |
| EXP-02 | Phase 8: Export & Sharing | Pending |
| EXP-03 | Phase 8: Export & Sharing | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
