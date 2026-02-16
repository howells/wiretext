"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useRef } from "react";
import { COMPONENT_BY_TYPE } from "@/engine/components";
import { useEditorStore } from "@/store";
import { arrowTool } from "@/tools/arrow";
import { boxTool } from "@/tools/box";
import { lineTool } from "@/tools/line";
import { getHoveredHandle, getResizeCursor, selectTool } from "@/tools/select";
import { textTool } from "@/tools/text";
import type { ToolHandler } from "@/tools/types";

const toolMap: Record<string, ToolHandler> = {
  select: selectTool,
  box: boxTool,
  text: textTool,
  line: lineTool,
  arrow: arrowTool,
};

function getActiveHandler(): ToolHandler | null {
  const activeTool = useEditorStore.getState().activeTool;
  return toolMap[activeTool] ?? null;
}

export function useCanvasEvents() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const pendingComponent = useEditorStore((s) => s.pendingComponent);
  const hoverCursorRef = useRef<string | null>(null);

  const onMouseDown = useCallback(
    (col: number, row: number, e: ReactMouseEvent) => {
      const pending = useEditorStore.getState().pendingComponent;
      if (pending) {
        const def = COMPONENT_BY_TYPE[pending];
        const state = useEditorStore.getState();
        const newObj = state.addObject({
          type: "component",
          componentType: pending,
          position: { col, row },
          width: def.defaultWidth,
          height: def.defaultHeight,
          borderStyle: "single",
          zIndex: state.objects.length,
          layerId: state.activeLayerId,
          ...(pending === "tabs" && { tabs: ["Tab 1", "Tab 2", "Tab 3"] }),
          ...(pending === "navbar" && {
            navItems: ["Home", "About", "Contact"],
          }),
          ...(pending === "table" && { columns: ["Col A", "Col B"] }),
          ...(pending === "stepper" && {
            items: ["Step 1", "Step 2", "Step 3"],
            activeStep: 0,
          }),
          ...(pending === "breadcrumb" && {
            items: ["Home", "Page", "Current"],
          }),
          ...(pending === "list" && {
            items: ["Item 1", "Item 2", "Item 3"],
            height: 3,
          }),
          ...(pending === "rating" && { value: 3, maxValue: 5 }),
        });
        state.setPendingComponent(null);
        state.setActiveTool("select");
        state.selectObject(newObj.id);
        return;
      }

      getActiveHandler()?.onMouseDown?.(col, row, e);
    },
    []
  );

  const onMouseMove = useCallback(
    (col: number, row: number, e: ReactMouseEvent) => {
      // Detect resize/endpoint handle hover for cursor
      const handle = getHoveredHandle(col, row);
      if (handle === "endpoint") {
        hoverCursorRef.current = "crosshair";
      } else if (handle) {
        hoverCursorRef.current = getResizeCursor(handle);
      } else {
        hoverCursorRef.current = null;
      }

      getActiveHandler()?.onMouseMove?.(col, row, e);
    },
    []
  );

  const onMouseUp = useCallback(
    (col: number, row: number, e: ReactMouseEvent) => {
      getActiveHandler()?.onMouseUp?.(col, row, e);
    },
    []
  );

  const baseCursor = pendingComponent
    ? "crosshair"
    : (toolMap[activeTool]?.cursor ?? "default");

  const cursor = hoverCursorRef.current ?? baseCursor;

  return { onMouseDown, onMouseMove, onMouseUp, cursor };
}
