# Phase 1: Foundation & Design System - Research

**Researched:** 2026-03-19
**Domain:** Next.js App Router shell, Tailwind CSS v4 theming, responsive layout, imperial/metric unit system
**Confidence:** HIGH

## Summary

Phase 1 delivers four foundational capabilities: (1) a Next.js App Router project scaffold with Tailwind CSS v4, (2) a dark/light theme system with dark as default, (3) a responsive sidebar/main layout that stacks on tablet, and (4) a unit system that stores millimeters internally and displays imperial fractions or metric values. This is a greenfield project with no existing code.

The technical challenges are well-understood. Tailwind CSS v4's `@custom-variant` directive replaces the old `darkMode: 'class'` config, and `next-themes` handles SSR-safe theme toggling without flash-of-unstyled-content (FOUC). The imperial fraction display is pure math (find nearest 1/16th, simplify with GCD) but must be implemented carefully to avoid floating-point display artifacts. The unit system architecture (internal mm storage, display-only conversion) is a locked decision from project research.

**Primary recommendation:** Use `next-themes` for theme management (prevents FOUC, handles localStorage persistence, 2.4KB), Tailwind v4 `@custom-variant dark` for class-based dark mode, and build a custom `formatFraction()` utility for imperial display at 1/16" precision.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Dark theme uses slate/zinc neutrals with amber accent color for warmth -- woodworking aesthetic, modern feel
- Theme toggle is a sun/moon icon button in the header bar -- standard and discoverable
- Tailwind CSS dark: variant with CSS custom properties for theming -- aligns with project constraint (no UI libs)
- Inter/system font stack for typography -- clean, no extra font downloads
- Sidebar is 320px fixed width on desktop -- sufficient for input forms
- Breakpoint at 768px for stacking -- inputs stack above visualization on tablet/mobile per requirements
- Sidebar scrolls independently from main visualization area -- keeps viz visible while editing
- Empty main area shows friendly message: "Add boards and pieces to get started"
- Internal storage in millimeters (float) -- lossless metric base per STATE.md decision
- Imperial display at 1/16" precision -- standard woodworking precision
- Unit toggle in header bar next to theme toggle -- always accessible
- Users type decimal inches, displayed as proper fractions (e.g., type "15.75" -> displays "15-3/4")

### Claude's Discretion
- Specific shade values for the color palette
- Animation/transition details for theme toggle
- Exact empty state illustration or icon choice
- Tailwind config structure and file organization

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DES-01 | App uses dark theme by default | `next-themes` with `defaultTheme="dark"` + Tailwind v4 `@custom-variant dark` |
| DES-02 | User can toggle between dark and light themes | Sun/moon icon button in header using `useTheme()` hook from `next-themes` |
| DES-03 | Layout uses sidebar for inputs, main area for visualization | CSS Grid layout with `grid-cols-[320px_1fr]` on desktop |
| DES-04 | On mobile/tablet, inputs stack above visualization | Single column grid below 768px breakpoint (`md:` prefix) |
| DES-05 | App is responsive and usable on tablet (768px+) | Tailwind responsive utilities, no fixed widths on mobile, independent scroll areas |
| UNIT-01 | App displays imperial units (inches) by default | Settings state defaults to `units: 'imperial'`, fraction formatting utility |
| UNIT-02 | User can toggle between imperial and metric (mm) units | Unit toggle button in header, context-provided unit preference |
| UNIT-03 | Unit toggle converts all displayed values without losing precision | Internal mm storage, display-only conversion at UI boundary |
</phase_requirements>

## Standard Stack

### Core (Phase 1 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x (latest via create-next-app) | App framework | Project constraint. create-next-app scaffolds App Router + Tailwind v4 automatically. v16 is available but has breaking changes (removed APIs, enforced async accessors) with no upside for this client-side app. |
| React | 19.x | UI library | Ships with Next.js 15. |
| TypeScript | 5.x | Type safety | Ships with create-next-app. Catches unit/dimension bugs at compile time. |
| Tailwind CSS | 4.x (4.2.2 current) | Styling | Project constraint. v4 uses CSS-first config via `@theme` directive, `@custom-variant` for dark mode. No tailwind.config.js needed. |
| next-themes | 0.4.6 | Theme management | Prevents FOUC on SSR/SSG, handles localStorage persistence, system preference detection. 2.4KB. NOT a UI component library -- it is a utility. Hand-rolling SSR-safe theme toggling is error-prone (requires script injection, hydration mismatch handling). |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 4.x (4.1.0 current) | Unit testing | Testing unit conversion functions, fraction formatting. Required for Nyquist validation. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Custom theme script | next-themes solves FOUC, localStorage sync, system preference detection in 2 lines. Custom requires injecting a blocking script in `<head>`, handling hydration mismatches, and managing localStorage manually. |
| Tailwind v4 @custom-variant | Tailwind v3 darkMode config | v4 is CSS-first, no JS config file needed. v3 still works but is the legacy path. |

