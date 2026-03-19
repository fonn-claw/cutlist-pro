# Phase 4: Optimization Engine - Research

**Researched:** 2026-03-19
**Domain:** Guillotine bin-packing algorithm for woodworking cut optimization
**Confidence:** HIGH

## Summary

The guillotine bin-packing problem is well-studied in computational geometry and operations research. The standard approach, documented in Jukka Jylanki's "A Thousand Ways to Pack the Bin" paper, uses recursive free-rectangle splitting: maintain a list of available rectangular spaces, place pieces into the best-fitting space using a heuristic, then split the remaining space into two new rectangles via a guillotine (straight-through) cut. The First Fit Decreasing heuristic (sort pieces largest-area-first) combined with Best Short Side Fit selection and Short Axis splitting produces good results for typical woodworking scenarios.

While npm packages exist (guillotine-packer v1.0.2, rectpack-ts v0.0.2), they are either unmaintained (5+ years, Vite compatibility issues) or too immature. The algorithm is well-understood, approximately 200-300 lines of TypeScript, and the project's specific requirements (kerf handling, grain direction constraints, output format matching Phase 5 visualization) make a hand-rolled implementation the correct choice. This aligns with the established project pattern of pure functions in `src/lib/` with comprehensive TDD.

**Primary recommendation:** Implement a custom guillotine bin-packing algorithm as pure TypeScript functions with TDD. Use First Fit Decreasing with Best Short Side Fit heuristic. The algorithm is small enough to implement cleanly and test thoroughly, with zero external dependencies.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Guillotine bin-packing: pieces placed via recursive splitting of available rectangles
- First Fit Decreasing heuristic: sort pieces by area (largest first), place each in first board with space
- If a piece doesn't fit any existing board, start a new board from the available stock
- Kerf accounted for by expanding piece dimensions during placement (piece + kerf on each cut side)
- Default kerf: 1/8" (3.175mm) -- standard table saw blade width
- User-configurable via a settings input (stored in mm internally)
- Kerf applied between cuts, not on board edges
- Pieces marked with grainDirection=true cannot be rotated during placement
- Pieces with grainDirection=false can be rotated 90 degrees if it produces a better fit
- Algorithm tries both orientations for rotatable pieces
- Result contains: array of board layouts, each with placed pieces (position x,y + dimensions) and waste regions
- Unplaced pieces tracked separately (if boards run out)
- Total waste calculation per board and overall

