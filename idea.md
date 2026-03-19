# CutList Pro — Woodworking Cut Optimizer

## What It Is
A web app that helps woodworkers optimize how they cut pieces from their available boards. Enter your boards and the pieces you need — the app calculates the optimal layout to minimize waste and shows a beautiful animated visualization of how everything fits.

## Who It's For
Woodworkers, carpenters, cabinet makers, DIY builders. Anyone who buys lumber and needs to figure out the best way to cut it. Currently they do this with pen and paper, clunky desktop software from the 2000s, or expensive paid tools.

## Why It Matters
Wood is expensive. A bad cutting plan wastes 20-30% of material. An optimized plan can cut waste to under 10%. For a cabinet project using $500 in lumber, that's $100+ saved. There are 5M+ woodworkers on Reddit alone, and the existing tools are terrible.

## Tech Stack
- Next.js (React)
- Tailwind CSS
- SVG for cut layout visualization with animations
- 100% client-side — no backend, no database, no auth
- Deploy to Vercel

## Core Features

### 1. Board Input
- Add available stock boards with dimensions (length × width) and quantity
- Common presets (e.g., 4×8 plywood sheet, 1×6 board)
- Support both metric (mm) and imperial (inches) units
- Unit toggle that converts everything

### 2. Cut List Input
- Add needed pieces with dimensions (length × width), quantity, and optional label
- Color assignment per piece type (auto or manual)
- Quick-add: paste a list or duplicate entries

### 3. Optimization Engine
- Bin-packing algorithm (guillotine cut — because woodworkers can only make straight through-cuts)
- Kerf setting (blade width, typically 3mm/1/8") — accounts for material lost to the saw blade
- Grain direction option (some pieces must be cut along the grain)
- Run optimization on button click

### 4. Visual Layout (the showpiece)
- SVG visualization showing each board with pieces laid out
- Pieces are color-coded by type and labeled
- Animated optimization — pieces slide/fade into place when you hit "Optimize"
- Waste areas shown in a distinct pattern/color
- Hover over a piece to see its dimensions and label
- Zoom and pan on large layouts

### 5. Summary Dashboard
- Total boards needed vs available
- Total waste percentage
- Cost estimate (optional price-per-board input)
- Per-board waste breakdown

### 6. Export
- Download cut layout as PNG (take to the workshop)
- Print-friendly view
- Share link (encode state in URL)

## Design Direction
- Clean, modern UI — NOT the typical ugly woodworking software
- Dark theme by default (workshop-friendly, looks great in screenshots)
- Smooth animations on the optimization step
- Responsive — must work on tablet (workshop use)
- Professional feel — this should look like a real product, not a weekend hack

## What Makes It Impressive
- The animated optimization visualization is the hero moment
- Color-coded, labeled pieces on boards are immediately readable
- The contrast between "ugly old woodworking software" and this polished modern tool
- It's genuinely useful — woodworkers will actually use this
- LinkedIn demo: show the animation in a 15-second video clip
