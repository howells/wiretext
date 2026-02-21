"use client";

import type { BoxObject, CharMetrics, ComponentObject } from "@wiretext/engine";
import { useEffect, useRef } from "react";
import { gridToScreen } from "@/lib/coordinates";
import { useEditorStore } from "@/store";

interface LabelEditorOverlayProps {
  metrics: CharMetrics;
}

export function LabelEditorOverlay({ metrics }: LabelEditorOverlayProps) {
  const editingLabelId = useEditorStore((s) => s.editingLabelId);
  const objects = useEditorStore((s) => s.objects);
  const viewport = useEditorStore((s) => s.viewport);
  const updateObject = useEditorStore((s) => s.updateObject);
  const setEditingLabelId = useEditorStore((s) => s.setEditingLabelId);
  const inputRef = useRef<HTMLInputElement>(null);

  const obj = editingLabelId
    ? (objects.find((o) => o.id === editingLabelId) as
        | (BoxObject | ComponentObject)
        | undefined)
    : null;

  useEffect(() => {
    if (editingLabelId && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editingLabelId]);

  if (!obj || (obj.type !== "box" && obj.type !== "component")) {
    return null;
  }

  // Position input at the label row, spanning the full object width
  const labelRow = obj.position.row + Math.floor(obj.height / 2);
  const pos = gridToScreen(obj.position.col, labelRow, viewport, metrics);
  const inputWidth = obj.width * metrics.charWidth * viewport.zoom;

  const handleBlur = () => {
    setEditingLabelId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") {
      setEditingLabelId(null);
    }
    e.stopPropagation();
  };

  return (
    <input
      className="absolute z-50 border border-accent bg-bg/90 px-1 py-0 text-center font-mono text-text outline-none"
      onBlur={handleBlur}
      onChange={(e) =>
        updateObject(obj.id, {
          label: e.target.value || undefined,
        } as Partial<BoxObject>)
      }
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
      ref={inputRef}
      spellCheck={false}
      style={{
        left: pos.x,
        top: pos.y,
        width: inputWidth,
        fontSize: `${14 * viewport.zoom}px`,
        lineHeight: "1.5",
        height: `${metrics.lineHeight * viewport.zoom}px`,
      }}
      type="text"
      value={obj.label ?? ""}
    />
  );
}
