# Feature Research

**Domain:** Woodworking Cut List Optimization (Web App)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Stock board input with dimensions and quantity | Every competitor has this. It is the fundamental input. | LOW | Length x width, quantity. Support both sheet goods (plywood) and dimensional lumber. |
| Cut piece input with dimensions, quantity, label | The other half of the core input. Users need to specify what they want cut. | LOW | Label is important for identifying pieces in the layout. |
| Common board presets | Users expect 4x8 plywood, standard lumber sizes. Typing "96 x 48" every time is friction. | LOW | Maintain a preset library: 4x8, 4x4 plywood, standard lumber (1x4, 1x6, 2x4, etc.). |
| Kerf (blade width) setting | Every serious optimizer accounts for saw blade thickness. Without it, cuts don't fit in reality. | LOW | Default to 1/8" (3.175mm). Must be configurable. |
| Guillotine-cut bin packing algorithm | The core optimization. Must produce good layouts using only straight through-cuts. | HIGH | This is the hardest technical piece. Competitors use various algorithms (genetic, heuristic). Quality of optimization is a key differentiator even though having *an* optimizer is table stakes. |
| Visual cutting diagram | Users need to see where each piece goes on each board. Every competitor shows this. | MEDIUM | Color-coded, labeled pieces on board outlines. This is the minimum visual output. |
| Waste percentage display | Users want to know how efficient the layout is. Every competitor shows this. | LOW | Per-board and total waste percentage. |
| Board count summary | "How many boards do I need to buy?" is the primary question users want answered. | LOW | Total boards required, broken down by stock type. |
| Grain direction support | Woodworkers frequently need grain to run a specific direction. Competitors support this. | MEDIUM | Pieces marked "with grain" should not be rotated. Affects optimization algorithm. |
| Unit support (imperial and metric) | US woodworkers use inches/fractions, international users use mm. Both audiences exist. | MEDIUM | Imperial default (US audience). Toggle to metric. Conversion must be accurate. |
| PDF or image export | Users take the diagram to the workshop. They need a printable/saveable output. | MEDIUM | PNG export is fine. PDF is better for print but more complex to implement. |
| Print-friendly view | Same workshop use case. Users print the layout and take it to the saw. | MEDIUM | Simplified layout optimized for paper, high contrast, clear labels. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Animated optimization visualization | No competitor does this. Pieces sliding/fading into place is the "hero moment" that makes demo videos compelling and the tool memorable. | HIGH | SVG animation with choreographed piece placement. This is CutList Pro's signature feature and the reason people share it. |
| Modern, polished dark-theme UI | Every existing tool looks like it was built in 2005. A clean, modern interface instantly signals quality and trustworthiness. | MEDIUM | Dark theme default (workshop glare), Tailwind-based design system. The visual gap between this and competitors is massive. |
| Share via URL (stateless) | No backend needed. Users can share their cut lists by copying a URL. Competitors require accounts or file exports. | MEDIUM | Encode full state in URL params. Enables sharing without accounts, bookmarking projects, and collaboration. |
| 100% client-side / no account required | Zero friction to start using. No signup, no login, no data stored on servers. Privacy-friendly. Most competitors require accounts for any real usage. | LOW | Architecture decision, not a feature to build per se. But it is a strong differentiator in marketing. |
| Hover tooltips with piece details | Interactive exploration of the layout. Competitors show static diagrams. | LOW | Show dimensions, label, and piece number on hover. Makes large layouts navigable. |
| Zoom and pan on layouts | Large projects (50+ pieces, 10+ boards) need spatial navigation. Most web competitors lack this. | MEDIUM | SVG viewport manipulation. Essential for large projects but not needed for simple ones. |
| Cost estimate with per-board pricing | Answers "how much will this project cost?" directly. Some competitors have this, but most free tools do not. | LOW | Optional price-per-board input, total cost calculation, cost-of-waste display. |
| Quick-add / paste list | Importing a cut list from a spreadsheet or text is faster than entering pieces one by one. Few competitors support this. | MEDIUM | Parse pasted text (tab or comma separated) into piece entries. Huge UX win for large projects. |
| Color assignment per piece type | Visual grouping in the diagram. Auto-assign colors but allow manual override. | LOW | Distinct colors per piece label/type. Auto-generation with manual override. |
| Tablet-optimized responsive design | Workshop use case: users bring a tablet to the shop. Most competitors are desktop-only or have poor mobile/tablet layouts. | MEDIUM | Touch-friendly inputs, readable diagrams on 10" screens. Not phone-optimized, but tablet is essential. |
| Instant optimization (no server round-trip) | Client-side computation means results appear instantly. Competitors with server-based optimization add latency and often have calculation limits. | LOW | Architecture advantage. No rate limits, no "5 calculations per day" restrictions. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User accounts and cloud storage | "Save my projects" is a natural request. | Adds backend complexity, auth, database, GDPR concerns, ongoing server costs. Violates the 100% client-side architecture constraint. | URL-encoded state for sharing. Browser localStorage for recent projects. Both are zero-backend. |
| 3D visualization | "Show me what the finished project looks like." | Massive scope increase. 3D rendering is a completely different domain. Not what a cut optimizer does. | Keep 2D SVG. Link out to SketchUp/Fusion360 for 3D design. |
| Non-rectangular / irregular cuts | "I need to cut triangles / curves / custom shapes." | Guillotine-only constraint reflects real woodworking. Irregular shapes require completely different algorithms and UI. | Explicitly scope to rectangular guillotine cuts. This covers 95%+ of real woodworking projects. |
| CNC machine integration / G-code export | "Send the cut plan to my CNC router." | Tiny audience (hobbyist CNC owners), massive complexity (machine specs, toolpath generation, safety). | Out of scope. CNC users have dedicated CAM software. |
| Edge banding support | Professional cabinet makers want edge banding calculations. | Adds UI complexity (per-edge settings on every piece), complicates the algorithm, and narrows the audience to cabinet makers. | Omit for v1. If demand is clear, add as an advanced option later. Keep core UI clean. |
| SketchUp / CAD import | "Import my model and generate a cut list automatically." | File format parsing, 3D-to-2D conversion, component extraction. Huge scope, fragile, version-dependent. | Manual input with quick-add/paste. Users can export dimensions from CAD and paste them in. |
| Material/wood species database | "Include prices for oak, maple, walnut, etc." | Prices vary by region, supplier, and season. A database would be immediately stale. | Let users enter their own price per board. Simple, always accurate. |
| Mobile-first design (phone) | "I want to use this on my phone." | Cut diagrams are inherently spatial. Phone screens cannot display useful layouts. Input forms are cramped. | Tablet is the floor. Responsive down to ~768px. Phone users get a degraded but functional experience for input only. |
| Offcut/remnant management | "Track my leftover pieces for future projects." | Requires persistent state (inventory tracking), which conflicts with stateless URL architecture. Adds significant data model complexity. | Show offcut dimensions in the summary so users can manually note them. |
| Multi-material optimization in one run | "Optimize across plywood AND lumber simultaneously." | Different stock dimensions, different constraints, confusing combined output. | Run separate optimizations per material type. Simpler UI, clearer results. |

