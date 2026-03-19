# Technology Stack

**Project:** CutList Pro - Woodworking Cut Optimizer
**Researched:** 2026-03-19
**Overall Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.5.x (stable) | React framework, routing, deployment | Production-proven on Vercel. v16 is available but v15.5 is the safer choice for a new greenfield project shipping fast -- v16 has breaking changes (removed AMP, runtime configs, enforced async accessors) that add migration risk with no upside for a client-side-only app. Turbopack dev is stable on 15.5. | HIGH |
| React | 19.x | UI library | Ships with Next.js 15.5. React 19 gives us `use()`, improved Suspense, and better hydration -- all stable. | HIGH |
| TypeScript | 5.x | Type safety | Non-negotiable for any production app. Next.js has first-class TS support. Catches dimension/unit bugs at compile time. | HIGH |

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.2.x | Utility-first CSS | Per PROJECT.md constraints. v4.2 (released Feb 2026) has new Vite plugin, 5x faster builds, CSS-first config via `@theme`. Zero-config with Next.js. Dark mode via `dark:` variant makes the dark-theme-default requirement trivial. | HIGH |

### Visualization & Animation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Native SVG + React | - | Cut layout rendering | PROJECT.md specifies SVG. Native SVG in React gives full control over every rect, text label, and pattern. No abstraction layer to fight. SVG scales perfectly for print export. | HIGH |
| Motion (formerly Framer Motion) | 12.x | SVG animation | The `motion` package (renamed from `framer-motion`) is the standard React animation library. 120fps via Web Animations API with spring physics fallback. `motion.rect` and `motion.g` animate SVG elements directly. `AnimatePresence` handles enter/exit animations for the "pieces slide into place" hero moment. 12.x has no breaking changes from 11.x. | HIGH |
| Custom pan/zoom | - | SVG pan and zoom | Do NOT use `react-svg-pan-zoom` (last meaningful update 2022, 23K weekly downloads is low). Instead, implement pan/zoom with pointer events + CSS transforms -- it is ~50 lines of code for a custom hook, gives full control, and avoids a dependency that may conflict with Motion animations. | MEDIUM |

### Algorithm

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Custom guillotine packer | - | Bin-packing optimization | Write this from scratch. The npm options (`guillotine-packer` last published 5 years ago, `rectangle-packer` limited docs) are undermaintained and none support kerf width or grain direction -- both core requirements. The guillotine algorithm is well-documented in academic literature and straightforward to implement: recursively split free rectangles after each placement. A custom implementation gives us kerf subtraction, grain-direction constraints, and rotation control. ~200-400 lines of TypeScript. | HIGH |

### URL State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| nuqs | latest | Type-safe URL query state | Purpose-built for Next.js URL state. Used by Vercel, Sentry, Supabase. `useQueryStates` manages multiple keys atomically. Built-in parsers for numbers, strings, arrays. 6 kB gzipped. Featured at Next.js Conf 2025. This replaces the need for manual `searchParams` wrangling. | HIGH |
| lz-string | 1.5.x | URL compression | `compressToEncodedURIComponent` compresses JSON state for URL sharing. A cut list with 20 pieces on 5 boards compresses from ~2KB to ~400 chars -- well within URL limits. Mature (1.2M weekly downloads), zero dependencies, tiny. Combine with nuqs: nuqs manages the query param, lz-string compresses the value. | HIGH |

### Export

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| html-to-image | latest | PNG export | `toPng()` renders any DOM node (including SVG) to a PNG blob. More reliable than html2canvas for SVG content because it uses `foreignObject` rendering. Works client-side. For print-friendly view, use `@media print` CSS + `window.print()` -- no library needed. | MEDIUM |

### Dev Tooling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | 9.x | Linting | Flat config format. Ships with `create-next-app`. | HIGH |
| Prettier | 3.x | Code formatting | Consistent style. `prettier-plugin-tailwindcss` auto-sorts Tailwind classes. | HIGH |
| Vitest | 2.x | Unit testing | Fast, Vite-native test runner. Essential for testing the bin-packing algorithm with edge cases (kerf, grain, rotation). Jest works too but Vitest is faster and simpler to configure. | MEDIUM |

## What NOT to Use

