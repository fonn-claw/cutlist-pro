# Phase 3: Cut List Input - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the Cut List Input UI: a form in the sidebar where users can add, edit, remove, duplicate, and bulk-add cut pieces with dimensions, labels, colors, and quantities. No optimization or visualization — just cut piece management.

</domain>

<decisions>
## Implementation Decisions

### Cut Piece Form Layout
- Form in sidebar below board section — same inline pattern as board input
- Cut piece entries as card list with inline edit — consistent with board entries
- Color auto-assigned from a palette on creation, with manual override via color picker
- Duplicate button on each entry — creates a copy with new ID
- Delete via icon button with no confirmation — consistent with boards

### Quick-Add (Bulk Entry)
- Paste tab/comma-separated list into a textarea — parsed on submit
- Format: "length, width, quantity, label" per line (quantity and label optional)
- Parsed values create individual CutPiece entries with auto-assigned colors
- Show a toggle/button to switch between single-add form and bulk-add textarea

### Color System
- 10-color palette with distinct, visible colors on both dark and light themes
- Colors auto-assigned in order (cycling through palette)
- Manual override via a simple color picker (click swatch to open palette)
- Color stored as hex string in CutPiece.color field (already in types.ts)

### State Management
- React useState at page level — same pattern as boards (lifted state)
- Cut piece operations as pure functions in lib/cut-operations.ts
- CutPiece type already defined in types.ts with id, dimensions, quantity, label, color, grainDirection

### Claude's Discretion
- Exact color palette hex values
- Quick-add textarea placeholder text
- Form field ordering and spacing
- Color picker UI details (inline swatches vs dropdown)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/types.ts` — CutPiece interface already defined
- `src/lib/board-operations.ts` — Pattern for CRUD pure functions (addBoard, updateBoard, removeBoard)
- `src/components/boards/BoardForm.tsx` — Pattern for input form component
- `src/components/boards/BoardEntry.tsx` — Pattern for inline edit card
- `src/components/boards/BoardList.tsx` — Pattern for list with empty state
- `src/contexts/UnitContext.tsx` — useUnits hook for display formatting
- `src/lib/units.ts` — Conversion and formatting utilities

### Established Patterns
- Pure functions in lib/ with TDD tests
- UI components in components/{feature}/ directory
- State lifted to page.tsx with handlers passed as props
- Semantic color tokens: bg-surface, text-text-primary, border-border, text-accent
- Client components with "use client" directive

### Integration Points
- Cut piece input lives in Sidebar below board section
- State managed at page.tsx level alongside board state
- Cut piece data feeds Phase 4 (Optimization Engine)
- grainDirection flag will be used by optimization (Phase 4) to prevent rotation

</code_context>

<specifics>
## Specific Ideas

- Follow the exact same patterns established in Phase 2 for consistency
- Quick-add parsing should be forgiving (handle extra whitespace, missing optional fields)
- Color palette should work well against both dark and light backgrounds

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
