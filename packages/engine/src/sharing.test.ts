import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";

import { decodeDocument, encodeDocument } from "./sharing";
import { must } from "./test-utils";
import type { BoxObject, ComponentObject, Layer, WireObject } from "./types";

const makeLayer = (overrides: Partial<Layer> = {}): Layer => ({
  id: "layer-1",
  locked: false,
  name: "Layer 1",
  visible: true,
  ...overrides,
});

/** V1 documents predate layers, so their objects carry no layerId. */
const makeV1Box = (): Omit<BoxObject, "layerId"> => ({
  borderStyle: "single",
  height: 5,
  id: "box-1",
  position: { col: 0, row: 0 },
  type: "box",
  width: 10,
  zIndex: 0,
});

const makeBox = (overrides: Partial<BoxObject> = {}): BoxObject => ({
  ...makeV1Box(),
  layerId: "layer-1",
  ...overrides,
});

describe("encodeDocument / decodeDocument", () => {
  describe("round-trip encoding", () => {
    it("should decode back to the same objects and layers after encoding", () => {
      const objects: WireObject[] = [makeBox()];
      const layers: Layer[] = [makeLayer()];

      const hash = encodeDocument(objects, layers);
      const decoded = decodeDocument(hash);

      expect(decoded).not.toBeNull();
      expect(decoded?.version).toBe(2);
      expect(decoded?.objects).toEqual(objects);
      expect(decoded?.layers).toEqual(layers);
    });

    it("should round-trip multiple objects of different types", () => {
      const layerId = "layer-1";
      const objects: WireObject[] = [
        makeBox({ id: "b1" }),
        {
          content: "Hello\nWorld",
          id: "t1",
          layerId,
          position: { col: 5, row: 2 },
          type: "text",
          zIndex: 1,
        },
        {
          endPosition: { col: 10, row: 10 },
          id: "l1",
          layerId,
          position: { col: 0, row: 0 },
          type: "line",
          zIndex: 2,
        },
        {
          endHead: false,
          endPosition: { col: 8, row: 4 },
          id: "a1",
          layerId,
          position: { col: 0, row: 0 },
          startHead: true,
          type: "arrow",
          zIndex: 3,
        },
      ];
      const layers: Layer[] = [makeLayer()];

      const hash = encodeDocument(objects, layers);
      const decoded = decodeDocument(hash);

      expect(decoded?.objects).toEqual(objects);
      expect(decoded?.layers).toEqual(layers);
    });

    it("should round-trip multiple layers", () => {
      const objects: WireObject[] = [
        makeBox({ layerId: "layer-1" }),
        makeBox({ id: "box-2", layerId: "layer-2" }),
      ];
      const layers: Layer[] = [
        makeLayer({ id: "layer-1", name: "Background" }),
        makeLayer({ id: "layer-2", locked: true, name: "Foreground" }),
      ];

      const hash = encodeDocument(objects, layers);
      const decoded = decodeDocument(hash);

      expect(decoded?.layers).toEqual(layers);
    });
  });

  describe("round-trip with complex component object", () => {
    it("should preserve all optional fields on a component object", () => {
      const component: ComponentObject = {
        activeStep: 2,
        alertType: "warning",
        annotation: "Primary data table",
        borderStyle: "double",
        checked: false,
        columns: ["Name", "Email", "Role"],
        componentType: "table",
        fill: "solid",
        groupId: "group-a",
        height: 12,
        icon: "table",
        id: "comp-1",
        items: ["Item 1", "Item 2", "Item 3"],
        label: "Users Table",
        layerId: "layer-1",
        listStyle: "bullet",
        maxValue: 100,
        name: "my-table",
        navItems: ["Home", "About"],
        position: { col: 2, row: 3 },
        progress: 75,
        separator: " | ",
        tabs: ["Tab A", "Tab B"],
        type: "component",
        value: 42,
        width: 40,
        zIndex: 0,
      };
      const layers: Layer[] = [makeLayer()];

      const hash = encodeDocument([component], layers);
      const decoded = decodeDocument(hash);

      expect(decoded?.objects[0]).toEqual(component);
    });
  });

  describe("V1 format migration", () => {
    it("should wrap a raw V1 array in a V2 document with a generated layer", () => {
      const v1Objects = [makeV1Box()];
      const v1Hash = compressToEncodedURIComponent(JSON.stringify(v1Objects));

      const decoded = decodeDocument(v1Hash);

      expect(decoded).not.toBeNull();
      expect(decoded?.version).toBe(2);
      expect(decoded?.layers).toHaveLength(1);
      const generatedLayer = must(decoded?.layers[0]);
      expect(generatedLayer.name).toBe("Layer 1");
      expect(generatedLayer.visible).toBe(true);
      expect(generatedLayer.locked).toBe(false);
    });

    it("should assign V1 objects to the generated layer when they have no layerId", () => {
      // The box has no layerId, so migrateV1 assigns the new generated id
      const v1Objects = [makeV1Box()];
      const v1Hash = compressToEncodedURIComponent(JSON.stringify(v1Objects));

      const decoded = decodeDocument(v1Hash);

      expect(decoded?.objects).toHaveLength(1);
      const generatedLayerId = must(decoded?.layers[0]).id;
      expect(must(decoded?.objects[0]).layerId).toBe(generatedLayerId);
    });

    it("should preserve an existing layerId on V1 objects rather than overwriting it", () => {
      const v1Objects: WireObject[] = [makeBox({ layerId: "original-layer" })];
      const v1Hash = compressToEncodedURIComponent(JSON.stringify(v1Objects));

      const decoded = decodeDocument(v1Hash);

      // V1 migration uses ?? so existing layerId is preserved
      expect(must(decoded?.objects[0]).layerId).toBe("original-layer");
    });
  });

  describe("invalid input", () => {
    it("should return null for a garbage string", () => {
      const result = decodeDocument("not-valid-compressed-data!@#$");
      expect(result).toBeNull();
    });

    it("should return null for an empty string", () => {
      const result = decodeDocument("");
      expect(result).toBeNull();
    });

    it("should return null for a valid compressed non-document JSON value", () => {
      const hash = compressToEncodedURIComponent(JSON.stringify(42));
      const result = decodeDocument(hash);
      expect(result).toBeNull();
    });

    it("should return null for a compressed object without a version field", () => {
      const hash = compressToEncodedURIComponent(
        JSON.stringify({ foo: "bar" })
      );
      const result = decodeDocument(hash);
      expect(result).toBeNull();
    });

    it("should return null for a compressed V2 object with wrong version number", () => {
      const hash = compressToEncodedURIComponent(
        JSON.stringify({ layers: [], objects: [], version: 99 })
      );
      const result = decodeDocument(hash);
      expect(result).toBeNull();
    });
  });
});
