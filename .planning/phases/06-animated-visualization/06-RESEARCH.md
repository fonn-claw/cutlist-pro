# Phase 6: Animated Visualization - Research

**Researched:** 2026-03-19
**Domain:** SVG animation in React (CSS transitions, staggered sequencing, 60fps performance)
**Confidence:** HIGH

## Summary

Animating SVG `<rect>` elements sliding into position is best achieved with **CSS transitions on transform and opacity** applied to SVG `<g>` wrapper elements. Modern browsers (Chrome 89+, Firefox, Safari) GPU-accelerate CSS transform/opacity on SVG elements, meaning these animations run on the compositor thread at 60fps without triggering layout recalculation or repainting. No animation library is needed.

The architecture uses React state to control animation phases: a `useAnimationSequence` hook tracks which pieces are "active" (visible at final position) vs "pending" (invisible/offset). Stagger timing is handled by `setTimeout` chains in a `useEffect`, incrementally revealing pieces. Each `PieceRect` receives an `animated` boolean -- when false, it renders at an offset position with opacity 0; when true, CSS transitions smoothly move it to final position with opacity 1. The CSS transition handles the interpolation; React only toggles state.

This approach is superior to requestAnimationFrame because: (1) CSS transitions run on the GPU compositor thread, not the main thread, so they maintain 60fps even during React reconciliation; (2) no per-frame setState calls that cause re-renders; (3) easing is handled by the browser's native cubic-bezier implementation; (4) dramatically less code (~50 lines vs ~150 for rAF approach).

**Primary recommendation:** Use CSS `transition` on SVG `<g>` elements with `transform: translate()` and `opacity` for piece entrance. Orchestrate stagger timing with a custom `useAnimationSequence` hook using `setTimeout`. Zero dependencies added.

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
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIS-04 | Animated optimization -- pieces slide/fade into position when user clicks Optimize | CSS transition on SVG g elements with transform+opacity, useAnimationSequence hook for stagger orchestration, skip-to-end on click |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | State management for animation phases | Already in project |
| CSS Transitions | N/A (browser) | GPU-accelerated transform+opacity interpolation | Zero-dependency, compositor-thread animation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | - | - | No additional dependencies needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS transitions | Framer Motion | Adds ~30KB, provides spring physics and layout animations -- overkill for simple slide+fade |
| CSS transitions | react-spring | Adds ~20KB, JS-driven interpolation -- unnecessary when CSS handles it natively |
| CSS transitions | requestAnimationFrame | More control but more code, runs on main thread, harder to get easing right, requires per-frame state management |
| CSS transitions | SMIL `<animate>` | Deprecated direction from Chrome (then un-deprecated), poor React integration, no stagger control |
| CSS transitions | CSS @keyframes | Would work but transitions are simpler for A-to-B state changes; keyframes better for looping |

**Why CSS transitions over requestAnimationFrame:** The previous research draft recommended rAF. After deeper investigation, CSS transitions are strictly better for this use case because: (1) GPU-accelerated on SVG elements in Chrome 89+/Firefox/Safari -- animations run on the compositor thread at 60fps even when main thread is busy; (2) React only needs to toggle boolean states, not update positions 60x/sec; (3) browser-native ease-out easing without hand-rolling cubic bezier math; (4) automatic animation interruption when state changes mid-transition.

**Installation:**
```bash
# No installation needed -- zero new dependencies
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   └── useAnimationSequence.ts    # Orchestrates stagger timing
├── lib/
│   └── animation-utils.ts         # Pure functions: compute slide origin, sort pieces, calculate delays
├── components/visualization/
│   ├── PieceRect.tsx              # Enhanced with animation props (existing)
│   ├── BoardDiagram.tsx           # Enhanced with animation orchestration (existing)
│   ├── CuttingDiagramList.tsx     # Enhanced with board-by-board sequencing (existing)
│   └── WasteRect.tsx              # Enhanced with fade-in after pieces complete (existing)
```

