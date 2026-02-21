# Connectors Feature Plan (v2 — Post-Review)

## Problem

Diagonal lines in monospace ASCII art look terrible. Users need orthogonal connectors that route between boxes with horizontal/vertical segments and auto-update when boxes move.

## Data Model

### New Type: `ConnectorObject`

```typescript
interface ConnectorObject extends BaseObject {
  type: "connector"
  fromId: ObjectId
  toId: ObjectId
  fromSide?: "top" | "bottom" | "left" | "right"  // absent = auto
  toSide?: "top" | "bottom" | "left" | "right"     // absent = auto
  startHead?: boolean   // default false
  endHead?: boolean     // default true
  label?: string
}
```

**Design decisions from review:**
- No `routing` field (YAGNI — only one value "auto")
- Optional `fromSide`/`toSide` (absent = auto, present = user-pinned)
- `position` field inherited from BaseObject — set to fromObj's attachment point at creation, but treated as vestigial. All rendering derives from `fromId`/`toId` lookups.

### Union Updates

```typescript
export type WireObject = ... | ConnectorObject;
export type NewWireObject = ... | Omit<ConnectorObject, "id">;
export type ToolType = "select" | "box" | "text" | "line" | "arrow" | "connector";
```

## Auto-Attachment Algorithm

When `fromSide`/`toSide` is absent (auto), compute best edge from relative box centers:

```typescript
function resolveAutoSide(fromObj, toObj): { fromSide: Side, toSide: Side } {
  const dx = toCenter.col - fromCenter.col
  const dy = toCenter.row - fromCenter.row
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0
      ? { fromSide: "right", toSide: "left" }
      : { fromSide: "left", toSide: "right" }
  }
  return dy > 0
    ? { fromSide: "bottom", toSide: "top" }
    : { fromSide: "top", toSide: "bottom" }
}
```

### Attachment Points (integer grid coordinates)

Exit **one cell outside** the box border (not at the border):
- `"top"`:    `{ col: pos.col + Math.floor(width / 2), row: pos.row - 1 }`
- `"bottom"`: `{ col: pos.col + Math.floor(width / 2), row: pos.row + height }`
- `"left"`:   `{ col: pos.col - 1, row: pos.row + Math.floor(height / 2) }`
- `"right"`:  `{ col: pos.col + width, row: pos.row + Math.floor(height / 2) }`

`Math.floor()` for odd dimensions. Exit outside border so connector doesn't overwrite box characters.

## Routing Algorithm (4 cases)

Given exit point + exit direction and entry point + entry direction:

### Case 1: Straight (0 bends)
Facing each other, aligned on the same axis.
```
└──┬──┘
   │
┌──┴──┐
```

### Case 2: L-route (1 bend)
Perpendicular exits.
```
└──┬──┘
   │
   └──────┐
       ┌──┴──┐
```

### Case 3: Z-route (2 bends)
Same axis, offset.
```
└──┬──┘
   │
   └──────┐
          │
       ┌──┴──┐
```

### Case 4: U-route (3 bends)
Parallel exits, same direction.
```
┌─────┐
│  A  ├──┐
└─────┘  │
         │
┌─────┐  │
│  B  ├──┘
└─────┘
```

### Path = ordered GridPoint[] of segment endpoints
Rendered by drawing `│`/`─` between consecutive points, with `┌┐└┘` at corners.

### Degenerate cases
- Boxes touching/overlapping: clamp minimum segment length to 1 cell
- Zero distance between attachment points: straight line (even if 0-length)

## Rendering (compose.ts)

### `stampConnector(grid, connector, allObjects)`

1. Find `fromObj` and `toObj` by ID in `allObjects`. If either missing → skip.
2. Both must satisfy `hasRectBounds()`. If not → skip.
3. Resolve auto sides → compute attachment points
4. Compute path segments via routing algorithm
5. Stamp segments: `│` vertical, `─` horizontal
6. Stamp corners: `┌ ┐ └ ┘` based on turn direction
7. Stamp arrow heads: `→ ← ↑ ↓` at endpoints
8. Stamp label at path midpoint (by total path length, above horizontal / beside vertical)

Uses `setChar` (non-destructive) so box borders win over connector lines.

### Render order
Connectors render in normal zIndex order. Using `setChar` (not `forceSetChar`) means box borders drawn later won't be overwritten.

## Store Changes

