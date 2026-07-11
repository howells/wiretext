import type { Layer } from "@wiretext/engine";
import { nanoid } from "nanoid";

import { expandToGroups, pushHistory } from "./helpers";
import type { EditorActions, EditorGet, EditorSet } from "./types";

type LayerActions = Pick<
  EditorActions,
  | "addLayer"
  | "deleteLayer"
  | "renameLayer"
  | "reorderLayer"
  | "toggleLayerVisibility"
  | "toggleLayerLock"
  | "moveObjectsToLayer"
  | "setActiveLayer"
>;

export const createLayerActions = (
  set: EditorSet,
  get: EditorGet
): LayerActions => ({
  addLayer: (name) => {
    const layer: Layer = {
      id: nanoid(),
      locked: false,
      name: name ?? `Layer ${get().layers.length + 1}`,
      visible: true,
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
        activeLayerId: layer.id,
        layers: newLayers,
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
    if (!targetLayer) {
      return;
    }
    set((s) => ({
      ...pushHistory(s),
      activeLayerId: s.activeLayerId === id ? targetLayer.id : s.activeLayerId,
      layers: s.layers.filter((l) => l.id !== id),
      objects: s.objects.map((obj) =>
        obj.layerId === id ? { ...obj, layerId: targetLayer.id } : obj
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
      if (!removed) {
        return state;
      }
      newLayers.splice(clamped, 0, removed);
      return {
        ...pushHistory(state),
        layers: newLayers,
      };
    });
  },

  setActiveLayer: (id) => {
    set({ activeLayerId: id });
  },

  toggleLayerLock: (id) => {
    set((state) => ({
      ...pushHistory(state),
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, locked: !l.locked } : l
      ),
    }));
  },

  toggleLayerVisibility: (id) => {
    set((state) => ({
      ...pushHistory(state),
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    }));
  },
});
