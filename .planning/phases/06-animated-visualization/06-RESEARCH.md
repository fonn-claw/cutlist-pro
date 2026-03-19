# Phase 6: Animated Visualization - Research

**Researched:** 2026-03-19
**Domain:** SVG animation in React (CSS transitions + requestAnimationFrame)
**Confidence:** HIGH

## Summary

This phase adds entrance animations to the existing SVG cutting diagram pieces. The current codebase renders `PieceRect` components as `<rect>` elements inside SVG, positioned with `x`, `y`, `width`, `height` attributes. The animation needs to make these pieces slide in from board edges and fade in, staggered board-by-board and sorted by piece area descending.

The recommended approach is a **custom `useAnimation` hook using `requestAnimationFrame`** that drives SVG attribute interpolation. CSS transitions cannot animate SVG attributes (`x`, `y`) reliably across browsers -- they work on CSS properties but SVG geometry attributes need either SMIL, CSS `transform`, or JS-driven animation. Since pieces need coordinated stagger timing across boards and a skip-to-end mechanism, a JS-driven approach with `requestAnimationFrame` provides the most control with zero dependencies.

**Primary recommendation:** Build a `useAnimationSequence` hook that accepts placed pieces grouped by board, computes start positions (off nearest board edge), and drives interpolation via `requestAnimationFrame`. No external animation libraries needed -- the animation logic is ~100 lines of pure JS.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Animation plays on each Optimize click -- every new optimization result triggers the animation
- Re-optimization always replays animation (shows the hero moment every time)
- Total animation duration: 2-3 seconds for a typical project (~10-15 pieces)
- Animation must play smoothly at 60fps without jank or layout shifts
- Pieces slide in from the nearest board edge + fade in simultaneously
- Use ease-out easing for natural deceleration (pieces "arrive" and settle)
- Waste regions appear after all pieces are placed (fade in together)
- Board outline/header visible immediately -- animation is only for pieces
- Pieces animate board-by-board: first board completes, then second board starts
- Within each board, pieces stagger with 50-100ms delay between each
- Short pause (~200ms) between boards for visual separation
- Larger pieces animate first (sorted by area descending) for dramatic effect
- Click anywhere during animation to skip to final state instantly
- No play/pause/replay buttons -- keep UI clean
- If user modifies inputs while animation is playing, animation stops and result clears

### Claude's Discretion
- Exact slide distance and direction calculation per piece
- Whether to use CSS transitions, CSS animations, or requestAnimationFrame
- Waste region fade timing and opacity curve
- Whether board headers animate or appear instantly

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIS-04 | Animated optimization -- pieces slide/fade into position when user clicks "Optimize" | Animation hook drives SVG attribute interpolation via rAF; PieceRect gets animated props; BoardDiagram orchestrates stagger; CuttingDiagramList coordinates board-by-board sequencing; click-to-skip via animation state |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (existing) | 19.2.4 | Component rendering | Already in project |
| requestAnimationFrame (browser API) | N/A | Frame-by-frame animation driver | Zero dependencies, full control over timing, easy cancel via cancelAnimationFrame |

### Supporting
No additional libraries needed. The animation is straightforward interpolation of 2-3 SVG attributes per piece.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| requestAnimationFrame | Framer Motion | Massive bundle (~30KB), overkill for SVG attribute interpolation on <20 elements |
| requestAnimationFrame | CSS transitions on transform | SVG `x`/`y` are presentation attributes not CSS properties; would need to switch to `transform: translate()` which changes the rendering model |
| requestAnimationFrame | SMIL `<animate>` | Deprecated direction from Chrome team, poor React integration, hard to coordinate stagger timing |
| requestAnimationFrame | Web Animations API | Good option but less control over stagger sequencing; would work but rAF is simpler for this use case |

**Installation:**
```bash
# No new dependencies required
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   └── useAnimationSequence.ts    # Animation orchestration hook
├── lib/
│   └── animation-utils.ts         # Pure functions: easing, start positions, timing
├── components/visualization/
│   ├── PieceRect.tsx              # Modified: accept animated x/y/opacity props
│   ├── WasteRect.tsx              # Modified: accept animated opacity prop
│   ├── BoardDiagram.tsx           # Modified: use animation hook, pass animated props
│   └── CuttingDiagramList.tsx     # Modified: coordinate board-by-board sequencing
```

