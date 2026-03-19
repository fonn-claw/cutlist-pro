# Phase 5: Static Visualization - Research

**Researched:** 2026-03-19
**Domain:** SVG rendering of cutting diagrams in React, zoom/pan, tooltips
**Confidence:** HIGH

## Summary

Phase 5 renders optimization results as interactive SVG cutting diagrams. Each `BoardLayout` from `OptimizationResult` becomes a separate SVG showing placed pieces as colored rectangles and waste regions as hatched areas. The implementation is pure React + inline SVG with no additional libraries -- the decisions explicitly rule out libraries for zoom/pan and tooltips.

The core technical challenges are: (1) calculating proper SVG viewBox to scale board dimensions to screen pixels, (2) implementing zoom/pan via CSS transforms on a wrapper div, (3) rendering readable labels that scale appropriately with zoom, (4) creating SVG hatching patterns that work in both light and dark themes, and (5) positioning HTML tooltips relative to SVG elements using mouse coordinates.

**Primary recommendation:** Build a component hierarchy of `CuttingDiagramList > BoardDiagram > (PieceRect, WasteRect, PieceLabel, PieceTooltip)` using inline SVG with React props driven directly from the existing `BoardLayout[]` type. Zoom/pan via CSS `transform: scale() translate()` on a wrapper div with wheel and pointer event handlers.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- One SVG per board -- each board renders as a separate diagram
- Pieces rendered as colored rectangles at computed x,y positions from OptimizationResult
- Piece colors come from CutPiece.color (already assigned in Phase 3)
- Labels show piece name and dimensions inside each rectangle (if space allows)
- Waste/unused areas rendered as hatched/crosshatch pattern rectangles in a muted color
- Hover over any piece shows tooltip with: label, dimensions (in current unit), and quantity info
- Use a simple positioned div tooltip (no library needed)
- Tooltip follows cursor or anchors to piece
- Mouse wheel to zoom, click-drag to pan on the SVG container
- Use CSS transform (scale + translate) on a wrapper div -- simple, no library needed
- Reset zoom button to return to fit-all view
- Minimum zoom: fit entire board, maximum zoom: 4x
- Board diagrams stack vertically in the main area
- Each board has a header showing "Board N of M" with board dimensions
- Boards with no placed pieces are not shown

### Claude's Discretion
- Exact waste area pattern (hatching angle, density)
- Tooltip positioning logic
- Zoom/pan interaction details (smooth vs discrete)
- SVG viewBox calculation approach
- Label font size scaling with zoom

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIS-01 | SVG visualization shows each board with pieces laid out | BoardDiagram component renders BoardLayout as SVG with viewBox scaling |
| VIS-02 | Pieces are color-coded by type and labeled with name/dimensions | PlacedPiece.color for fill, label + formatDimension for text |
| VIS-03 | Waste areas shown in distinct pattern/color | SVG `<pattern>` with diagonal hatching, muted color from theme |
| VIS-05 | User can hover over a piece to see dimensions/label in tooltip | HTML div tooltip positioned via mouse event coordinates |
| VIS-06 | User can zoom and pan on large layouts | CSS transform on wrapper div with wheel + pointer event handlers |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Component rendering | Already installed, project standard |
| Inline SVG | N/A | Board diagram rendering | Native JSX SVG -- no library needed for rectangles/text/patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| formatDimension (src/lib/units.ts) | existing | Dimension display in tooltips/labels | All dimension text rendering |
| useUnits (src/contexts/UnitContext.tsx) | existing | Current unit system | Tooltip and label dimension formatting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG | D3.js | Massive overkill for rectangles; adds 50KB+ dep, imperative API conflicts with React |
| CSS transform zoom | react-zoom-pan-pinch | Adds dependency; CSS transform is ~30 lines of code for this use case |
| HTML div tooltip | Floating UI / Tippy | Adds dependency; simple absolute positioning is sufficient for cursor-following tooltip |

