# Phase 5: Static Visualization - Research

**Researched:** 2026-03-19
**Domain:** SVG rendering of cutting diagrams in React, zoom/pan, tooltips
**Confidence:** HIGH

## Summary

Phase 5 renders optimization results as interactive SVG cutting diagrams. Each `BoardLayout` from `OptimizationResult` becomes a separate SVG showing placed pieces as colored rectangles and waste regions as hatched areas. The implementation is pure React + inline SVG with no additional libraries -- the decisions explicitly rule out libraries for zoom/pan and tooltips.

The core technical challenges are: (1) SVG viewBox mapping of board mm dimensions to screen coordinates, (2) zoom/pan implementation (viewBox manipulation or CSS transforms on a wrapper), (3) readable labels that scale appropriately, (4) SVG crosshatch patterns that work in both themes, and (5) positioning HTML tooltips relative to SVG elements via mouse coordinates.

All layout data is already computed by Phase 4's optimizer. `BoardLayout` provides board dimensions, `PlacedPiece` provides x/y/width/height/color/label, and `WasteRegion` provides waste coordinates. This phase is a pure rendering layer with no new data models or algorithms.

**Primary recommendation:** Build a component hierarchy of `BoardDiagramList > BoardDiagram > (PieceRect, WastePattern, PieceTooltip)` using inline SVG with React props driven directly from `OptimizationResult.boards[]`. Zoom/pan via SVG viewBox manipulation or CSS transform on a wrapper div. Use `addEventListener('wheel', ..., { passive: false })` for zoom to avoid browser scroll interference.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Each BoardLayout from OptimizationResult renders as a separate SVG diagram
- SVG viewBox matches board dimensions (in mm internally, scaled for display)
- Pieces rendered as filled rectangles at their x,y positions with the piece's assigned color
- Piece labels (name + dimensions) rendered as text inside or beside the rectangle
- Scale factor computed to fit board SVG within the main area width
- Waste/unused areas shown with a distinct crosshatch or diagonal line pattern
- Use a lighter, muted color (e.g., zinc-800 in dark mode, zinc-200 in light mode) for waste areas
- Waste regions come from OptimizationResult.boards[].waste
- Hovering over a piece shows a tooltip with: label, dimensions (in current units), quantity info
- Tooltip positioned near the mouse cursor, not overlapping the piece
- Simple div tooltip, not a library -- positioned absolutely relative to the SVG container
- Mouse wheel zooms in/out centered on cursor position
- Click-and-drag pans the view when zoomed in
- Reset zoom button to return to fit-to-container view
- Implement via SVG viewBox manipulation or CSS transform on a wrapper
- Board diagrams displayed vertically in the main area, one below another
- Board label above each diagram (e.g., "Board 1: 48" x 96"")
- When no optimization result exists, keep the existing empty state message
- Kerf gaps should be visible between pieces (thin lines of background showing through)
- Pieces should use their CutPiece.color for fills

### Claude's Discretion
- Exact crosshatch pattern for waste areas
- Tooltip styling details
- Zoom step size and animation smoothness
- Whether to use SVG viewBox or CSS transform for zoom/pan
- Board diagram spacing and margins

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIS-01 | SVG visualization shows each board with pieces laid out | BoardLayout has width/height for board and PlacedPiece[] with x, y, width, height; render as SVG rects inside viewBox |
| VIS-02 | Pieces are color-coded by type and labeled with name/dimensions | PlacedPiece.color for fill, PlacedPiece.label + formatDimension() for text labels |
| VIS-03 | Waste areas shown in distinct pattern/color | BoardLayout.waste[] provides WasteRegion coords; render with SVG `<pattern>` crosshatch fill |
| VIS-05 | User can hover over a piece to see dimensions and label in tooltip | onMouseEnter/onMouseLeave on piece rects; absolute/fixed-positioned div tooltip with React state |
| VIS-06 | User can zoom and pan on large layouts | SVG viewBox manipulation or CSS transform for zoom; pointer events for pan; wheel event for zoom |
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
| DIY zoom/pan | react-zoom-pan-pinch | Adds dependency for something achievable in ~40 lines of code |
| HTML div tooltip | Floating UI / Tippy | Adds dependency; simple absolute positioning sufficient for cursor-following tooltip |

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
│       ├── BoardDiagramList.tsx   # Maps OptimizationResult.boards[] to BoardDiagram components
│       ├── BoardDiagram.tsx       # Single board SVG with zoom/pan wrapper
│       ├── PieceRect.tsx          # Individual placed piece rectangle with label
│       ├── WastePattern.tsx       # SVG <defs> with crosshatch pattern definition
│       └── PieceTooltip.tsx       # Positioned HTML tooltip overlay
├── hooks/
│   └── useZoomPan.ts             # Zoom/pan state and event handlers
└── lib/
    └── visualization-utils.ts    # viewBox calculation, text contrast, label sizing helpers
