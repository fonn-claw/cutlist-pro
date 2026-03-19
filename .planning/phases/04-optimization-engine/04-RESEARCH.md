# Phase 4: Optimization Engine - Research

**Researched:** 2026-03-19
**Domain:** Guillotine bin-packing algorithm, kerf handling, grain direction constraints
**Confidence:** HIGH

## Summary

Phase 4 implements a custom guillotine bin-packing algorithm as pure TypeScript functions. The algorithm takes Board[], CutPiece[], and Settings (kerf) as inputs and produces a CuttingLayout describing where each piece lands on which board. The core approach is first-fit decreasing (sort by area, try largest pieces first) with recursive guillotine splitting of available rectangles. Kerf is handled by expanding piece dimensions during placement. Pieces with `grainDirection=true` skip rotation attempts.

The existing codebase already has the data types (`Board`, `CutPiece`, `Settings` with `kerf` field), the grain direction checkbox in the CutPieceForm, and an established pattern of pure functions in `src/lib/` with TDD tests. The algorithm is entirely compute -- no UI except an "Optimize" button and a kerf input. While npm packages exist (guillotine-packer v1.0.2, rectangle-packer v1.0.4), they are unmaintained or lack kerf/grain support. The algorithm is approximately 200-300 lines of TypeScript -- tractable to implement and test.

**Primary recommendation:** Implement custom guillotine bin-packing as pure functions in `src/lib/optimizer.ts` with comprehensive TDD tests. No external bin-packing library needed. Use Best Short Side Fit selection with Short Axis Split, and try both horizontal-first and vertical-first strategies to pick the better result.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Guillotine bin-packing: recursively split available space with horizontal or vertical cuts
- First-fit decreasing heuristic: sort pieces by area (largest first), try each board before opening a new one
- Try both orientations (horizontal-first and vertical-first splits) and keep the better result
- Pieces with grainDirection=true are never rotated -- only placed in their original orientation
- Kerf width stored in Settings.kerf (already defined in types.ts, in mm)
- Default kerf: 1/8" (3.175mm) -- standard table saw blade
- Kerf is subtracted from available space after each cut -- pieces cannot overlap the kerf gap
- Kerf setting input in the sidebar settings area (simple number input)
- Input: Board[] (from Phase 2 state) + CutPiece[] (from Phase 3 state) + Settings (kerf)
- Output: CuttingLayout -- array of BoardLayout, each containing placed pieces with x,y positions
- "Optimize" button in the main area or header -- triggers computation
- Results stored in React state at page level for visualization phases to consume
- PlacedPiece: CutPiece reference + x, y position + rotated boolean + board index
- BoardLayout: board reference + array of PlacedPieces + waste area
- CuttingLayout: array of BoardLayouts + summary stats (total boards used, total waste)
- Algorithm must produce valid guillotine cuts -- every cut goes edge-to-edge (no L-shaped cuts)
- Performance target: <1 second for typical project (10 boards, 50 pieces)
- Should handle edge case where pieces don't fit on any available board gracefully