### Claude's Discretion
- Specific placement algorithm variant (shelf-based vs recursive guillotine)
- Tie-breaking heuristics when multiple placements score equally
- Performance optimization details
- Exact data structure field names for layout results

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| OPT-01 | User can run guillotine bin-packing optimization on button click | Algorithm exposed as pure function `optimizeCutLayout(boards, pieces, settings)` returning full layout data |
| OPT-02 | User can configure kerf (blade width) setting with sensible default (1/8") | Kerf already in Settings interface; algorithm adds kerf to piece dimensions during placement |
| OPT-03 | User can mark pieces with grain direction constraint (no rotation) | CutPiece.grainDirection already exists; algorithm skips rotation for grainDirection=true pieces |
| OPT-04 | Algorithm produces layouts using only guillotine (straight through) cuts | Recursive free-rectangle splitting inherently produces only guillotine cuts |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| None (hand-rolled) | N/A | Guillotine bin-packing algorithm | Existing npm packages are unmaintained or immature; algorithm is ~250 lines; custom impl matches project types exactly |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 4.1.0 | Unit testing | Already in project; test every algorithm path |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled | guillotine-packer (npm) | 5 years unmaintained, Vite/process.env bug, no kerf-on-edges control, 47 weekly downloads |
| Hand-rolled | rectpack-ts (npm) | v0.0.2, MaxRects-focused not guillotine-focused, no kerf support |
| Best Short Side Fit | Best Area Fit | BAF wastes less total area but BSSF produces tighter visual layouts for woodworking |

**Installation:**
```bash
# No new packages needed -- pure TypeScript implementation
```

## Architecture Patterns

### Recommended Project Structure
```
src/lib/
  optimizer.ts           # Main optimize function + types
  optimizer.test.ts      # Comprehensive TDD tests
  optimizer-helpers.ts   # Internal helpers (sorting, scoring) if optimizer.ts exceeds ~200 lines
  types.ts               # Add OptimizationResult, PlacedPiece, BoardLayout types
```

### Pattern 1: Recursive Free-Rectangle Splitting (Guillotine)
**What:** Maintain a list of free rectangles per board. When placing a piece, find the best-fitting free rectangle, place the piece at its corner, then split the remaining space into exactly two new free rectangles via a guillotine cut (horizontal or vertical).
**When to use:** Every placement operation.
**Example:**
```typescript
// Source: Jylanki "A Thousand Ways to Pack the Bin" + DeepWiki rectpack docs

interface FreeRectangle {
  x: number;      // mm, top-left corner
  y: number;      // mm, top-left corner
  width: number;  // mm
  height: number; // mm
}

interface PlacedPiece {
  pieceId: string;
  x: number;
  y: number;
  width: number;   // as-placed (may be rotated)
  height: number;  // as-placed (may be rotated)
  rotated: boolean;
  label: string;
  color: string;
}

interface BoardLayout {
  boardId: string;
  boardIndex: number;       // which instance of this board type (0-based)
  width: number;
  height: number;
  pieces: PlacedPiece[];
  freeRectangles: FreeRectangle[];  // remaining usable space
  wasteArea: number;        // mm^2 of unusable fragments
  usedArea: number;         // mm^2 of placed pieces
}

interface OptimizationResult {
  boards: BoardLayout[];
  unplacedPieces: string[]; // piece IDs that couldn't fit
  totalWaste: number;       // mm^2
  totalUsed: number;        // mm^2
  totalAvailable: number;   // mm^2
  wastePercentage: number;  // 0-100
}

// Core placement: find best free rect, place piece, split remaining space
function placePiece(
  freeRects: FreeRectangle[],
  pieceWidth: number,  // includes kerf
  pieceHeight: number, // includes kerf
  canRotate: boolean
): { rect: FreeRectangle; rotated: boolean } | null {
  let bestScore = Infinity;
  let bestRect: FreeRectangle | null = null;
  let bestRotated = false;

  for (const rect of freeRects) {
    // Try normal orientation
    if (pieceWidth <= rect.width && pieceHeight <= rect.height) {
      const shortSide = Math.min(rect.width - pieceWidth, rect.height - pieceHeight);
      if (shortSide < bestScore) {
        bestScore = shortSide;
        bestRect = rect;
        bestRotated = false;
      }
    }
    // Try rotated orientation (only if allowed)
    if (canRotate && pieceHeight <= rect.width && pieceWidth <= rect.height) {
      const shortSide = Math.min(rect.width - pieceHeight, rect.height - pieceWidth);
      if (shortSide < bestScore) {
        bestScore = shortSide;
        bestRect = rect;
        bestRotated = true;
      }
    }
  }

  return bestRect ? { rect: bestRect, rotated: bestRotated } : null;
}

// After placing a piece at (rect.x, rect.y), split remaining space
// into two new free rectangles via guillotine cut
function splitFreeRect(
  rect: FreeRectangle,
  placedWidth: number,
  placedHeight: number
): FreeRectangle[] {
  const result: FreeRectangle[] = [];
  const rightWidth = rect.width - placedWidth;
  const bottomHeight = rect.height - placedHeight;

  // Short Axis Split: cut along the shorter remaining dimension
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

### Pattern 2: Kerf Handling via Dimension Expansion
**What:** When placing a piece, add kerf width to the piece dimensions (but only between cuts, not on board edges). In practice, add kerf to piece width and height during placement scoring and free-rect splitting, but record the piece's actual dimensions in the output.
**When to use:** Every placement calculation.
**Example:**
```typescript
// Kerf is applied as an expansion around each piece during placement.
// The placed piece occupies (pieceWidth + kerf) x (pieceHeight + kerf) in the layout,
// but the PlacedPiece records the original dimensions.
//
// Why kerf on both sides? Each cut removes material. When piece A is next to piece B,
// there's one kerf between them. Adding kerf/2 to each side of each piece achieves this.
// Simplification: add full kerf to width and height of each piece during placement.
// This slightly overestimates kerf at board edges but is the standard approach and
// produces safe (never too tight) layouts.

function effectiveDimensions(piece: { width: number; height: number }, kerf: number) {
  return {
    width: piece.width + kerf,
    height: piece.height + kerf,
  };
}
```

### Pattern 3: First Fit Decreasing with Multi-Board
**What:** Expand board quantities into individual board instances. Sort pieces by area (largest first). For each piece, try to place it on each existing board in order. If no board has space, allocate a new board instance from available stock.
**When to use:** Top-level optimization loop.
**Example:**
```typescript
function optimizeCutLayout(
  boards: Board[],
  pieces: CutPiece[],
  settings: Settings
): OptimizationResult {
  // 1. Expand boards by quantity: Board{qty:3} -> 3 board instances
  // 2. Expand pieces by quantity: CutPiece{qty:2} -> 2 piece instances
  // 3. Sort pieces by area descending (First Fit Decreasing)
  // 4. For each piece:
  //    a. Calculate effective dimensions (add kerf)
  //    b. Try placement on each active board (Best Short Side Fit)
  //    c. If canRotate (!grainDirection), try both orientations
  //    d. If no fit on active boards, allocate next available board
  //    e. If no boards left, add to unplaced list
  // 5. Calculate waste stats per board and overall
  // 6. Return OptimizationResult
}
```

### Anti-Patterns to Avoid
- **Mutating input arrays:** Algorithm MUST be a pure function. Clone boards/pieces before processing. Return new result object.
- **Forgetting to expand quantities:** Board{qty:3} means 3 separate board instances to pack onto, not 1 board used 3 times. Same for CutPiece quantities.
- **Kerf on board edges:** The simplification of adding full kerf to piece dimensions slightly overestimates at edges but is safe. Do NOT try to conditionally apply kerf only between pieces -- this massively complicates the algorithm for negligible gain.
- **Greedy without sorting:** Placing pieces in input order (not sorted by area) produces significantly worse layouts. Always sort largest-first.
- **Floating point comparisons:** Use a small epsilon (0.01mm) when checking if a piece fits in a rectangle. Real-world mm dimensions can accumulate floating point errors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unit conversion | Custom conversion math | Existing `src/lib/units.ts` | Already built and tested |
| UUID generation | Custom ID scheme | `crypto.randomUUID()` | Established project pattern |

**Key insight:** The optimization algorithm itself IS the thing to hand-roll. The existing npm packages (guillotine-packer, rectpack-ts) are unmaintained, have compatibility issues, and don't match the project's type system. At ~250 lines of well-tested TypeScript, this is a tractable custom implementation.

## Common Pitfalls

### Pitfall 1: Non-Guillotine Splits
**What goes wrong:** After placing a piece, splitting the remaining space into more than 2 rectangles or using L-shaped remainders violates the guillotine constraint.
**Why it happens:** MaxRects algorithms (which track all maximal free rectangles including overlapping ones) are more common in tutorials but do NOT produce guillotine-valid cuts.
**How to avoid:** Each placement MUST split one free rectangle into exactly 0, 1, or 2 new rectangles via a single straight-through cut. Never merge or overlap free rectangles.
**Warning signs:** Free rectangles that overlap each other; pieces that can only be separated by non-straight cuts.

### Pitfall 2: Kerf Double-Counting
**What goes wrong:** Adding kerf to both sides of adjacent pieces counts the kerf twice (piece A adds kerf to its right, piece B adds kerf to its left = 2x kerf gap).
**Why it happens:** Confusion between "kerf per cut" and "kerf per piece edge."
**How to avoid:** Add kerf once per piece dimension (width + kerf, height + kerf). This means each piece "owns" one kerf width on its right and bottom. The slight overestimate at board edges is acceptable and standard.
**Warning signs:** Layouts with visibly larger gaps than expected kerf width.

### Pitfall 3: Quantity Expansion Bugs
**What goes wrong:** A CutPiece with quantity=3 gets placed once instead of three times, or a Board with quantity=2 only provides one board.
**Why it happens:** Forgetting to expand quantities into individual instances before the packing loop.
**How to avoid:** First step of algorithm: expand all quantities. Track which original board/piece each instance came from via ID references.
**Warning signs:** Tests pass with qty=1 but fail with qty>1.

### Pitfall 4: Grain Direction Rotation Bug
**What goes wrong:** Pieces with grainDirection=true get rotated, ruining the wood grain alignment.
**Why it happens:** Rotation check missing or inverted boolean logic.
**How to avoid:** `canRotate = !piece.grainDirection`. Test explicitly with grain-constrained pieces that only fit when rotated (should fail to place, not rotate).
**Warning signs:** Grain-locked pieces appearing in rotated orientation in output.

### Pitfall 5: Empty or Zero-Dimension Free Rectangles
**What goes wrong:** After splitting, free rectangles with width=0 or height=0 accumulate, slowing down the algorithm and causing edge-case bugs.
**Why it happens:** Exact-fit placements produce zero-width remainders.
**How to avoid:** Filter out free rectangles where width < epsilon or height < epsilon after every split.
**Warning signs:** Growing free rectangle lists, slowing performance on repeated optimizations.

## Code Examples

### Main Optimizer Function Signature
```typescript
// Source: Project types.ts + algorithm research

import type { Board, CutPiece, Settings } from '@/lib/types';

export interface PlacedPiece {
  pieceId: string;      // original CutPiece.id
  instanceIndex: number; // which instance of this piece (0-based)
  x: number;            // mm from board left edge
  y: number;            // mm from board top edge
  width: number;        // as-placed dimension (may differ from original if rotated)
  height: number;       // as-placed dimension
  rotated: boolean;
  label: string;
  color: string;
}

export interface WasteRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoardLayout {
  boardId: string;       // original Board.id
  instanceIndex: number; // which instance of this board type
  width: number;         // board dimensions in mm
  height: number;
  pieces: PlacedPiece[];
  waste: WasteRegion[];  // unused areas for visualization
  usedArea: number;      // mm^2
  wasteArea: number;     // mm^2
  utilizationPercent: number; // 0-100
}

export interface OptimizationResult {
  boards: BoardLayout[];
  unplacedPieces: Array<{ pieceId: string; instanceIndex: number }>;
  summary: {
    totalBoards: number;
    totalPieces: number;
    placedPieces: number;
    totalArea: number;
    usedArea: number;
    wasteArea: number;
    wastePercentage: number;
  };
}

export function optimizeCutLayout(
  boards: Board[],
  pieces: CutPiece[],
  settings: Settings
): OptimizationResult;
```

### Test Pattern: Verify Guillotine Constraint
```typescript
// Every placed piece must be reachable via guillotine cuts only.
// Practical test: for each board layout, verify that the placed pieces
// + waste regions tile the board exactly (no overlaps, no gaps not
// explainable by guillotine splitting).

it('all cuts are guillotine-valid (pieces do not overlap)', () => {
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

### Test Pattern: Kerf Gap Verification
```typescript
it('kerf gap exists between adjacent pieces', () => {
  const kerf = 3.175; // 1/8"
  const result = optimizeCutLayout(
    [{ id: 'b1', dimensions: { length: 1000, width: 500 }, quantity: 1 }],
    [
      { id: 'p1', dimensions: { length: 400, width: 200 }, quantity: 1, label: 'A', color: '#f00', grainDirection: false },
      { id: 'p2', dimensions: { length: 400, width: 200 }, quantity: 1, label: 'B', color: '#0f0', grainDirection: false },
    ],
    { units: 'metric', kerf }
  );
  const board = result.boards[0];
  // Pieces should not be touching -- kerf gap between them
  // If p1 is at x=0, p2 should be at x >= 400 + kerf (or similar for y)
  const [p1, p2] = board.pieces;
  if (p1.x + p1.width <= p2.x) {
    // Horizontally adjacent
    expect(p2.x - (p1.x + p1.width)).toBeGreaterThanOrEqual(kerf - 0.01);
  }
});
```

### Test Pattern: Grain Direction Respected
```typescript
it('grain-locked piece is never rotated', () => {
  const result = optimizeCutLayout(
    [{ id: 'b1', dimensions: { length: 500, width: 300 }, quantity: 1 }],
    [{ id: 'p1', dimensions: { length: 400, width: 100 }, quantity: 1, label: 'A', color: '#f00', grainDirection: true }],
    { units: 'metric', kerf: 3.175 }
  );
  const placed = result.boards[0].pieces[0];
  expect(placed.rotated).toBe(false);
  expect(placed.width).toBe(400);
  expect(placed.height).toBe(100);
});

it('grain-locked piece that only fits rotated goes to unplaced', () => {
  // Board is 300 wide, piece is 400 long -- only fits if rotated
  // But grain direction prevents rotation
  const result = optimizeCutLayout(
    [{ id: 'b1', dimensions: { length: 300, width: 500 }, quantity: 1 }],
    [{ id: 'p1', dimensions: { length: 400, width: 100 }, quantity: 1, label: 'A', color: '#f00', grainDirection: true }],
    { units: 'metric', kerf: 0 }
  );
  expect(result.unplacedPieces).toHaveLength(1);
  expect(result.unplacedPieces[0].pieceId).toBe('p1');
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Shelf-based packing | Guillotine free-rect splitting | Jylanki 2010 paper | Better space utilization, still produces guillotine-valid cuts |
| Single heuristic | Try all heuristic combos, pick best | Common practice | 5-15% improvement in utilization for small extra compute |
| Exact solvers (ILP) | Heuristics (FFD + BSSF) | Always for interactive use | Exact solvers take seconds-to-minutes; heuristics are <10ms |

**Deprecated/outdated:**
- **Next Fit Decreasing:** Only considers current board, wastes space. Use First Fit Decreasing instead.
- **guillotine-packer npm package:** Last updated 2021, has `process` reference bug in Vite/browser environments, only 47 weekly downloads.

## Open Questions

1. **Multi-heuristic tryall strategy**
   - What we know: Trying all 18 combinations (3 selection x 6 split) and picking the best result produces optimal layouts
   - What's unclear: Is the performance budget (<1s) sufficient for tryall on 20+ pieces across multiple boards?
   - Recommendation: Start with single heuristic (BSSF + Short Axis Split). Add tryall as a performance-gated optimization if initial results are suboptimal. 18 runs of a <10ms algorithm is still <200ms.

2. **Board allocation strategy**
   - What we know: FFD places each piece on first board with space
   - What's unclear: Should boards be pre-allocated from stock, or allocated on-demand?
   - Recommendation: Allocate on-demand. Start with zero active boards, allocate from expanded stock pool as needed. Simpler and avoids wasting boards.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run src/lib/optimizer.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OPT-01 | optimizeCutLayout returns valid BoardLayout[] | unit | `npx vitest run src/lib/optimizer.test.ts -t "produces layout"` | No -- Wave 0 |
| OPT-02 | Kerf gaps between pieces match configured kerf | unit | `npx vitest run src/lib/optimizer.test.ts -t "kerf"` | No -- Wave 0 |
| OPT-03 | grainDirection=true pieces never rotated | unit | `npx vitest run src/lib/optimizer.test.ts -t "grain"` | No -- Wave 0 |
| OPT-04 | All cuts are guillotine-valid (no overlaps, pieces within bounds) | unit | `npx vitest run src/lib/optimizer.test.ts -t "guillotine"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/optimizer.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/optimizer.test.ts` -- covers OPT-01 through OPT-04
- [ ] New types in `src/lib/types.ts` -- OptimizationResult, PlacedPiece, BoardLayout, WasteRegion

*(No new framework installs needed -- Vitest already configured)*

## Sources

### Primary (HIGH confidence)
- Jukka Jylanki, "A Thousand Ways to Pack the Bin - A Practical Approach to Two-Dimensional Rectangle Bin Packing" (2010) -- foundational reference for all rectangle bin-packing heuristics
- [DeepWiki: rectpack Guillotine Algorithms](https://deepwiki.com/secnot/rectpack/4.2-guillotine-algorithms) -- detailed description of selection rules (BSSF, BLSF, BAF) and split rules (SAS, LAS, SLAS, LLAS, MAXAS, MINAS)
- Existing project code: `src/lib/types.ts` -- Board, CutPiece, Settings interfaces with kerf and grainDirection fields

### Secondary (MEDIUM confidence)
- [guillotine-packer GitHub](https://github.com/tyschroed/guillotine-packer) -- confirmed API supports kerfSize and allowRotation parameters; verified Vite compatibility issue
- [Vite issue #11338](https://github.com/vitejs/vite/issues/11338) -- guillotine-packer `process is not defined` in browser bundles
- [Wikipedia: Guillotine cutting](https://en.wikipedia.org/wiki/Guillotine_cutting) -- formal definition of guillotine constraint

### Tertiary (LOW confidence)
- npm download counts and version dates for guillotine-packer (47/week) and rectpack-ts (v0.0.2) -- used to assess library health, not algorithmic claims

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- algorithm is well-documented in academic literature, implementation approach is proven
- Architecture: HIGH -- follows established project patterns (pure functions, TDD, lib/ directory)
- Pitfalls: HIGH -- guillotine constraint violations and kerf handling are well-known failure modes in bin-packing implementations

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable domain, algorithm research doesn't change)