```

### Pattern 1: SVG viewBox Coordinate System
**What:** Each board SVG uses a viewBox matching the board's mm dimensions. The browser scales SVG to fit the container. All piece coordinates are in mm and map directly to SVG user units.
**When to use:** Every board diagram.
**Example:**
```typescript
// Board is 2438.4mm x 1219.2mm (96" x 48")
// viewBox maps mm space directly; browser handles scaling to pixels
const padding = 20; // mm padding around board edge
const viewBox = `${-padding} ${-padding} ${layout.width + padding * 2} ${layout.height + padding * 2}`;

<svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
  {/* Board outline */}
  <rect x={0} y={0} width={layout.width} height={layout.height}
    fill="var(--surface-alt)" stroke="var(--border)" strokeWidth={1} />
  {/* Pieces at their mm coordinates */}
  {layout.pieces.map(piece => (
    <rect x={piece.x} y={piece.y} width={piece.width} height={piece.height}
      fill={piece.color} />
  ))}
</svg>
```

### Pattern 2: Zoom/Pan via ViewBox Manipulation
**What:** Zoom narrows the viewBox (showing less area = zoomed in). Pan shifts the viewBox origin. This keeps all coordinates in mm space.
**When to use:** Each BoardDiagram gets its own zoom/pan state.
**Example:**
```typescript
interface ZoomPanState {
  zoom: number;       // 1.0 = fit-to-container, >1 = zoomed in
  panX: number;       // viewBox x offset in mm
  panY: number;       // viewBox y offset in mm
  isPanning: boolean;
}

// viewBox at current zoom/pan:
const viewW = (boardWidth + padding * 2) / zoom;
const viewH = (boardHeight + padding * 2) / zoom;
const viewBox = `${panX} ${panY} ${viewW} ${viewH}`;

// Zoom centered on cursor:
function zoomAtPoint(
  prevState: ZoomPanState,
  cursorSvgX: number, cursorSvgY: number,
  zoomFactor: number,
  boardWidth: number, boardHeight: number
): ZoomPanState {
  const newZoom = Math.max(1, Math.min(10, prevState.zoom * zoomFactor));
  const oldViewW = boardWidth / prevState.zoom;
  const newViewW = boardWidth / newZoom;
  const oldViewH = boardHeight / prevState.zoom;
  const newViewH = boardHeight / newZoom;

  // Keep cursor at same relative position in viewport
  const fractionX = (cursorSvgX - prevState.panX) / oldViewW;
  const fractionY = (cursorSvgY - prevState.panY) / oldViewH;
  const newPanX = cursorSvgX - fractionX * newViewW;
  const newPanY = cursorSvgY - fractionY * newViewH;

  return {
    zoom: newZoom,
    panX: Math.max(0, Math.min(boardWidth - newViewW, newPanX)),
    panY: Math.max(0, Math.min(boardHeight - newViewH, newPanY)),
    isPanning: false,
  };
}