**Installation:**
```bash
# No new packages needed -- all built with React + inline SVG
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── visualization/
│       ├── CuttingDiagramList.tsx   # Maps BoardLayout[] to BoardDiagram components
│       ├── BoardDiagram.tsx         # Single board SVG with zoom/pan wrapper
│       ├── PieceRect.tsx            # Individual placed piece rectangle
│       ├── WasteRect.tsx            # Waste region with hatching pattern
│       └── PieceTooltip.tsx         # Positioned HTML tooltip overlay
├── hooks/
│   └── useZoomPan.ts               # Zoom/pan state and event handlers
└── lib/
    └── visualization-utils.ts      # viewBox calculation, label sizing, scale helpers
```

### Pattern 1: SVG viewBox Scaling
**What:** Use SVG `viewBox` to map board mm dimensions to screen coordinates, then CSS to control rendered size.
**When to use:** Every board diagram.
**Example:**
```typescript
// Board dimensions are in mm. viewBox maps coordinate space.
// The SVG element gets a CSS width of 100% and height auto-scales.
interface BoardDiagramProps {
  layout: BoardLayout;
  boardIndex: number;
  totalBoards: number;
}

function BoardDiagram({ layout, boardIndex, totalBoards }: BoardDiagramProps) {
  // Add padding for labels/dimensions outside the board
  const padding = 20; // mm in SVG coordinate space
  const viewBox = `${-padding} ${-padding} ${layout.width + padding * 2} ${layout.height + padding * 2}`;

  return (
    <div className="relative">
      <h3 className="text-sm font-semibold text-text-primary mb-2">
        Board {boardIndex + 1} of {totalBoards}
      </h3>
      {/* Zoom/pan wrapper */}
      <div className="overflow-hidden border border-border rounded-lg bg-surface">
        <div style={{ transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`, transformOrigin: '0 0' }}>
          <svg
            viewBox={viewBox}
            className="w-full h-auto"
            style={{ maxHeight: '500px' }}
          >
            {/* Board outline */}
            <rect x={0} y={0} width={layout.width} height={layout.height}
              fill="none" stroke="currentColor" strokeWidth={1} />
            {/* Waste regions */}
            {layout.waste.map((w, i) => (
              <WasteRect key={`waste-${i}`} region={w} />
            ))}
            {/* Placed pieces */}
            {layout.pieces.map((piece, i) => (
              <PieceRect key={`piece-${i}`} piece={piece} />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
```

### Pattern 2: SVG Hatching Pattern for Waste
**What:** Define an SVG `<defs><pattern>` with diagonal lines for waste area fill.
**When to use:** All waste regions.
**Example:**
```typescript
// Define once per SVG, reference by fill="url(#waste-hatch)"
<defs>
  <pattern id="waste-hatch" patternUnits="userSpaceOnUse"
    width={8} height={8} patternTransform="rotate(45)">
    <line x1={0} y1={0} x2={0} y2={8}
      stroke="var(--text-secondary)" strokeWidth={0.5} strokeOpacity={0.3} />
  </pattern>
</defs>

// Usage on waste rect
<rect x={region.x} y={region.y} width={region.width} height={region.height}
  fill="url(#waste-hatch)" stroke="var(--border)" strokeWidth={0.5} />
```
**Recommendation for discretion:** 45-degree diagonal lines at 8-unit spacing, 0.3 opacity, using `--text-secondary` color. This is subtle enough not to overwhelm but clearly distinguishable from placed pieces.

### Pattern 3: CSS Transform Zoom/Pan Hook
**What:** Custom hook managing zoom level + pan offset via CSS transforms.
**When to use:** Each BoardDiagram wrapper.
**Example:**
```typescript
interface ZoomPanState {
  zoom: number;
  panX: number;
  panY: number;
}

function useZoomPan(minZoom = 1, maxZoom = 4) {
  const [state, setState] = useState<ZoomPanState>({ zoom: 1, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setState(prev => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1; // Smooth 10% steps
      const newZoom = Math.min(maxZoom, Math.max(minZoom, prev.zoom * delta));
      return { ...prev, zoom: newZoom };
    });
  }, [minZoom, maxZoom]);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setState(prev => ({
      ...prev,
      panX: prev.panX + dx / prev.zoom,
      panY: prev.panY + dy / prev.zoom,
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const reset = useCallback(() => {
    setState({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  // Attach wheel listener with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return { ...state, containerRef, handlePointerDown, handlePointerMove, handlePointerUp, reset };
}
```

### Pattern 4: HTML Tooltip over SVG
**What:** A positioned `<div>` overlaying the SVG container, shown on piece hover.
**When to use:** Piece mouse events.
**Example:**
```typescript
// Tooltip state in parent component
const [tooltip, setTooltip] = useState<{
  piece: PlacedPiece;
  x: number;
  y: number;
} | null>(null);

// On SVG piece rect:
<rect
  onMouseEnter={(e) => setTooltip({ piece, x: e.clientX, y: e.clientY })}
  onMouseMove={(e) => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
  onMouseLeave={() => setTooltip(null)}
  // ... other props
/>

// Tooltip div (portal or absolute positioned in container)
{tooltip && (
  <div
    className="fixed z-50 bg-surface border border-border rounded px-3 py-2 shadow-lg text-sm pointer-events-none"
    style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
  >
    <div className="font-semibold text-text-primary">{tooltip.piece.label}</div>
    <div className="text-text-secondary">
      {formatDimension(tooltip.piece.width, units)} x {formatDimension(tooltip.piece.height, units)}
    </div>
    {tooltip.piece.rotated && (
      <div className="text-xs text-accent">Rotated</div>
    )}
  </div>
)}
```
**Recommendation for discretion:** Use `fixed` positioning with mouse clientX/clientY + offset. Offset 12px right and 12px up from cursor. Add boundary checking so tooltip doesn't overflow viewport (flip to left side if near right edge).

### Pattern 5: Label Sizing Inside Pieces
**What:** Show text labels inside piece rectangles only when the piece is large enough.
**When to use:** Every placed piece.
**Example:**
```typescript
// In SVG coordinate space (mm), estimate if label fits
// A reasonable threshold: piece must be at least 40mm wide and 20mm tall for a label
const MIN_LABEL_WIDTH = 40;  // mm
const MIN_LABEL_HEIGHT = 20; // mm

function PieceRect({ piece }: { piece: PlacedPiece }) {
  const showLabel = piece.width >= MIN_LABEL_WIDTH && piece.height >= MIN_LABEL_HEIGHT;
  const fontSize = Math.min(piece.width / 8, piece.height / 3, 12); // Cap at 12mm in SVG units

  return (
    <g>
      <rect x={piece.x} y={piece.y} width={piece.width} height={piece.height}
        fill={piece.color} fillOpacity={0.7} stroke={piece.color} strokeWidth={1} />
      {showLabel && (
        <>
          <text
            x={piece.x + piece.width / 2}
            y={piece.y + piece.height / 2 - fontSize * 0.3}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize} fill="white" fontWeight="600"
          >
            {piece.label}
          </text>
          <text
            x={piece.x + piece.width / 2}
            y={piece.y + piece.height / 2 + fontSize * 0.8}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize * 0.75} fill="white" fillOpacity={0.8}
          >
            {formatDimension(piece.width, units)} x {formatDimension(piece.height, units)}
          </text>
        </>
      )}
    </g>
  );
}
```
**Recommendation for discretion:** Use a dynamic font size based on piece dimensions with a maximum cap. The label text needs a subtle dark stroke or drop shadow for readability against varying piece colors. Alternatively, detect color luminance and use black or white text accordingly.

### Anti-Patterns to Avoid
- **D3 for simple rectangles:** D3's imperative DOM manipulation conflicts with React's declarative model. For rectangles and text, inline JSX SVG is simpler and more maintainable.
- **SVG-based tooltips:** SVG `<title>` elements produce ugly native browser tooltips. HTML div tooltips are more styleable and theme-aware.
- **Zooming by changing viewBox:** Changing `viewBox` on every zoom event causes full SVG re-render. CSS `transform: scale()` on a wrapper is GPU-accelerated and doesn't re-render children.
- **Storing zoom in SVG transform attribute:** Conflicts with React's controlled rendering. Use CSS transforms on the wrapper div instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unit formatting | Custom string formatters | `formatDimension()` from `src/lib/units.ts` | Already handles imperial fractions and metric; tested |
| Unit system detection | Manual state | `useUnits()` from `src/contexts/UnitContext.tsx` | Already wired through app |
| Color assignment | SVG fill logic | `PlacedPiece.color` from optimization result | Colors already assigned in Phase 3 |
| Board layout data | Manual calculation | `OptimizationResult.boards` from optimizer | Positions already computed in Phase 4 |

**Key insight:** The visualization is purely a rendering layer. All layout computation, color assignment, and dimension data already exist in the types. The SVG components are thin wrappers that map data properties to SVG attributes.

## Common Pitfalls

### Pitfall 1: Wheel Event passive: false
**What goes wrong:** Browser default scroll behavior fires when user tries to zoom the SVG, causing the page to scroll instead.
**Why it happens:** Modern browsers default wheel event listeners to `passive: true` for performance. `e.preventDefault()` is silently ignored.
**How to avoid:** Attach wheel handler via `addEventListener` with `{ passive: false }` in a `useEffect`, not via React's `onWheel` prop.
**Warning signs:** Zoom works intermittently, page scrolls when trying to zoom.

### Pitfall 2: SVG Text Not Readable on Colored Backgrounds
**What goes wrong:** White or dark text on certain piece colors becomes invisible.
**Why it happens:** Piece colors from CutPiece.color span the full palette -- some are light, some dark.
**How to avoid:** Either: (a) use a dark text stroke/outline for contrast, (b) calculate relative luminance and switch text color, or (c) use a semi-transparent dark background behind text.
**Warning signs:** Labels disappear on light-colored pieces in dark mode (or vice versa).

### Pitfall 3: SVG Pattern IDs Must Be Unique Per SVG
**What goes wrong:** Multiple board SVGs on the page share `<pattern id="waste-hatch">`. Browser picks one arbitrarily, patterns may disappear.
**Why it happens:** SVG pattern IDs are document-scoped, not SVG-scoped.
**How to avoid:** Include a unique suffix per board: `id={`waste-hatch-${boardIndex}`}` and reference as `fill={`url(#waste-hatch-${boardIndex})`}`.
**Warning signs:** Waste hatching appears on first board but not subsequent boards, or patterns flicker.

### Pitfall 4: Zoom + Pan Coordinate Mismatch
**What goes wrong:** Pan direction or speed feels wrong after zooming. Mouse position drifts during panning.
**Why it happens:** Pan delta (in screen pixels) must be divided by current zoom level to get the correct translation in SVG space.
**How to avoid:** Always compute: `panX += dx / zoom`. See Pattern 3 above.
**Warning signs:** Panning feels "sluggish" when zoomed in, or "too fast" when zoomed out.

### Pitfall 5: Tooltip Position with CSS Transform
**What goes wrong:** Tooltip appears at wrong position because the SVG container is scaled/panned.
**Why it happens:** SVG mouse event coordinates are relative to the transformed element.
**How to avoid:** Use `e.clientX` / `e.clientY` (viewport coordinates) for tooltip position, not SVG local coordinates. Position the tooltip with `fixed` positioning.
**Warning signs:** Tooltip drifts away from cursor when zoomed in.

### Pitfall 6: Large Board Causes Tiny Pieces
**What goes wrong:** On a 4x8ft (1220x2440mm) board, small pieces (50x50mm) become a few pixels on screen.
**Why it happens:** The viewBox maps the full board to the container width. Small pieces become proportionally tiny.
**How to avoid:** This is exactly why zoom exists. Ensure default view fits the board, and zoom up to 4x makes small pieces readable. Also, tooltip on hover provides dimensions even when label doesn't fit.
**Warning signs:** Users can't read labels on small pieces at default zoom.

## Code Examples

### Complete BoardDiagram Integration
```typescript
// src/components/visualization/CuttingDiagramList.tsx
'use client';

import type { OptimizationResult } from '@/lib/types';
import { BoardDiagram } from './BoardDiagram';

interface CuttingDiagramListProps {
  result: OptimizationResult;
}

export function CuttingDiagramList({ result }: CuttingDiagramListProps) {
  const boardsWithPieces = result.boards.filter(b => b.pieces.length > 0);

  return (
    <div className="space-y-6">
      {boardsWithPieces.map((layout, index) => (
        <BoardDiagram
          key={`${layout.boardId}-${layout.instanceIndex}`}
          layout={layout}
          boardIndex={index}
          totalBoards={boardsWithPieces.length}
        />
      ))}
    </div>
  );
}
```

### Text Contrast Helper
```typescript
// src/lib/visualization-utils.ts

/**
 * Returns 'white' or 'black' based on background color luminance.
 * Input: hex color string like '#d97706' or 'rgb(...)'
 */
export function getContrastTextColor(hexColor: string): string {
  // Parse hex
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Relative luminance (simplified sRGB)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
```

### SVG viewBox Calculation Helper
```typescript
// src/lib/visualization-utils.ts

export function calculateViewBox(
  boardWidth: number,
  boardHeight: number,
  padding = 20
): string {
  return `${-padding} ${-padding} ${boardWidth + padding * 2} ${boardHeight + padding * 2}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3 for all SVG in React | Inline JSX SVG for simple shapes | React 16+ (2017+) | No library needed for rectangles/text |
| Library-based zoom (panzoom, etc.) | CSS transform on wrapper | Evergreen browsers | GPU-accelerated, no dependency |
| SVG `<title>` for tooltips | HTML overlay div | Always been better | Full styling control |
| onWheel React prop | addEventListener with passive:false | React 17+ | Required for preventDefault to work |

**Deprecated/outdated:**
- SVG 1.1 `xlink:href` -- use `href` directly in React JSX (SVG 2)
- `getBBox()` for measuring text -- unreliable before render; use dimension estimation instead

## Open Questions

1. **Label font size minimum threshold**
   - What we know: Dynamic sizing based on piece dimensions works, with a max cap
   - What's unclear: Exact minimum before hiding the label entirely (40mm threshold is a guess)
   - Recommendation: Start with 40mm width / 20mm height threshold, tune during implementation based on visual testing

2. **Piece color contrast in both themes**
   - What we know: CutPiece colors are from a predefined palette (Phase 3)
   - What's unclear: Whether all palette colors have sufficient contrast against both dark and light theme board backgrounds
   - Recommendation: Use `fillOpacity={0.7}` on piece rects so board background shows through, plus the luminance-based text color function

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run src/lib/visualization-utils.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIS-01 | SVG renders board with pieces at positions | manual-only | Visual verification in browser | N/A |
| VIS-02 | Pieces color-coded and labeled | unit | `npx vitest run src/lib/visualization-utils.test.ts -x` | No -- Wave 0 |
| VIS-03 | Waste areas distinct pattern | manual-only | Visual verification | N/A |
| VIS-05 | Hover tooltip shows dimensions | manual-only | Interactive browser test | N/A |
| VIS-06 | Zoom and pan on layouts | unit | `npx vitest run src/hooks/useZoomPan.test.ts -x` | No -- Wave 0 |

**Note:** This phase is heavily visual. Most requirements need manual/visual verification in the browser. Unit tests cover the utility functions (contrast color, viewBox calculation, label sizing logic).

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/visualization-utils.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + visual inspection of board diagrams

### Wave 0 Gaps
- [ ] `src/lib/visualization-utils.test.ts` -- covers VIS-02 (getContrastTextColor, calculateViewBox, label sizing)
- [ ] `src/hooks/useZoomPan.test.ts` -- covers VIS-06 (zoom clamping, pan delta calculation)

## Sources

### Primary (HIGH confidence)
- React JSX SVG documentation -- inline SVG is native React, no special handling needed
- MDN SVG `<pattern>` element -- standard SVG feature supported in all modern browsers
- MDN Pointer Events API -- setPointerCapture for reliable pan tracking
- MDN wheel event passive behavior -- well-documented browser behavior

### Secondary (MEDIUM confidence)
- CSS transform for zoom/pan -- widely used pattern in map/diagram viewers
- Luminance-based text contrast -- standard W3C relative luminance formula

### Tertiary (LOW confidence)
- Label sizing thresholds (40mm/20mm) -- estimated, needs tuning during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No external libraries; pure React + SVG is well-understood
- Architecture: HIGH - Component decomposition follows established React patterns; data types are fully defined
- Pitfalls: HIGH - Known browser behaviors (passive wheel, SVG pattern IDs, coordinate transforms) documented in MDN
- Label sizing: LOW - Thresholds are estimates that need visual tuning

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable domain, no fast-moving dependencies)
