# Architecture Patterns

**Domain:** Woodworking cut list optimizer (client-side web app)
**Researched:** 2026-03-19

## Recommended Architecture

CutList Pro is a **stateless client-side tool** with four clearly separated layers: Input Management, Optimization Engine, Visualization Renderer, and State Serialization. All computation happens in the browser. There is no backend.

### High-Level Component Map

```
+------------------------------------------------------------------+
|                        Next.js App Shell                          |
|  (App Router, layout, theme provider, unit context)               |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------+    +------------------+    +---------------+ |
|  |  Input Panel     |    |  Visualization   |    |  Summary      | |
|  |  (sidebar/top)   |    |  Panel (main)    |    |  Dashboard    | |
|  |                  |    |                  |    |               | |
|  |  - Board inputs  |    |  - SVG renderer  |    |  - Board count| |
|  |  - Piece inputs  |    |  - Zoom/pan      |    |  - Waste %    | |
|  |  - Settings      |    |  - Animations    |    |  - Cost est.  | |
|  |  - Presets       |    |  - Hover tooltip |    |  - Breakdown  | |
|  +--------+---------+    +--------+---------+    +-------+-------+ |
|           |                        ^                      ^        |
|           v                        |                      |        |
|  +--------+------------------------+----------------------+------+ |
|  |                    App State (React Context / useReducer)     | |
|  |  boards[], pieces[], settings{kerf, units, grain}, results   | |
|  +--------+-----------------------------------------------------+ |
|           |                        ^                               |
|           v                        |                               |
|  +--------+------------------------+-----------------------------+ |
|  |              Optimization Engine (pure functions)              | |
|  |  - Guillotine bin packing                                     | |
|  |  - Kerf adjustment                                            | |
|  |  - Grain direction constraints                                | |
|  |  - Multi-strategy solver                                      | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +---------------------------------------------------------------+ |
|  |              State Serialization Layer                         | |
|  |  - JSON serialize <-> lz-string compress <-> URL hash         | |
|  |  - PNG export (html2canvas / SVG-to-canvas)                   | |
|  |  - Print stylesheet                                           | |
|  +---------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Data Direction |
|-----------|---------------|-------------------|----------------|
| **App Shell** | Layout, theme, unit context, responsive breakpoints | All components (provides context) | Down |
| **Input Panel** | Board CRUD, piece CRUD, settings (kerf, units, grain) | App State (dispatches actions) | Writes to state |
| **Optimization Engine** | Guillotine bin packing algorithm, kerf-adjusted placement, grain constraints | App State (reads inputs, writes results) | Pure function: input -> output |
| **Visualization Panel** | SVG rendering of packed boards, animations, zoom/pan, tooltips | App State (reads results) | Reads from state |
| **Summary Dashboard** | Waste statistics, board counts, cost estimates | App State (reads results) | Reads from state |
| **State Serialization** | URL encoding/decoding, PNG export, print view | App State (reads/writes full state) | Bidirectional |

### Data Flow

```
User Input -> Input Panel -> dispatch(action) -> App State (useReducer)
                                                       |
                                                       v
                                              Optimization Engine
                                              (triggered on "Optimize" click)
                                                       |
                                                       v
                                              App State updated with results
                                                  /          \
                                                 v            v
                                          Visualization   Summary Dashboard
                                          Panel           (derived stats)
                                                 \            /
                                                  v          v
                                          State Serialization
                                          (URL sync, export)
```

**Key flow decisions:**

1. **Optimization is triggered explicitly** (button click), not on every input change. Bin packing is O(n^2) or worse -- running on every keystroke would be terrible UX.
2. **Results are stored in state**, not recomputed on render. The optimization output (bin assignments with x/y coordinates) is the source of truth for both visualization and summary.
3. **URL state syncs after optimization**, not during input. Encoding partial input state into the URL creates noise. Sync when the user has a complete result worth sharing.

## Core Data Models

```typescript
// === Input Types ===
interface Board {
  id: string;
  width: number;        // always stored in mm internally
  height: number;
  quantity: number;
  label: string;
  pricePerBoard?: number;
}

