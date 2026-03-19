# Phase 1: Foundation & Design System - Research

**Researched:** 2026-03-19
**Domain:** Next.js App Router, Tailwind CSS v4 theming, responsive layout, unit conversion
**Confidence:** HIGH

## Summary

Phase 1 establishes the greenfield Next.js 16 project with Tailwind CSS v4, a dark/light theme system, responsive sidebar/main layout, and an imperial/metric unit conversion system. The tech stack is well-established and thoroughly documented -- Next.js 16.2.0 is stable with Turbopack as the default bundler, Tailwind CSS v4.2.2 uses a CSS-first configuration model with `@theme` directives, and `next-themes` 0.4.6 handles SSR-safe theme toggling.

The key architectural decisions are: (1) use `@theme inline` with CSS custom properties for semantic color tokens that switch between dark/light, (2) use `next-themes` with `attribute="class"` plus `@custom-variant dark` for Tailwind dark mode, (3) hand-roll the imperial fraction display (it is ~20 lines of code for 1/16" precision -- no library needed), and (4) store all dimensions internally in millimeters as floats.

**Primary recommendation:** Use `create-next-app@latest` for scaffolding (which creates a Next.js 16 project with Turbopack), `next-themes` for SSR-safe theme management, Tailwind v4 CSS-first config with semantic color tokens, and a custom `useUnits` hook for the mm-based unit system with imperial fraction formatting.

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
| DES-03 | Layout uses sidebar for inputs, main area for visualization | Flexbox layout with 320px fixed sidebar on desktop |
| DES-04 | On mobile/tablet, inputs stack above visualization | Column direction below 768px breakpoint (`md:` prefix) |
| DES-05 | App is responsive and usable on tablet (768px+) | Tailwind responsive utilities, independent scroll areas |
| UNIT-01 | App displays imperial units (inches) by default | Unit context defaults to `"imperial"`, fraction formatting utility |
| UNIT-02 | User can toggle between imperial and metric (mm) units | Unit toggle button in header, context-provided unit preference |
| UNIT-03 | Unit toggle converts all displayed values without losing precision | Internal mm storage (float), display-only conversion at UI boundary |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.0 | App framework (App Router) | Latest stable. Turbopack default, React 19.2, proxy.ts replaces middleware. |
| react | 19.2.4 | UI library | Ships with Next.js 16. View Transitions, useEffectEvent available. |
| react-dom | 19.2.4 | React DOM renderer | Ships with Next.js 16. |
| tailwindcss | 4.2.2 | Utility-first CSS | CSS-first config with @theme, @custom-variant. No JS config file. |
| @tailwindcss/postcss | 4.2.2 | PostCSS plugin for Tailwind v4 | Required for Next.js integration in v4. |
| typescript | 5.x | Type safety | Ships with create-next-app. Strict mode default. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | 0.4.6 | SSR-safe theme toggling | Handles FOUC prevention, localStorage, system preference. Supports React 19. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Custom ThemeProvider | next-themes handles SSR hydration mismatch, FOUC, localStorage persistence -- would take 50+ lines to hand-roll safely |
| Hand-rolled fraction formatting | footinch npm package | footinch is from 2018, unmaintained. Fraction formatting is ~20 lines of pure math. |
| Tailwind @theme inline tokens | CSS-only :root variables | @theme generates utility classes AND CSS vars; plain :root only gives vars |

**Installation:**
```bash
# Scaffold project (creates Next.js 16 with Turbopack, TypeScript, Tailwind v4)
npx create-next-app@latest cutlist-pro --typescript --tailwind --app --turbopack

# Phase 1 dependency
cd cutlist-pro
npm install next-themes
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider, UnitProvider
│   ├── page.tsx            # Main page with sidebar + visualization layout
│   └── globals.css         # Tailwind imports, @theme tokens, @custom-variant
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # App header with theme toggle + unit toggle
│   │   ├── Sidebar.tsx     # Left panel (empty shell for Phase 1)
│   │   └── MainArea.tsx    # Right visualization area (empty state for Phase 1)
│   └── ui/
│       ├── ThemeToggle.tsx  # Sun/moon icon button
│       └── UnitToggle.tsx   # Imperial/metric toggle
├── context/
│   └── UnitContext.tsx      # Unit system provider + hook
├── lib/
│   └── units.ts            # mm <-> inches conversion, fraction formatting
└── types/
    └── units.ts            # Unit type definitions
```

### Pattern 1: Theme System with Tailwind v4 + next-themes

**What:** CSS-first theming using `@theme inline` for semantic tokens, `@custom-variant dark` for Tailwind dark: prefix, and `next-themes` for SSR-safe toggling.

**When to use:** Always -- this is the foundation for all UI.

**CSS setup (globals.css):**
```css
@import "tailwindcss";

/* Enable class-based dark mode for next-themes */
@custom-variant dark (&:where(.dark, .dark *));

/* Semantic color tokens -- @theme inline generates utilities AND CSS vars */
@theme inline {
  --color-surface: var(--surface);
  --color-surface-alt: var(--surface-alt);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-border: var(--border);
}

/* Light theme values (set on :root) */
:root {
  --surface: #ffffff;
  --surface-alt: #f8fafc;       /* slate-50 */
  --text-primary: #0f172a;      /* slate-900 */
  --text-secondary: #64748b;    /* slate-500 */
  --accent: #d97706;            /* amber-600 */
  --accent-hover: #b45309;      /* amber-700 */
  --border: #e2e8f0;            /* slate-200 */
}

/* Dark theme values (activated by .dark class from next-themes) */
.dark {
  --surface: #0f172a;           /* slate-900 */
  --surface-alt: #1e293b;       /* slate-800 */
  --text-primary: #f1f5f9;      /* slate-100 */
  --text-secondary: #94a3b8;    /* slate-400 */
  --accent: #f59e0b;            /* amber-500 */
  --accent-hover: #fbbf24;      /* amber-400 */
  --border: #334155;            /* slate-700 */
}
```
Source: https://tailwindcss.com/docs/dark-mode, https://tailwindcss.com/docs/theme

**Usage in components (auto-generated utility classes):**
```tsx
<div className="bg-surface text-text-primary border-border">
  <span className="text-accent">Highlighted</span>
</div>
```

### Pattern 2: next-themes Integration with App Router

**What:** Wrap the app in `ThemeProvider` with `attribute="class"` so Tailwind's `dark:` variant and `.dark` CSS selector both activate.

**When to use:** Always -- root layout setup.

**Example:**
```tsx
// src/components/ThemeProvider.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// src/app/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import { UnitProvider } from "@/context/UnitContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface text-text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <UnitProvider>
            {children}
          </UnitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```
Source: https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4

### Pattern 3: Unit System with React Context

**What:** A React Context that holds the current display unit preference, with pure functions for conversion and formatting.

**When to use:** Any component that displays dimensions.

**Example:**
```typescript
// src/lib/units.ts
export type UnitSystem = "imperial" | "metric";

const MM_PER_INCH = 25.4;

/** Convert mm to inches */
export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

/** Convert inches to mm */
export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

/**
 * Format a mm value as a proper fraction string at 1/16" precision.
 * Examples: 400.05 mm -> "15-3/4"", 25.4 mm -> "1""
 */
export function formatImperial(mm: number): string {
  const totalInches = mm / MM_PER_INCH;
  const wholeInches = Math.floor(totalInches);
  const remainder = totalInches - wholeInches;
  const sixteenths = Math.round(remainder * 16);

  if (sixteenths === 0) {
    return `${wholeInches}"`;
  }
  if (sixteenths === 16) {
    return `${wholeInches + 1}"`;
  }

  // Simplify fraction: find GCD
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(sixteenths, 16);
  const num = sixteenths / divisor;
  const den = 16 / divisor;

  return wholeInches > 0
    ? `${wholeInches}-${num}/${den}"`
    : `${num}/${den}"`;
}