### Claude's Discretion
- Specific algorithm implementation details and optimizations
- Whether to use a web worker for computation (recommended if >100 pieces)
- Exact placement of the kerf input and optimize button
- Error handling for edge cases (pieces larger than any board, etc.)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| OPT-01 | User can run guillotine bin-packing optimization on button click | Algorithm as pure function `optimizeCutLayout(boards, pieces, settings)`, Optimize button wired to page state |
| OPT-02 | User can configure kerf (blade width) setting with sensible default (1/8") | Kerf already in Settings type; kerf input in sidebar; default 3.175mm |
| OPT-03 | User can mark pieces with grain direction constraint (no rotation) | CutPiece.grainDirection already exists and UI checkbox exists; algorithm respects flag |
| OPT-04 | Algorithm produces layouts using only guillotine (straight through) cuts | Recursive free-rectangle splitting inherently produces only guillotine cuts |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ^5 | Type-safe algorithm implementation | Already in project |
| Vitest | ^4.1.0 | TDD for algorithm pure functions | Already configured |
| React 19 | 19.2.4 | State management for results + UI | Already in project |

### Supporting
No additional libraries needed. The algorithm is implemented as pure functions with zero external dependencies.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom algorithm | guillotine-packer v1.0.2 (npm) | Last updated Jan 2020, no TypeScript types, `process` reference bug in Vite/browser environments, 47 weekly downloads |
| Custom algorithm | rectangle-packer v1.0.4 (npm) | Generic packer, no kerf support, no grain direction, would need adapter layer |

**Installation:**
```bash
# No new packages needed -- pure TypeScript implementation
```

## Architecture Patterns

### Recommended Project Structure
```
src/lib/
  types.ts               # Add PlacedPiece, BoardLayout, OptimizationResult types
  optimizer.ts            # Core guillotine bin-packing algorithm
  optimizer.test.ts       # Comprehensive TDD tests
```

### Pattern 1: Recursive Free-Rectangle Splitting (Guillotine)
**What:** Maintain a list of free rectangles per board. When placing a piece, find the best-fitting free rectangle, place the piece at its corner, then split the remaining space into exactly two new free rectangles via a guillotine cut (horizontal or vertical). This guarantees all cuts are edge-to-edge.
**When to use:** Every placement operation.
**Example:**
```typescript
interface FreeRectangle {
  x: number;      // mm, top-left corner
  y: number;      // mm, top-left corner
  width: number;  // mm
  height: number; // mm
}

// After placing a piece at (rect.x, rect.y), split remaining space
// into two new free rectangles via guillotine cut.
//
// +--------+-------+
// | PIECE  |       |   <- right remainder
// |  (w,h) |       |
// +--------+-------+
// |                |   <- bottom remainder
// +----------------+
//
// Short Axis Split: cut along the shorter remaining dimension
function splitFreeRect(
  rect: FreeRectangle,
  placedWidth: number,
  placedHeight: number
): FreeRectangle[] {
  const result: FreeRectangle[] = [];
  const rightWidth = rect.width - placedWidth;
  const bottomHeight = rect.height - placedHeight;

  if (rightWidth > 0 && bottomHeight > 0) {
    if (rightWidth < bottomHeight) {
      // Vertical cut: right portion is narrow, bottom gets full width
      result.push({ x: rect.x + placedWidth, y: rect.y, width: rightWidth, height: placedHeight });
      result.push({ x: rect.x, y: rect.y + placedHeight, width: rect.width, height: bottomHeight });
    } else {
      // Horizontal cut: bottom portion is narrow, right gets full height
      result.push({ x: rect.x + placedWidth, y: rect.y, width: rightWidth, height: rect.height });
      result.push({ x: rect.x, y: rect.y + placedHeight, width: placedWidth, height: bottomHeight });
    }
  } else if (rightWidth > 0) {
    result.push({ x: rect.x + placedWidth, y: rect.y, width: rightWidth, height: rect.height });
  } else if (bottomHeight > 0) {
    result.push({ x: rect.x, y: rect.y + placedHeight, width: rect.width, height: bottomHeight });
  }

  return result;
}
```

### Pattern 2: Best Short Side Fit Selection
**What:** For each free rectangle, score how well a piece fits by measuring the shorter leftover side. Pick the rectangle with the smallest short-side remainder. This produces tight layouts.
**When to use:** When choosing which free rectangle to place a piece into.
**Example:**
```typescript
function findBestFit(
  freeRects: FreeRectangle[],
  pieceWidth: number,
  pieceHeight: number,
  canRotate: boolean
): { rectIndex: number; rotated: boolean } | null {
  let bestScore = Infinity;
  let bestIndex = -1;
  let bestRotated = false;
  const EPSILON = 0.01;

  for (let i = 0; i < freeRects.length; i++) {
    const rect = freeRects[i];

    // Try original orientation
    if (pieceWidth <= rect.width + EPSILON && pieceHeight <= rect.height + EPSILON) {
      const shortSide = Math.min(rect.width - pieceWidth, rect.height - pieceHeight);
      if (shortSide < bestScore) {
        bestScore = shortSide;
        bestIndex = i;
        bestRotated = false;
      }
    }

    // Try rotated (swap width/height)
    if (canRotate && pieceHeight <= rect.width + EPSILON && pieceWidth <= rect.height + EPSILON) {
      const shortSide = Math.min(rect.width - pieceHeight, rect.height - pieceWidth);
      if (shortSide < bestScore) {
        bestScore = shortSide;
        bestIndex = i;
        bestRotated = true;
      }
    }
  }

  return bestIndex >= 0 ? { rectIndex: bestIndex, rotated: bestRotated } : null;
}
```

### Pattern 3: Kerf via Dimension Expansion
**What:** When placing a piece, add kerf to piece dimensions for the purpose of space allocation. The piece occupies `(width + kerf) x (height + kerf)` in the layout, but records its actual dimensions. This accounts for material removed by the saw blade.
**When to use:** Every placement calculation.
**Example:**
```typescript
// Kerf is added to piece dimensions during placement.
// Piece A at x=0 occupies width + kerf horizontally.
// Piece B placed next starts at x = pieceA.width + kerf.
// This slightly overestimates at board edges (safe behavior).
function effectiveDimensions(width: number, height: number, kerf: number) {
  return {
    width: width + kerf,
    height: height + kerf,
  };
}
```

### Pattern 4: Dual-Strategy Comparison
**What:** Run the packing algorithm twice -- once preferring horizontal-first splits, once preferring vertical-first splits -- and keep the result that uses fewer boards (or less waste on tie).
**When to use:** Top-level optimize call.
**Example:**
```typescript
function optimizeCutLayout(boards: Board[], pieces: CutPiece[], settings: Settings): OptimizationResult {
  const resultH = packWithStrategy(boards, pieces, settings.kerf, 'horizontal-first');
  const resultV = packWithStrategy(boards, pieces, settings.kerf, 'vertical-first');

  if (resultH.summary.totalBoards < resultV.summary.totalBoards) return resultH;
  if (resultV.summary.totalBoards < resultH.summary.totalBoards) return resultV;
  return resultH.summary.wastePercentage <= resultV.summary.wastePercentage ? resultH : resultV;
}
```

### Pattern 5: First-Fit Decreasing with Multi-Board
**What:** Expand board and piece quantities into individual instances. Sort pieces by area (largest first). For each piece, try to place it on each active board. If no board has space, allocate a new board from stock.
**When to use:** Main packing loop.
**Example:**
```typescript
function packWithStrategy(boards: Board[], pieces: CutPiece[], kerf: number, strategy: string): OptimizationResult {
  // 1. Expand boards by quantity: Board{qty:3} -> 3 board instances
  const expandedBoards = expandBoards(boards);
  // 2. Expand pieces by quantity: CutPiece{qty:2} -> 2 piece instances
  const expandedPieces = expandPieces(pieces);
  // 3. Sort pieces by area descending
  expandedPieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  // 4. For each piece, find best fit across active boards
  //    If none, allocate next board from pool
  //    If no boards left, add to unplaced
  // 5. Calculate waste stats
}
```

### Anti-Patterns to Avoid
- **Mutating input arrays:** Algorithm MUST be a pure function. Clone boards/pieces before processing.
- **Forgetting to expand quantities:** Board{qty:3} means 3 separate board instances, not 1 board.
- **MaxRects algorithm:** MaxRects tracks overlapping maximal free rectangles -- it does NOT produce guillotine-valid cuts. Use guillotine free-rect splitting only.
- **Greedy without sorting:** Placing pieces in input order (not sorted by area) produces significantly worse layouts.
- **Floating point equality:** Use epsilon (0.01mm) when checking if a piece fits in a rectangle.
- **Zero-dimension free rectangles:** Filter out free rectangles where width < epsilon or height < epsilon after every split to prevent accumulation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unit conversion | Custom conversion math | `src/lib/units.ts` (toInternal/fromInternal) | Already built and tested |
| UUID generation | Custom ID scheme | `crypto.randomUUID()` | Established project pattern |
| Color assignment | Custom palette logic | `src/lib/color-palette.ts` | Already built |

**Key insight:** The optimization algorithm IS the thing to hand-roll. It is the core domain logic of the app. But everything around it (IDs, units, state management) uses existing patterns.

## Common Pitfalls

### Pitfall 1: Non-Guillotine Splits
**What goes wrong:** After placing a piece, splitting remaining space into more than 2 rectangles or using L-shaped remainders violates the guillotine constraint.
**Why it happens:** MaxRects algorithms (common in tutorials) track overlapping maximal free rectangles which are NOT guillotine-valid.
**How to avoid:** Each placement MUST split one free rectangle into exactly 0, 1, or 2 new rectangles via a single straight-through cut.
**Warning signs:** Free rectangles that overlap each other; pieces that can only be separated by non-straight cuts.

### Pitfall 2: Kerf Double-Counting
**What goes wrong:** Adding kerf to both sides of adjacent pieces counts the kerf twice.
**Why it happens:** Confusion between "kerf per cut" and "kerf per piece edge."
**How to avoid:** Add kerf once per piece dimension (width + kerf, height + kerf). Each piece "owns" one kerf width on its right and bottom. Slight overestimate at board edges is acceptable and standard.
**Warning signs:** Layouts with visibly larger gaps than expected kerf width.

### Pitfall 3: Quantity Expansion Bugs
**What goes wrong:** A CutPiece with quantity=3 gets placed once instead of three times, or a Board with quantity=2 only provides one board.
**Why it happens:** Forgetting to expand quantities into individual instances before the packing loop.
**How to avoid:** First step: expand all quantities. Track original board/piece ID + instance index.
**Warning signs:** Tests pass with qty=1 but fail with qty>1.

### Pitfall 4: Grain Direction Rotation Bug
**What goes wrong:** Pieces with grainDirection=true get rotated.
**Why it happens:** Rotation check missing or inverted boolean logic.
**How to avoid:** `canRotate = !piece.grainDirection`. Test explicitly: a grain-locked piece that only fits rotated should go to unplaced, NOT be rotated.
**Warning signs:** Grain-locked pieces appearing in rotated orientation in output.

### Pitfall 5: Infinite Board Opening
**What goes wrong:** Algorithm opens more boards than available stock.
**Why it happens:** No cap on board instances.
**How to avoid:** Available board instances = sum of all board quantities. If all are full and pieces remain, mark as unplaced.
**Warning signs:** Layout shows 50 boards when user specified 5 total.

### Pitfall 6: Piece Dimension Convention Confusion
**What goes wrong:** Algorithm treats CutPiece.dimensions.length as width or vice versa.
**Why it happens:** Ambiguity between "length/width" (woodworking) and "width/height" (2D geometry).
**How to avoid:** Define clear convention: CutPiece.dimensions.width maps to x-axis, CutPiece.dimensions.length maps to y-axis. Document once and be consistent. When rotated, swap.
**Warning signs:** Pieces appear stretched or flipped in visualization.

## Code Examples

### Output Type Definitions
```typescript
export interface PlacedPiece {
  pieceId: string;       // original CutPiece.id
  instanceIndex: number; // which instance of this piece (0-based)
  x: number;             // mm from board left edge
  y: number;             // mm from board top edge
  width: number;         // as-placed width (may differ from original if rotated)
  height: number;        // as-placed height
  rotated: boolean;
  label: string;
  color: string;
}

export interface BoardLayout {
  boardId: string;        // original Board.id
  instanceIndex: number;  // which instance of this board type
  width: number;          // board width in mm
  height: number;         // board height in mm
  pieces: PlacedPiece[];
  usedArea: number;       // mm^2 of placed pieces
  wasteArea: number;      // mm^2 unused
}

export interface OptimizationResult {
  boards: BoardLayout[];
  unplacedPieces: Array<{ pieceId: string; instanceIndex: number; label: string }>;
  summary: {
    totalBoards: number;
    totalPieces: number;
    placedPieces: number;
    totalArea: number;     // mm^2 of all used boards
    usedArea: number;      // mm^2 of placed pieces
    wasteArea: number;     // mm^2 unused
    wastePercentage: number; // 0-100
  };
}
```

### Expanding Quantities
```typescript
interface ExpandedPiece {
  originalId: string;
  instanceIndex: number;
  width: number;     // CutPiece.dimensions.width
  height: number;    // CutPiece.dimensions.length
  canRotate: boolean;
  label: string;
  color: string;
}

function expandPieces(pieces: CutPiece[]): ExpandedPiece[] {
  const expanded: ExpandedPiece[] = [];
  for (const piece of pieces) {
    for (let i = 0; i < piece.quantity; i++) {
      expanded.push({
        originalId: piece.id,
        instanceIndex: i,
        width: piece.dimensions.width,
        height: piece.dimensions.length,
        canRotate: !piece.grainDirection,
        label: piece.label,
        color: piece.color,
      });
    }
  }
  return expanded;
}

interface ExpandedBoard {
  originalId: string;
  instanceIndex: number;
  width: number;
  height: number;
}

function expandBoards(boards: Board[]): ExpandedBoard[] {
  const expanded: ExpandedBoard[] = [];
  for (const board of boards) {
    for (let i = 0; i < board.quantity; i++) {
      expanded.push({
        originalId: board.id,
        instanceIndex: i,
        width: board.dimensions.width,
        height: board.dimensions.length,
      });
    }
  }
  return expanded;
}
```

### Test Pattern: Guillotine Constraint Verification
```typescript
it('no pieces overlap on any board', () => {
  const result = optimizeCutLayout(boards, pieces, settings);
  for (const board of result.boards) {
    for (let i = 0; i < board.pieces.length; i++) {
      for (let j = i + 1; j < board.pieces.length; j++) {
        const a = board.pieces[i];
        const b = board.pieces[j];
        const overlaps =
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y;
        expect(overlaps).toBe(false);
      }
    }
  }
});

it('no piece extends beyond board boundaries', () => {
  const result = optimizeCutLayout(boards, pieces, settings);
  for (const board of result.boards) {
    for (const piece of board.pieces) {
      expect(piece.x + piece.width).toBeLessThanOrEqual(board.width + 0.01);
      expect(piece.y + piece.height).toBeLessThanOrEqual(board.height + 0.01);
    }
  }
});
```

### Test Pattern: Grain Direction
```typescript
it('grain-locked piece is never rotated', () => {
  const result = optimizeCutLayout(
    [{ id: 'b1', dimensions: { length: 500, width: 300 }, quantity: 1 }],
    [{ id: 'p1', dimensions: { length: 400, width: 100 }, quantity: 1, label: 'A', color: '#f00', grainDirection: true }],
    { units: 'metric', kerf: 3.175 }
  );
  const placed = result.boards[0].pieces[0];
  expect(placed.rotated).toBe(false);
});

it('grain-locked piece that only fits rotated goes to unplaced', () => {
  const result = optimizeCutLayout(
    [{ id: 'b1', dimensions: { length: 200, width: 500 }, quantity: 1 }],
    [{ id: 'p1', dimensions: { length: 400, width: 100 }, quantity: 1, label: 'A', color: '#f00', grainDirection: true }],
    { units: 'metric', kerf: 0 }
  );
  expect(result.unplacedPieces).toHaveLength(1);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Shelf-based packing | Guillotine free-rect splitting | Jylanki 2010 paper | Better space utilization, still guillotine-valid |
| Single split strategy | Dual strategy (H-first and V-first) comparison | Common practice | 5-15% improvement for minimal overhead |
| Exact solvers (ILP) | Heuristics (FFD + BSSF) | Always for interactive use | Exact solvers take seconds-to-minutes; heuristics <10ms |
| Class-based OOP packer | Pure functional approach | Project convention | Fits React state model, easier to test |

**Deprecated/outdated:**
- **guillotine-packer npm:** Last updated Jan 2020, `process` reference bug in Vite/browser environments, 47 weekly downloads.
- **Next Fit Decreasing:** Only considers current board, wastes space. Use First Fit Decreasing instead.

## Open Questions

1. **Web Worker for Large Inputs**
   - What we know: Performance target is <1s for 10 boards, 50 pieces. Pure JS handles this easily (<10ms).
   - What's unclear: At what scale does blocking the main thread become noticeable?
   - Recommendation: Skip web worker for v1. At 50 pieces the algorithm runs in single-digit milliseconds. Add web worker later if users report UI freezing with >100 pieces.

2. **Dimension Convention (length vs width)**
   - What we know: CutPiece has `dimensions.length` and `dimensions.width`. In 2D packing, these map to y-axis (height) and x-axis (width) respectively.
   - What's unclear: Does grain run along "length"?
   - Recommendation: Define convention explicitly in code. width = x-axis, length = y-axis (height). Document once at top of optimizer.ts.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 |
| Config file | vitest.config.ts (environment: node) |
| Quick run command | `npx vitest run src/lib/optimizer.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OPT-01 | optimizeCutLayout returns valid BoardLayout[] with pieces placed | unit | `npx vitest run src/lib/optimizer.test.ts -t "produces layout"` | No -- Wave 0 |
| OPT-02 | Kerf gaps between adjacent pieces match configured kerf | unit | `npx vitest run src/lib/optimizer.test.ts -t "kerf"` | No -- Wave 0 |
| OPT-03 | grainDirection=true pieces never rotated | unit | `npx vitest run src/lib/optimizer.test.ts -t "grain"` | No -- Wave 0 |
| OPT-04 | All cuts guillotine-valid (no overlaps, pieces within bounds) | unit | `npx vitest run src/lib/optimizer.test.ts -t "guillotine"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/optimizer.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/optimizer.test.ts` -- covers OPT-01 through OPT-04
- [ ] New types in `src/lib/types.ts` -- PlacedPiece, BoardLayout, OptimizationResult

*(No new framework installs needed -- Vitest already configured)*

## Sources

### Primary (HIGH confidence)
- Project source: `src/lib/types.ts` -- Board, CutPiece, Settings with kerf and grainDirection fields verified
- Project source: `src/app/page.tsx` -- page-level state pattern, Board[] and CutPiece[] state confirmed
- Project source: `src/components/cuts/CutPieceForm.tsx` -- grainDirection checkbox already implemented
- Jukka Jylanki, "A Thousand Ways to Pack the Bin" (2010) -- foundational reference for rectangle bin-packing heuristics

### Secondary (MEDIUM confidence)
- [guillotine-packer GitHub](https://github.com/tyschroed/guillotine-packer) -- evaluated and rejected (last updated 2020, no kerf/grain)
- [rectangle-packer npm](https://www.npmjs.com/package/rectangle-packer) -- evaluated and rejected (generic, no kerf)
- [Wikipedia: Guillotine cutting](https://en.wikipedia.org/wiki/Guillotine_cutting) -- formal definition of guillotine constraint

### Tertiary (LOW confidence)
- npm download counts and version dates used to assess library health

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing tooling
- Architecture: HIGH -- well-understood algorithm, clear input/output types defined in CONTEXT.md, follows established project patterns
- Pitfalls: HIGH -- kerf handling, quantity expansion, and grain direction are well-known failure modes in bin-packing implementations

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable algorithmic domain, no library version concerns)