| Technology | Why Not | Use Instead |
|------------|---------|-------------|
| shadcn/ui, Radix, any component library | PROJECT.md explicitly says "no external UI component libraries." Bundle size matters, full design control needed. | Native HTML + Tailwind. Build your own input components. |
| D3.js | Massive overkill. D3's DOM manipulation model fights React's declarative model. You only need rectangles and text in SVG. | Native SVG elements in JSX (`<rect>`, `<text>`, `<g>`) |
| Canvas API | Not scalable for print, harder to animate, no native text rendering, can't do hover tooltips without reimplementing hit detection. | SVG |
| react-svg-pan-zoom | Last meaningful update 2022. Adds DOM wrapping that may conflict with Motion animations. | Custom pointer-event hook (~50 LOC) |
| guillotine-packer (npm) | Last published 5 years ago. No kerf support. No grain direction. No TypeScript types. | Custom implementation |
| Zustand / Redux / Jotai | Unnecessary complexity for this app. State is simple: boards array, pieces array, settings object, optimization result. React context + `useReducer` is sufficient. URL is the persistence layer via nuqs. | React Context + useReducer + nuqs |
| Next.js 16 | Breaking changes (removed APIs, enforced async accessors) add risk. No features this app needs that 15.5 lacks. Turbopack dev is already stable on 15.5. | Next.js 15.5.x |
| Framer Motion (package name) | Renamed to `motion`. The `framer-motion` npm package still works but `motion` is the maintained name going forward. | `npm install motion` |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15.5 | Vite + React SPA | Next.js gives us file-based routing, automatic code splitting, and one-click Vercel deploy. Since there is no backend, SPA would work -- but Next.js adds zero overhead and simplifies deployment. |
| Framework | Next.js 15.5 | Next.js 16 | v16 is stable but has breaking changes. v15.5 is battle-tested and has all features this app needs. Upgrade later when ecosystem fully settles. |
| Animation | Motion 12.x | React Spring | Motion has better SVG support, simpler API for layout animations, and `AnimatePresence` for the enter/exit hero animation. React Spring is lower-level. |
| Animation | Motion 12.x | CSS animations/transitions | CSS can handle simple fades but not spring physics, staggered animations, or layout transitions. The "pieces sliding into place" effect needs Motion. |
| State | nuqs + lz-string | Manual URL params | nuqs handles Next.js router integration, type parsing, and history management. Manual implementation is error-prone and ~200 LOC to replicate what nuqs gives you. |
| Export | html-to-image | html2canvas | html2canvas struggles with SVG `foreignObject` and CSS custom properties (Tailwind v4 uses them heavily). html-to-image handles both correctly. |

## Installation

```bash
# Create project
npx create-next-app@latest cutlist-pro --typescript --tailwind --app --src-dir

# Core dependencies
npm install motion nuqs lz-string html-to-image

# Dev dependencies
npm install -D vitest @testing-library/react prettier prettier-plugin-tailwindcss
```

## Stack Architecture Summary

```
User Input (forms)
    |
    v
React State (useReducer + Context)
    |
    +--> nuqs (sync to URL) --> lz-string (compress for sharing)
    |
    v
Guillotine Packer (custom algorithm)
    |
    v
SVG Visualization (native React SVG + Motion animations)
    |
    +--> html-to-image (PNG export)
    +--> @media print (print view)
```

**Total additional dependencies: 4** (`motion`, `nuqs`, `lz-string`, `html-to-image`)
**Total dev dependencies: 3** (`vitest`, `@testing-library/react`, `prettier-plugin-tailwindcss`)

This is a deliberately minimal dependency footprint. The app's complexity lives in the algorithm and visualization -- both custom code, not library wrappers.

## Sources

- [Next.js 16 announcement](https://nextjs.org/blog/next-16) - Used to evaluate v15 vs v16 tradeoffs
- [Next.js 15 vs 16 comparison](https://www.descope.com/blog/post/nextjs15-vs-nextjs16) - Breaking changes analysis
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) - v4 architecture and features
- [Tailwind CSS v4.2 release](https://medium.com/codex/tailwindcss-v4-2-is-out-4-new-colors-official-webpack-plugin-and-complete-logical-properties-9116753d6c7e) - Latest patch version
- [Motion (Framer Motion) docs](https://motion.dev/) - Package rename, v12.x features
- [Motion upgrade guide](https://motion.dev/docs/react-upgrade-guide) - No breaking changes in v12
- [nuqs official site](https://nuqs.dev) - URL state management for Next.js
- [nuqs at React Advanced 2025](https://www.infoq.com/news/2025/12/nuqs-react-advanced/) - Production adoption by Vercel, Sentry
- [nuqs at Next.js Conf 2025](https://nextjs.org/conf/session/type-safe-url-state-in-nextjs-with-nuqs) - Official Next.js ecosystem endorsement
- [lz-string npm](https://www.npmjs.com/package/lz-string) - URL-safe compression
- [guillotine-packer npm](https://www.npmjs.com/package/guillotine-packer) - Evaluated and rejected (stale, no kerf)
- [rectangle-packer npm](https://www.npmjs.com/package/rectangle-packer) - Evaluated as alternative
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image) - PNG export approach
- [react-svg-pan-zoom GitHub](https://github.com/chrvadala/react-svg-pan-zoom) - Evaluated and rejected
