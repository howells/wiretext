import { describe, expect, it } from "vitest";

import { fillDefaults } from "./defaults";
import { resolveLayers } from "./layers";
import { must, mustBeBox, mustBeComponent } from "./test-utils";
import type { BoxObject, Layer, WireObject } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeDefaultLayer = (id = "default-layer"): Layer => ({
  id,
  locked: false,
  name: "Layer 1",
  visible: true,
});

const makeObject = (overrides: Partial<BoxObject> = {}): WireObject => ({
  borderStyle: "single",
  height: 5,
  id: "obj-1",
  layerId: "default-layer",
  position: { col: 0, row: 0 },
  type: "box",
  width: 10,
  zIndex: 0,
  ...overrides,
});

// ---------------------------------------------------------------------------
// resolveLayers — no user layers (fallback to default)
// ---------------------------------------------------------------------------

describe("resolveLayers — no user layers", () => {
  it("returns the default layer when userLayers is undefined", () => {
    const defaultLayer = makeDefaultLayer();
    const objects = [makeObject()];

    const result = resolveLayers(objects, defaultLayer);

    expect(result.layers).toEqual([defaultLayer]);
    expect(result.objects).toEqual(objects);
  });

  it("returns the default layer when userLayers is empty array", () => {
    const defaultLayer = makeDefaultLayer();
    const objects = [makeObject()];

    const result = resolveLayers(objects, defaultLayer, []);

    expect(result.layers).toEqual([defaultLayer]);
    expect(result.objects).toEqual(objects);
  });

  it("does not mutate the original objects array", () => {
    const defaultLayer = makeDefaultLayer();
    const original = [makeObject()];
    const copy = [...original];

    resolveLayers(original, defaultLayer);

    expect(original).toEqual(copy);
  });
});

// ---------------------------------------------------------------------------
// resolveLayers — with user layers
// ---------------------------------------------------------------------------