interface Piece {
  id: string;
  width: number;        // always stored in mm internally
  height: number;
  quantity: number;
  label: string;
  color: string;
  grainDirection: 'none' | 'horizontal' | 'vertical';
}

interface Settings {
  kerfWidth: number;    // mm
  units: 'imperial' | 'metric';
  // display units only -- all math in mm
}

// === Output Types ===
interface PackedPiece {
  pieceId: string;
  boardIndex: number;
  x: number;
  y: number;
  width: number;        // may differ from input if rotated
  height: number;
  rotated: boolean;
}

interface PackedBoard {
  boardId: string;
  boardIndex: number;
  pieces: PackedPiece[];
  wasteArea: number;    // mm^2
  wastePercent: number;
}

interface OptimizationResult {
  boards: PackedBoard[];
  totalWaste: number;
  totalWastePercent: number;
  unplacedPieces: Piece[];  // pieces that didn't fit
}

// === App State ===
interface AppState {
  boards: Board[];
  pieces: Piece[];
  settings: Settings;
  result: OptimizationResult | null;
  isOptimizing: boolean;
}
```

## Patterns to Follow

### Pattern 1: Internal Unit Normalization

**What:** Store all dimensions in millimeters internally. Convert to/from display units (inches or mm) only at the UI boundary.

**When:** Always. This is non-negotiable for a tool that supports unit switching.

**Why:** Avoids floating-point drift from repeated conversions. The optimization engine never needs to know about display units. Unit toggle becomes a pure display concern.

```typescript
// Convert at input boundary
function toInternal(value: number, units: 'imperial' | 'metric'): number {
  return units === 'imperial' ? value * 25.4 : value;
}

// Convert at display boundary
function toDisplay(valueMm: number, units: 'imperial' | 'metric'): number {
  return units === 'imperial' ? valueMm / 25.4 : valueMm;
}
```

### Pattern 2: Optimization as a Pure Function

**What:** The optimization engine is a pure function: `(boards, pieces, settings) => OptimizationResult`. No side effects, no state mutation, no DOM access.

**When:** Always. This is what makes the engine testable, replaceable, and potentially offloadable to a Web Worker.

```typescript
function optimize(
  boards: Board[],
  pieces: Piece[],
  settings: Settings
): OptimizationResult {
  // Expand quantities into individual items
  // Apply kerf adjustments
  // Run guillotine packing
  // Return placement coordinates
}
```

### Pattern 3: Kerf as Pre-Processing

**What:** Account for kerf (blade width) by expanding piece dimensions before packing, not by modifying the packing algorithm. Each piece becomes `(width + kerf, height + kerf)` for packing purposes, but rendered at original dimensions.

**When:** Always. This keeps the packing algorithm generic and the kerf logic isolated.

**Why:** Modifying the bin-packing algorithm to handle kerf inline is error-prone and couples concerns. Pre-processing is how the `guillotine-packer` library handles it (via `kerfSize` parameter), and it is the standard approach in the industry.

### Pattern 4: Grain Direction as Rotation Constraint

**What:** Grain direction is implemented by conditionally disabling rotation for specific pieces. If a piece has `grainDirection: 'horizontal'` or `'vertical'`, it must not be rotated during packing.

**When:** When grain-sensitive pieces are in the cut list.

```typescript
// Before passing to packer:
const packableItems = pieces.map(piece => ({
  ...piece,
  allowRotation: piece.grainDirection === 'none'
}));
```

### Pattern 5: SVG Coordinate System for Visualization

**What:** Render each board as an SVG `<svg>` with `viewBox` set to the board dimensions. Pieces are `<rect>` elements positioned by the packer output (x, y, width, height). Use CSS/Framer Motion for animations.

**When:** Always for the visualization panel.

**Why:** SVG viewBox gives automatic scaling -- the board fills its container regardless of pixel size. No manual coordinate math needed. Pieces map 1:1 from packer output coordinates to SVG positions.

```tsx
<svg viewBox={`0 0 ${board.width} ${board.height}`} className="w-full">
  {board.pieces.map(piece => (
    <motion.rect
      key={piece.pieceId}
      x={piece.x}
      y={piece.y}
      width={piece.width}
      height={piece.height}
      fill={piece.color}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    />
  ))}