### Pattern 1: CSS Transition on SVG `<g>` Elements
**What:** Wrap each piece's SVG content in a `<g>` with CSS transition on transform and opacity. Toggle between offset/hidden and final/visible states via React props.
**When to use:** Always -- this is the core animation mechanism.
**Example:**
```typescript
// PieceRect.tsx -- enhanced with animation state
interface PieceRectProps {
  piece: PlacedPiece;
  units: UnitSystem;
  animated: boolean;       // false = at offset, true = at final position
  slideFrom: { dx: number; dy: number }; // offset from final position
  onMouseEnter?: (e: React.MouseEvent, piece: PlacedPiece) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

export function PieceRect({ piece, units, animated, slideFrom, ...handlers }: PieceRectProps) {
  const translateX = animated ? 0 : slideFrom.dx;
  const translateY = animated ? 0 : slideFrom.dy;
  const opacity = animated ? 1 : 0;

  return (
    <g
      style={{
        transform: `translate(${translateX}px, ${translateY}px)`,
        opacity,
        transition: 'transform 400ms ease-out, opacity 300ms ease-out',
        willChange: animated ? 'auto' : 'transform, opacity',
      }}
    >
      <rect
        x={piece.x}
        y={piece.y}
        width={piece.width}
        height={piece.height}
        fill={piece.color}
        fillOpacity={0.7}
        stroke={piece.color}
        strokeWidth={1}
        cursor="pointer"
        onMouseEnter={(e) => handlers.onMouseEnter?.(e, piece)}
        onMouseMove={handlers.onMouseMove}
        onMouseLeave={handlers.onMouseLeave}
      />
      {/* labels... */}
    </g>
  );
}
```

### Pattern 2: Stagger Orchestration Hook
**What:** A custom hook that manages which pieces are "active" over time, using setTimeout chains.
**When to use:** In BoardDiagram to control per-piece reveal timing.
**Example:**
```typescript
// useAnimationSequence.ts
interface AnimationConfig {
  totalItems: number;
  staggerDelay: number;    // ms between each piece (50-100ms)
  onComplete?: () => void; // callback when all items revealed
}

function useAnimationSequence({ totalItems, staggerDelay, onComplete }: AnimationConfig) {
  const [activeCount, setActiveCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timersRef = useRef<number[]>([]);

  const start = useCallback(() => {
    // Clear any existing timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveCount(0);
    setIsAnimating(true);

    for (let i = 0; i < totalItems; i++) {
      const timer = window.setTimeout(() => {
        setActiveCount(i + 1);
        if (i === totalItems - 1) {
          setIsAnimating(false);
          onComplete?.();
        }
      }, i * staggerDelay);
      timersRef.current.push(timer);
    }
  }, [totalItems, staggerDelay, onComplete]);

  const skipToEnd = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveCount(totalItems);
    setIsAnimating(false);
  }, [totalItems]);

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveCount(0);
    setIsAnimating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  return { activeCount, isAnimating, start, skipToEnd, reset };
}
```

### Pattern 3: Compute Slide Direction from Nearest Edge
**What:** Pure function that determines which board edge a piece is closest to, returning an offset vector.
**When to use:** To calculate the `slideFrom` prop for each PieceRect.
**Example:**
```typescript
// animation-utils.ts
interface SlideOffset {
  dx: number;  // horizontal offset in SVG units
  dy: number;  // vertical offset in SVG units
}

function computeSlideOrigin(
  piece: PlacedPiece,
  boardWidth: number,
  boardHeight: number,
  slideDistance: number = 80  // how far off-board pieces start (in SVG user units)
): SlideOffset {
  const centerX = piece.x + piece.width / 2;
  const centerY = piece.y + piece.height / 2;

  const distToLeft = centerX;
  const distToRight = boardWidth - centerX;
  const distToTop = centerY;
  const distToBottom = boardHeight - centerY;

  const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

  if (minDist === distToLeft) return { dx: -slideDistance, dy: 0 };
  if (minDist === distToRight) return { dx: slideDistance, dy: 0 };
  if (minDist === distToTop) return { dx: 0, dy: -slideDistance };
  return { dx: 0, dy: slideDistance };
}

// Sort pieces by area descending for dramatic stagger effect
function sortPiecesForAnimation(pieces: PlacedPiece[]): PlacedPiece[] {
  return [...pieces].sort((a, b) => (b.width * b.height) - (a.width * a.height));
}
```

