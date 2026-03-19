# Pitfalls Research

**Domain:** Woodworking cut optimizer (2D guillotine bin-packing with SVG visualization)
**Researched:** 2026-03-19
**Confidence:** HIGH (domain-specific algorithm pitfalls) / MEDIUM (SVG animation at scale)

## Critical Pitfalls

### Pitfall 1: Kerf Accumulation Errors

**What goes wrong:**
The algorithm treats kerf (blade width, typically 1/8" / 3mm) as a simple constant subtracted once, when in reality kerf must be applied between every adjacent cut. Ten crosscuts with a 3mm kerf removes 30mm of usable material. Off-by-one errors are extremely common: the final cut in a sequence does NOT need a trailing kerf (you are cutting to the edge of the board), but every internal cut does. Getting this wrong means calculated layouts physically do not fit on real boards -- pieces are too tight, or waste percentages are inaccurate.

**Why it happens:**
Developers think of kerf as "add 3mm to each piece dimension" rather than modeling it as material consumed between adjacent placements. The distinction is subtle but produces cumulative errors proportional to the number of cuts.

**How to avoid:**
Model kerf as a gap between placed rectangles, not as an addition to piece dimensions. When placing piece N next to piece N-1 on a board, the available remaining width is `board_width - sum(piece_widths) - (num_pieces - 1) * kerf`. The last piece sits flush against the board edge with no trailing kerf. Write explicit test cases: place 4 pieces of 100mm on a 412mm board with 4mm kerf (100+4+100+4+100+4+100 = 412, exactly fits). Place 5 pieces and verify it fails.

**Warning signs:**
- Layouts that "fit" in the visualization but pieces physically overlap when cut
- Waste percentage calculations that are off by 1-3% compared to manual calculation
- User complaints that the optimizer says pieces fit but they do not in the workshop

**Phase to address:**
Core algorithm phase (Phase 1/2). This must be correct from day one -- every other feature (visualization, waste stats, cost estimates) depends on accurate placement math.

---

### Pitfall 2: Grain Direction as an Afterthought

**What goes wrong:**
The optimizer freely rotates pieces 90 degrees to find better packing, but many woodworking pieces MUST be cut along the grain (e.g., table legs, face frames, panels with visible grain). If grain direction is bolted on after the core algorithm is built, it requires a near-complete rewrite of the packing logic because rotation constraints fundamentally change the solution space.

**Why it happens:**
From a pure bin-packing perspective, rotation is just a boolean flip. But woodworking grain direction means some pieces can rotate and others cannot, creating a mixed-constraint problem that standard 2D bin-packing implementations do not handle. Developers build the "simple" rotatable version first, then discover adding per-piece rotation locks breaks their placement heuristics.

**How to avoid:**
Design the algorithm data model to include a `canRotate: boolean` flag on every piece from the start. The packing algorithm should check this flag before considering a rotated placement. Even in Phase 1, the algorithm should accept this parameter (defaulting to `true` for backward compatibility) so the data flow is established before the UI exposes grain controls.

**Warning signs:**
- Algorithm code has hardcoded rotation logic without per-piece checks
- Piece data structure has no rotation/grain field
- "We'll add grain direction later" appears in planning docs

**Phase to address:**
Algorithm design phase (Phase 1). The data model and algorithm interface must support grain constraints even if the UI toggle ships later.

---

### Pitfall 3: URL State Exceeds Browser Limits

**What goes wrong:**
The project encodes all state in the URL for sharing (no backend). A modest project with 8 stock boards and 25 cut pieces with labels, colors, and dimensions can easily produce 2-4KB of JSON. Base64 encoding adds 33% overhead. Complex projects with 50+ pieces and multiple board types push toward 8-10KB. Safari and some mobile browsers impose URL limits around 2048-8192 characters for certain operations (bookmarking, sharing via messaging apps, QR codes). The share link silently truncates or fails.

**Why it happens:**
The naive approach of `JSON.stringify(state) -> base64 -> URL hash` works perfectly during development with small test data. The limits only surface when real users create large projects and try to share them.

**How to avoid:**
1. Use compact serialization from the start: short keys (`l` not `length`, `w` not `width`), omit defaults, use arrays instead of objects.
2. Apply compression (e.g., lz-string or pako/deflate) before base64 encoding -- this typically achieves 60-70% size reduction on structured JSON.
3. Set a hard budget: measure compressed URL length and warn users when approaching 2000 characters.
4. Have a fallback plan: if URL exceeds limit, offer "copy to clipboard" with the full state as a JSON blob, or localStorage with a short ID.

**Warning signs:**
- No compression library in the dependency list
- Share URLs work in Chrome but fail in Safari or messaging apps
- QR codes for share links become unscannably dense
- No tests with realistic data volumes (20+ pieces)

**Phase to address:**
State management / sharing phase. Must be designed before the share feature ships, not retrofitted.

---

### Pitfall 4: Floating-Point Rounding in Unit Conversion

**What goes wrong:**
Converting between imperial (inches/fractions) and metric (mm) introduces floating-point artifacts. 1 inch = 25.4mm exactly, but 1/3 of an inch, common fractional measurements, and repeated conversions accumulate errors. A piece entered as 15-3/4" converts to 400.05mm, then back to 15.750000000000002". Worse: if the algorithm runs in one unit system and the display shows another, rounding discrepancies cause pieces to "not fit" in the display but fit in the algorithm, or vice versa.

**Why it happens:**
IEEE 754 floating-point cannot represent all decimal fractions exactly. Round-trip conversions (imperial -> metric -> imperial) amplify this. Woodworkers expect exact fractional display (15-3/4", not 15.75000002").

**How to avoid:**
Store all measurements internally in a single canonical unit (thousandths of an inch, or hundredths of a millimeter -- integers, not floats). Convert only at display time. Never round-trip: always derive the display value from the canonical stored value. For imperial display, snap to the nearest 1/32" or 1/16" fraction and display as a proper fraction string.

**Warning signs:**
- Measurements stored as floating-point inches or mm
- Round-trip conversion tests show drift (enter 15-3/4", toggle to metric, toggle back, see 15.749999")
- Algorithm uses a different unit than the display

**Phase to address:**
Data model / input phase (Phase 1). The internal representation must be decided before any algorithm or UI code is written.

---

### Pitfall 5: Algorithm Runs on the Main Thread and Freezes UI

**What goes wrong:**
2D guillotine bin-packing is NP-hard. Heuristic approaches (First Fit Decreasing, Best Fit) are fast for small inputs but can take 500ms-2s for 50+ pieces across multiple boards, especially with backtracking or multi-pass optimization. Running this on the main thread freezes the entire UI -- the "Optimize" button appears stuck, animations stall, and users think the app crashed.

**Why it happens:**
For small test cases (5-10 pieces), the algorithm returns in <10ms and the problem is invisible. Developers never test with realistic workloads. JavaScript is single-threaded, and React cannot update the UI while the algorithm is computing.

**How to avoid:**
Run the optimization in a Web Worker from the start. The API boundary is clean: send piece/board data in, receive placement results out. This also enables a progress callback for showing an optimization animation or progress bar. Design the worker interface in Phase 1 even if the initial algorithm is fast enough to run inline.

**Warning signs:**
- Algorithm function is called directly in a React event handler or useEffect
- No Web Worker in the project
- "Optimize" button has no loading state
- Testing only with < 10 pieces

**Phase to address:**
Algorithm phase (Phase 1/2). The Web Worker boundary should be established when the algorithm is first implemented, not retrofitted later.

---

### Pitfall 6: SVG Visualization Does Not Match Algorithm Output

**What goes wrong:**
The algorithm produces placement coordinates (x, y, width, height per piece per board) and the SVG visualization renders those coordinates. But subtle mismatches creep in: the algorithm uses kerf-adjusted positions but the SVG does not account for kerf gaps visually, or the SVG scales pieces to fill the viewport without maintaining the exact aspect ratio of the board. The result is a visualization that "looks right" but does not accurately represent the physical cutting layout. Users follow the visual layout in the workshop and discover pieces do not fit.

**Why it happens:**
The algorithm and the visualization are built by different mental models. The algorithm thinks in absolute coordinates with kerf gaps. The SVG rendering code often uses relative positioning or CSS layout that does not precisely map to physical dimensions.

**How to avoid:**
The SVG viewBox should exactly match the board dimensions (e.g., `viewBox="0 0 96 48"` for a 96x48" board). Pieces should be placed at the exact coordinates the algorithm outputs, with kerf gaps rendered as visible spaces between pieces. Never scale, offset, or transform the algorithm output for display -- use the SVG viewBox for zooming instead. Write visual regression tests: render the SVG, measure element positions, and assert they match algorithm output.

**Warning signs:**
- SVG rendering code has its own coordinate transformation logic
- Kerf gaps are not visible in the visualization
- Pieces in the SVG touch edge-to-edge with no gap
- No tests comparing algorithm output coordinates to SVG element positions

**Phase to address:**
Visualization phase. Must be built directly on top of algorithm output with no intermediate transformation layer.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skipping Web Worker for algorithm | Faster initial dev, simpler code | UI freezes for complex projects, must refactor later | Never -- the worker boundary is cheap to set up early |
| Storing measurements as floats | Natural JS number handling | Unit conversion drift, display bugs, rounding errors | Never -- use integer-based canonical units from day one |
| Hardcoding imperial units only | Ship faster for US audience | Complete refactor to add metric, conversion bugs | MVP only if metric toggle is explicitly deferred |
| Using `innerHTML` for SVG generation | Quick prototyping | No React reconciliation, no animation hooks, security risks | Never in a React project |
| Naive JSON in URL (no compression) | Simple implementation | Share links break on large projects | Acceptable only if sharing is a post-MVP feature |
| Single board type only | Simpler algorithm | Users cannot mix sheet goods and dimensional lumber | MVP only -- multi-board support should come in Phase 2 |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating all SVG pieces simultaneously | Janky animation, dropped frames on tablet | Stagger animations: animate pieces sequentially or in small batches (5-10 at a time) using `delay` offsets | 30+ pieces on a single board, or any mobile/tablet device |
| Re-rendering entire SVG on any state change | Sluggish UI when editing piece dimensions | Memoize board SVGs individually; only re-render the board whose pieces changed | 3+ boards with 10+ pieces each |
| Algorithm re-runs on every input keystroke | Input lag when typing dimensions | Debounce optimization trigger (300-500ms) or require explicit "Optimize" button click | Always problematic without debouncing |
| Large PNG export via DOM-to-image | Browser tab crashes or produces blank image | Use SVG-native export (serialize SVG to string, render to canvas at target resolution) | Multi-board layouts with 50+ total pieces |
| URL state parsing on every route change | Slow page load, flash of empty state | Parse URL state once on mount, store in React state, do not re-parse | Complex project URLs with compressed data |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing only the optimized result, no per-board breakdown | User cannot figure out which board to cut first in the workshop | Show each board as a separate card/panel with its own piece list and cut sequence |
| No visual distinction between "can rotate" and "fixed grain" pieces | User cuts a grain-sensitive piece in the wrong orientation, ruining the board | Use a grain direction indicator (parallel lines or arrow) on pieces in the SVG |
| Imperial fractions displayed as decimals (15.75" instead of 15-3/4") | Woodworkers do not think in decimals; they use fractions and tape measures marked in fractions | Always display imperial as proper fractions (15-3/4") with a decimal tooltip |
| No undo after optimization | User accidentally re-optimizes with wrong inputs and loses the good layout | Store previous optimization result; offer undo or "revert to last optimization" |
| Tiny text labels on small pieces in SVG | Labels unreadable on pieces smaller than ~2" in the visualization | Show labels on hover/tooltip instead; for print view, use a numbered legend |
| Color-coded pieces with poor contrast on dark theme | Pieces blend into dark background or into each other | Use a curated palette tested against dark backgrounds; add subtle borders to all pieces |

## "Looks Done But Isn't" Checklist

- [ ] **Kerf handling:** Verify algorithm applies kerf between adjacent cuts but NOT after the last piece on each row/column -- test with exact-fit scenarios
- [ ] **Grain direction:** Verify pieces marked "no rotate" are never rotated in the output, even when rotation would produce less waste
- [ ] **Unit conversion round-trip:** Enter dimensions in imperial, toggle to metric, toggle back -- values must be identical
- [ ] **Share URL:** Create a project with 30+ pieces, generate share link, open in Safari private window -- must load correctly
- [ ] **SVG accuracy:** Measure pixel positions of pieces in rendered SVG against algorithm output coordinates -- must match within 0.1px at the SVG viewBox scale
- [ ] **Tablet usability:** Test zoom/pan on iPad Safari -- pinch zoom must not fight with browser zoom
- [ ] **Print layout:** Print preview must show all boards, not just the visible viewport, with piece labels readable at print resolution
- [ ] **Edge case: piece larger than board:** Algorithm must reject and show clear error, not infinite loop or silent failure
- [ ] **Edge case: zero-dimension piece:** Input validation must prevent 0-width or 0-height pieces
- [ ] **Edge case: kerf larger than piece:** If kerf is 4mm and piece is 3mm, algorithm must reject, not produce negative dimensions

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Kerf accumulation errors | MEDIUM | Add kerf-gap model to algorithm; rewrite placement logic; re-test all optimization paths |
| Grain direction afterthought | HIGH | Refactor piece data model, add rotation constraint to algorithm, update all placement heuristics, re-test |
| URL state overflow | LOW | Add lz-string compression as a wrapper around existing serialization; update URL read/write functions |
| Float precision in units | HIGH | Change canonical storage to integers; update all input parsing, algorithm, and display code |
| Main-thread algorithm blocking | MEDIUM | Extract algorithm to Web Worker; add message-passing interface; update UI to handle async results |
| SVG-algorithm coordinate mismatch | MEDIUM | Align SVG viewBox to board dimensions; remove intermediate coordinate transforms; add regression tests |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Kerf accumulation errors | Phase 1: Core Algorithm | Unit tests with exact-fit board scenarios verify correct kerf placement |
| Grain direction afterthought | Phase 1: Core Algorithm (data model) | Piece data structure includes `canRotate` field; algorithm respects it in tests |
| URL state overflow | Phase 2: State & Sharing | Test with 30+ piece projects; measure URL length; verify compression is applied |
| Float precision in units | Phase 1: Data Model | Round-trip conversion tests pass with exact equality (not approximate) |
| Main-thread blocking | Phase 1: Core Algorithm | Algorithm runs in Web Worker; UI remains responsive during optimization |
| SVG-algorithm mismatch | Phase 2: Visualization | Automated test compares algorithm coordinates to rendered SVG element positions |
| Animation performance | Phase 2: Visualization | Test staggered animation with 40+ pieces on iPad; verify 30+ fps |
| Print/export accuracy | Phase 3: Export & Polish | Print preview shows all boards at correct scale with readable labels |

## Sources

- [CutPlan - Complete Guide to Cut List Optimization (2026)](https://cutplan.ai/en/blog/complete-guide-cut-list-optimization.html)
- [Avoiding Common Cutlist Optimizer Mistakes (Medium/SteelSolver)](https://medium.com/steelsolver-com/avoiding-common-cutlist-optimizer-mistakes-for-woodworkers-70aa71824ead)
- [Guillotine Cutting - Wikipedia](https://en.wikipedia.org/wiki/Guillotine_cutting)
- [Bin Packing Problem - Wikipedia](https://en.wikipedia.org/wiki/Bin_packing_problem)
- [URL Length Limits (Microsoft/Lineserve)](https://www.lineserve.net/blog/ultimate-guide-to-url-length-limits-browsers-http-specs-and-best-practices)
- [High Performance SVGs (CSS-Tricks)](https://css-tricks.com/high-performance-svgs/)
- [Next.js SPA / Client-Side Only Guide](https://nextjs.org/docs/app/guides/single-page-applications)
- [Motion for React - SVG Animation](https://motion.dev/docs/react-svg-animation)
- [opcut - Open Source Cutting Stock Optimizer (GitHub)](https://github.com/bozokopic/opcut)
- [Kerf-Aware Cut List Optimizer (trade-schools.net)](https://www.trade-schools.net/tools/cut-list-optimizer)

---
*Pitfalls research for: Woodworking Cut Optimizer (CutList Pro)*
*Researched: 2026-03-19*
