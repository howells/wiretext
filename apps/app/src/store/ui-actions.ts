import type { ObjectId } from "@wiretext/engine";

import { trackToolSelected } from "@/lib/analytics";

import type { EditorActions, EditorSet } from "./types";

type UiActions = Pick<
  EditorActions,
  | "selectAll"
  | "selectObject"
  | "clearSelection"
  | "setSelection"
  | "setActiveTool"
  | "setContextMenu"
  | "setDraft"
  | "setEditingLabelId"
  | "setEditingTextId"
  | "setMarquee"
  | "setPendingComponent"
  | "setSnapGuides"
  | "toggleSidebar"
  | "toggleSnap"
  | "panViewport"
  | "zoomViewport"
>;

type HistoryActions = Pick<EditorActions, "undo" | "redo">;

export const createHistoryActions = (set: EditorSet): HistoryActions => ({
  redo: () => {
    set((state) => {
      if (state.future.length === 0) {
        return state;
      }
      const [next] = state.future;
      if (!next) {
        return state;
      }
      return {
        future: state.future.slice(1),
        layers: next.layers,
        objects: next.objects,
        past: [...state.past, { layers: state.layers, objects: state.objects }],
      };
    });
  },

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
        future: [
          { layers: state.layers, objects: state.objects },
          ...state.future,
        ],
        layers: previous.layers,
        objects: previous.objects,
        past: state.past.slice(0, -1),
      };
    });
  },
});

export const createUiActions = (set: EditorSet): UiActions => ({
  clearSelection: () => {
    set({ selection: new Set<ObjectId>() });
  },

  panViewport: (deltaX, deltaY) => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        panX: state.viewport.panX + deltaX,
        panY: state.viewport.panY + deltaY,
      },
    }));
  },

  selectAll: () => {
    set((state) => {
      const excludedLayers = new Set<string>();
      for (const layer of state.layers) {
        if (!layer.visible || layer.locked) {
          excludedLayers.add(layer.id);
        }
      }
      const ids = new Set<ObjectId>();
      for (const obj of state.objects) {
        if (!excludedLayers.has(obj.layerId)) {
          ids.add(obj.id);
        }
      }
      return { selection: ids };
    });
  },

  selectObject: (id, toggle = false) => {
    set((state) => {
      const obj = state.objects.find((o) => o.id === id);
      const groupMembers: ObjectId[] = [];
      if (obj?.groupId !== undefined && obj.groupId !== "") {
        for (const member of state.objects) {
          if (member.groupId === obj.groupId) {
            groupMembers.push(member.id);
          }
        }
      } else {
        groupMembers.push(id);
      }

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

  setActiveTool: (tool) => {
    set({ activeTool: tool });
    trackToolSelected(tool);
  },

  setContextMenu: (menu) => {
    set({ contextMenu: menu });
  },

  setDraft: (draft) => {
    set({ draft });
  },

  setEditingLabelId: (id) => {
    set({ editingLabelId: id });
  },

  setEditingTextId: (id) => {
    set({ editingTextId: id });
  },

  setMarquee: (marquee) => {
    set({ marquee });
  },

  setPendingComponent: (type) => {
    set({ pendingComponent: type });
  },

  setSelection: (ids) => {
    set({ selection: ids });
  },

  setSnapGuides: (guides) => {
    set({ snapGuides: guides });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarExpanded: !state.sidebarExpanded }));
  },

  toggleSnap: () => {
    set((s) => ({ snapEnabled: !s.snapEnabled }));
  },

  zoomViewport: (delta, centerX, centerY) => {
    set((state) => {
      const newZoom = Math.max(0.25, Math.min(4, state.viewport.zoom + delta));
      const scale = newZoom / state.viewport.zoom;
      return {
        viewport: {
          panX: centerX - (centerX - state.viewport.panX) * scale,
          panY: centerY - (centerY - state.viewport.panY) * scale,
          zoom: newZoom,
        },
      };
    });
  },
});