### Pattern 4: Board-by-Board Sequencing
**What:** CuttingDiagramList orchestrates animation across boards -- each board starts after the previous completes.
**When to use:** Always -- user decision mandates board-by-board sequencing.
**Example:**
```typescript
// In CuttingDiagramList: track which board index is currently animating
const [activeBoardIndex, setActiveBoardIndex] = useState(-1);

// When optimization result changes, start animation from board 0
useEffect(() => {
  setActiveBoardIndex(0);
}, [result]);

// Each BoardDiagram calls onAnimationComplete when its pieces finish
// Then CuttingDiagramList advances to next board after 200ms pause
const handleBoardComplete = useCallback((boardIndex: number) => {
  setTimeout(() => {
    setActiveBoardIndex(boardIndex + 1);
  }, 200); // inter-board pause
}, []);
```

### Pattern 5: Skip-to-End with Instant Transition Override
**What:** When user clicks to skip, temporarily disable CSS transitions so pieces jump to final state instantly.
**When to use:** On click during animation.
**Example:**
```typescript
// Track whether transitions should be disabled
const [skipMode, setSkipMode] = useState(false);

const handleSkip = () => {
  setSkipMode(true);    // disables CSS transitions
  skipToEnd();          // sets all pieces to animated=true
  // Re-enable transitions after paint
  requestAnimationFrame(() => setSkipMode(false));
};

// In PieceRect: conditionally apply transition
style={{
  transition: skipMode ? 'none' : 'transform 400ms ease-out, opacity 300ms ease-out',
}}
```

