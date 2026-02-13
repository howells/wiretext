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
      // Detect resize handle hover for cursor
      const handle = getHoveredHandle(col, row);
      hoverCursorRef.current = handle ? getResizeCursor(handle) : null;

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