</svg>
```

### Pattern 6: State-in-URL via LZ-String Compression

**What:** Serialize the full app state (boards, pieces, settings, result) to JSON, compress with `lz-string`'s `compressToEncodedURIComponent`, and store in the URL hash.

**When:** After optimization completes, and on "Share" action.

**Why:** JSON state for a typical cut list (5-10 boards, 20-30 pieces) is 2-5KB. LZ-string compresses this to 500-1500 bytes -- well within URL length limits. No backend required.

```typescript
import LZString from 'lz-string';

function stateToUrl(state: AppState): string {
  const json = JSON.stringify({
    b: state.boards,
    p: state.pieces,
    s: state.settings,
    r: state.result,
  });
  return LZString.compressToEncodedURIComponent(json);
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Running Optimization on Every Input Change

**What:** Re-running the bin packing algorithm whenever the user types a dimension or adds a piece.

**Why bad:** Bin packing is computationally expensive. Running it on every keystroke creates lag, wasted computation, and confusing intermediate visual states. Users also expect to set up their full cut list before optimizing.

**Instead:** Explicit "Optimize" button. Show a visual indicator when inputs have changed since last optimization (stale results).

### Anti-Pattern 2: Storing Display Units in State

**What:** Storing dimensions in inches when the user has imperial selected, and converting everything when they toggle to metric.

**Why bad:** Repeated conversion introduces floating-point errors. Every component that reads dimensions must know the current unit setting. Toggling units requires a full state rewrite.

**Instead:** Store in mm. Convert at display boundaries only.

### Anti-Pattern 3: Building a Custom Bin-Packing Algorithm from Scratch

**What:** Implementing guillotine bin packing from academic papers instead of using an existing library.

**Why bad:** Bin-packing algorithms have subtle edge cases around splitting strategies, heuristic selection, and rotation handling. A naive implementation will produce visibly worse results and take weeks to debug.

**Instead:** Use `guillotine-packer` (supports kerf, rotation, multiple strategies). Write a wrapper that handles grain direction constraints and quantity expansion. Only consider a custom implementation if the library proves insufficient after real testing.

### Anti-Pattern 4: Coupling SVG Structure to Algorithm Output

**What:** Having the optimization engine return SVG elements or DOM-specific data.

**Why bad:** Makes the engine untestable without a DOM, prevents reuse, and blocks future features like text-based cut lists.

**Instead:** The engine returns plain coordinate data. The visualization layer transforms coordinates into SVG elements.

## Suggested Build Order

Based on component dependencies, the recommended build sequence is:

```
Phase 1: Data Model + Input UI
  - Define TypeScript types (Board, Piece, Settings)
  - App state with useReducer
  - Input panel components (board form, piece form, settings)
  - Board presets
  - Unit conversion utilities
  Dependencies: None. This is foundation.

Phase 2: Optimization Engine
  - Integrate guillotine-packer library
  - Kerf pre-processing wrapper
  - Grain direction constraint wrapper
  - Quantity expansion (1 piece x 5 qty -> 5 items to pack)
  - Unit tests with known-good layouts
  Dependencies: Data model types from Phase 1.

Phase 3: SVG Visualization
  - Board SVG rendering (viewBox-based)
  - Piece rectangles with color coding
  - Waste area rendering
  - Hover tooltips
  - Animated transitions (Framer Motion)
  - Zoom and pan
  Dependencies: Optimization output format from Phase 2.

Phase 4: Summary + Polish
  - Summary dashboard (waste %, board count, cost)
  - Dark/light theme
  - Responsive layout (sidebar -> stacked on tablet)
  Dependencies: Optimization results from Phase 2.

Phase 5: Sharing + Export
  - LZ-string URL state encoding
  - URL state restoration on load
  - PNG export (html2canvas or SVG serialization)
  - Print stylesheet
  Dependencies: All above components working.
```

**Why this order:**
- You cannot visualize results without an optimization engine.
- You cannot optimize without input data structures.
- Export/sharing depends on everything else being stable.
- The visualization is the "hero feature" but it needs real data to develop against, so it comes after the engine, not before.

## Scalability Considerations

| Concern | Typical Use (20 pieces) | Large Project (100+ pieces) | Extreme (500+ pieces) |
|---------|------------------------|---------------------------|----------------------|
| **Optimization speed** | Instant (<50ms) | Noticeable (200-500ms) | May need Web Worker (1-5s) |
| **SVG rendering** | No issue | Fine with virtualization | May need board-level lazy rendering |
| **URL state size** | ~500 bytes compressed | ~2KB compressed | May exceed URL limits -- need fallback |
| **Memory** | Negligible | Negligible | Still fine for browser |

**Practical note:** Most woodworking projects have 5-30 pieces. The 100+ case is cabinetry shops, which are a stretch goal audience. Optimize for the common case first.

### Web Worker Consideration

If optimization takes >100ms (likely only for 100+ pieces), move the engine to a Web Worker. Because the engine is a pure function with serializable inputs/outputs, this is a straightforward refactor -- no architectural changes needed. Do not pre-optimize with a Worker for typical use cases.

## Technology Decisions for Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | `useReducer` + React Context | Right-sized for this app. No need for Redux/Zustand for a single-page tool with 4 state slices. |
| Bin packing | `guillotine-packer` library | Built for woodworking, supports kerf and rotation, multi-strategy solver. Last updated 2020 but stable -- bin packing algorithms don't change. |
| Animation | Framer Motion (`motion/react`) | Best React animation library for orchestrated SVG transitions. The "pieces sliding into place" effect maps directly to `motion.rect` with staggered delays. |
| SVG approach | Inline JSX SVG (not image-based) | Full control over interactivity (hover, click), animation, and styling. |
| URL compression | `lz-string` | Mature, small (5KB), URL-safe encoding built-in. Standard choice for this pattern. |
| PNG export | `html2canvas` or SVG serialization to canvas | Both work client-side. html2canvas is simpler; direct SVG-to-canvas gives better quality. |
| Zoom/pan | CSS transforms or a lightweight lib like `react-zoom-pan-pinch` | Avoid heavyweight map-style libraries. SVG viewBox manipulation + CSS transform is often enough. |

## Sources

- [guillotine-packer GitHub](https://github.com/tyschroed/guillotine-packer) -- TypeScript guillotine bin packing with kerf support, rotation, multi-strategy heuristics (HIGH confidence)
- [guillotine-packer npm](https://www.npmjs.com/package/guillotine-packer) -- API documentation and usage examples (HIGH confidence)
- [Framer Motion SVG Animation](https://motion.dev/docs/react-svg-animation) -- React SVG animation patterns (HIGH confidence)
- [lz-string URL compression pattern](https://snyk.io/advisor/npm-package/lz-string/functions/lz-string.compressToEncodedURIComponent) -- compressToEncodedURIComponent for URL state (HIGH confidence)
- [URL as State pattern](https://alfy.blog/2025/10/31/your-url-is-your-state.html) -- Modern URL-based state management approach (MEDIUM confidence)
- [Advanced React URL state management](https://blog.logrocket.com/advanced-react-state-management-using-url-parameters/) -- URL parameter state patterns in React (MEDIUM confidence)
- [Cutlist Optimizer reference](https://github.com/gopalsdiary/Cutlist-Optimizer) -- Open-source woodworking optimizer with grain direction support (MEDIUM confidence)
- [html2canvas in Next.js](https://github.com/DevGeekPhoenix/nextjs-html2canvas-example) -- Client-side screenshot capture example (MEDIUM confidence)
