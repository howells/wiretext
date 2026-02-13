import { enableMapSet, produce } from "immer";
import { nanoid } from "nanoid";
import { create } from "zustand";
import type {
  ComponentType,
  GridSize,
  NewWireObject,
  ObjectId,
  ToolType,
  Viewport,
  WireObject,
} from "@/engine/types";
import { hasRectBounds } from "@/engine/types";

enableMapSet();

const MAX_HISTORY = 100;

export interface EditorState {
  // Document
  objects: WireObject[];
  gridSize: GridSize;

  // UI
  activeTool: ToolType;
  selection: Set<ObjectId>;
  viewport: Viewport;
  draft: WireObject | null;
  editingTextId: ObjectId | null;
  editingLabelId: ObjectId | null;
  pendingComponent: ComponentType | null;
  sidebarExpanded: boolean;
  marquee: {
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
  } | null;

  // Clipboard
  clipboard: WireObject[];

  // History
  past: WireObject[][];
  future: WireObject[][];
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

  // Clipboard
  copySelection: () => void;
  pasteClipboard: () => void;
  duplicateSelection: () => void;

  // UI mutations (no history)
  setActiveTool: (tool: ToolType) => void;
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
  toggleSidebar: () => void;

  // History
  undo: () => void;
  redo: () => void;
}

export type EditorStore = EditorState & EditorActions;

function pushHistory(state: EditorState): {
  past: WireObject[][];
  future: WireObject[][];
} {
  return {
    past: [...state.past.slice(-(MAX_HISTORY - 1)), state.objects],
    future: [],
  };
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  // Initial state
  objects: [],
  gridSize: { cols: 120, rows: 60 },
  activeTool: "select",
  selection: new Set<ObjectId>(),
  viewport: { panX: 0, panY: 0, zoom: 1 },
  draft: null,
  editingTextId: null,
  editingLabelId: null,
  pendingComponent: null,
  sidebarExpanded: true,
  marquee: null,
  clipboard: [],
  past: [],
  future: [],

  // Document mutations
  addObject: (objWithoutId) => {
    const id = nanoid();
    const obj = { ...objWithoutId, id } as WireObject;
    set((state) => ({
      ...pushHistory(state),
      objects: [...state.objects, obj],
    }));
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
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.filter((obj) => !state.selection.has(obj.id)),
      selection: new Set<ObjectId>(),
    }));
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

  pasteClipboard: () => {
    const { clipboard } = get();
    if (clipboard.length === 0) {
      return;
    }
    const OFFSET_COL = 2;
    const OFFSET_ROW = 1;
    const newIds = new Set<ObjectId>();
    const newObjects = clipboard.map((obj) => {
      const newId = nanoid();
      newIds.add(newId);
      const base = {
        ...obj,
        id: newId,
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
    // Copy then paste in one step
    const copied = state.objects.filter((obj) => state.selection.has(obj.id));
    const OFFSET_COL = 2;
    const OFFSET_ROW = 1;
    const newIds = new Set<ObjectId>();
    const newObjects = copied.map((obj) => {
      const newId = nanoid();
      newIds.add(newId);
      const base = {
        ...obj,
        id: newId,
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

    set((state) => ({
      ...pushHistory(state),
      objects: [...state.objects, ...newObjects],
      selection: newIds,
    }));
  },

  // UI mutations
  setActiveTool: (tool) => set({ activeTool: tool }),

  setSelection: (ids) => set({ selection: ids }),

  selectObject: (id, toggle = false) => {
    set((state) => {
      const next = new Set(toggle ? state.selection : []);
      if (toggle && next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
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

  toggleSidebar: () =>
    set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),

  // History
  undo: () => {
    set((state) => {
      if (state.past.length === 0) {
        return state;
      }
      const previous = state.past.at(-1);
      return {
        past: state.past.slice(0, -1),
        future: [state.objects, ...state.future],
        objects: previous,
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
        past: [...state.past, state.objects],
        future: state.future.slice(1),
        objects: next,
      };
    });
  },
}));