### Pattern 1: Animation State Machine
**What:** The animation has three states: `idle` (no animation), `playing` (interpolating), `complete` (final positions shown). The hook manages transitions between these states.
**When to use:** When the `optimizationResult` prop changes from null to a value (or from one value to another).

```typescript
type AnimationState = 'idle' | 'playing' | 'complete';

interface AnimatedPiece {
  // Final position (from PlacedPiece)
  finalX: number;
  finalY: number;
  // Start position (computed: off nearest board edge)
  startX: number;
  startY: number;
  // Current interpolated values
  currentX: number;
  currentY: number;
  currentOpacity: number;
  // Timing
  delay: number;     // ms before this piece starts
  duration: number;   // ms for this piece's animation
}
```

### Pattern 2: Nearest-Edge Start Position Calculation
**What:** Each piece starts off-screen from the nearest board edge and slides to its final position.
**When to use:** Computing the `startX`/`startY` for each piece.

```typescript
function computeStartPosition(
  piece: PlacedPiece,
  boardWidth: number,
  boardHeight: number
): { startX: number; startY: number } {
  const centerX = piece.x + piece.width / 2;
  const centerY = piece.y + piece.height / 2;

  // Distances to each edge
  const distLeft = centerX;
  const distRight = boardWidth - centerX;
  const distTop = centerY;
  const distBottom = boardHeight - centerY;

  const minDist = Math.min(distLeft, distRight, distTop, distBottom);

  if (minDist === distLeft) return { startX: -piece.width, startY: piece.y };
  if (minDist === distRight) return { startX: boardWidth, startY: piece.y };
  if (minDist === distTop) return { startX: piece.x, startY: -piece.height };
  return { startX: piece.x, startY: boardHeight };
}
```

### Pattern 3: Ease-Out Easing Function
**What:** Standard ease-out curve for natural deceleration.

```typescript
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
```

### Pattern 4: Stagger Timing Calculation
**What:** Pieces within a board are sorted by area (descending) and staggered with 50-100ms delays. Boards are sequenced with a ~200ms gap.

```typescript
function computeDelays(
  boards: BoardLayout[],
  pieceDuration: number,    // ~300ms per piece
  pieceStagger: number,     // ~80ms between pieces
  boardPause: number        // ~200ms between boards
): Map<string, number> {
  const delays = new Map<string, number>();
  let currentTime = 0;

  for (const board of boards) {
    const sorted = [...board.pieces].sort(
      (a, b) => (b.width * b.height) - (a.width * a.height)
    );
    for (let i = 0; i < sorted.length; i++) {
      const key = `${sorted[i].pieceId}-${sorted[i].instanceIndex}`;
      delays.set(key, currentTime + i * pieceStagger);
    }
    // Next board starts after last piece finishes
    currentTime += (sorted.length - 1) * pieceStagger + pieceDuration + boardPause;
  }

  return delays;
}
```

### Pattern 5: SVG Transform-Based Animation (Preferred over x/y mutation)
**What:** Instead of animating `x` and `y` attributes directly, use SVG `transform` attribute on the `<g>` wrapper to translate from start to final position. This keeps the final `x`/`y` attributes untouched and only modifies the transform offset.
**Why:** Cleaner separation -- the `PieceRect` keeps its existing `x`/`y` rendering. The animation layer adds a `transform` offset that starts at `(startX - finalX, startY - finalY)` and animates to `(0, 0)`.

```typescript
// In PieceRect, wrap existing content in a <g> with transform
<g
  transform={`translate(${offsetX}, ${offsetY})`}
  opacity={opacity}
>
  {/* existing rect + text elements unchanged */}
</g>
```

### Anti-Patterns to Avoid
- **Animating with React state per frame:** Do NOT call `setState` on every `requestAnimationFrame` tick for each piece. This causes React re-renders at 60fps. Instead, use `useRef` to store animation state and mutate SVG DOM elements directly via refs, OR batch all pieces into a single state update per frame.
- **Using setTimeout chains:** Unreliable timing, drifts, cannot be cancelled cleanly. Use `requestAnimationFrame` with elapsed time tracking.
- **CSS transitions on SVG attributes:** `x`, `y`, `width`, `height` on `<rect>` are SVG presentation attributes, not CSS properties. CSS transitions on them are inconsistent across browsers. Use `transform: translate()` or JS-driven attribute updates.
- **Animating during layout:** Never trigger animations that cause DOM layout recalculation. SVG transforms and opacity are compositor-friendly and avoid layout thrashing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Easing functions | Complex parametric curves | Simple `easeOutCubic: (t) => 1 - (1-t)^3` | One line, well-known, sufficient for "settle" feel |
| Frame timing | Manual `Date.now()` tracking | `requestAnimationFrame` timestamp parameter | Browser provides high-resolution timestamps automatically |