**Installation:**
```bash
# Scaffold project
npx create-next-app@latest cutlist-pro --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Phase 1 dependencies
npm install next-themes

# Dev dependencies
npm install -D vitest
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout: ThemeProvider, font, metadata
│   ├── page.tsx             # Main page: sidebar + main grid
│   └── globals.css          # Tailwind imports, @custom-variant, @theme tokens
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # App header: logo, unit toggle, theme toggle
│   │   ├── Sidebar.tsx      # Sidebar wrapper (scrollable)
│   │   └── MainArea.tsx     # Main visualization area (scrollable, empty state)
│   └── ui/
│       ├── ThemeToggle.tsx   # Sun/moon icon button
│       └── UnitToggle.tsx    # in/mm toggle button
├── lib/
│   ├── units.ts             # toInternal(), toDisplay(), formatFraction()
│   └── types.ts             # Board, Piece, Settings, AppState types
└── contexts/
    └── UnitContext.tsx       # Unit preference context provider
```

### Pattern 1: Tailwind v4 Dark Mode with CSS Custom Properties

**What:** Use `@custom-variant` to drive dark mode via class, and `@theme` to define design tokens as CSS custom properties.

**When to use:** Always -- this is the Tailwind v4 way.

**Example:**
```css
/* src/app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Amber accent */
  --color-accent: oklch(0.78 0.15 75);
  --color-accent-hover: oklch(0.72 0.15 75);

  /* Sidebar width */
  --sidebar-width: 320px;
}
```
Source: https://tailwindcss.com/docs/dark-mode

### Pattern 2: next-themes Integration with App Router

**What:** Wrap the app in `ThemeProvider` with `attribute="class"` so Tailwind's `dark:` variant activates.

**When to use:** Always for this project.

**Example:**
```tsx
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```
Source: https://github.com/pacocoursey/next-themes

### Pattern 3: Imperial Fraction Formatting

**What:** Convert a decimal inch value to a woodworker-friendly fraction string at 1/16" precision.

**When to use:** Every time an imperial dimension is displayed.

**Example:**
```typescript
// src/lib/units.ts
const MM_PER_INCH = 25.4;

export function toDisplay(valueMm: number, units: 'imperial' | 'metric'): number {
  return units === 'imperial' ? valueMm / MM_PER_INCH : valueMm;
}

export function toInternal(value: number, units: 'imperial' | 'metric'): number {
  return units === 'imperial' ? value * MM_PER_INCH : value;
}

/**
 * Format a decimal inch value as a woodworking fraction string.
 * e.g., 15.75 -> "15-3/4\"", 0.0625 -> "1/16\""
 */
export function formatFraction(decimalInches: number, precision: number = 16): string {
  const whole = Math.floor(decimalInches);
  const remainder = decimalInches - whole;

  if (remainder < 1 / (precision * 2)) {
    return `${whole}"`;
  }

  let numerator = Math.round(remainder * precision);
  let denominator = precision;

  // Simplify fraction using GCD
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;

  if (whole === 0) {
    return `${numerator}/${denominator}"`;
  }
  return `${whole}-${numerator}/${denominator}"`;
}

export function formatDimension(valueMm: number, units: 'imperial' | 'metric'): string {
  if (units === 'metric') {
    return `${Math.round(valueMm * 10) / 10}mm`;
  }
  return formatFraction(valueMm / MM_PER_INCH);
}
```

### Pattern 4: Responsive Sidebar/Main Grid Layout

**What:** CSS Grid with fixed sidebar on desktop, stacked on mobile.

**When to use:** The main page layout.

**Example:**
```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden">
        <Sidebar className="overflow-y-auto border-r border-zinc-200 dark:border-zinc-800" />
        <MainArea className="overflow-y-auto" />
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Using Tailwind v3 config for dark mode:** Do NOT create a `tailwind.config.js` with `darkMode: 'class'`. Tailwind v4 uses `@custom-variant dark` in CSS. The JS config file is the legacy path.
- **Storing display units in state:** NEVER store inches values. Always store mm internally, convert at display boundary only. Toggling units is a display concern, not a data concern.
- **Client-side theme detection without hydration guard:** Using `window.matchMedia` directly causes hydration mismatches. Use `next-themes` which handles this correctly with a blocking script.
- **Using `useEffect` to set initial theme:** Causes a visible flash from light to dark on page load. `next-themes` injects a synchronous script in `<head>` that prevents this.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSR-safe dark mode toggle | Custom blocking script + localStorage + hydration guard | `next-themes` (0.4.6) | FOUC prevention requires a synchronous `<head>` script that runs before React hydrates. next-themes has solved this for years, including edge cases around system preference detection and server rendering. |
| CSS custom property theming | Manual CSS variable management | Tailwind v4 `@theme` directive | Tailwind v4 automatically generates CSS custom properties from `@theme` tokens. Manual management duplicates this and falls out of sync. |
| Responsive breakpoint logic | Custom media query listeners in JS | Tailwind responsive prefixes (`md:`, `lg:`) | CSS-level responsive design is simpler, more performant, and declarative. JS-based breakpoint detection adds complexity for no benefit in this layout. |