### Shared cascade helper
```typescript
function expandWithConnectors(ids: Set<ObjectId>, objects: WireObject[]): Set<ObjectId> {
  const result = new Set(ids)
  for (const obj of objects) {
    if (obj.type === "connector" && (ids.has(obj.fromId) || ids.has(obj.toId))) {
      result.add(obj.id)
    }
  }
  return result
}
```

Apply in: `deleteObject`, `deleteSelection`, `cutSelection`.

### Movement guards
In `moveObject` and `moveSelection`: skip connectors (`if (obj.type === "connector") return obj`).

### Resize guard
In `getResizeConstraint`: `if (obj.type === "connector") return "none"`.

### Copy/paste (Phase 2 — deferred)
For v1: exclude connectors from clipboard. Revisit ID-remapping in Phase 2.

## Interaction Design

### Connector tool
- Icon: `┌─▸` — Shortcut: `C`
- Toolbar placement: after Arrow
- Cursor: crosshair
- **Does NOT auto-switch to select after creation** (stays in connector mode for sequential creation)

### Creation flow
1. `onMouseDown`: Hit-test for box/component. If none → status bar: "Start from a box edge". If found → store `fromId`.
2. `onMouseMove`: Render draft via canvas overlay (dashed line following routing algorithm). If hovering over valid target → highlight target edge (accent indicator at attachment midpoint).
3. `onMouseUp`: Hit-test for target. If valid (not self, has rect bounds) → create connector. If invalid → cancel.

### Selection
- Hit test: compute connector path, check if click is within 1 cell of any segment
- Performance: AABB pre-check before full path computation
- Properties panel: From/To names, side dropdowns, arrow head toggles, label input (single-line)

### Movement
- Connectors cannot be directly moved (path is derived)
- When user attempts to drag selected connector → status bar: "Move connected boxes to reposition"
- Endpoint dragging to change `fromSide`/`toSide` (stretch goal)

### Deletion
- Deleting connector: removes just the connector
- Deleting connected box: cascade via `expandWithConnectors` — single undo step

### Label placement
- Midpoint by total path length (not segment count)
- Above horizontal segments (row - 1)
- Right of vertical segments (col + 2)
- If midpoint falls on corner → shift to longer adjacent segment
- Truncate with `…` if longer than segment

## Files to Modify

### Phase 1: Engine Core
1. `packages/engine/src/types.ts` — ConnectorObject, WireObject union, NewWireObject, ToolType
2. `packages/engine/src/defaults.ts` — Connector defaults
3. `packages/engine/src/characters.ts` — CONNECTOR_CORNER_CHARS
4. `packages/engine/src/connector-routing.ts` — NEW: path computation (resolveAutoSide, computePath)
5. `packages/engine/src/connector-routing.test.ts` — NEW: routing tests (all 4 cases + edge cases)
6. `packages/engine/src/compose.ts` — stampConnector, update compose() switch
7. `packages/engine/src/compose.test.ts` — Connector rendering tests
8. `packages/engine/src/validate.ts` — Connector validation
9. `packages/engine/src/bounds.ts` — Connector bounds (needs objects array)
10. `packages/engine/src/index.ts` — Export new types and functions

### Phase 2: Editor Tool
11. `apps/app/src/tools/connector.ts` — NEW: connector tool handler
12. `apps/app/src/tools/select.ts` — Connector hit testing, movement guards
13. `apps/app/src/store/index.ts` — Cascade delete, movement guards, connector-aware actions
14. `apps/app/src/components/editor/toolbar.tsx` — Connector tool button
15. `apps/app/src/components/editor/canvas.tsx` — Draft connector overlay
16. `apps/app/src/components/editor/properties-panel.tsx` — Connector properties
17. `apps/app/src/components/editor/status-bar.tsx` — Connector-specific status messages

### Phase 3: Schema/MCP/CLI
18. `packages/schemas/src/index.ts` — ConnectorSchema
19. `apps/mcp/server.ts` — create_connector tool
20. `apps/cli/index.ts` — Connector support

## Testing Strategy

### Unit (packages/engine)
- `connector-routing.test.ts`: All 4 route cases, degenerate cases (touching boxes, overlapping, exact diagonal)
- `compose.test.ts`: Connector rendering (straight, L, Z, U), with labels, orphan skip
- `validate.test.ts`: Self-loops, missing refs, non-rect endpoints

### Integration (apps/app)
- Tool: create, cancel, invalid target, sequential creation
- Selection: hit test, properties panel
- Cascade: delete box → connector removed, undo restores both
- Movement: move box → connector updates, connector itself not movable
