import type { ObjectId, WireObject } from "@wiretext/engine";
import { nanoid } from "nanoid";

import {
  cloneWithOffset,
  expandWithConnectors,
  getMaxZIndex,
  pushHistory,
  remapGroupIds,
} from "./helpers";
import type { EditorActions, EditorGet, EditorSet } from "./types";

type ClipboardActions = Pick<
  EditorActions,
  "copySelection" | "cutSelection" | "pasteClipboard" | "duplicateSelection"
>;

/** Clone objects with fresh ids, offset positions, and remapped group ids. */
const cloneObjects = (
  source: WireObject[],
  layerId: string,
  offsetCol: number,
  offsetRow: number
): { objects: WireObject[]; ids: Set<ObjectId> } => {
  const ids = new Set<ObjectId>();
  const rawObjects = source.map((obj) => {
    const newId = nanoid();
    ids.add(newId);
    return cloneWithOffset(obj, newId, layerId, offsetCol, offsetRow);
  });
  return { ids, objects: remapGroupIds(rawObjects) };
};

/** Assign ascending zIndex values above the layer's current maximum. */
const raiseAboveLayer = (
  objects: WireObject[],
  layerObjects: WireObject[]
): WireObject[] => {
  let nextZ = getMaxZIndex(layerObjects) + 1;
  return objects.map((obj) => {
    nextZ += 1;
    return { ...obj, zIndex: nextZ };
  });
};

export const createClipboardActions = (
  set: EditorSet,
  get: EditorGet
): ClipboardActions => ({
  copySelection: () => {
    const { selection, objects } = get();
    if (selection.size === 0) {
      return;
    }
    // Exclude connectors — their fromId/toId references break on paste
    const copied = objects.filter(
      (obj) => selection.has(obj.id) && obj.type !== "connector"
    );
    set({ clipboard: copied });
  },

  cutSelection: () => {
    const { selection, objects } = get();
    if (selection.size === 0) {
      return;
    }
    // Exclude connectors from clipboard — their references break on paste
    const copied = objects.filter(
      (obj) => selection.has(obj.id) && obj.type !== "connector"
    );
    set((state) => {
      const idsToDelete = expandWithConnectors(state.selection, state.objects);
      return {
        ...pushHistory(state),
        clipboard: copied,
        objects: state.objects.filter((obj) => !idsToDelete.has(obj.id)),
        selection: new Set<ObjectId>(),
      };
    });
  },

  duplicateSelection: (offsetCol = 2, offsetRow = 1) => {
    const { selection, objects, activeLayerId } = get();
    if (selection.size === 0) {
      return;
    }
    // Exclude connectors — their fromId/toId references break with new IDs
    const copied = objects.filter(
      (obj) => selection.has(obj.id) && obj.type !== "connector"
    );
    const { objects: newObjects, ids: newIds } = cloneObjects(
      copied,
      activeLayerId,
      offsetCol,
      offsetRow
    );
    set((state) => {
      const layerObjs = state.objects.filter(
        (o) => o.layerId === activeLayerId
      );
      const raised = raiseAboveLayer(newObjects, layerObjs);
      return {
        ...pushHistory(state),
        objects: [...state.objects, ...raised],
        selection: newIds,
      };
    });
  },

  pasteClipboard: () => {
    const { clipboard, activeLayerId } = get();
    if (clipboard.length === 0) {
      return;
    }
    const { objects: newObjects, ids: newIds } = cloneObjects(
      clipboard,
      activeLayerId,
      2,
      1
    );
    set((state) => {
      const layerObjs = state.objects.filter(
        (o) => o.layerId === activeLayerId
      );
      const raised = raiseAboveLayer(newObjects, layerObjs);
      return {
        ...pushHistory(state),
        clipboard: raised,
        objects: [...state.objects, ...raised],
        selection: newIds,
      };
    });
  },
});