// Converting mouse to SVG coordinates:
function clientToSvg(e: MouseEvent, svg: SVGSVGElement): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
  return { x: svgPt.x, y: svgPt.y };
}
```

### Pattern 3: SVG Crosshatch Pattern for Waste
**What:** Define an SVG `<defs><pattern>` with diagonal lines for waste area fill.
**When to use:** All waste regions.
**Example:**
```typescript
// Define once per SVG. Use unique ID per board to avoid document-scoped collision.
<defs>
  <pattern id={`waste-hatch-${boardIndex}`} patternUnits="userSpaceOnUse"
    width={8} height={8} patternTransform="rotate(45)">
    <line x1={0} y1={0} x2={0} y2={8}
      stroke="var(--text-secondary)" strokeWidth={0.5} strokeOpacity={0.3} />
  </pattern>
</defs>

// Waste region rect
<rect x={region.x} y={region.y} width={region.width} height={region.height}
  fill={`url(#waste-hatch-${boardIndex})`}
  stroke="var(--border)" strokeWidth={0.5} />
```
**Recommendation:** 45-degree diagonal lines at 8-unit spacing, 0.3 opacity, using `--text-secondary` color. Subtle enough not to overwhelm but clearly distinct from placed pieces.

### Pattern 4: HTML Tooltip over SVG
**What:** Track hovered piece in React state. Render a `position: fixed` div at mouse coordinates.
**When to use:** Piece mouse enter/move/leave events.
**Example:**
```typescript
interface TooltipState {
  piece: PlacedPiece;
  x: number;  // clientX
  y: number;  // clientY
}