### Anti-Patterns to Avoid
- **Animating SVG x/y attributes directly:** These are SVG presentation attributes, not CSS properties. CSS transitions on them are inconsistent across browsers. Use CSS `transform: translate()` instead, which is GPU-composited.
- **Animating width/height:** Triggers expensive repaint. If you need scale-in effects, use `transform: scale()` instead.
- **React state updates per frame via requestAnimationFrame:** Never use `useState` inside `requestAnimationFrame` for each piece. Let CSS handle interpolation; React only sets start/end states.
- **`will-change` on all elements permanently:** Add `will-change: transform, opacity` only during animation, reset to `auto` after. Each `will-change` element creates a compositor layer consuming GPU memory.
- **SMIL `<animate>` elements:** Poor React integration (declarative SVG children interfere with React's DOM diffing), limited stagger control, and messy cleanup.
- **Conditionally mounting/unmounting pieces:** Causes SVG bounding box changes and layout shifts. Always render all pieces; control visibility with opacity and transform.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Easing functions | Custom cubic-bezier math | CSS `ease-out` / `cubic-bezier()` | Browser-native, hardware-accelerated, handles edge cases |
| Frame timing | Manual `requestAnimationFrame` loop with interpolation | CSS `transition` | CSS transitions run on compositor thread; rAF runs on main thread |
| Animation cleanup | Manual timer tracking with complex state | `useEffect` cleanup + `useRef` for timer IDs | React lifecycle handles unmount; refs prevent stale closures |

**Key insight:** The entire animation system needs zero interpolation code. CSS transitions handle all per-frame work on the GPU. React's job is purely to toggle boolean states at the right times via setTimeout. This is dramatically simpler than an rAF-based approach and performs better.

## Common Pitfalls

### Pitfall 1: SVG Transform Coordinate System Confusion
**What goes wrong:** CSS `transform: translate(10px, 10px)` on SVG elements may not match SVG coordinate units when the SVG has a viewBox scaling.
**Why it happens:** CSS pixels and SVG user units can differ when viewBox scales the coordinate space. The `px` unit in CSS transform inside SVG maps to SVG user units, not screen pixels.
**How to avoid:** Use SVG user units consistently. Since the existing `<svg>` has a viewBox matching mm dimensions, CSS translate values inside it will be in SVG user units (mm). Test with known values to confirm. A `translate(80px, 0)` means 80mm in SVG space.
**Warning signs:** Pieces slide too far or too short; animation looks different at different SVG sizes.

### Pitfall 2: Stale Closure in setTimeout Chains
**What goes wrong:** Timer callbacks capture stale state values, causing animation to behave incorrectly after props change mid-animation.
**Why it happens:** JavaScript closures capture values at creation time; React state updates don't affect already-scheduled callbacks.
**How to avoid:** Use `useRef` for mutable values that timers need. Store timer IDs in refs for cleanup. Always clear all timers before starting a new animation.
**Warning signs:** Animation continues after result changes; pieces animate to wrong positions.

### Pitfall 3: Layout Shift When Pieces Appear
**What goes wrong:** SVG viewBox recalculates or diagram jumps when animation starts.
**Why it happens:** If pieces are conditionally rendered (mounted/unmounted), the SVG content bounding box changes.
**How to avoid:** Always render ALL pieces in the DOM from the start. Control visibility with opacity:0 and transform offset. Never conditionally mount/unmount pieces during animation.
**Warning signs:** Board diagram jumps or resizes when animation starts.

### Pitfall 4: will-change Memory Bloat
**What goes wrong:** Applying `will-change: transform` to dozens of elements permanently consumes excessive GPU memory.
**Why it happens:** Each `will-change` element gets its own compositor layer; with 30+ pieces across multiple boards, this adds up.
**How to avoid:** Set `will-change: transform, opacity` only when animation is pending (piece not yet animated), reset to `auto` once piece reaches final position.
**Warning signs:** High GPU memory usage in DevTools, potential frame drops on lower-end devices.

### Pitfall 5: Click-to-Skip Race Condition
**What goes wrong:** Clicking to skip animation while timers are mid-flight causes partial animation states or visual flicker.
**Why it happens:** Some timers fire between the skip action and React re-render.
**How to avoid:** skipToEnd must: (1) clear ALL scheduled timers, (2) set activeCount to totalItems synchronously, (3) temporarily set `transition: none` so pieces jump instantly without 400ms transition animation.
**Warning signs:** Some pieces at offset positions after skip; visual flicker during skip.

### Pitfall 6: CSS Transition Not Firing on Initial Render
**What goes wrong:** Piece appears at final position immediately without animating, because browser batches the initial render with the state change.
**Why it happens:** If you set the offset state and final state in the same render cycle, the browser optimizes away the transition.
**How to avoid:** Two-phase approach: (1) render pieces at offset positions (animated=false), (2) in next frame/microtask, start the stagger sequence. Use a `requestAnimationFrame` or `setTimeout(fn, 0)` after initial mount to ensure the browser has painted the initial offset state before triggering transitions.
**Warning signs:** First board's pieces appear instantly; subsequent boards animate correctly.

### Pitfall 7: SVG Overflow Clipping Hides Slide-In
**What goes wrong:** Pieces sliding in from outside the board boundary are clipped because the SVG viewBox or the `overflow-hidden` container clips them.
**Why it happens:** The existing `overflow-hidden` class on the container div and the SVG viewBox set to board dimensions.
**How to avoid:** Since pieces fade in simultaneously with sliding, they start at opacity 0 at the offset position. By the time they reach visible opacity, they are mostly within the board area. The slide distance should be modest (not fully off-board) so pieces are visible during most of the slide. Alternatively, use `overflow: visible` on the SVG element during animation.
**Warning signs:** Pieces appear to "pop in" at the board edge rather than sliding smoothly.

## Code Examples

### Complete Animation Utilities (Pure Functions)
```typescript
// animation-utils.ts -- pure functions, fully testable

export interface SlideOffset {
  dx: number;
  dy: number;
}

export function computeSlideOrigin(
  piece: { x: number; y: number; width: number; height: number },
  boardWidth: number,
  boardHeight: number,
  slideDistance = 80
): SlideOffset {
  const cx = piece.x + piece.width / 2;
  const cy = piece.y + piece.height / 2;
  const distances = [
    { dx: -slideDistance, dy: 0, d: cx },                    // left
    { dx: slideDistance, dy: 0, d: boardWidth - cx },        // right
    { dx: 0, dy: -slideDistance, d: cy },                    // top
    { dx: 0, dy: slideDistance, d: boardHeight - cy },       // bottom
  ];
  const nearest = distances.reduce((min, cur) => cur.d < min.d ? cur : min);
  return { dx: nearest.dx, dy: nearest.dy };
}

export function sortPiecesForAnimation<T extends { width: number; height: number }>(
  pieces: T[]
): T[] {
  return [...pieces].sort((a, b) => (b.width * b.height) - (a.width * a.height));
}

// Dynamically compute stagger delay to fit within time budget
export function computeStaggerDelay(
  pieceCount: number,
  maxBoardDuration = 1500,  // ms max for one board
  minDelay = 30,
  maxDelay = 100
): number {
  if (pieceCount <= 1) return 0;
  const computed = Math.floor(maxBoardDuration / pieceCount);
  return Math.max(minDelay, Math.min(maxDelay, computed));
}
```

### Waste Region Fade-In After Pieces Complete
```typescript
// WasteRect enhanced with animation
interface WasteRectProps {
  region: WasteRegion;
  boardIndex: number;
  visible: boolean; // controlled by board animation completion
}

export function WasteRect({ region, boardIndex, visible }: WasteRectProps) {
  return (
    <rect
      x={region.x}
      y={region.y}
      width={region.width}
      height={region.height}
      fill={`url(#waste-hatch-${boardIndex})`}
      stroke="var(--border)"
      strokeWidth={0.5}
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 500ms ease-out',
      }}
    />
  );
}
```

### Board Header Decision
Board headers should appear instantly. They provide spatial context ("Board 1 of 3") that helps the viewer understand what is being animated. Animating them adds no visual value and delays the hero moment.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SMIL `<animate>` elements | CSS transitions/animations | SMIL deprecated then un-deprecated ~2016, but CSS is standard path | CSS is the recommended approach for SVG animation |
| JS-driven rAF for all SVG animation | CSS for interpolation, JS for orchestration only | Chrome 89 (2021) GPU-accelerated SVG CSS transforms | transform/opacity on SVG elements now GPU-composited in all modern browsers |
| jQuery.animate() / Velocity.js | Browser-native CSS transitions | 2015+ | Zero-dependency, hardware-accelerated by default |
| Animating SVG x/y/width/height attributes | CSS transform: translate() on g elements | Ongoing best practice | Avoids layout recalculation, enables GPU compositing |

**Deprecated/outdated:**
- SMIL animation: Still works but poor React integration, hard to control programmatically
- Animating SVG geometry attributes (x, y, width, height): Triggers layout. Use transform instead.
- requestAnimationFrame for simple entrance animations: Unnecessary main-thread work when CSS transitions handle it on compositor thread.

## Open Questions

1. **CSS translate units inside SVG viewBox**
   - What we know: CSS `transform: translate()` on elements inside an SVG with viewBox uses SVG user units. The existing viewBox matches mm dimensions.
   - What's unclear: Whether `80px` translate in SVG context maps exactly to 80 SVG user units needs verification. Boards can be ~2400mm wide (8ft plywood), so 80mm offset is ~3% of board width.
   - Recommendation: Start with slideDistance as a percentage of board dimension (e.g., 10% of the shorter board axis). Tune visually. If `px` units don't map as expected, switch to using the SVG `transform` attribute (`transform={translate(dx, dy)}`) instead of CSS style.

2. **Transition timing for varying piece counts**
   - What we know: 50-100ms stagger with 10-15 pieces = 500-1500ms per board. With 2-3 boards + pauses, fits in 2-3 second budget.
   - What's unclear: Edge case with 30+ pieces on one board could exceed time budget.
   - Recommendation: Use dynamic stagger delay: `computeStaggerDelay(pieceCount)` that caps per-board animation at ~1.5s by reducing inter-piece delay for larger boards.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIS-04a | computeSlideOrigin returns correct edge direction | unit | `npx vitest run src/lib/animation-utils.test.ts -t "slide origin"` | No -- Wave 0 |
| VIS-04b | sortPiecesForAnimation sorts by area descending | unit | `npx vitest run src/lib/animation-utils.test.ts -t "sort"` | No -- Wave 0 |
| VIS-04c | computeStaggerDelay caps duration for large piece counts | unit | `npx vitest run src/lib/animation-utils.test.ts -t "stagger"` | No -- Wave 0 |
| VIS-04d | useAnimationSequence advances activeCount over time | unit | `npx vitest run src/hooks/useAnimationSequence.test.ts` | No -- Wave 0 |
| VIS-04e | Pieces animate at 60fps without jank | manual-only | Visual inspection in browser DevTools Performance tab | N/A |
| VIS-04f | Click-to-skip instantly shows final state | manual-only | Click during animation, verify instant completion | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/animation-utils.test.ts` -- covers VIS-04a, VIS-04b, VIS-04c (pure function tests)
- [ ] `src/hooks/useAnimationSequence.test.ts` -- covers VIS-04d (uses `vi.useFakeTimers()` for setTimeout testing in node environment)