## Feature Dependencies

```
[Board Input] ──required-by──> [Optimization Algorithm]
[Cut Piece Input] ──required-by──> [Optimization Algorithm]
[Kerf Setting] ──required-by──> [Optimization Algorithm]
[Grain Direction] ──required-by──> [Optimization Algorithm]

[Optimization Algorithm] ──required-by──> [Visual Cutting Diagram]
[Optimization Algorithm] ──required-by──> [Waste/Board Summary]
[Optimization Algorithm] ──required-by──> [Cost Estimate]

[Visual Cutting Diagram] ──required-by──> [Animated Visualization]
[Visual Cutting Diagram] ──required-by──> [Hover Tooltips]
[Visual Cutting Diagram] ──required-by──> [Zoom and Pan]
[Visual Cutting Diagram] ──required-by──> [PNG Export]
[Visual Cutting Diagram] ──required-by──> [Print View]

[Color Assignment] ──enhances──> [Visual Cutting Diagram]
[Board Presets] ──enhances──> [Board Input]
[Quick-Add / Paste] ──enhances──> [Cut Piece Input]
[Unit Toggle] ──enhances──> [Board Input]
[Unit Toggle] ──enhances──> [Cut Piece Input]

[All State] ──required-by──> [Share via URL]
```

### Dependency Notes