// On SVG piece rect:
onMouseEnter={(e) => setTooltip({ piece, x: e.clientX, y: e.clientY })}
onMouseMove={(e) => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
onMouseLeave={() => setTooltip(null)}

// Tooltip div (fixed position, follows cursor):
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

### Pattern 5: Label Sizing Inside Pieces
**What:** Render text labels inside piece rectangles only when large enough. Dynamic font size based on piece dimensions.
**When to use:** Every placed piece.
**Example:**
```typescript
const MIN_LABEL_WIDTH = 40;  // mm threshold
const MIN_LABEL_HEIGHT = 20; // mm threshold

function PieceRect({ piece, units }: { piece: PlacedPiece; units: UnitSystem }) {
  const showLabel = piece.width >= MIN_LABEL_WIDTH && piece.height >= MIN_LABEL_HEIGHT;
  const fontSize = Math.min(piece.width / 8, piece.height / 3, 12); // Cap at 12mm SVG units
  const textColor = getContrastTextColor(piece.color);

  return (
    <g>
      <rect x={piece.x} y={piece.y} width={piece.width} height={piece.height}
        fill={piece.color} fillOpacity={0.85} stroke={piece.color} strokeWidth={0.5} />
      {showLabel && (
        <>
          <text
            x={piece.x + piece.width / 2}
            y={piece.y + piece.height / 2 - fontSize * 0.3}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize} fill={textColor} fontWeight="600"
          >
            {piece.label}
          </text>
          <text
            x={piece.x + piece.width / 2}
            y={piece.y + piece.height / 2 + fontSize * 0.8}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize * 0.75} fill={textColor} fillOpacity={0.8}
          >
            {formatDimension(piece.width, units)} x {formatDimension(piece.height, units)}
          </text>
        </>
      )}
    </g>
  );
}
```

### Anti-Patterns to Avoid
- **D3 for simple rectangles:** D3's imperative DOM manipulation conflicts with React's declarative model. Inline JSX SVG is simpler for rectangles and text.
- **SVG-based tooltips:** SVG `<title>` elements produce ugly native browser tooltips. HTML div tooltips are styleable and theme-aware.
- **Canvas instead of SVG:** Canvas cannot be animated per-element in Phase 6 and doesn't support CSS styling or easy PNG export.
- **Storing pixel coordinates:** Always work in mm coordinates in SVG space; let viewBox handle scaling to screen pixels. Never convert mm to pixels manually.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unit formatting | Custom mm-to-display conversion | `formatDimension()` from `src/lib/units.ts` | Already handles imperial fractions and metric; tested |
| Unit system detection | Manual state | `useUnits()` from `src/contexts/UnitContext.tsx` | Already wired through app |
| Color assignment | New color scheme | `PlacedPiece.color` from optimization result | Colors already assigned in Phase 3 |
| Board layout data | Manual calculation | `OptimizationResult.boards` from optimizer | Positions already computed in Phase 4 |
| SVG-to-screen coordinates | Manual matrix math | `svg.createSVGPoint()` + `getScreenCTM().inverse()` | Browser handles all coordinate transforms natively |

**Key insight:** The visualization is purely a rendering layer. All layout computation, color assignment, and dimension data already exist in the types. The SVG components are thin wrappers that map data properties to SVG attributes.

## Common Pitfalls

### Pitfall 1: Passive Wheel Event Listener
**What goes wrong:** Browser scrolls the page when user tries to zoom the SVG with mousewheel.
**Why it happens:** Modern browsers default wheel listeners to `passive: true` for performance. `e.preventDefault()` is silently ignored on React's `onWheel` prop.
**How to avoid:** Attach wheel handler via `useEffect` + `addEventListener('wheel', handler, { passive: false })` on the container ref, not via React's `onWheel` prop.
**Warning signs:** Zoom works but page also scrolls; console warning about passive event listeners.

### Pitfall 2: SVG Pattern IDs Must Be Unique Per SVG
**What goes wrong:** Multiple board SVGs share `<pattern id="waste-hatch">`. Browser picks one arbitrarily; patterns may disappear on subsequent boards.
**Why it happens:** SVG pattern IDs are document-scoped, not SVG-scoped.
**How to avoid:** Include a unique suffix per board: `id={`waste-hatch-${boardIndex}`}` and reference as `fill={`url(#waste-hatch-${boardIndex})`}`.
**Warning signs:** Waste hatching appears on first board but not others.

### Pitfall 3: SVG Text Not Readable on Colored Backgrounds
**What goes wrong:** White text on light-colored pieces (amber, cyan) becomes invisible.
**Why it happens:** Piece colors from the palette span light to dark; static text color can't work for all.
**How to avoid:** Calculate relative luminance of piece color and choose black or white text. Use the `getContrastTextColor()` helper function.
**Warning signs:** Labels disappear on certain piece colors.

### Pitfall 4: Kerf Gaps Already Handled
**What goes wrong:** Developer tries to add manual spacing between pieces, doubling the kerf gap.
**Why it happens:** Misunderstanding that the optimizer already places pieces with kerf spacing. `PlacedPiece.width/height` are actual piece dimensions; the kerf gap is the empty space between them.
**How to avoid:** Render piece rects at their exact x, y, width, height from PlacedPiece. The board background shows through the kerf gaps automatically.
**Warning signs:** Pieces have double-width gaps between them.

### Pitfall 5: Tooltip Position with Zoom/Pan
**What goes wrong:** Tooltip appears at wrong position when SVG is zoomed/panned.
**Why it happens:** SVG mouse event coordinates may be affected by transforms.
**How to avoid:** Use `e.clientX` / `e.clientY` (viewport coordinates) for tooltip position with `position: fixed`. These are unaffected by SVG transforms.
**Warning signs:** Tooltip drifts away from cursor when zoomed in.

### Pitfall 6: Zoom + Pan Coordinate Mismatch
**What goes wrong:** Pan feels too fast when zoomed out or too slow when zoomed in.
**Why it happens:** Pan delta (screen pixels) not adjusted for zoom level.
**How to avoid:** For viewBox approach: convert mouse delta to SVG delta using `delta / zoom`. For CSS transform: `panX += dx / zoom`.
**Warning signs:** Panning speed changes with zoom level in unexpected ways.

## Code Examples

### Complete BoardDiagramList Integration
```typescript
// src/components/visualization/BoardDiagramList.tsx
'use client';

import type { OptimizationResult } from '@/lib/types';
import { useUnits } from '@/contexts/UnitContext';
import { BoardDiagram } from './BoardDiagram';

interface BoardDiagramListProps {
  result: OptimizationResult;
}

export function BoardDiagramList({ result }: BoardDiagramListProps) {
  const { units } = useUnits();

  return (
    <div className="space-y-6">
      {result.boards.map((layout, index) => (
        <BoardDiagram
          key={`${layout.boardId}-${layout.instanceIndex}`}
          layout={layout}
          boardIndex={index}
          totalBoards={result.boards.length}
          units={units}
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
 * Returns '#ffffff' or '#000000' based on background color luminance.
 * Uses W3C relative luminance formula.
 */
export function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
```

### Page Integration
```typescript
// In page.tsx, update MainArea content:
<MainArea>
  {optimizationResult ? (
    <div className="space-y-4">
      {/* Existing summary stats card stays */}
      <div className="bg-surface rounded-lg border border-border p-4">
        {/* ...existing summary stats... */}
      </div>
      {/* Unplaced pieces warning stays */}
      {optimizationResult.unplacedPieces.length > 0 && (
        <div className="bg-red-500/10 ...">...</div>
      )}
      {/* NEW: Board diagrams */}
      <BoardDiagramList result={optimizationResult} />
    </div>
  ) : null}
</MainArea>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3 for all SVG in React | Inline JSX SVG for simple shapes | React 16+ (2017+) | No library needed for rectangles/text |
| jQuery SVG manipulation | React declarative SVG | React era | Automatic re-renders on data change |
| SVG `<title>` for tooltips | HTML overlay div | Always better | Full styling control, theme-aware |
| onWheel React prop | addEventListener passive:false | React 17+ | Required for preventDefault to work |

**Deprecated/outdated:**
- SVG 1.1 `xlink:href` -- use `href` directly in React JSX (SVG 2)
- `getBBox()` for text measurement -- unreliable before render; estimate based on character count instead

## Open Questions

1. **ViewBox vs CSS Transform for zoom/pan**
   - What we know: Both work. ViewBox is SVG-native and keeps all coordinates in mm. CSS transform is simpler but makes tooltip positioning trickier.
   - Recommendation: Use SVG viewBox manipulation. It naturally keeps coordinate system consistent and `createSVGPoint()` + `getScreenCTM()` handle mouse-to-SVG conversion.

2. **Crosshatch pattern scaling at extreme zoom**
   - What we know: `patternUnits="userSpaceOnUse"` causes pattern to scale with viewBox zoom.
   - Recommendation: Accept the scaling -- at moderate zoom (1-5x) it looks fine. If needed, dynamically adjust pattern size based on zoom level.

3. **Label font size thresholds**
   - What we know: 40mm width / 20mm height is an initial estimate for "label fits".
   - Recommendation: Start with these values and tune visually during implementation. Tooltip always available regardless.

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
| VIS-06 | Zoom and pan on layouts | unit | `npx vitest run src/lib/visualization-utils.test.ts -x` | No -- Wave 0 |

**Note:** This phase is heavily visual. Most requirements need manual/visual verification. Unit tests cover pure utility functions (contrast color, viewBox calculation, zoom math).

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + visual inspection of board diagrams

### Wave 0 Gaps
- [ ] `src/lib/visualization-utils.test.ts` -- covers getContrastTextColor, viewBox calculation, zoom clamping math

## Sources

### Primary (HIGH confidence)
- Project codebase -- types.ts (PlacedPiece, WasteRegion, BoardLayout, OptimizationResult), optimizer.ts, page.tsx, units.ts, globals.css, color-palette.ts
- MDN SVG documentation -- viewBox, pattern, preserveAspectRatio, createSVGPoint, getScreenCTM (stable web standard)
- MDN Pointer Events API -- setPointerCapture for reliable pan tracking (stable web standard)
- MDN wheel event passive behavior -- well-documented browser behavior

### Secondary (MEDIUM confidence)
- SVG viewBox zoom/pan pattern -- widely used technique in map/diagram viewers
- W3C relative luminance formula for text contrast

### Tertiary (LOW confidence)
- Label sizing thresholds (40mm/20mm) -- estimated, needs visual tuning during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No external libraries; pure React + SVG is well-understood
- Architecture: HIGH - Component decomposition follows established React patterns; data types fully defined
- Pitfalls: HIGH - Known browser behaviors (passive wheel, SVG pattern IDs, coordinate transforms) documented in MDN
- Label sizing: LOW - Thresholds are estimates that need visual tuning

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable domain, no fast-moving dependencies)
