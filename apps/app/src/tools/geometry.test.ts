import type {
  BoxObject,
  ComponentObject,
  ComponentType,
  ConnectorObject,
  Layer,
} from "@wiretext/engine";
import { describe, expect, it } from "vitest";

import { getResizeHandle, hitTest, objectIntersectsRect } from "./geometry";

const layer = (
  id: string,
  overrides: Partial<Omit<Layer, "id">> = {}
): Layer => ({
  id,
  locked: false,
  name: id,
  visible: true,
  ...overrides,
});

const box = (
  id: string,
  layerId: string,
  col: number,
  row: number,
  width: number,
  height: number,
  zIndex: number
): BoxObject => ({
  borderStyle: "single",
  height,
  id,
  layerId,
  position: { col, row },
  type: "box",
  width,
  zIndex,
});

const component = (
  id: string,
  componentType: ComponentType,
  col: number,
  row: number,
  width: number,
  height: number
): ComponentObject => ({
  borderStyle: "single",
  componentType,
  height,
  id,
  layerId: "layer-1",
  position: { col, row },
  type: "component",
  width,
  zIndex: 0,
});

const connector = (id: string): ConnectorObject => ({
  fromId: "a",
  id,
  layerId: "layer-1",
  position: { col: 5, row: 5 },
  toId: "b",
  type: "connector",
  zIndex: 0,
});

// ─── hitTest ──────────────────────────────────────────

describe("hitTest", () => {
  const visible = layer("layer-1");

  it("returns the topmost object by zIndex when objects are stacked", () => {
    const lower = box("lower", "layer-1", 0, 0, 10, 10, 0);
    const upper = box("upper", "layer-1", 0, 0, 10, 10, 5);
    const hit = hitTest(3, 3, [lower, upper], [visible]);
    expect(hit?.id).toBe("upper");
  });

  it("returns null when the point misses every object", () => {
    const only = box("only", "layer-1", 0, 0, 5, 5, 0);
    expect(hitTest(50, 50, [only], [visible])).toBeNull();
  });

  it("excludes objects on a hidden layer", () => {
    const hidden = layer("layer-1", { visible: false });
    const obj = box("obj", "layer-1", 0, 0, 10, 10, 0);
    expect(hitTest(3, 3, [obj], [hidden])).toBeNull();
  });

  it("excludes objects on a locked but visible layer", () => {
    const locked = layer("layer-1", { locked: true, visible: true });
    const obj = box("obj", "layer-1", 0, 0, 10, 10, 0);
    expect(hitTest(3, 3, [obj], [locked])).toBeNull();
  });
});

// ─── getResizeHandle ──────────────────────────────────

describe("getResizeHandle", () => {
  // box at col 10..19, row 10..19 (width/height 10)
  const rectBox = box("b", "layer-1", 10, 10, 10, 10, 0);

  it("returns the corner handle at each corner", () => {
    expect(getResizeHandle(10, 10, rectBox)).toBe("nw");
    expect(getResizeHandle(19, 10, rectBox)).toBe("ne");
    expect(getResizeHandle(10, 19, rectBox)).toBe("sw");
    expect(getResizeHandle(19, 19, rectBox)).toBe("se");
  });

  it("returns the edge handle along each edge", () => {
    expect(getResizeHandle(15, 10, rectBox)).toBe("n");
    expect(getResizeHandle(15, 19, rectBox)).toBe("s");
    expect(getResizeHandle(19, 15, rectBox)).toBe("e");
    expect(getResizeHandle(10, 15, rectBox)).toBe("w");
  });

  it("returns null when the point is inside but off every edge", () => {
    expect(getResizeHandle(15, 15, rectBox)).toBeNull();
  });

  it("returns null when the point is well outside the object", () => {
    expect(getResizeHandle(100, 100, rectBox)).toBeNull();
  });

  it("returns null for a component with a 'none' constraint (icon)", () => {
    const icon = component("icon", "icon", 10, 10, 4, 4);
    expect(getResizeHandle(10, 10, icon)).toBeNull();
  });

  it("returns null for a connector", () => {
    expect(getResizeHandle(5, 5, connector("c"))).toBeNull();
  });

  describe("horizontal constraint (fixed-height component, e.g. button)", () => {
    // button at col 10..19, row 10..14
    const button = component("btn", "button", 10, 10, 10, 5);

    it("suppresses the pure vertical n/s handles", () => {
      expect(getResizeHandle(15, 10, button)).toBeNull();
      expect(getResizeHandle(15, 14, button)).toBeNull();
    });

    it("collapses the top/bottom corners to horizontal handles", () => {
      // ne -> e, se -> e, nw -> w, sw -> w
      expect(getResizeHandle(19, 10, button)).toBe("e");
      expect(getResizeHandle(19, 14, button)).toBe("e");
      expect(getResizeHandle(10, 10, button)).toBe("w");
      expect(getResizeHandle(10, 14, button)).toBe("w");
    });

    it("keeps the horizontal e/w edge handles", () => {
      expect(getResizeHandle(19, 12, button)).toBe("e");
      expect(getResizeHandle(10, 12, button)).toBe("w");
    });
  });
});

// ─── objectIntersectsRect ─────────────────────────────

describe("objectIntersectsRect", () => {
  // box occupies cols 10..19, rows 10..19 (bounds col=10..20, row=10..20)
  const obj = box("b", "layer-1", 10, 10, 10, 10, 0);

  it("returns true when the rect overlaps the object", () => {
    expect(objectIntersectsRect(obj, 5, 5, 15, 15)).toBe(true);
  });

  it("returns false when the rect is disjoint from the object", () => {
    expect(objectIntersectsRect(obj, 100, 100, 110, 110)).toBe(false);
  });

  it("returns false when the rect merely touches the object's right/bottom edge", () => {
    // object bounds end at col 20 / row 20; a rect starting exactly there
    // does not overlap because the test uses strict inequalities.
    expect(objectIntersectsRect(obj, 20, 20, 30, 30)).toBe(false);
  });

  it("returns false when the rect merely touches the object's left/top edge", () => {
    // object bounds start at col 10 / row 10; a rect ending exactly there
    // does not overlap.
    expect(objectIntersectsRect(obj, 0, 0, 10, 10)).toBe(false);
  });
});
