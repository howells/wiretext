"use client";

import { COMPONENT_BY_TYPE } from "@wiretext/engine";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useState } from "react";

import { useEditorStore } from "@/store";
import { arrowTool } from "@/tools/arrow";
import { boxTool } from "@/tools/box";
import { connectorTool } from "@/tools/connector";
import { lineTool } from "@/tools/line";
import { getHoveredHandle, getResizeCursor, selectTool } from "@/tools/select";
import { textTool } from "@/tools/text";
import type { ToolHandler } from "@/tools/types";

const toolMap: Record<string, ToolHandler> = {
  arrow: arrowTool,
  box: boxTool,
  connector: connectorTool,
  line: lineTool,
  select: selectTool,
  text: textTool,
};

const getActiveHandler = (): ToolHandler | null => {
  const { activeTool } = useEditorStore.getState();
  return toolMap[activeTool] ?? null;
};

/**
 * Mouse-down entry point for the canvas, in grid coordinates.
 *
 * A pending component (chosen from the palette but not yet placed) short-circuits
 * the active tool: the click stamps that component at the cursor with its default
 * size and per-type seed content, then flips back to the select tool and selects
 * the new object. Otherwise the event is forwarded to the active tool's handler.
 */
const onMouseDown = (col: number, row: number, e: ReactMouseEvent) => {
  const pending = useEditorStore.getState().pendingComponent;
  if (pending) {
    const def = COMPONENT_BY_TYPE[pending];
    const state = useEditorStore.getState();
    const newObj = state.addObject({
      borderStyle: "single",
      componentType: pending,
      height: def.defaultHeight,
      layerId: state.activeLayerId,
      position: { col, row },
      type: "component",
      width: def.defaultWidth,
      zIndex: state.objects.length,
      ...(pending === "tabs" && { tabs: ["Tab 1", "Tab 2", "Tab 3"] }),
      ...(pending === "navbar" && {
        navItems: ["Home", "About", "Contact"],
      }),
      ...(pending === "table" && { columns: ["Col A", "Col B"] }),
      ...(pending === "stepper" && {
        activeStep: 0,
        items: ["Step 1", "Step 2", "Step 3"],
      }),
      ...(pending === "breadcrumb" && {
        items: ["Home", "Page", "Current"],
      }),
      ...(pending === "list" && {
        height: 3,
        items: ["Item 1", "Item 2", "Item 3"],
      }),
      ...(pending === "rating" && { maxValue: 5, value: 3 }),
    });
    state.setPendingComponent(null);
    state.setActiveTool("select");
    state.selectObject(newObj.id);
    return;
  }

  getActiveHandler()?.onMouseDown?.(col, row, e);
};

const onMouseUp = (col: number, row: number, e: ReactMouseEvent) => {
  getActiveHandler()?.onMouseUp?.(col, row, e);
};

/**
 * Wires canvas pointer events to the active tool and derives the cursor.
 *
 * The per-tool logic (drag-to-draw, marquee, move/resize) lives in the tool
 * handlers under src/tools; this hook only routes to them and resolves the
 * cursor. On move it probes for a resize/endpoint handle under the pointer: a
 * hit gives a transient hover cursor that overrides the tool's base cursor, so
 * the resize affordance appears without changing tools or state.
 */
export const useCanvasEvents = () => {
  const activeTool = useEditorStore((s) => s.activeTool);
  const pendingComponent = useEditorStore((s) => s.pendingComponent);
  const [hoverCursor, setHoverCursor] = useState<string | null>(null);

  const onMouseMove = (col: number, row: number, e: ReactMouseEvent) => {
    // Detect resize/endpoint handle hover for cursor
    const handle = getHoveredHandle(col, row);
    if (handle === "endpoint") {
      setHoverCursor("crosshair");
    } else if (handle) {
      setHoverCursor(getResizeCursor(handle));
    } else {
      setHoverCursor(null);
    }

    getActiveHandler()?.onMouseMove?.(col, row, e);
  };

  const baseCursor = pendingComponent
    ? "crosshair"
    : (toolMap[activeTool]?.cursor ?? "default");

  const cursor = hoverCursor ?? baseCursor;

  return { cursor, onMouseDown, onMouseMove, onMouseUp };
};