**Key insight:** This animation is simple enough that hand-rolling IS the right approach. Animation libraries (Framer Motion, GSAP, react-spring) are designed for complex interactive animations with physics, gestures, and layout animations. For sequenced SVG entrance animations on <20 elements, a custom hook is less code, zero bundle impact, and more controllable.

## Common Pitfalls

### Pitfall 1: React Re-renders Kill Performance
**What goes wrong:** Calling `setState` 60 times per second for each animating piece causes React reconciliation on every frame, dropping below 60fps.
**Why it happens:** Natural instinct is to store animated values in React state.
**How to avoid:** Use `useRef` for animation state. Mutate SVG element attributes directly via `ref.current.setAttribute()` or use a single `useState` that batches all piece positions into one object update per frame.
**Warning signs:** React DevTools shows constant re-renders during animation; Chrome Performance panel shows long "Scripting" blocks during animation.

### Pitfall 2: Memory Leaks from Uncancelled Animations
**What goes wrong:** If the component unmounts or optimization result changes mid-animation, the `requestAnimationFrame` loop continues, trying to update unmounted DOM elements.
**Why it happens:** Forgetting to call `cancelAnimationFrame` in cleanup.
**How to avoid:** Store the rAF ID in a ref. Cancel in the `useEffect` cleanup function. Also cancel when skip-to-end is triggered.

```typescript
useEffect(() => {
  const rafId = { current: 0 };
  // ... start animation loop
  rafId.current = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(rafId.current);
}, [optimizationResult]);
```

### Pitfall 3: Stale Closure Over Animation State
**What goes wrong:** The rAF callback captures stale values from the initial render, not seeing updated state.
**Why it happens:** JavaScript closures capture variable values at creation time.
**How to avoid:** Use refs for all mutable animation state (current time, piece positions). Only use the rAF timestamp parameter for timing.

### Pitfall 4: SVG Clipping Breaks Slide-In
**What goes wrong:** Pieces sliding in from outside the board boundary are invisible because the SVG viewBox clips them, or the `overflow-hidden` container clips them.
**Why it happens:** The SVG viewBox is set to exactly the board dimensions; pieces starting outside are clipped.
**How to avoid:** Either (a) expand the SVG viewBox by a margin during animation and restore after, or (b) use `opacity: 0` at the start position and fade in as pieces enter the visible area, or (c) add `overflow="visible"` to the SVG during animation. Option (b) is simplest since pieces already fade in -- they become visible as they enter the board area.

### Pitfall 5: Zoom/Pan Conflicts
**What goes wrong:** User zooms or pans during animation, causing visual glitches or the animation target positions to shift.
**Why it happens:** The CSS `transform: scale() translate()` on the wrapper div interacts with SVG-level transforms on pieces.
**How to avoid:** Animation transforms are in SVG coordinate space (inside the viewBox), while zoom/pan transforms are in screen space (on the wrapper div). These are independent and should not conflict. However, tooltips should be disabled during animation (already decided: "Tooltip interaction should work after animation completes, not during").

### Pitfall 6: Animation Duration Doesn't Scale
**What goes wrong:** With 2 pieces, animation feels right at 2 seconds. With 30 pieces, it takes 10+ seconds and feels tedious.
**Why it happens:** Fixed stagger delay * piece count = linear growth.
**How to avoid:** Cap total animation duration. Compute per-piece stagger dynamically: `stagger = Math.min(80, totalDuration / pieceCount)`. Target 2-3 seconds total regardless of piece count.

## Code Examples

### useAnimationSequence Hook (Core Pattern)

```typescript
import { useEffect, useRef, useCallback, useState } from 'react';
import type { BoardLayout, PlacedPiece } from '@/lib/types';

type AnimationPhase = 'idle' | 'playing' | 'complete';

interface PieceAnimState {
  offsetX: number;  // translate offset from final position
  offsetY: number;
  opacity: number;
}

interface UseAnimationSequenceReturn {
  phase: AnimationPhase;
  getPieceState: (boardIdx: number, pieceKey: string) => PieceAnimState;
  getWasteOpacity: () => number;
  skipToEnd: () => void;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useAnimationSequence(
  boards: BoardLayout[] | null,
  enabled: boolean
): UseAnimationSequenceReturn {
  // Implementation drives rAF loop, computes per-piece offsets
  // Returns getPieceState() that BoardDiagram calls for each PieceRect
  // ...
}
```