- **Optimization Algorithm requires all inputs:** Board dimensions, cut piece dimensions, kerf, and grain direction all feed the algorithm. Inputs must be built first.
- **Visual Cutting Diagram requires algorithm output:** Cannot render until optimization produces a layout. The diagram is the primary output consumers.
- **Animated Visualization requires static diagram first:** Build the static SVG layout, then layer animation on top. Do not attempt animation before static rendering works.
- **Export/Print require the diagram:** PNG export and print view are transformations of the visual diagram. Build the diagram first.
- **URL sharing requires all state to be serializable:** Every input and setting must be encodable to URL parameters. Design the data model with serialization in mind from the start.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate the concept.

- [ ] Stock board input (dimensions, quantity, presets) -- core input
- [ ] Cut piece input (dimensions, quantity, label) -- core input
- [ ] Kerf setting -- required for real-world accuracy
- [ ] Imperial/metric unit toggle -- both audiences need this
- [ ] Guillotine bin-packing optimization -- the core value
- [ ] Static SVG cutting diagram (color-coded, labeled) -- primary output
- [ ] Waste percentage and board count summary -- key metrics
- [ ] Dark theme UI -- workshop use case, brand identity
- [ ] Responsive layout (tablet support) -- workshop use case

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Animated optimization visualization -- the "hero moment" for demos and sharing
- [ ] Grain direction support -- important for real projects but adds algorithm complexity
- [ ] Hover tooltips on pieces -- interactive exploration
- [ ] Zoom and pan -- needed for large projects
- [ ] Share via URL -- enables viral sharing, no backend
- [ ] PNG export -- take to workshop
- [ ] Print-friendly view -- take to workshop
- [ ] Cost estimate dashboard -- "how much will this cost?"
- [ ] Color assignment (auto + manual override) -- visual polish
- [ ] Quick-add / paste list -- power user feature
- [ ] Board presets library -- convenience feature
- [ ] Light theme toggle -- some users prefer light

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Edge banding support -- only if cabinet maker audience demands it
- [ ] Offcut summary with dimensions -- helps users track leftover wood
- [ ] localStorage for recent projects -- persist state without backend
- [ ] Undo/redo for input changes -- quality of life
- [ ] Manual piece rearrangement (drag pieces post-optimization) -- power users want this per competitor feedback
- [ ] CSV/spreadsheet import -- bulk project input
- [ ] Multiple optimization strategies (minimize waste vs. minimize boards vs. minimize cost) -- different priorities for different users

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Board input (dimensions, qty) | HIGH | LOW | P1 |
| Cut piece input (dimensions, qty, label) | HIGH | LOW | P1 |
| Kerf setting | HIGH | LOW | P1 |
| Guillotine bin-packing algorithm | HIGH | HIGH | P1 |
| Static SVG cutting diagram | HIGH | MEDIUM | P1 |
| Waste % and board count summary | HIGH | LOW | P1 |
| Dark theme UI | MEDIUM | LOW | P1 |
| Responsive/tablet layout | MEDIUM | MEDIUM | P1 |
| Unit toggle (imperial/metric) | MEDIUM | MEDIUM | P1 |
| Animated visualization | HIGH | HIGH | P2 |
| Grain direction | HIGH | MEDIUM | P2 |
| Share via URL | HIGH | MEDIUM | P2 |
| Hover tooltips | MEDIUM | LOW | P2 |
| Zoom and pan | MEDIUM | MEDIUM | P2 |
| PNG export | MEDIUM | LOW | P2 |
| Print view | MEDIUM | MEDIUM | P2 |
| Cost estimate | MEDIUM | LOW | P2 |
| Board presets | MEDIUM | LOW | P2 |
| Quick-add / paste | MEDIUM | MEDIUM | P2 |
| Color customization | LOW | LOW | P2 |
| Light theme toggle | LOW | LOW | P2 |
| Edge banding | LOW | HIGH | P3 |
| Manual rearrangement | MEDIUM | HIGH | P3 |
| localStorage persistence | LOW | LOW | P3 |
| CSV import | LOW | MEDIUM | P3 |
| Multiple optimization strategies | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | CutList Optimizer (web) | OptiCutter (web) | MaxCut (desktop) | CutList Pro (ours) |
|---------|-------------------------|------------------|-------------------|-------------------|
| Free tier | Limited (5 projects, 5 daily calcs) | Fully free | One-time purchase $45-150 | Fully free, no limits |
| Account required | Yes (for saves) | No | N/A (desktop) | No -- stateless |
| Grain direction | Yes | Yes | Yes | Yes (P2) |
| Kerf compensation | Yes | Yes | Yes | Yes (P1) |
| Edge banding | Yes | Yes | Yes | No (anti-feature for v1) |
| Visual diagram | Static, clear labeling | Static | Static, color-coded | Animated SVG (differentiator) |
| Export | PDF | PDF, CSV | Print | PNG, print view |
| Cost tracking | No | Yes (basic) | Yes (advanced) | Yes (basic, P2) |
| Unit support | Metric + imperial | Multiple formats | Metric + imperial | Imperial default + metric |
| UI quality | Functional, dated | Clean, modern-ish | Desktop app, feature-heavy | Modern dark theme (differentiator) |
| Mobile/tablet | Responsive | Responsive | Desktop only | Tablet-optimized |
| Share/collaborate | Requires account | No | File export | URL sharing (differentiator) |
| Offline capable | No (web) | No (web) | Yes (desktop) | Yes (client-side, no server needed) |
| Algorithm quality | Good | Good | Best (per benchmarks) | TBD -- must be competitive |
| Manual rearrangement | No | No | Yes | Future (P3) |

