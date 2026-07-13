import type { Layer, WireObject } from "@wiretext/engine";
import { encodeDocument } from "@wiretext/engine";
import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";

import { isValidDocument } from "./share-validation";

const layer = (id: string, name = "Layer 1"): Layer => ({
  id,
  locked: false,
  name,
  visible: true,
});

const box = (id: string, layerId: string): WireObject => ({
  borderStyle: "single",
  height: 5,
  id,
  layerId,
  position: { col: 0, row: 0 },
  type: "box",
  width: 5,
  zIndex: 0,
});

/** Encode an arbitrary (possibly malformed) document body the way the engine
 *  does, so we can exercise inputs that decode but fail structural validation. */
const encodeRaw = (doc: unknown): string =>
  compressToEncodedURIComponent(JSON.stringify(doc));

describe("isValidDocument", () => {
  it("accepts a well-formed document", () => {
    const data = encodeDocument([box("obj-1", "layer-1")], [layer("layer-1")]);
    expect(isValidDocument(data)).toBe(true);
  });

  it("rejects a document with more than 500 objects", () => {
    const objects = Array.from({ length: 501 }, (_, i) =>
      box(`obj-${i}`, "layer-1")
    );
    const data = encodeDocument(objects, [layer("layer-1")]);
    expect(isValidDocument(data)).toBe(false);
  });

  it("rejects a document with more than 50 layers", () => {
    const layers = Array.from({ length: 51 }, (_, i) => layer(`layer-${i}`));
    const data = encodeDocument([box("obj-1", "layer-0")], layers);
    expect(isValidDocument(data)).toBe(false);
  });

  it("rejects an object with an unknown type", () => {
    const data = encodeRaw({
      layers: [layer("layer-1")],
      objects: [{ id: "obj-1", layerId: "layer-1", type: "circle" }],
      version: 2,
    });
    expect(isValidDocument(data)).toBe(false);
  });

  it("rejects an object missing its id", () => {
    const data = encodeRaw({
      layers: [layer("layer-1")],
      objects: [{ layerId: "layer-1", type: "box" }],
      version: 2,
    });
    expect(isValidDocument(data)).toBe(false);
  });

  it("rejects a layer missing its id", () => {
    const data = encodeRaw({
      layers: [{ locked: false, name: "Layer 1", visible: true }],
      objects: [],
      version: 2,
    });
    expect(isValidDocument(data)).toBe(false);
  });

  it("rejects a layer missing its name", () => {
    const data = encodeRaw({
      layers: [{ id: "layer-1", locked: false, visible: true }],
      objects: [],
      version: 2,
    });
    expect(isValidDocument(data)).toBe(false);
  });

  it("rejects a payload that decodes but whose objects are not an array", () => {
    const data = encodeRaw({
      layers: [],
      objects: "not-an-array",
      version: 2,
    });
    expect(isValidDocument(data)).toBe(false);
  });

  it("rejects a payload that decodes but whose layers are not an array", () => {
    const data = encodeRaw({
      layers: "not-an-array",
      objects: [],
      version: 2,
    });
    expect(isValidDocument(data)).toBe(false);
  });

  it("rejects a non-decodable string", () => {
    expect(isValidDocument("###not-a-valid-payload###")).toBe(false);
  });
});