describe("resolveLayers — with user layers", () => {
  it("creates Layer objects with visible=true and locked=false", () => {
    const defaultLayer = makeDefaultLayer();
    const objects = [makeObject()];

    const result = resolveLayers(objects, defaultLayer, [
      { id: "ui", name: "UI Elements" },
      { id: "flow", name: "Flow Arrows" },
    ]);

    expect(result.layers).toEqual([
      { id: "ui", locked: false, name: "UI Elements", visible: true },
      { id: "flow", locked: false, name: "Flow Arrows", visible: true },
    ]);
  });

  it("reassigns objects with default layerId to first user layer", () => {
    const defaultLayer = makeDefaultLayer();
    const objects = [
      makeObject({ id: "a", layerId: "default-layer" }),
      makeObject({ id: "b", layerId: "default-layer" }),
    ];

    const result = resolveLayers(objects, defaultLayer, [
      { id: "ui", name: "UI" },
    ]);

    expect(must(result.objects[0]).layerId).toBe("ui");
    expect(must(result.objects[1]).layerId).toBe("ui");
  });

  it("preserves objects that reference a valid user layer", () => {
    const defaultLayer = makeDefaultLayer();
    const objects = [
      makeObject({ id: "a", layerId: "flow" }),
      makeObject({ id: "b", layerId: "ui" }),
    ];

    const result = resolveLayers(objects, defaultLayer, [
      { id: "ui", name: "UI" },
      { id: "flow", name: "Flow" },
    ]);

    expect(must(result.objects[0]).layerId).toBe("flow");
    expect(must(result.objects[1]).layerId).toBe("ui");
  });

  it("reassigns objects with unknown layerId to first user layer", () => {
    const defaultLayer = makeDefaultLayer();
    const objects = [makeObject({ id: "a", layerId: "nonexistent-layer" })];

    const result = resolveLayers(objects, defaultLayer, [
      { id: "ui", name: "UI" },
    ]);

    expect(must(result.objects[0]).layerId).toBe("ui");
  });

  it("handles mix of default, valid, and unknown layer IDs", () => {
    const defaultLayer = makeDefaultLayer();
    const objects = [
      makeObject({ id: "a", layerId: "default-layer" }),
      makeObject({ id: "b", layerId: "ui" }),
      makeObject({ id: "c", layerId: "flow" }),
      makeObject({ id: "d", layerId: "garbage" }),
    ];

    const result = resolveLayers(objects, defaultLayer, [
      { id: "ui", name: "UI" },
      { id: "flow", name: "Flow" },
    ]);

    // default → first user
    expect(must(result.objects[0]).layerId).toBe("ui");
    // valid, kept
    expect(must(result.objects[1]).layerId).toBe("ui");
    // valid, kept
    expect(must(result.objects[2]).layerId).toBe("flow");
    // unknown → first user
    expect(must(result.objects[3]).layerId).toBe("ui");
  });

  it("does not mutate original objects", () => {
    const defaultLayer = makeDefaultLayer();
    const obj = makeObject({ id: "a", layerId: "default-layer" });
    const objects = [obj];

    resolveLayers(objects, defaultLayer, [{ id: "ui", name: "UI" }]);

    expect(obj.layerId).toBe("default-layer");
  });

  it("does not mutate original default layer", () => {
    const defaultLayer = makeDefaultLayer();
    const original = { ...defaultLayer };

    resolveLayers([], defaultLayer, [{ id: "ui", name: "UI" }]);

    expect(defaultLayer).toEqual(original);
  });

  it("handles single user layer", () => {
    const defaultLayer = makeDefaultLayer();
    const objects = [makeObject()];

    const result = resolveLayers(objects, defaultLayer, [
      { id: "main", name: "Main" },
    ]);

    expect(result.layers).toHaveLength(1);
    expect(must(result.layers[0]).id).toBe("main");
    expect(must(result.objects[0]).layerId).toBe("main");
  });

  it("handles many user layers", () => {
    const defaultLayer = makeDefaultLayer();
    const layers = Array.from({ length: 10 }, (_, i) => ({
      id: `layer-${i}`,
      name: `Layer ${i}`,
    }));

    const result = resolveLayers([], defaultLayer, layers);

    expect(result.layers).toHaveLength(10);
    for (const [i, layer] of result.layers.entries()) {
      expect(layer.id).toBe(`layer-${i}`);
      expect(layer.name).toBe(`Layer ${i}`);
      expect(layer.visible).toBe(true);
      expect(layer.locked).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// resolveLayers — empty objects array
// ---------------------------------------------------------------------------

describe("resolveLayers — empty objects", () => {
  it("handles empty objects with no user layers", () => {
    const defaultLayer = makeDefaultLayer();
    const result = resolveLayers([], defaultLayer);

    expect(result.objects).toEqual([]);
    expect(result.layers).toEqual([defaultLayer]);
  });

  it("handles empty objects with user layers", () => {
    const defaultLayer = makeDefaultLayer();
    const result = resolveLayers([], defaultLayer, [{ id: "ui", name: "UI" }]);

    expect(result.objects).toEqual([]);
    expect(result.layers).toHaveLength(1);
    expect(must(result.layers[0]).id).toBe("ui");
  });
});

// ---------------------------------------------------------------------------
// Integration: resolveLayers with fillDefaults output
// ---------------------------------------------------------------------------

describe("resolveLayers — integration with fillDefaults", () => {
  it("correctly reassigns fillDefaults auto-generated layerIds", () => {
    const { objects: filled, layer: defaultLayer } = fillDefaults([
      { height: 5, type: "box", width: 10 },
      { content: "hello", type: "text" },
    ]);

    // All objects should have the default layer's ID
    expect(must(filled[0]).layerId).toBe(defaultLayer.id);
    expect(must(filled[1]).layerId).toBe(defaultLayer.id);

    const result = resolveLayers(filled, defaultLayer, [
      { id: "main", name: "Main Layer" },
    ]);

    // After resolve, all should be on the user layer
    expect(must(result.objects[0]).layerId).toBe("main");
    expect(must(result.objects[1]).layerId).toBe("main");
    expect(must(result.layers[0]).name).toBe("Main Layer");
  });

  it("assigns objects with explicit layerId to correct user layer", () => {
    const { objects: filled, layer: defaultLayer } = fillDefaults([
      { height: 5, layerId: "annotations", type: "box", width: 10 },
      { content: "note", type: "text" },
    ]);

    // First object kept its explicit layerId, second got the default
    expect(must(filled[0]).layerId).toBe("annotations");
    expect(must(filled[1]).layerId).toBe(defaultLayer.id);

    const result = resolveLayers(filled, defaultLayer, [
      { id: "ui", name: "UI" },
      { id: "annotations", name: "Notes" },
    ]);

    // kept
    expect(must(result.objects[0]).layerId).toBe("annotations");
    // default → first user
    expect(must(result.objects[1]).layerId).toBe("ui");
  });

  it("works end-to-end with multiple layers and object types", () => {
    const { objects: filled, layer: defaultLayer } = fillDefaults([
      { height: 10, layerId: "bg", type: "box", width: 20 },
      { content: "Title", layerId: "ui", type: "text" },
      { endPosition: { col: 20, row: 5 }, layerId: "flow", type: "arrow" },
      { componentType: "button", label: "Click", type: "component" },
    ]);

    const result = resolveLayers(filled, defaultLayer, [
      { id: "bg", name: "Background" },
      { id: "ui", name: "UI Elements" },
      { id: "flow", name: "Flow Arrows" },
    ]);

    expect(must(result.objects[0]).layerId).toBe("bg");
    expect(must(result.objects[1]).layerId).toBe("ui");
    expect(must(result.objects[2]).layerId).toBe("flow");
    // no explicit → first user layer
    expect(must(result.objects[3]).layerId).toBe("bg");
    expect(result.layers).toHaveLength(3);
  });

  it("without user layers, fillDefaults output is unchanged", () => {
    const { objects: filled, layer: defaultLayer } = fillDefaults([
      { height: 5, type: "box", width: 10 },
    ]);

    const result = resolveLayers(filled, defaultLayer);

    // same reference
    expect(result.objects).toBe(filled);
    expect(result.layers).toEqual([defaultLayer]);
  });
});

// ---------------------------------------------------------------------------
// resolveLayers — preserves all object properties
// ---------------------------------------------------------------------------

describe("resolveLayers — property preservation", () => {
  it("preserves all object properties when reassigning layer", () => {
    const defaultLayer = makeDefaultLayer();
    const obj: WireObject = {
      annotation: "This is annotated",
      borderStyle: "double",
      fill: "solid",
      groupId: "group-1",
      height: 15,
      id: "test-obj",
      label: "My Box",
      layerId: "default-layer",
      name: "Named Box",
      position: { col: 5, row: 10 },
      type: "box",
      width: 30,
      zIndex: 42,
    };

    const result = resolveLayers([obj], defaultLayer, [
      { id: "new-layer", name: "New" },
    ]);

    const updated = mustBeBox(result.objects[0]);
    expect(updated.layerId).toBe("new-layer");
    expect(updated.id).toBe("test-obj");
    expect(updated.position).toEqual({ col: 5, row: 10 });
    expect(updated.zIndex).toBe(42);
    expect(updated.name).toBe("Named Box");
    expect(updated.annotation).toBe("This is annotated");
    expect(updated.groupId).toBe("group-1");
    expect(updated.width).toBe(30);
    expect(updated.height).toBe(15);
    expect(updated.borderStyle).toBe("double");
    expect(updated.fill).toBe("solid");
    expect(updated.label).toBe("My Box");
  });

  it("preserves component-specific properties", () => {
    const defaultLayer = makeDefaultLayer();
    const obj: WireObject = {
      borderStyle: "single",
      columns: ["Name", "Value"],
      componentType: "table",
      filterable: true,
      height: 10,
      id: "comp-1",
      layerId: "default-layer",
      position: { col: 0, row: 0 },
      rows: [["a", "1"]],
      type: "component",
      width: 40,
      zIndex: 0,
    };

    const result = resolveLayers([obj], defaultLayer, [
      { id: "data", name: "Data" },
    ]);

    const updated = mustBeComponent(result.objects[0]);
    expect(updated.layerId).toBe("data");
    expect(updated.columns).toEqual(["Name", "Value"]);
    expect(updated.rows).toEqual([["a", "1"]]);
    expect(updated.filterable).toBe(true);
  });
});
