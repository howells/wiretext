import type { Layer, WireObject } from "./types";

/**
 * Resolve user-provided layer definitions against the auto-generated default.
 *
 * When the caller supplies named layers, objects that were assigned the
 * default layer (or reference an unknown layer ID) are moved to the first
 * user-defined layer. Objects that already reference a valid user layer
 * keep their assignment.
 *
 * When no user layers are provided, the default layer is used as-is.
 */
export const resolveLayers = (
  filled: WireObject[],
  defaultLayer: Layer,
  userLayers?: readonly { id: string; name: string }[]
): { objects: WireObject[]; layers: Layer[] } => {
  if (!userLayers || userLayers.length === 0) {
    return { layers: [defaultLayer], objects: filled };
  }

  const layers: Layer[] = userLayers.map((l) => ({
    id: l.id,
    locked: false,
    name: l.name,
    visible: true,
  }));

  const validIds = new Set(userLayers.map((l) => l.id));
  // userLayers is non-empty (guarded above), so layers always has a first entry
  const [firstLayer] = layers;
  const fallbackLayerId = firstLayer ? firstLayer.id : defaultLayer.id;
  const objects = filled.map((obj) =>
    obj.layerId === defaultLayer.id || !validIds.has(obj.layerId)
      ? { ...obj, layerId: fallbackLayerId }
      : obj
  );

  return { layers, objects };
};