## Sources

### Primary (HIGH confidence)
- [MDN: CSS and JS animation performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance) - compositor thread for transform/opacity
- [MDN: transform-box property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-box) - fill-box for SVG transform-origin
- [Chrome DevBlog: Hardware-accelerated animations](https://developer.chrome.com/blog/hardware-accelerated-animations) - Chrome 89+ GPU acceleration for SVG CSS transforms
- Project codebase: PieceRect.tsx, BoardDiagram.tsx, CuttingDiagramList.tsx, types.ts -- current SVG rendering architecture

### Secondary (MEDIUM confidence)
- [Charlie Marsh: SVG Performance](https://www.crmarsh.com/svg-performance/) - 2-5x perf improvement with CSS transforms on SVG (Khan Academy case study, confirmed 12-20fps to 52-60fps)
- [CSS-Tricks: GPU-Accelerated SVG Animations](https://css-tricks.com/platform-news-rounded-outlines-gpu-accelerated-svg-animations-how-css-variables-are-resolved/) - Chrome GPU acceleration for SVG confirmed
- [CSS-Tricks: Transforms on SVG Elements](https://css-tricks.com/transforms-on-svg-elements/) - cross-browser gotchas with SVG transforms and coordinate systems
- [Smashing Magazine: CSS GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) - will-change best practices and compositor layer management

### Tertiary (LOW confidence)
- [Boundev: SVG Animation CSS Tutorial](https://www.boundev.com/blog/svg-animation-css-tutorial-guide) - general SVG CSS animation patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - zero new dependencies, using browser-native CSS transitions verified by MDN and Chrome DevBlog
- Architecture: HIGH - CSS transitions on SVG g elements are well-documented and GPU-accelerated in all target browsers; stagger via setTimeout is standard React pattern
- Pitfalls: HIGH - documented from multiple authoritative sources (MDN, CSS-Tricks, Chrome DevBlog) and direct analysis of existing codebase components

**Research date:** 2026-03-19
**Valid until:** 2026-06-19 (stable browser APIs, no fast-moving dependencies)
