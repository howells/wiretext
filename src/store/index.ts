import { enableMapSet, produce } from "immer";
import { nanoid } from "nanoid";
import { create } from "zustand";
import type {
  ComponentType,
  GridSize,
  Layer,
  LayerId,
  NewWireObject,
  ObjectId,
  ToolType,
  Viewport,
  WireObject,
} from "@/engine/types";
import { hasRectBounds } from "@/engine/types";
import {
  trackClearAll,
  trackObjectCreated,
  trackToolSelected,
} from "@/lib/analytics";

enableMapSet();

const MAX_HISTORY = 100;

export interface ContextMenu {
  x: number;
  y: number;
  targetObjectId: ObjectId | null;
}

export type SidebarTab = "properties" | "layers";

export interface HistorySnapshot {
  objects: WireObject[];
  layers: Layer[];
}

const DEFAULT_LAYER_ID = nanoid();

export interface EditorState {
  // Document
  objects: WireObject[];
  layers: Layer[];
  gridSize: GridSize;

  // UI
  activeTool: ToolType;
  activeLayerId: LayerId;
  selection: Set<ObjectId>;
  viewport: Viewport;
  draft: WireObject | null;
  editingTextId: ObjectId | null;
  editingLabelId: ObjectId | null;
  pendingComponent: ComponentType | null;
  sidebarExpanded: boolean;
  sidebarTab: SidebarTab;
  marquee: {
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
  } | null;
  contextMenu: ContextMenu | null;

  // Clipboard
  clipboard: WireObject[];

  // History
  past: HistorySnapshot[];
  future: HistorySnapshot[];
}

export interface EditorActions {
  // Document mutations (push history)
  addObject: (obj: NewWireObject) => WireObject;
  updateObject: (id: ObjectId, patch: Partial<WireObject>) => void;
  deleteObject: (id: ObjectId) => void;
  deleteSelection: () => void;
  moveObject: (id: ObjectId, deltaCol: number, deltaRow: number) => void;
  moveSelection: (deltaCol: number, deltaRow: number) => void;
  resizeObject: (id: ObjectId, newWidth: number, newHeight: number) => void;
  clearAll: () => void;
  loadDocument: (objects: WireObject[], layers: Layer[]) => void;

  // Layer management (push history)
  addLayer: (name?: string) => Layer;
  deleteLayer: (id: LayerId) => void;
  renameLayer: (id: LayerId, name: string) => void;
  reorderLayer: (id: LayerId, newIndex: number) => void;
  toggleLayerVisibility: (id: LayerId) => void;
  toggleLayerLock: (id: LayerId) => void;
  moveObjectsToLayer: (objectIds: ObjectId[], layerId: LayerId) => void;

  // Z-ordering (push history)
  bringToFront: (ids: ObjectId[]) => void;
  sendToBack: (ids: ObjectId[]) => void;
  bringForward: (ids: ObjectId[]) => void;
  sendBackward: (ids: ObjectId[]) => void;
  reorderObjectZIndex: (objectId: ObjectId, newPosition: number) => void;

  // Grouping
  groupSelection: () => void;
  ungroupSelection: () => void;
  selectAll: () => void;

  // Clipboard
  copySelection: () => void;
  cutSelection: () => void;
  pasteClipboard: () => void;
  duplicateSelection: () => void;

  // UI mutations (no history)
  setActiveTool: (tool: ToolType) => void;
  setActiveLayer: (id: LayerId) => void;
  setSelection: (ids: Set<ObjectId>) => void;
  selectObject: (id: ObjectId, toggle?: boolean) => void;
  clearSelection: () => void;
  panViewport: (deltaX: number, deltaY: number) => void;
  zoomViewport: (delta: number, centerX: number, centerY: number) => void;
  setDraft: (draft: WireObject | null) => void;
  setEditingTextId: (id: ObjectId | null) => void;
  setEditingLabelId: (id: ObjectId | null) => void;
  setPendingComponent: (type: ComponentType | null) => void;
  setMarquee: (
    marquee: {
      startCol: number;
      startRow: number;
      endCol: number;
      endRow: number;
    } | null
  ) => void;
  setContextMenu: (menu: ContextMenu | null) => void;
  toggleSidebar: () => void;
  setSidebarTab: (tab: SidebarTab) => void;

