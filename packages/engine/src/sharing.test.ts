import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";
import { decodeDocument, encodeDocument } from "./sharing";
import type { Layer, WireObject } from "./types";

const makeLayer = (overrides: Partial<Layer> = {}): Layer => ({
  id: "layer-1",
  name: "Layer 1",
  visible: true,
  locked: false,
  ...overrides,
});

const makeBox = (
  overrides: Partial<Extract<WireObject, { type: "box" }>> = {}
): Extract<WireObject, { type: "box" }> => ({
  id: "box-1",
  type: "box",
  position: { col: 0, row: 0 },
  width: 10,
  height: 5,
  borderStyle: "single",
  zIndex: 0,
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
          id: "t1",
          type: "text",
          content: "Hello\nWorld",
          position: { col: 5, row: 2 },
          zIndex: 1,
          layerId,
        },
        {
          id: "l1",
          type: "line",
          position: { col: 0, row: 0 },
          endPosition: { col: 10, row: 10 },
          zIndex: 2,
          layerId,
        },
        {
          id: "a1",
          type: "arrow",
          position: { col: 0, row: 0 },
          endPosition: { col: 8, row: 4 },
          startHead: true,
          endHead: false,
          zIndex: 3,
          layerId,
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
        makeLayer({ id: "layer-2", name: "Foreground", locked: true }),
      ];

      const hash = encodeDocument(objects, layers);
      const decoded = decodeDocument(hash);

      expect(decoded?.layers).toEqual(layers);
    });
  });

  describe("round-trip with complex component object", () => {
    it("should preserve all optional fields on a component object", () => {
      const component: Extract<WireObject, { type: "component" }> = {
        id: "comp-1",
        type: "component",
        componentType: "table",
        position: { col: 2, row: 3 },
        width: 40,
        height: 12,
        borderStyle: "double",
        fill: "solid",
        label: "Users Table",
        icon: "table",
        checked: false,
        progress: 75,
        columns: ["Name", "Email", "Role"],
        tabs: ["Tab A", "Tab B"],
        navItems: ["Home", "About"],
        alertType: "warning",
        items: ["Item 1", "Item 2", "Item 3"],
        separator: " | ",
        listStyle: "bullet",
        activeStep: 2,
        value: 42,
        maxValue: 100,
        zIndex: 0,
        layerId: "layer-1",
        name: "my-table",
        annotation: "Primary data table",
        groupId: "group-a",
      };
      const layers: Layer[] = [makeLayer()];

      const hash = encodeDocument([component], layers);
      const decoded = decodeDocument(hash);

      expect(decoded?.objects[0]).toEqual(component);
    });
  });

  describe("V1 format migration", () => {
    it("should wrap a raw V1 array in a V2 document with a generated layer", () => {
      const v1Objects: WireObject[] = [
        makeBox({ layerId: undefined as unknown as string }),
      ];
      const v1Hash = compressToEncodedURIComponent(JSON.stringify(v1Objects));

      const decoded = decodeDocument(v1Hash);

      expect(decoded).not.toBeNull();
      expect(decoded?.version).toBe(2);
      expect(decoded?.layers).toHaveLength(1);
      expect(decoded?.layers[0].name).toBe("Layer 1");
      expect(decoded?.layers[0].visible).toBe(true);
      expect(decoded?.layers[0].locked).toBe(false);
    });

    it("should assign V1 objects to the generated layer when they have no layerId", () => {
      // Build a box without a layerId so migrateV1 assigns the new generated id
      const { layerId: _dropped, ...boxWithoutLayer } = makeBox();
      const v1Objects = [boxWithoutLayer];
      const v1Hash = compressToEncodedURIComponent(JSON.stringify(v1Objects));

      const decoded = decodeDocument(v1Hash);

      expect(decoded?.objects).toHaveLength(1);
      const generatedLayerId = decoded?.layers[0].id;
      expect(decoded?.objects[0].layerId).toBe(generatedLayerId);
    });

    it("should preserve an existing layerId on V1 objects rather than overwriting it", () => {
      const v1Objects: WireObject[] = [makeBox({ layerId: "original-layer" })];
      const v1Hash = compressToEncodedURIComponent(JSON.stringify(v1Objects));

      const decoded = decodeDocument(v1Hash);

      // V1 migration uses ?? so existing layerId is preserved
      expect(decoded?.objects[0].layerId).toBe("original-layer");
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
        JSON.stringify({ version: 99, objects: [], layers: [] })
      );
      const result = decodeDocument(hash);
      expect(result).toBeNull();
    });
  });
});
