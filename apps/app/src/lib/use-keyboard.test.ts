import type { BoxObject } from "@wiretext/engine";
import { beforeEach, describe, expect, it } from "vitest";

import { useEditorStore } from "@/store";

import { handleArrowKeys } from "./use-keyboard";

const makeBox = (id: string, col: number, row: number): BoxObject => ({
  borderStyle: "single",
  height: 3,
  id,
  layerId: "layer-1",
  position: { col, row },
  type: "box",
  width: 4,
  zIndex: 0,
});

type FakeKeyEvent = Pick<KeyboardEvent, "preventDefault" | "shiftKey"> & {
  readonly defaultPrevented: boolean;
};

const fakeKeyEvent = (opts: { shiftKey?: boolean } = {}): FakeKeyEvent => {
  let prevented = false;
  return {
    get defaultPrevented() {
      return prevented;
    },
    preventDefault: () => {
      prevented = true;
    },
    shiftKey: opts.shiftKey ?? false,
  };
};

const getPosition = (id: string) =>
  useEditorStore.getState().objects.find((o) => o.id === id)?.position;

describe("handleArrowKeys", () => {
  const box1 = makeBox("box-1", 10, 10);
  const box2 = makeBox("box-2", 20, 20);

  beforeEach(() => {
    useEditorStore.setState({
      future: [],
      objects: [box1, box2],
      past: [],
      selection: new Set(["box-1"]),
    });
  });

  it("returns false for non-arrow keys", () => {
    expect(handleArrowKeys(fakeKeyEvent(), "a")).toBe(false);
    expect(handleArrowKeys(fakeKeyEvent(), "escape")).toBe(false);
    expect(handleArrowKeys(fakeKeyEvent(), "z")).toBe(false);
  });

  it("returns false when nothing is selected", () => {
    useEditorStore.setState({ selection: new Set() });
    const e = fakeKeyEvent();
    expect(handleArrowKeys(e, "arrowup")).toBe(false);
    expect(e.defaultPrevented).toBe(false);
  });

  it("moves selection right by 1 cell", () => {
    expect(handleArrowKeys(fakeKeyEvent(), "arrowright")).toBe(true);
    expect(getPosition("box-1")).toEqual({ col: 11, row: 10 });
  });

  it("moves selection left by 1 cell", () => {
    handleArrowKeys(fakeKeyEvent(), "arrowleft");
    expect(getPosition("box-1")).toEqual({ col: 9, row: 10 });
  });

  it("moves selection up by 1 cell", () => {
    handleArrowKeys(fakeKeyEvent(), "arrowup");
    expect(getPosition("box-1")).toEqual({ col: 10, row: 9 });
  });

  it("moves selection down by 1 cell", () => {
    handleArrowKeys(fakeKeyEvent(), "arrowdown");
    expect(getPosition("box-1")).toEqual({ col: 10, row: 11 });
  });

  it("moves by 5 cells when shift is held", () => {
    handleArrowKeys(fakeKeyEvent({ shiftKey: true }), "arrowright");
    expect(getPosition("box-1")).toEqual({ col: 15, row: 10 });
  });

  it("shift+up moves 5 cells up", () => {
    handleArrowKeys(fakeKeyEvent({ shiftKey: true }), "arrowup");
    expect(getPosition("box-1")).toEqual({ col: 10, row: 5 });
  });

  it("does not move unselected objects", () => {
    handleArrowKeys(fakeKeyEvent(), "arrowright");
    expect(getPosition("box-2")).toEqual({ col: 20, row: 20 });
  });

  it("moves multiple selected objects together", () => {
    useEditorStore.setState({ selection: new Set(["box-1", "box-2"]) });
    handleArrowKeys(fakeKeyEvent({ shiftKey: true }), "arrowdown");
    expect(getPosition("box-1")).toEqual({ col: 10, row: 15 });
    expect(getPosition("box-2")).toEqual({ col: 20, row: 25 });
  });

  it("calls preventDefault when handling arrow key", () => {
    const e = fakeKeyEvent();
    handleArrowKeys(e, "arrowright");
    expect(e.defaultPrevented).toBe(true);
  });

  it("does not preventDefault for non-arrow keys", () => {
    const e = fakeKeyEvent();
    handleArrowKeys(e, "a");
    expect(e.defaultPrevented).toBe(false);
  });

  it("pushes to undo history", () => {
    expect(useEditorStore.getState().past).toHaveLength(0);
    handleArrowKeys(fakeKeyEvent(), "arrowright");
    expect(useEditorStore.getState().past.length).toBeGreaterThan(0);
  });
});
