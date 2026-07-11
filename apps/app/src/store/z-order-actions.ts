import type { ObjectId, WireObject } from "@wiretext/engine";

import {
  expandToGroups,
  getMaxZIndex,
  getMinZIndex,
  pushHistory,
} from "./helpers";
import type { EditorActions, EditorSet } from "./types";

type ZOrderActions = Pick<
  EditorActions,
  | "bringToFront"
  | "sendToBack"
  | "bringForward"
  | "sendBackward"
  | "reorderObjectZIndex"
>;

/** The object with the lowest zIndex, or null when the list is empty. */
const lowestByZIndex = (objects: WireObject[]): WireObject | null => {
  let lowest: WireObject | null = null;
  for (const obj of objects) {
    if (lowest === null || obj.zIndex < lowest.zIndex) {
      lowest = obj;
    }
  }
  return lowest;
};

/** The object with the highest zIndex, or null when the list is empty. */
const highestByZIndex = (objects: WireObject[]): WireObject | null => {
  let highest: WireObject | null = null;
  for (const obj of objects) {
    if (highest === null || obj.zIndex > highest.zIndex) {
      highest = obj;
    }
  }
  return highest;
};

/** Compute new zIndex assignments after moving a target to a visual position.
 *  Visual order is zIndex descending: highest zIndex = top = index 0. */
const computeReorderedZIndexes = (
  objects: WireObject[],
  target: WireObject,
  newPosition: number
): Map<ObjectId, number> => {
  const layerObjs = objects
    .filter((o) => o.layerId === target.layerId)
    .toSorted((a, b) => b.zIndex - a.zIndex);

  // Remove target from sorted list
  const without = layerObjs.filter((o) => o.id !== target.id);

  // Insert at new position (clamped)
  const clamped = Math.max(0, Math.min(without.length, newPosition));
  const reordered = [
    ...without.slice(0, clamped),
    target,
    ...without.slice(clamped),
  ];

  // Reassign zIndex values: first in visual order gets highest zIndex
  const zIndexMap = new Map<ObjectId, number>();
  for (const [i, obj] of reordered.entries()) {
    zIndexMap.set(obj.id, reordered.length - 1 - i);
  }
  return zIndexMap;
};

/** Swap the zIndex values of the objects at two indices in place. */
const swapZIndex = (objects: WireObject[], aIdx: number, bIdx: number) => {
  const a = objects[aIdx];
  const b = objects[bIdx];
  if (!a || !b) {
    return;
  }
  objects[aIdx] = { ...a, zIndex: b.zIndex };
  objects[bIdx] = { ...b, zIndex: a.zIndex };
};

/** Move each targeted object one z step up or down within its layer by
 *  swapping with the nearest non-targeted neighbor. Returns a new array. */
const stepZOrder = (
  objects: WireObject[],
  idSet: Set<ObjectId>,
  direction: "up" | "down"
): WireObject[] => {
  const newObjects = [...objects];
  for (const obj of newObjects) {
    if (!idSet.has(obj.id)) {
      continue;
    }
    // Find the nearest non-targeted object in the same layer one step away
    const sameLayer = newObjects.filter(
      (o) =>
        o.layerId === obj.layerId &&
        !idSet.has(o.id) &&
        (direction === "up" ? o.zIndex > obj.zIndex : o.zIndex < obj.zIndex)
    );
    const neighbor =
      direction === "up"
        ? lowestByZIndex(sameLayer)
        : highestByZIndex(sameLayer);
    if (neighbor) {
      swapZIndex(
        newObjects,
        newObjects.indexOf(obj),
        newObjects.indexOf(neighbor)
      );
    }
  }
  return newObjects;
};

export const createZOrderActions = (set: EditorSet): ZOrderActions => ({
  bringForward: (ids) => {
    set((state) => {
      const idSet = expandToGroups(new Set(ids), state.objects);
      return {
        ...pushHistory(state),
        objects: stepZOrder(state.objects, idSet, "up"),
      };
    });
  },

  bringToFront: (ids) => {
    set((state) => {
      const idSet = expandToGroups(new Set(ids), state.objects);
      const firstTarget = state.objects.find((o) => idSet.has(o.id));
      if (!firstTarget) {
        return state;
      }
      const { layerId } = firstTarget;
      const layerObjs = state.objects.filter(
        (o) => o.layerId === layerId && !idSet.has(o.id)
      );
      let nextZ = getMaxZIndex(layerObjs) + 1;
      return {
        ...pushHistory(state),
        objects: state.objects.map((obj) => {
          if (!idSet.has(obj.id)) {
            return obj;
          }
          nextZ += 1;
          return { ...obj, zIndex: nextZ };
        }),
      };
    });
  },

  reorderObjectZIndex: (objectId, newPosition) => {
    set((state) => {
      const target = state.objects.find((o) => o.id === objectId);
      if (!target) {
        return state;
      }

      const zIndexMap = computeReorderedZIndexes(
        state.objects,
        target,
        newPosition
      );

      return {
        ...pushHistory(state),
        objects: state.objects.map((obj) => {
          const newZ = zIndexMap.get(obj.id);
          return newZ === undefined ? obj : { ...obj, zIndex: newZ };
        }),
      };
    });
  },

  sendBackward: (ids) => {
    set((state) => {
      const idSet = expandToGroups(new Set(ids), state.objects);
      return {
        ...pushHistory(state),
        objects: stepZOrder(state.objects, idSet, "down"),
      };
    });
  },

  sendToBack: (ids) => {
    set((state) => {
      const idSet = expandToGroups(new Set(ids), state.objects);
      const targetObjs = state.objects.filter((o) => idSet.has(o.id));
      const [firstTarget] = targetObjs;
      if (!firstTarget) {
        return state;
      }
      const { layerId } = firstTarget;
      const layerObjs = state.objects.filter(
        (o) => o.layerId === layerId && !idSet.has(o.id)
      );
      const minZ = getMinZIndex(layerObjs);
      let nextZ = Math.max(0, minZ - targetObjs.length);
      return {
        ...pushHistory(state),
        objects: state.objects.map((obj) => {
          if (!idSet.has(obj.id)) {
            return obj;
          }
          nextZ += 1;
          return { ...obj, zIndex: nextZ };
        }),
      };
    });
  },
});