/** Format a mm value as metric display */
export function formatMetric(mm: number): string {
  return `${Math.round(mm * 10) / 10} mm`;
}

/** Format mm value in current unit system */
export function formatDimension(mm: number, unit: UnitSystem): string {
  return unit === "imperial" ? formatImperial(mm) : formatMetric(mm);
}

/** Parse user input (in current unit) to internal mm */
export function parseToMm(value: number, unit: UnitSystem): number {
  return unit === "imperial" ? inchesToMm(value) : value;
}
```

```tsx
// src/context/UnitContext.tsx
"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type UnitSystem, formatDimension, parseToMm } from "@/lib/units";

interface UnitContextValue {
  unit: UnitSystem;
  toggleUnit: () => void;
  formatValue: (mm: number) => string;
  toMm: (value: number) => number;
}

const UnitContext = createContext<UnitContextValue | null>(null);

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<UnitSystem>("imperial");

  const toggleUnit = useCallback(() => {
    setUnit((prev) => (prev === "imperial" ? "metric" : "imperial"));
  }, []);

  const formatValue = useCallback(
    (mm: number) => formatDimension(mm, unit),
    [unit]
  );

  const toMm = useCallback(
    (value: number) => parseToMm(value, unit),
    [unit]
  );

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, formatValue, toMm }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnits must be used within UnitProvider");
  return ctx;
}
```

### Pattern 4: Responsive Sidebar Layout

**What:** Flexbox layout with fixed sidebar on desktop, stacked on mobile.

**When to use:** The main app shell.

**Example:**
```tsx
export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <aside className="w-full md:w-80 md:flex-shrink-0 overflow-y-auto
                          border-b md:border-b-0 md:border-r border-border bg-surface">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto bg-surface-alt">
          <MainArea />
        </main>
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Using tailwind.config.js in v4:** Tailwind v4 uses CSS-first configuration. No JS config file.
- **Storing dimensions in inches internally:** Causes precision loss on repeated conversions. Always store in mm (float).
- **Rendering theme icons without mounted check:** `useTheme()` returns undefined on server. Always gate on `mounted` state to prevent hydration mismatch.
- **Using `dark:` utilities everywhere:** Define semantic tokens with CSS custom properties so elements automatically adapt. Reserve `dark:` prefix for exceptions only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme toggling with SSR | Custom ThemeProvider with useEffect + localStorage | `next-themes` (0.4.6) | Handles FOUC, hydration mismatch, localStorage, system preference -- at least 5 edge cases |
| Project scaffolding | Manual Next.js + Tailwind setup | `create-next-app@latest --tailwind` | Scaffolds correct v4 config, Turbopack, TypeScript automatically |
| Responsive breakpoints in JS | Custom media query listeners | Tailwind responsive prefixes (`md:`) | CSS-level responsive is simpler and more performant |