**Key insight:** The "no UI component libraries" constraint does NOT mean "build everything from scratch." Utilities like `next-themes` (2.4KB, solves a specific hard problem) are appropriate. The constraint targets large component libraries like shadcn/ui, Radix, MUI, etc.

## Common Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC) on Dark Theme
**What goes wrong:** App renders with light theme briefly, then snaps to dark. Visually jarring, especially with dark-by-default requirement.
**Why it happens:** React hydration runs after initial paint. If theme is set via `useEffect`, there is always one frame of the wrong theme.
**How to avoid:** Use `next-themes` which injects a synchronous blocking script in `<head>` that sets the `.dark` class before any paint.
**Warning signs:** Brief white flash on page load when dark theme is default.

### Pitfall 2: Floating-Point Artifacts in Fraction Display
**What goes wrong:** 15.75 inches displays as "15-12/16" instead of "15-3/4", or worse, "15-0.7500000001/1".
**Why it happens:** IEEE 754 floating-point arithmetic. `15.75 - 15 = 0.7500000000000001` in some cases.
**How to avoid:** Use `Math.round()` before fraction simplification. Always simplify with GCD. Test edge cases: 0, exact whole numbers, exact halves/quarters/eighths/sixteenths, and values that fall between precision steps.
**Warning signs:** Fractions with denominators that are not powers of 2, or unsimplified fractions.

### Pitfall 3: Sidebar Scroll Independence Breaking on Mobile
**What goes wrong:** On mobile, both sidebar (now stacked on top) and main area scroll as a single page, or the main area gets pushed below the fold with no way to scroll to it.
**Why it happens:** `overflow-y-auto` on nested containers requires explicit height constraints. Without `h-screen` and `overflow-hidden` on the parent, the grid expands to content height.
**How to avoid:** Use `h-screen flex flex-col` on the outermost container. The grid takes `flex-1 overflow-hidden`. Each column gets `overflow-y-auto`. On mobile stacked layout, set explicit heights or use `min-h-0` to allow flex children to shrink.
**Warning signs:** Page scrolls as a whole instead of panels scrolling independently. Content below the fold on 768px screens.

### Pitfall 4: Unit Context Not Available During SSR
**What goes wrong:** Components that call `useContext(UnitContext)` crash during server rendering because the provider depends on client state.
**Why it happens:** Next.js App Router renders components on the server by default. Context providers with client state must be marked `'use client'`.
**How to avoid:** Mark the UnitContext provider as `'use client'`. Ensure the default unit (imperial) is the SSR-rendered value to avoid hydration mismatch.
**Warning signs:** Hydration mismatch warnings in console. "Cannot read property of null" errors from context.

## Code Examples

### Theme Toggle Component
```tsx
// src/components/ui/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render placeholder to avoid hydration mismatch
    return <button className="w-9 h-9" aria-label="Toggle theme" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-lg
                 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100
                 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
}
```
Source: https://github.com/pacocoursey/next-themes

### Unit Toggle Component
```tsx
// src/components/ui/UnitToggle.tsx
'use client';

import { useUnits } from '@/contexts/UnitContext';

export function UnitToggle() {
  const { units, toggleUnits } = useUnits();

  return (
    <button
      onClick={toggleUnits}
      className="px-3 py-1.5 text-sm font-medium rounded-lg
                 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100
                 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label={`Switch to ${units === 'imperial' ? 'metric' : 'imperial'} units`}
    >
      {units === 'imperial' ? 'in' : 'mm'}
    </button>
  );
}
```

### Color Palette (Claude's Discretion)

Recommended slate/zinc neutrals with amber accent:

