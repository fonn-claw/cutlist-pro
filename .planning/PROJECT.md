# CutList Pro

## What This Is

A web app that helps woodworkers optimize how they cut pieces from available stock boards. Users enter their boards and needed pieces, the app calculates optimal layouts using guillotine bin-packing, and displays a beautiful animated SVG visualization showing how everything fits — minimizing waste and saving money.

## Core Value

The animated cut layout visualization must clearly show optimized piece placement on boards, making it immediately obvious how to cut each board with minimal waste.

## Requirements

### Validated

- ✓ Add stock boards with dimensions (length × width) and quantity — Phase 2
- ✓ Common board presets (4×8 plywood, 1×6 board, etc.) — Phase 2
- ✓ Support imperial (inches, default) and metric (mm) units with toggle — Phase 1
- ✓ Add cut pieces with dimensions, quantity, and optional label — Phase 3
- ✓ Color assignment per piece type (auto or manual) — Phase 3
- ✓ Quick-add: paste a list or duplicate entries — Phase 3
- ✓ Guillotine cut bin-packing optimization algorithm — Phase 4
- ✓ Configurable kerf (blade width) setting — Phase 4
- ✓ Grain direction option for pieces — Phase 4
- ✓ SVG visualization with color-coded, labeled pieces on boards — Phase 5
- ✓ Waste areas shown in distinct pattern/color — Phase 5
- ✓ Hover tooltips showing piece dimensions and label — Phase 5
- ✓ Zoom and pan on large layouts — Phase 5
- ✓ Dark theme by default with light theme toggle — Phase 1
- ✓ Responsive design — must work on tablet — Phase 1

### Active

- [ ] Animated optimization — pieces slide/fade into place
- [ ] Summary dashboard: boards needed, waste %, cost estimate, per-board breakdown
- [ ] Export as PNG
- [ ] Print-friendly view
- [ ] Share via URL (encode state in URL)

### Out of Scope

- User accounts / authentication — 100% client-side, no backend
- Database / server storage — state lives in URL
- Payment processing — free tool
- 3D visualization — 2D SVG is sufficient
- Non-rectangular cuts — guillotine cuts only (straight through-cuts)
- Mobile-first design — responsive but tablet is the floor

## Context

- Target audience: 5M+ woodworkers on Reddit, plus carpenters, cabinet makers, DIY builders
- Current alternatives are clunky desktop software from the 2000s or expensive paid tools
- Wood is expensive — bad cutting plans waste 20-30%, optimized plans cut waste to under 10%
- For a $500 lumber project, optimization saves $100+
- The animated visualization is the hero moment — designed to look great in a 15-second demo video
- Workshop use case means dark theme matters (screen glare) and tablet support is essential

## Constraints

- **Tech stack**: Next.js App Router, Tailwind CSS, SVG — no external UI component libraries
- **Architecture**: 100% client-side, no backend, no database, no auth
- **Deployment**: Vercel
- **Algorithm**: Guillotine cuts only (straight through-cuts) — reflects real woodworking constraints
- **Design**: Dark theme default, clean modern UI — not typical ugly woodworking software
- **Units**: Imperial default, metric toggle

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router + Tailwind | Modern React stack, fast dev, easy Vercel deploy | — Pending |
| No UI component libraries | Keep bundle small, full design control | — Pending |
| SVG for visualization | Native browser support, scalable, animatable | — Pending |
| Guillotine cuts only | Reflects real constraint — woodworkers can only make straight through-cuts | — Pending |
| Dark theme default | Workshop-friendly, reduces screen glare, looks great in screenshots | — Pending |
| Imperial units default | Primary US woodworker audience | — Pending |
| State in URL for sharing | No backend needed, simple sharing mechanism | — Pending |
| Client-side only | Zero infrastructure cost, privacy, works offline | — Pending |
| Sidebar inputs + main visualization | Standard tool layout, efficient screen usage | — Pending |
| Stack inputs above viz on mobile | Natural reading flow on narrow screens | — Pending |

---
*Last updated: 2026-03-19 after Phase 5*
