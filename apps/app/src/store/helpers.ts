import type { LayerId, ObjectId, WireObject } from "@wiretext/engine";
import { nanoid } from "nanoid";

import type { EditorState, HistorySnapshot } from "./types";
import { MAX_HISTORY } from "./types";

/**
 * Snapshot the current document onto the undo stack.
 *
 * History is two stacks of {objects, layers} snapshots. Every undoable action
 * spreads this return value *before* applying its mutation, capturing the
 * pre-mutation document as the new top of `past` and clearing `future` (a fresh
 * edit invalidates any redo path). undo/redo (ui-actions.ts) then move the live
 * document between the two stacks. Only objects and layers are versioned —
 * selection, tool, and viewport are not.
 *
 * `past` is capped at MAX_HISTORY (100): keeping the last 99 plus this one drops
 * the oldest entry once the cap is reached.
 */
export const pushHistory = (
  state: EditorState
): { past: HistorySnapshot[]; future: HistorySnapshot[] } => ({
  future: [],
  past: [
    ...state.past.slice(-(MAX_HISTORY - 1)),
    { layers: state.layers, objects: state.objects },
  ],
});

/** Given a set of object IDs, expand to include all objects sharing a groupId with any of them */
export const expandToGroups = (
  ids: Set<ObjectId>,
  objects: WireObject[]
): Set<ObjectId> => {
  const groupIds = new Set<string>();
  for (const obj of objects) {
    if (ids.has(obj.id) && obj.groupId !== undefined && obj.groupId !== "") {
      groupIds.add(obj.groupId);
    }
  }
  if (groupIds.size === 0) {
    return ids;
  }
  const expanded = new Set(ids);
  for (const obj of objects) {
    if (
      obj.groupId !== undefined &&
      obj.groupId !== "" &&
      groupIds.has(obj.groupId)
    ) {
      expanded.add(obj.id);
    }
  }
  return expanded;
};

/** Given a set of object IDs, expand to include any connectors attached to them */
export const expandWithConnectors = (
  ids: Set<ObjectId>,
  objects: WireObject[]
): Set<ObjectId> => {
  const result = new Set(ids);
  for (const obj of objects) {
    if (
      obj.type === "connector" &&
      (ids.has(obj.fromId) || ids.has(obj.toId))
    ) {
      result.add(obj.id);
    }
  }
  return result;
};

/** Remap groupId values so pasted/duplicated groups are distinct from originals */
export const remapGroupIds = (objs: WireObject[]): WireObject[] => {
  const groupMap = new Map<string, string>();
  return objs.map((obj) => {
    if (obj.groupId === undefined || obj.groupId === "") {
      return obj;
    }
    let newGroupId = groupMap.get(obj.groupId);
    if (newGroupId === undefined) {
      newGroupId = nanoid();
      groupMap.set(obj.groupId, newGroupId);
    }
    return { ...obj, groupId: newGroupId };
  });
};

/**
 * Merge a partial patch onto an object while keeping its concrete variant.
 *
 * The generic `T` binds to the object's actual union member at the call site,
 * so `patch` is `Partial<T>` of that same variant rather than
 * `Partial<WireObject>`. This is what lets `updateObject` narrow a patch to the
 * matched object's type and reject fields from a sibling variant — the `type`
 * discriminant is preserved because a patch can only ever carry `T`'s own keys.
 */
export const mergePatch = <T extends WireObject>(
  obj: T,
  patch: Partial<T>
): T => ({
  ...obj,
  ...patch,
});

/** Translate an object by a grid delta. Connectors derive position from their
 *  endpoints, so they are returned unchanged. */
export const translateObject = (
  obj: WireObject,
  deltaCol: number,
  deltaRow: number
): WireObject => {
  if (obj.type === "connector") {
    return obj;
  }
  const position = {
    col: obj.position.col + deltaCol,
    row: obj.position.row + deltaRow,
  };
  if (obj.type === "line") {
    return {
      ...obj,
      endPosition: {
        col: obj.endPosition.col + deltaCol,
        row: obj.endPosition.row + deltaRow,
      },
      position,
    };
  }
  if (obj.type === "arrow") {
    return {
      ...obj,
      endPosition: {
        col: obj.endPosition.col + deltaCol,
        row: obj.endPosition.row + deltaRow,
      },
      position,
    };
  }
  return { ...obj, position };
};

/** Produce an offset copy of an object with a fresh id on the target layer. */
export const cloneWithOffset = (
  obj: WireObject,
  id: ObjectId,
  layerId: LayerId,
  offsetCol: number,
  offsetRow: number
): WireObject => {
  const position = {
    col: obj.position.col + offsetCol,
    row: obj.position.row + offsetRow,
  };
  if (obj.type === "line") {
    return {
      ...obj,
      endPosition: {
        col: obj.endPosition.col + offsetCol,
        row: obj.endPosition.row + offsetRow,
      },
      id,
      layerId,
      position,
    };
  }
  if (obj.type === "arrow") {
    return {
      ...obj,
      endPosition: {
        col: obj.endPosition.col + offsetCol,
        row: obj.endPosition.row + offsetRow,
      },
      id,
      layerId,
      position,
    };
  }
  return { ...obj, id, layerId, position };
};

/** Return a copy of the object with its group membership removed. */
export const clearGroupId = (obj: WireObject): WireObject => {
  const copy = { ...obj };
  delete copy.groupId;
  return copy;
};

/** Highest zIndex among the objects, or -1 when the list is empty. */
export const getMaxZIndex = (objects: WireObject[]): number => {
  let max = -1;
  for (const obj of objects) {
    if (obj.zIndex > max) {
      max = obj.zIndex;
    }
  }
  return max;
};

/** Lowest zIndex among the objects, or +Infinity when the list is empty. */
export const getMinZIndex = (objects: WireObject[]): number => {
  let min = Number.POSITIVE_INFINITY;
  for (const obj of objects) {
    if (obj.zIndex < min) {
      min = obj.zIndex;
    }
  }
  return min;
};