```css
/* Dark theme (default) */
/* Background layers: zinc-950 -> zinc-900 -> zinc-800 */
/* Text: zinc-100 (primary), zinc-400 (secondary) */
/* Borders: zinc-800 */
/* Accent: amber-500 (#f59e0b) for interactive elements */

/* Light theme */
/* Background layers: white -> zinc-50 -> zinc-100 */
/* Text: zinc-900 (primary), zinc-500 (secondary) */
/* Borders: zinc-200 */
/* Accent: amber-600 (#d97706) for better contrast on light */
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `darkMode: 'class'` | `@custom-variant dark` in CSS | Tailwind v4 (Jan 2025) | No JS config file needed. Dark mode config lives in CSS. |
| PostCSS-based Tailwind builds | Native CSS engine (Oxide) | Tailwind v4 (Jan 2025) | 5x faster builds, smaller output |
| `content: ['./src/**/*.tsx']` in config | Automatic content detection | Tailwind v4 (Jan 2025) | No content paths needed |
| `framer-motion` package name | `motion` package name | Late 2024 | Import from `motion/react` not `framer-motion` |

**Deprecated/outdated:**
- `tailwind.config.js` / `tailwind.config.ts`: Replaced by CSS-first `@theme` in v4. Do not create this file.
- `darkMode: 'class'` config option: Replaced by `@custom-variant dark` in CSS.

## Open Questions

1. **create-next-app Tailwind version**
   - What we know: `create-next-app@latest` scaffolds Tailwind but may default to v3 or v4 depending on the Next.js version
   - What's unclear: Whether Next.js 15 create-next-app defaults to Tailwind v4 automatically
   - Recommendation: After scaffolding, verify `tailwindcss` version in package.json. If v3, upgrade to v4 manually with `npm install tailwindcss@latest` and convert config to CSS-first format.

2. **SVG icon approach for sun/moon toggle**
   - What we know: No icon library allowed (no UI component libraries constraint)
   - What's unclear: Whether to inline SVG icons or use a lightweight icon utility
   - Recommendation: Inline SVG as React components. Sun and moon are simple shapes -- 10-15 lines of SVG each. No library needed.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` -- Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DES-01 | Dark theme default | manual-only | Visual verification -- theme provider sets `defaultTheme="dark"` | N/A |
| DES-02 | Theme toggle works | manual-only | Visual verification -- toggle switches between themes | N/A |
| DES-03 | Sidebar/main layout on desktop | manual-only | Visual verification -- layout renders correctly | N/A |
| DES-04 | Stacked layout on mobile | manual-only | Visual verification -- layout stacks below 768px | N/A |
| DES-05 | Responsive on tablet (768px+) | manual-only | Visual verification -- no horizontal scroll at 768px | N/A |
| UNIT-01 | Imperial display by default | unit | `npx vitest run src/lib/units.test.ts -t "default"` | No -- Wave 0 |
| UNIT-02 | Toggle between imperial/metric | unit | `npx vitest run src/lib/units.test.ts -t "toggle"` | No -- Wave 0 |
| UNIT-03 | Lossless unit conversion | unit | `npx vitest run src/lib/units.test.ts -t "precision"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration for Next.js project
- [ ] `src/lib/units.test.ts` -- Unit conversion and fraction formatting tests (covers UNIT-01, UNIT-02, UNIT-03)
- [ ] Framework install: `npm install -D vitest` -- if not already installed

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Dark Mode docs](https://tailwindcss.com/docs/dark-mode) -- `@custom-variant dark` syntax, class-based toggling
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) -- ThemeProvider API, FOUC prevention, App Router integration
- [Next.js Installation docs](https://nextjs.org/docs/app/getting-started/installation) -- create-next-app flags and defaults

### Secondary (MEDIUM confidence)
- [Implementing Dark Mode with Tailwind v4 and Next.js](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs) -- Integration pattern verified against official docs
- [Dark Mode in Next.js 15 with Tailwind v4](https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4) -- Latest method confirmation
- [Next.js Dark Mode Guide (BetterLink)](https://eastondev.com/blog/en/posts/dev/20251220-nextjs-dark-mode-guide/) -- Complete next-themes guide

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified against npm registry, official docs consulted
- Architecture: HIGH -- Patterns well-established for Next.js App Router + Tailwind v4 + next-themes
- Pitfalls: HIGH -- FOUC and floating-point issues are well-documented; fraction formatting is pure math
- Unit system: HIGH -- Internal mm storage is a locked project decision; conversion is straightforward arithmetic

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable technologies, 30-day validity)