  // History
  undo: () => void;
  redo: () => void;
}

export type EditorStore = EditorState & EditorActions;

function pushHistory(state: EditorState): {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
} {
  return {
    past: [
      ...state.past.slice(-(MAX_HISTORY - 1)),
      { objects: state.objects, layers: state.layers },
    ],
    future: [],
  };
}

/** Given a set of object IDs, expand to include all objects sharing a groupId with any of them */
function expandToGroups(
  ids: Set<ObjectId>,
  objects: WireObject[]
): Set<ObjectId> {
  const groupIds = new Set<string>();
  for (const obj of objects) {
    if (ids.has(obj.id) && obj.groupId) {
      groupIds.add(obj.groupId);
    }
  }
  if (groupIds.size === 0) {
    return ids;
  }
  const expanded = new Set(ids);
  for (const obj of objects) {
    if (obj.groupId && groupIds.has(obj.groupId)) {
      expanded.add(obj.id);
    }
  }
  return expanded;
}

/** Remap groupId values so pasted/duplicated groups are distinct from originals */
function remapGroupIds(objs: WireObject[]): WireObject[] {
  const groupMap = new Map<string, string>();
  return objs.map((obj) => {
    if (!obj.groupId) {
      return obj;
    }
    let newGroupId = groupMap.get(obj.groupId);
    if (!newGroupId) {
      newGroupId = nanoid();
      groupMap.set(obj.groupId, newGroupId);
    }
    return { ...obj, groupId: newGroupId } as WireObject;
  });
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  // Initial state
  objects: [],
  layers: [
    {
      id: DEFAULT_LAYER_ID,
      name: "Layer 1",
      visible: true,
      locked: false,
    },
  ],
  gridSize: { cols: 120, rows: 60 },
  activeTool: "select",
  activeLayerId: DEFAULT_LAYER_ID,
  selection: new Set<ObjectId>(),
  viewport: { panX: 0, panY: 0, zoom: 1 },
  draft: null,
  editingTextId: null,
  editingLabelId: null,
  pendingComponent: null,
  sidebarExpanded: true,
  sidebarTab: "properties" as SidebarTab,
  marquee: null,
  contextMenu: null,
  clipboard: [],
  past: [],
  future: [],

  // Document mutations
  addObject: (objWithoutId) => {
    const id = nanoid();
    const { activeLayerId } = get();
    const obj = { ...objWithoutId, id, layerId: activeLayerId } as WireObject;
    set((state) => ({
      ...pushHistory(state),
      objects: [...state.objects, obj],
    }));
    trackObjectCreated(obj.type);
    return obj;
  },

  updateObject: (id, patch) => {
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) =>
        obj.id === id ? ({ ...obj, ...patch } as WireObject) : obj
      ),
    }));
  },

  deleteObject: (id) => {
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.filter((obj) => obj.id !== id),
      selection: produce(state.selection, (draft) => {
        draft.delete(id);
      }),
    }));
  },

  deleteSelection: () => {
    const { selection } = get();
    if (selection.size === 0) {
      return;
    }
    set((state) => {
      const remaining = state.objects.filter(
        (obj) => !state.selection.has(obj.id)
      );
      // Clean up orphaned groups (groups with <2 members)
      const groupCounts = new Map<string, number>();
      for (const obj of remaining) {
        if (obj.groupId) {
          groupCounts.set(obj.groupId, (groupCounts.get(obj.groupId) ?? 0) + 1);
        }
      }
      const cleaned = remaining.map((obj) => {
        if (obj.groupId && (groupCounts.get(obj.groupId) ?? 0) < 2) {
          return { ...obj, groupId: undefined } as WireObject;
        }
        return obj;
      });
      return {
        ...pushHistory(state),
        objects: cleaned,
        selection: new Set<ObjectId>(),
      };
    });
  },

  moveObject: (id, deltaCol, deltaRow) => {
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) => {
        if (obj.id !== id) {
          return obj;
        }
        return {
          ...obj,
          position: {
            col: obj.position.col + deltaCol,
            row: obj.position.row + deltaRow,
          },
        } as WireObject;
      }),
    }));
  },

  moveSelection: (deltaCol, deltaRow) => {
    const { selection } = get();
    if (selection.size === 0) {
      return;
    }
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) => {
        if (!state.selection.has(obj.id)) {
          return obj;
        }
        return {
          ...obj,
          position: {
            col: obj.position.col + deltaCol,
            row: obj.position.row + deltaRow,
          },
        } as WireObject;
      }),
    }));
  },

  resizeObject: (id, newWidth, newHeight) => {
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) => {
        if (obj.id !== id || !hasRectBounds(obj)) {
          return obj;
        }
        return {
          ...obj,
          width: Math.max(3, newWidth),
          height: Math.max(3, newHeight),
        };
      }),
    }));
  },

  clearAll: () => {
    set((state) => ({
      ...pushHistory(state),
      objects: [],
      selection: new Set<ObjectId>(),
      editingTextId: null,
      editingLabelId: null,
      draft: null,
    }));
    trackClearAll();
  },

  loadDocument: (objects, layers) => {
    set((state) => ({
      ...pushHistory(state),
      objects,
      layers,
      activeLayerId: layers[0]?.id ?? state.activeLayerId,
      selection: new Set<ObjectId>(),
      editingTextId: null,
      editingLabelId: null,
      draft: null,
    }));
  },

  // Clipboard
  copySelection: () => {
    const { selection, objects } = get();
    if (selection.size === 0) {
      return;
    }
    const copied = objects.filter((obj) => selection.has(obj.id));
    set({ clipboard: copied });
  },

  cutSelection: () => {
    const { selection, objects } = get();
    if (selection.size === 0) {
      return;
    }
    const copied = objects.filter((obj) => selection.has(obj.id));
    set((state) => ({
      ...pushHistory(state),
      clipboard: copied,
      objects: state.objects.filter((obj) => !state.selection.has(obj.id)),
      selection: new Set<ObjectId>(),
    }));
  },

  pasteClipboard: () => {
    const { clipboard, activeLayerId } = get();
    if (clipboard.length === 0) {
      return;
    }
    const OFFSET_COL = 2;
    const OFFSET_ROW = 1;
    const newIds = new Set<ObjectId>();
    const rawObjects = clipboard.map((obj) => {
      const newId = nanoid();
      newIds.add(newId);
      const base = {
        ...obj,
        id: newId,
        layerId: activeLayerId,
        position: {
          col: obj.position.col + OFFSET_COL,
          row: obj.position.row + OFFSET_ROW,
        },
      };
      // Also offset endPosition for line/arrow
      if ("endPosition" in obj) {
        return {
          ...base,
          endPosition: {
            col: obj.endPosition.col + OFFSET_COL,
            row: obj.endPosition.row + OFFSET_ROW,
          },
        } as WireObject;
      }
      return base as WireObject;
    });
    const newObjects = remapGroupIds(rawObjects);

    set((state) => ({
      ...pushHistory(state),
      objects: [...state.objects, ...newObjects],
      selection: newIds,
      clipboard: newObjects,
    }));
  },

  duplicateSelection: () => {
    const state = get();
    if (state.selection.size === 0) {
      return;
    }
    const copied = state.objects.filter((obj) => state.selection.has(obj.id));
    const OFFSET_COL = 2;
    const OFFSET_ROW = 1;
    const newIds = new Set<ObjectId>();
    const rawObjects = copied.map((obj) => {
      const newId = nanoid();
      newIds.add(newId);
      const base = {
        ...obj,
        id: newId,
        layerId: state.activeLayerId,
        position: {
          col: obj.position.col + OFFSET_COL,
          row: obj.position.row + OFFSET_ROW,
        },
      };
      if ("endPosition" in obj) {
        return {
          ...base,
          endPosition: {
            col: obj.endPosition.col + OFFSET_COL,
            row: obj.endPosition.row + OFFSET_ROW,
          },
        } as WireObject;
      }
      return base as WireObject;
    });
    const newObjects = remapGroupIds(rawObjects);

    set((state) => ({
      ...pushHistory(state),
      objects: [...state.objects, ...newObjects],
      selection: newIds,
    }));
  },

  // Grouping
  groupSelection: () => {
    const { selection, objects } = get();
    if (selection.size < 2) {
      return;
    }
    // All selected objects must be on the same layer
    const selectedObjs = objects.filter((o) => selection.has(o.id));
    const layerIds = new Set(selectedObjs.map((o) => o.layerId));
    if (layerIds.size !== 1) {
      return;
    }
    const groupId = nanoid();
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) =>
        state.selection.has(obj.id) ? ({ ...obj, groupId } as WireObject) : obj
      ),
    }));
  },

  ungroupSelection: () => {
    const { selection, objects } = get();
    if (selection.size === 0) {
      return;
    }
    // Find all groupIds that intersect with the selection
    const groupIds = new Set<string>();
    for (const obj of objects) {
      if (selection.has(obj.id) && obj.groupId) {
        groupIds.add(obj.groupId);
      }
    }
    if (groupIds.size === 0) {
      return;
    }
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) =>
        obj.groupId && groupIds.has(obj.groupId)
          ? ({ ...obj, groupId: undefined } as WireObject)
          : obj
      ),
    }));
  },

  selectAll: () => {
    set((state) => {
      const excludedLayers = new Set(
        state.layers.filter((l) => !l.visible || l.locked).map((l) => l.id)
      );
      const ids = new Set(
        state.objects
          .filter((o) => !excludedLayers.has(o.layerId))
          .map((o) => o.id)
      );
      return { selection: ids };
    });
  },

  // UI mutations
  setActiveTool: (tool) => {
    set({ activeTool: tool });
    trackToolSelected(tool);
  },

  setSelection: (ids) => set({ selection: ids }),

  selectObject: (id, toggle = false) => {
    set((state) => {
      const obj = state.objects.find((o) => o.id === id);
      const groupMembers = obj?.groupId
        ? state.objects
            .filter((o) => o.groupId === obj.groupId)
            .map((o) => o.id)
        : [id];

      const next = new Set(toggle ? state.selection : []);
      if (toggle && next.has(id)) {
        // Deselect entire group
        for (const memberId of groupMembers) {
          next.delete(memberId);
        }
      } else {
        // Select entire group
        for (const memberId of groupMembers) {
          next.add(memberId);
        }
      }
      return { selection: next };
    });
  },

  clearSelection: () => set({ selection: new Set<ObjectId>() }),

  panViewport: (deltaX, deltaY) => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        panX: state.viewport.panX + deltaX,
        panY: state.viewport.panY + deltaY,
      },
    }));
  },

  zoomViewport: (delta, centerX, centerY) => {
    set((state) => {
      const newZoom = Math.max(0.25, Math.min(4, state.viewport.zoom + delta));
      const scale = newZoom / state.viewport.zoom;
      return {
        viewport: {
          zoom: newZoom,
          panX: centerX - (centerX - state.viewport.panX) * scale,
          panY: centerY - (centerY - state.viewport.panY) * scale,
        },
      };
    });
  },

  setDraft: (draft) => set({ draft }),

  setEditingTextId: (id) => set({ editingTextId: id }),

  setEditingLabelId: (id) => set({ editingLabelId: id }),

  setPendingComponent: (type) => set({ pendingComponent: type }),

  setMarquee: (marquee) => set({ marquee }),

  setContextMenu: (menu) => set({ contextMenu: menu }),

  toggleSidebar: () =>
    set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setActiveLayer: (id) => set({ activeLayerId: id }),

  // Layer management
  addLayer: (name) => {
    const layer: Layer = {
      id: nanoid(),
      name: name ?? `Layer ${get().layers.length + 1}`,
      visible: true,
      locked: false,
    };
    set((state) => {
      const activeIdx = state.layers.findIndex(
        (l) => l.id === state.activeLayerId
      );
      const insertIdx = activeIdx + 1;
      const newLayers = [...state.layers];
      newLayers.splice(insertIdx, 0, layer);
      return {
        ...pushHistory(state),
        layers: newLayers,
        activeLayerId: layer.id,
      };
    });
    return layer;
  },

  deleteLayer: (id) => {
    const state = get();
    if (state.layers.length <= 1) {
      return;
    }
    const idx = state.layers.findIndex((l) => l.id === id);
    if (idx === -1) {
      return;
    }
    // Find nearest layer to receive orphaned objects
    const targetLayer = state.layers[idx === 0 ? 1 : idx - 1];
    set((s) => ({
      ...pushHistory(s),
      layers: s.layers.filter((l) => l.id !== id),
      objects: s.objects.map((obj) =>
        obj.layerId === id ? { ...obj, layerId: targetLayer.id } : obj
      ),
      activeLayerId: s.activeLayerId === id ? targetLayer.id : s.activeLayerId,
    }));
  },

  renameLayer: (id, name) => {
    set((state) => ({
      ...pushHistory(state),
      layers: state.layers.map((l) => (l.id === id ? { ...l, name } : l)),
    }));
  },

  reorderLayer: (id, newIndex) => {
    set((state) => {
      const oldIdx = state.layers.findIndex((l) => l.id === id);
      if (oldIdx === -1) {
        return state;
      }
      const clamped = Math.max(0, Math.min(state.layers.length - 1, newIndex));
      if (oldIdx === clamped) {
        return state;
      }
      const newLayers = [...state.layers];
      const [removed] = newLayers.splice(oldIdx, 1);
      newLayers.splice(clamped, 0, removed);
      return {
        ...pushHistory(state),
        layers: newLayers,
      };
    });
  },

  toggleLayerVisibility: (id) => {
    set((state) => ({
      ...pushHistory(state),
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    }));
  },

  toggleLayerLock: (id) => {
    set((state) => ({
      ...pushHistory(state),
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, locked: !l.locked } : l
      ),
    }));
  },

  moveObjectsToLayer: (objectIds, layerId) => {
    set((state) => {
      const idSet = expandToGroups(new Set(objectIds), state.objects);
      return {
        ...pushHistory(state),
        objects: state.objects.map((obj) =>
          idSet.has(obj.id) ? { ...obj, layerId } : obj
        ),
      };
    });
  },

  // Z-ordering
  bringToFront: (ids) => {
    set((state) => {
      const idSet = expandToGroups(new Set(ids), state.objects);
      const targetObjs = state.objects.filter((o) => idSet.has(o.id));
      if (targetObjs.length === 0) {
        return state;
      }
      const layerId = targetObjs[0].layerId;
      const layerObjs = state.objects.filter(
        (o) => o.layerId === layerId && !idSet.has(o.id)
      );
      const maxZ = layerObjs.reduce((m, o) => Math.max(m, o.zIndex), -1);
      let nextZ = maxZ + 1;
      return {
        ...pushHistory(state),
        objects: state.objects.map((obj) => {
          if (!idSet.has(obj.id)) {
            return obj;
          }
          return { ...obj, zIndex: nextZ++ } as WireObject;
        }),
      };
    });
  },

  sendToBack: (ids) => {
    set((state) => {
      const idSet = expandToGroups(new Set(ids), state.objects);
      const targetObjs = state.objects.filter((o) => idSet.has(o.id));
      if (targetObjs.length === 0) {
        return state;
      }
      const layerId = targetObjs[0].layerId;
      const layerObjs = state.objects.filter(
        (o) => o.layerId === layerId && !idSet.has(o.id)
      );
      const minZ = layerObjs.reduce(
        (m, o) => Math.min(m, o.zIndex),
        Number.POSITIVE_INFINITY
      );
      const startZ = Math.max(0, minZ - targetObjs.length);
      let nextZ = startZ;
      return {
        ...pushHistory(state),
        objects: state.objects.map((obj) => {
          if (!idSet.has(obj.id)) {
            return obj;
          }
          return { ...obj, zIndex: nextZ++ } as WireObject;
        }),
      };
    });
  },

  bringForward: (ids) => {
    set((state) => {
      const idSet = expandToGroups(new Set(ids), state.objects);
      const newObjects = [...state.objects];
      for (const obj of newObjects) {
        if (idSet.has(obj.id)) {
          // Find the next higher zIndex object in same layer
          const sameLayer = newObjects.filter(
            (o) =>
              o.layerId === obj.layerId &&
              !idSet.has(o.id) &&
              o.zIndex > obj.zIndex
          );
          if (sameLayer.length > 0) {
            const nextUp = sameLayer.reduce((min, o) =>
              o.zIndex < min.zIndex ? o : min
            );
            // Swap zIndex values
            const objIdx = newObjects.indexOf(obj);
            const nextIdx = newObjects.indexOf(nextUp);
            newObjects[objIdx] = {
              ...obj,
              zIndex: nextUp.zIndex,
            } as WireObject;
            newObjects[nextIdx] = {
              ...nextUp,
              zIndex: obj.zIndex,
            } as WireObject;
          }
        }
      }
      return {
        ...pushHistory(state),
        objects: newObjects,
      };
    });
  },

  sendBackward: (ids) => {
    set((state) => {
      const idSet = expandToGroups(new Set(ids), state.objects);
      const newObjects = [...state.objects];
      for (const obj of newObjects) {
        if (idSet.has(obj.id)) {
          const sameLayer = newObjects.filter(
            (o) =>
              o.layerId === obj.layerId &&
              !idSet.has(o.id) &&
              o.zIndex < obj.zIndex
          );
          if (sameLayer.length > 0) {
            const nextDown = sameLayer.reduce((max, o) =>
              o.zIndex > max.zIndex ? o : max
            );
            const objIdx = newObjects.indexOf(obj);
            const nextIdx = newObjects.indexOf(nextDown);
            newObjects[objIdx] = {
              ...obj,
              zIndex: nextDown.zIndex,
            } as WireObject;
            newObjects[nextIdx] = {
              ...nextDown,
              zIndex: obj.zIndex,
            } as WireObject;
          }
        }
      }
      return {
        ...pushHistory(state),
        objects: newObjects,
      };
    });
  },

  reorderObjectZIndex: (objectId, newPosition) => {
    set((state) => {
      const target = state.objects.find((o) => o.id === objectId);
      if (!target) {
        return state;
      }

      // Get all objects in the same layer, sorted by zIndex descending
      // (matching visual order: highest zIndex = top = index 0)
      const layerObjs = state.objects
        .filter((o) => o.layerId === target.layerId)
        .sort((a, b) => b.zIndex - a.zIndex);

      // Remove target from sorted list
      const without = layerObjs.filter((o) => o.id !== objectId);

      // Insert at new position (clamped)
      const clamped = Math.max(0, Math.min(without.length, newPosition));
      const reordered = [
        ...without.slice(0, clamped),
        target,
        ...without.slice(clamped),
      ];

      // Reassign zIndex values: first in visual order gets highest zIndex
      const zIndexMap = new Map<ObjectId, number>();
      for (let i = 0; i < reordered.length; i++) {
        zIndexMap.set(reordered[i].id, reordered.length - 1 - i);
      }

      return {
        ...pushHistory(state),
        objects: state.objects.map((obj) => {
          const newZ = zIndexMap.get(obj.id);
          return newZ !== undefined
            ? ({ ...obj, zIndex: newZ } as WireObject)
            : obj;
        }),
      };
    });
  },

  // History
  undo: () => {
    set((state) => {
      if (state.past.length === 0) {
        return state;
      }
      const previous = state.past.at(-1);
      if (!previous) {
        return state;
      }
      return {
        past: state.past.slice(0, -1),
        future: [
          { objects: state.objects, layers: state.layers },
          ...state.future,
        ],
        objects: previous.objects,
        layers: previous.layers,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) {
        return state;
      }
      const next = state.future[0];
      return {
        past: [...state.past, { objects: state.objects, layers: state.layers }],
        future: state.future.slice(1),
        objects: next.objects,
        layers: next.layers,
      };
    });
  },
}));