### PieceRect Integration

```typescript
// Modified PieceRect accepts animation offset props
interface PieceRectProps {
  piece: PlacedPiece;
  units: UnitSystem;
  animOffset?: { offsetX: number; offsetY: number; opacity: number };
  // ... existing props
}

// Wrap in <g> with transform
<g
  transform={animOffset ? `translate(${animOffset.offsetX}, ${animOffset.offsetY})` : undefined}
  opacity={animOffset?.opacity ?? 1}
>
  {/* existing rect + text */}
</g>
```

### Skip-to-End on Click

```typescript
// In CuttingDiagramList or BoardDiagram wrapper
const handleSkip = useCallback(() => {
  if (animPhase === 'playing') {
    skipToEnd(); // Sets all pieces to final positions instantly
  }
}, [animPhase, skipToEnd]);

// Attach to the visualization container
<div onClick={handleSkip}>
  {/* boards */}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SMIL `<animate>` elements | CSS/JS animation | Chrome deprecated intent ~2015, reversed, but poor DX | Use JS or CSS transforms instead |
| jQuery.animate() | requestAnimationFrame | ~2012 | Native browser API, no library needed |
| CSS transitions on SVG attrs | SVG transform + JS | Always inconsistent | SVG attrs are not CSS properties; use transform |

**Deprecated/outdated:**
- SMIL animation: Still works but poor React integration, hard to control programmatically
- `element.style.x` for SVG: Not supported; SVG geometry attributes are not CSS properties in most contexts

## Open Questions

1. **Direct DOM mutation vs React state for animation**
   - What we know: Direct DOM mutation (via refs) is fastest but breaks React's rendering model. Single batched state update per frame is idiomatic React but may cause unnecessary child re-renders.
   - What's unclear: With React 19's automatic batching and ~15-20 pieces, whether batched state updates cause noticeable jank.
   - Recommendation: Start with React state (single object with all piece positions, updated once per rAF frame). If profiling shows jank, switch to direct ref-based DOM mutation. React 19's batching should handle this fine for <30 elements.

2. **Board headers: animate or instant?**
   - Recommendation: Show board headers instantly. They provide context for the animation ("Board 1 of 3") and animating them adds no visual value.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIS-04a | computeStartPosition returns correct edge position | unit | `npx vitest run src/lib/animation-utils.test.ts -x` | No -- Wave 0 |
| VIS-04b | computeDelays produces correct stagger timing | unit | `npx vitest run src/lib/animation-utils.test.ts -x` | No -- Wave 0 |
| VIS-04c | easeOutCubic returns correct values at boundaries | unit | `npx vitest run src/lib/animation-utils.test.ts -x` | No -- Wave 0 |
| VIS-04d | Total animation duration stays within 2-3s for typical projects | unit | `npx vitest run src/lib/animation-utils.test.ts -x` | No -- Wave 0 |
| VIS-04e | Animation plays smoothly at 60fps | manual-only | Visual inspection + Chrome Performance panel | N/A |
| VIS-04f | Click-to-skip sets all pieces to final state | manual-only | Visual inspection | N/A |
| VIS-04g | Animation replays on re-optimize | manual-only | Visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/animation-utils.test.ts` -- covers VIS-04a through VIS-04d (pure function tests for start positions, delays, easing, duration capping)

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/components/visualization/PieceRect.tsx`, `BoardDiagram.tsx`, `CuttingDiagramList.tsx` -- current SVG rendering architecture
- Project codebase: `src/lib/types.ts` -- PlacedPiece, BoardLayout types with x/y/width/height
- MDN Web Docs: `requestAnimationFrame`, SVG transform attribute, CSS vs SVG attribute animation behavior

### Secondary (MEDIUM confidence)
- React 19 automatic batching behavior for setState in rAF callbacks -- based on React docs and React 18+ batching guarantees

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no external libraries, just browser APIs already available
- Architecture: HIGH -- pattern is well-established (rAF + interpolation), codebase structure is clear
- Pitfalls: HIGH -- common SVG animation pitfalls are well-documented; codebase inspection reveals specific concerns (viewBox clipping, overflow-hidden, zoom/pan interaction)

**Research date:** 2026-03-19
**Valid until:** 2026-06-19 (stable domain, browser APIs don't change)
