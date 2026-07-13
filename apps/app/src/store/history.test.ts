import type { NewWireObject, ObjectId } from "@wiretext/engine";
import { beforeEach, describe, expect, it } from "vitest";

import { pushHistory } from "./helpers";
import { useEditorStore } from "./index";
import type { EditorState, HistorySnapshot } from "./types";
import { MAX_HISTORY } from "./types";

const LAYER_ID = "test-layer";
const LAYER_2_ID = "test-layer-2";

/** A fresh, fully-populated EditorState with brand-new references each call. */
const freshState = (): EditorState => ({
  activeLayerId: LAYER_ID,
  activeTool: "select",
  clipboard: [],
  contextMenu: null,
  draft: null,
  editingLabelId: null,
  editingTextId: null,
  future: [],
  gridSize: { cols: 120, rows: 60 },
  layers: [{ id: LAYER_ID, locked: false, name: "Layer 1", visible: true }],
  marquee: null,
  objects: [],
  past: [],
  pendingComponent: null,
  selection: new Set<ObjectId>(),
  sidebarExpanded: true,
  snapEnabled: true,
  snapGuides: { cols: [], rows: [] },
  viewport: { panX: 0, panY: 0, zoom: 1 },
});

/**
 * Full-state replace (the `true` flag) that rebuilds every EditorState field
 * fresh while preserving the stable action functions from the live store.
 * activeLayerId matches the fixture layer id so addObject attributes objects
 * to a real layer.
 */
const resetStore = () => {
  useEditorStore.setState(
    { ...useEditorStore.getState(), ...freshState() },
    true
  );
};

const makeBox = (zIndex = 0): NewWireObject => ({
  borderStyle: "single",
  height: 5,
  layerId: LAYER_ID,
  position: { col: 0, row: 0 },
  type: "box",
  width: 5,
  zIndex,
});

const state = () => useEditorStore.getState();

beforeEach(() => {
  resetStore();
});

describe("undo / redo", () => {
  it("grows past when an object is added", () => {
    state().addObject(makeBox());
    expect(state().objects).toHaveLength(1);
    expect(state().past).toHaveLength(1);
  });

  it("removes the object and grows future on undo", () => {
    state().addObject(makeBox());
    state().undo();
    expect(state().objects).toHaveLength(0);
    expect(state().future).toHaveLength(1);
    expect(state().past).toHaveLength(0);
  });

  it("restores the object on redo", () => {
    state().addObject(makeBox());
    state().undo();
    state().redo();
    expect(state().objects).toHaveLength(1);
    expect(state().future).toHaveLength(0);
  });

  it("clears future when a new mutation follows an undo", () => {
    state().addObject(makeBox());
    state().undo();
    expect(state().future).toHaveLength(1);
    state().addObject(makeBox());
    expect(state().future).toHaveLength(0);
  });

  it("treats undo with an empty past as a no-op", () => {
    state().undo();
    expect(state().objects).toHaveLength(0);
    expect(state().past).toHaveLength(0);
    expect(state().future).toHaveLength(0);
  });

  it("treats redo with an empty future as a no-op", () => {
    state().addObject(makeBox());
    state().redo();
    expect(state().objects).toHaveLength(1);
    expect(state().future).toHaveLength(0);
  });
});

describe("grouping", () => {
  it("sets a shared groupId on group and clears it on ungroup", () => {
    const a = state().addObject(makeBox());
    const b = state().addObject(makeBox());
    state().setSelection(new Set([a.id, b.id]));
    state().groupSelection();

    const grouped = state().objects;
    const ga = grouped.find((o) => o.id === a.id);
    const gb = grouped.find((o) => o.id === b.id);
    expect(ga?.groupId).toBeDefined();
    expect(ga?.groupId).toBe(gb?.groupId);

    state().ungroupSelection();
    const ungrouped = state().objects;
    expect(ungrouped.find((o) => o.id === a.id)?.groupId).toBeUndefined();
    expect(ungrouped.find((o) => o.id === b.id)?.groupId).toBeUndefined();
  });

  it("strips the orphaned member's groupId when deleting one of a pair", () => {
    const a = state().addObject(makeBox());
    const b = state().addObject(makeBox());
    state().setSelection(new Set([a.id, b.id]));
    state().groupSelection();

    state().setSelection(new Set([a.id]));
    state().deleteSelection();

    const remaining = state().objects;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe(b.id);
    expect(remaining[0]?.groupId).toBeUndefined();
  });

  it("is a no-op when grouping a single-object selection", () => {
    const a = state().addObject(makeBox());
    state().setSelection(new Set([a.id]));
    state().groupSelection();
    expect(state().objects.find((o) => o.id === a.id)?.groupId).toBeUndefined();
  });

  it("is a no-op when grouping a selection spanning two layers", () => {
    const a = state().addObject(makeBox());
    // Second layer with an object attributed to it.
    useEditorStore.setState((s) => ({
      layers: [
        ...s.layers,
        { id: LAYER_2_ID, locked: false, name: "Layer 2", visible: true },
      ],
    }));
    state().setActiveLayer(LAYER_2_ID);
    const b = state().addObject(makeBox());
    expect(b.layerId).toBe(LAYER_2_ID);

    state().setSelection(new Set([a.id, b.id]));
    state().groupSelection();

    const objs = state().objects;
    expect(objs.find((o) => o.id === a.id)?.groupId).toBeUndefined();
    expect(objs.find((o) => o.id === b.id)?.groupId).toBeUndefined();
  });
});

describe("z-order", () => {
  // Adds three boxes with ascending zIndex; returns their ids.
  const addThree = () => {
    const a = state().addObject(makeBox(0));
    const b = state().addObject(makeBox(1));
    const c = state().addObject(makeBox(2));
    return { a, b, c };
  };

  const zOf = (id: ObjectId): number | undefined =>
    state().objects.find((o) => o.id === id)?.zIndex;

  it("bringForward swaps a target up one step", () => {
    const { a, b, c } = addThree();
    state().bringForward([a.id]);
    expect(zOf(a.id)).toBe(1);
    expect(zOf(b.id)).toBe(0);
    expect(zOf(c.id)).toBe(2);
  });

  it("sendBackward swaps a target down one step", () => {
    const { a, b, c } = addThree();
    state().sendBackward([c.id]);
    expect(zOf(c.id)).toBe(1);
    expect(zOf(b.id)).toBe(2);
    expect(zOf(a.id)).toBe(0);
  });

  it("reorderObjectZIndex moves a target to a new visual position", () => {
    const { a, b, c } = addThree();
    // Move a (currently bottom) to visual position 0 (top => highest zIndex).
    state().reorderObjectZIndex(a.id, 0);
    expect(zOf(a.id)).toBe(2);
    expect(zOf(c.id)).toBe(1);
    expect(zOf(b.id)).toBe(0);
  });
});

const emptySnapshot = (): HistorySnapshot => ({ layers: [], objects: [] });

describe("pushHistory", () => {
  it("caps the past stack at MAX_HISTORY entries", () => {
    const full = freshState();
    full.past = Array.from({ length: MAX_HISTORY }, emptySnapshot);

    const result = pushHistory(full);
    expect(result.past).toHaveLength(MAX_HISTORY);
    expect(result.future).toEqual([]);
  });
});