### Competitor Insights

1. **Algorithm quality matters:** In benchmarks, MaxCut used 10 sheets where web competitors used 12 for the same project. A 20% difference in material usage is significant when plywood costs $100+ per sheet. The optimization algorithm must be competitive.

2. **No competitor has animated visualization.** Every tool produces static diagrams. This is CutList Pro's clearest differentiator.

3. **Free web tools have artificial limits.** CutList Optimizer restricts free users to 5 projects and 5 daily calculations. Being fully free with no limits is a competitive advantage.

4. **UI quality is universally low.** Even the "better" tools (OptiCutter) look dated. A modern, polished dark-theme UI with smooth interactions will stand out immediately.

5. **URL sharing is novel.** No competitor offers stateless URL sharing. Most require accounts to save/share. This enables viral distribution.

## Sources

- [CutList Optimizer](https://www.cutlistoptimizer.com/) -- web-based optimizer, Bronze/Silver/Gold tiers
- [OptiCutter](https://www.opticutter.com/cut-list-optimizer) -- free web optimizer with CSV/Excel import
- [MaxCut Software](https://maxcutsoftware.com/) -- Windows desktop, one-time purchase
- [Defusco: 8 Best Cutting Optimization Software](https://www.defusco.com/cutting-optimization-software/) -- comprehensive comparison
- [CutList Evolution](https://cutlistevo.com/articles/best-cutting-optimization-software.html) -- AI-driven, enterprise features
- [FineWoodworking Forum: Cut List Programs Review](https://www.finewoodworking.com/forum/cut-list-programs-review) -- real user benchmarks and feedback
- [Sawdust Journey Free Cutlist Optimizer](https://sawdustjourney.com/cutlist-optimizer) -- guillotine packing, free
- [LumberJocks: Free Cut List Software](https://www.lumberjocks.com/threads/free-cut-list-software.351726/) -- community discussion
- [SaaSHub: CutList Optimizer Alternatives](https://www.saashub.com/cutlist-optimizer-alternatives) -- competitor landscape

---
*Feature research for: Woodworking Cut List Optimization*
*Researched: 2026-03-19*