**Key insight:** The fraction formatter IS something to hand-roll. At ~20 lines of pure math with a GCD simplifier, it has zero edge cases beyond what the spec requires (1/16" precision). Adding a dependency (footinch, last updated 2022) for this is worse than owning the code.

## Common Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC) on Theme Load
**What goes wrong:** Page renders with wrong theme briefly before JavaScript hydrates.
**Why it happens:** Server renders HTML without knowing user's theme preference.
**How to avoid:** Use `next-themes` which injects a blocking `<script>` to set the theme class before paint. Pass `defaultTheme="dark"` since dark is our default.
**Warning signs:** Brief white flash on page load in dark mode.

### Pitfall 2: Tailwind v4 @theme vs :root Confusion
**What goes wrong:** CSS variables defined in `:root` don't generate utility classes.
**Why it happens:** Only `@theme` (or `@theme inline`) generates Tailwind utility classes. Plain `:root` only creates CSS variables.
**How to avoid:** Use `@theme inline` for variables that need utility classes (e.g., `bg-surface`). Use `:root` / `.dark` selectors for setting the underlying variable values that the @theme tokens reference.
**Warning signs:** `bg-surface` not recognized as a Tailwind class.

### Pitfall 3: Hydration Mismatch with Theme-Dependent Content
**What goes wrong:** React throws hydration errors because server and client render different theme states.
**Why it happens:** Server doesn't know the user's theme preference; client resolves it after mount.
**How to avoid:** Add `suppressHydrationWarning` to `<html>`. For components that render differently based on theme (like the sun/moon icon), use a `mounted` state guard.
**Warning signs:** Console errors about text content mismatch during hydration.

### Pitfall 4: Fraction Display Rounding Errors
**What goes wrong:** Values like 15.999... display as "16/16" instead of rounding up to the next whole inch.
**Why it happens:** Floating point arithmetic edge cases at fraction boundaries.
**How to avoid:** Handle the `sixteenths === 16` case explicitly by incrementing the whole number. Handle `sixteenths === 0` explicitly. Test boundary values thoroughly.
**Warning signs:** Fractions with numerator equal to denominator appearing in the UI.

### Pitfall 5: Independent Scroll Areas Breaking on Mobile
**What goes wrong:** On mobile, both sidebar and main area try to scroll independently, causing janky behavior.
**Why it happens:** `overflow-y-auto` on both containers when they are stacked vertically needs careful height management.
**How to avoid:** On mobile, the parent uses `flex-col` and `overflow-hidden`. Each child gets `overflow-y-auto`. The `h-screen` on the outermost container constrains total height so flex children know their bounds.
**Warning signs:** Double scrollbars or inability to scroll on mobile.

### Pitfall 6: Next.js 16 Breaking Changes
**What goes wrong:** Old patterns from Next.js 15 tutorials fail silently or error.
**Why it happens:** Next.js 16 made several breaking changes from 15.
**How to avoid:** Key changes to remember: (1) `params` and `searchParams` must be awaited (`await params`), (2) `middleware.ts` is deprecated in favor of `proxy.ts`, (3) `next lint` command removed -- use ESLint directly, (4) Turbopack is the default bundler.
**Warning signs:** Build errors about sync access to params, deprecation warnings about middleware.

## Code Examples

### Theme Toggle Component (with hydration safety)
```tsx
// src/components/ui/ThemeToggle.tsx
"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render same-size placeholder to avoid layout shift
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
```
Source: https://tailwindcss.com/docs/dark-mode, next-themes docs

### Unit Toggle Component
```tsx
// src/components/ui/UnitToggle.tsx
"use client";
import { useUnits } from "@/context/UnitContext";

export function UnitToggle() {
  const { unit, toggleUnit } = useUnits();

  return (
    <button
      onClick={toggleUnit}
      className="px-3 py-1.5 text-sm font-medium rounded-lg
                 hover:bg-surface-alt transition-colors"
      aria-label={`Switch to ${unit === "imperial" ? "metric" : "imperial"} units`}
    >
      {unit === "imperial" ? "in" : "mm"}
    </button>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | CSS-first @theme directive | Tailwind v4 (Jan 2025) | No JS config file needed; all in CSS |
| darkMode: "class" in config | @custom-variant dark in CSS | Tailwind v4 (Jan 2025) | Dark mode configured in CSS, not JS |
| Next.js 15 webpack (opt-in Turbopack) | Next.js 16 Turbopack (default) | Oct 2025 | 2-5x faster builds, 10x faster HMR |
| middleware.ts | proxy.ts | Next.js 16 (Oct 2025) | Renamed for clarity; middleware deprecated |
| React 18 | React 19.2 | With Next.js 16 | View Transitions, useEffectEvent, Activity |
| sync params/searchParams | async params/searchParams | Next.js 16 (Oct 2025) | Must await params in page/layout components |

**Deprecated/outdated:**
- `tailwind.config.js` / `tailwind.config.ts`: v3 pattern. Tailwind v4 uses CSS-first `@theme` directives.
- `darkMode: "class"` in JS config: Replaced by `@custom-variant dark` in CSS.
- `middleware.ts`: Deprecated in Next.js 16, renamed to `proxy.ts`.
- `next lint` command: Removed in Next.js 16. Use ESLint directly.
- Sync access to `params`, `searchParams`, `cookies()`, `headers()`: Must use `await` in Next.js 16.

## Open Questions

1. **Exact amber/slate shade palette values**
   - What we know: User wants slate/zinc neutrals with amber accent, dark theme default
   - What's unclear: Exact values may need tuning for contrast ratios and visual appeal
   - Recommendation: Start with the values in Pattern 1 CSS example (slate + amber from Tailwind default palette). This is in Claude's Discretion area -- adjust during implementation.

2. **Sun/moon icon source**
   - What we know: Need sun and moon SVG icons for theme toggle
   - What's unclear: Exact icon design
   - Recommendation: Use inline SVG as shown in code examples. Two simple Heroicons-style paths. No icon library needed for 2 icons.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | None -- Wave 0 creates vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DES-01 | Dark theme renders by default | unit | `npx vitest run src/__tests__/theme.test.tsx -t "dark default"` | No -- Wave 0 |
| DES-02 | Theme toggle switches dark/light | unit | `npx vitest run src/__tests__/theme.test.tsx -t "toggle"` | No -- Wave 0 |
| DES-03 | Sidebar + main layout renders | unit | `npx vitest run src/__tests__/layout.test.tsx -t "sidebar"` | No -- Wave 0 |
| DES-04 | Stacked layout at mobile breakpoint | manual-only | Visual inspection at 768px -- CSS responsive, not testable in jsdom | N/A |
| DES-05 | Usable at 768px width | manual-only | Visual inspection at 768px | N/A |
| UNIT-01 | Imperial display by default | unit | `npx vitest run src/__tests__/units.test.ts -t "imperial default"` | No -- Wave 0 |
| UNIT-02 | Unit toggle switches imperial/metric | unit | `npx vitest run src/__tests__/units.test.ts -t "toggle"` | No -- Wave 0 |
| UNIT-03 | Conversion preserves precision | unit | `npx vitest run src/__tests__/units.test.ts -t "precision"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration with jsdom environment and @vitejs/plugin-react
- [ ] `src/setupTests.ts` -- Import @testing-library/jest-dom
- [ ] `src/__tests__/units.test.ts` -- Unit conversion and fraction formatting tests (covers UNIT-01, UNIT-02, UNIT-03)
- [ ] `src/__tests__/theme.test.tsx` -- Theme provider and toggle tests (covers DES-01, DES-02)
- [ ] `src/__tests__/layout.test.tsx` -- Layout structure tests (covers DES-03)
- [ ] Dev dependencies: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom`

## Sources

### Primary (HIGH confidence)
- [Next.js 16 blog post](https://nextjs.org/blog/next-16) -- Breaking changes, new features, React 19.2
- [Tailwind CSS dark mode docs](https://tailwindcss.com/docs/dark-mode) -- @custom-variant syntax, class toggling
- [Tailwind CSS theme variables docs](https://tailwindcss.com/docs/theme) -- @theme directive, @theme inline, CSS variable naming
- [Next.js testing guide (Vitest)](https://nextjs.org/docs/app/guides/testing/vitest) -- Official Vitest setup for App Router
- npm registry -- Verified versions: next@16.2.0, tailwindcss@4.2.2, react@19.2.4, next-themes@0.4.6, vitest@4.1.0, @testing-library/react@16.3.2

### Secondary (MEDIUM confidence)
- [Tailwind v4 theming best practices discussion](https://github.com/tailwindlabs/tailwindcss/discussions/18471) -- @theme inline pattern for semantic tokens
- [Dark mode with Tailwind v4 and Next.js](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs) -- ThemeProvider implementation pattern
- [Dark mode Next.js 15 Tailwind v4 guide](https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4) -- next-themes + @custom-variant integration (applies to Next.js 16 as well)

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All versions verified against npm registry, Next.js 16 blog post confirms compatibility
- Architecture: HIGH -- Patterns verified from official Tailwind docs and community best practices
- Pitfalls: HIGH -- FOUC, hydration mismatch, and floating-point issues are well-documented
- Unit system: HIGH -- Simple math, well-understood domain (woodworking 1/16" precision), locked project decision

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable stack, no fast-moving dependencies)
