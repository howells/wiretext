import type { ObjectId } from "@wiretext/engine";
import { BORDERLESS_COMPONENTS, hasRectBounds } from "@wiretext/engine";
import { produce } from "immer";
import { nanoid } from "nanoid";

import { trackClearAll, trackObjectCreated } from "@/lib/analytics";

import {
  clearGroupId,
  expandWithConnectors,
  mergePatch,
  pushHistory,
  translateObject,
} from "./helpers";
import type { EditorActions, EditorGet, EditorSet } from "./types";

type ObjectActions = Pick<
  EditorActions,
  | "addObject"
  | "updateObject"
  | "deleteObject"
  | "deleteSelection"
  | "moveObject"
  | "moveSelection"
  | "resizeObject"
>;

type DocumentActions = Pick<
  EditorActions,
  "clearAll" | "loadDocument" | "groupSelection" | "ungroupSelection"
>;

export const createObjectActions = (
  set: EditorSet,
  get: EditorGet
): ObjectActions => ({
  addObject: (objWithoutId) => {
    const id = nanoid();
    const { activeLayerId } = get();
    const obj = { ...objWithoutId, id, layerId: activeLayerId };
    set((state) => ({
      ...pushHistory(state),
      objects: [...state.objects, obj],
    }));
    trackObjectCreated(obj.type);
    return obj;
  },

  deleteObject: (id) => {
    set((state) => {
      const idsToDelete = expandWithConnectors(new Set([id]), state.objects);
      return {
        ...pushHistory(state),
        objects: state.objects.filter((obj) => !idsToDelete.has(obj.id)),
        selection: produce(state.selection, (draft) => {
          for (const deleteId of idsToDelete) {
            draft.delete(deleteId);
          }
        }),
      };
    });
  },

  deleteSelection: () => {
    const { selection } = get();
    if (selection.size === 0) {
      return;
    }
    set((state) => {
      const idsToDelete = expandWithConnectors(state.selection, state.objects);
      const remaining = state.objects.filter((obj) => !idsToDelete.has(obj.id));
      // Clean up orphaned groups (groups with <2 members)
      const groupCounts = new Map<string, number>();
      for (const obj of remaining) {
        if (obj.groupId !== undefined && obj.groupId !== "") {
          groupCounts.set(obj.groupId, (groupCounts.get(obj.groupId) ?? 0) + 1);
        }
      }
      const cleaned = remaining.map((obj) => {
        if (
          obj.groupId !== undefined &&
          obj.groupId !== "" &&
          (groupCounts.get(obj.groupId) ?? 0) < 2
        ) {
          return clearGroupId(obj);
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
      objects: state.objects.map((obj) =>
        obj.id === id ? translateObject(obj, deltaCol, deltaRow) : obj
      ),
    }));
  },

  moveSelection: (deltaCol, deltaRow) => {
    const { selection } = get();
    if (selection.size === 0) {
      return;
    }
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) =>
        state.selection.has(obj.id)
          ? translateObject(obj, deltaCol, deltaRow)
          : obj
      ),
    }));
  },

  resizeObject: (id, newWidth, newHeight) => {
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) => {
        if (obj.id !== id || !hasRectBounds(obj)) {
          return obj;
        }
        const isBorderless =
          obj.type === "component" &&
          BORDERLESS_COMPONENTS.has(obj.componentType);
        return {
          ...obj,
          height: Math.max(isBorderless ? 1 : 3, newHeight),
          width: Math.max(isBorderless ? 1 : 3, newWidth),
        };
      }),
    }));
  },

  updateObject: (id, patch) => {
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) =>
        obj.id === id ? mergePatch(obj, patch) : obj
      ),
    }));
  },
});

export const createDocumentActions = (
  set: EditorSet,
  get: EditorGet
): DocumentActions => ({
  clearAll: () => {
    set((state) => ({
      ...pushHistory(state),
      draft: null,
      editingLabelId: null,
      editingTextId: null,
      objects: [],
      selection: new Set<ObjectId>(),
    }));
    trackClearAll();
  },

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
        state.selection.has(obj.id) ? { ...obj, groupId } : obj
      ),
    }));
  },

  loadDocument: (objects, layers) => {
    set((state) => ({
      ...pushHistory(state),
      activeLayerId: layers[0]?.id ?? state.activeLayerId,
      draft: null,
      editingLabelId: null,
      editingTextId: null,
      layers,
      objects,
      selection: new Set<ObjectId>(),
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
      if (
        selection.has(obj.id) &&
        obj.groupId !== undefined &&
        obj.groupId !== ""
      ) {
        groupIds.add(obj.groupId);
      }
    }
    if (groupIds.size === 0) {
      return;
    }
    set((state) => ({
      ...pushHistory(state),
      objects: state.objects.map((obj) =>
        obj.groupId !== undefined &&
        obj.groupId !== "" &&
        groupIds.has(obj.groupId)
          ? clearGroupId(obj)
          : obj
      ),
    }));
  },
});
