"use client";

import type { BoxObject, CharMetrics, ConnectorObject } from "@wiretext/engine";
import { getConnectorMidpoint, resolveConnectorPath } from "@wiretext/engine";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const obj = editingLabelId
    ? objects.find((o) => o.id === editingLabelId)
    : null;

  useEffect(() => {
    if (!editingLabelId) {
      return;
    }
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    });
  }, [editingLabelId]);

  if (!obj) {
    return null;
  }

  if (obj.type === "connector") {
    return (
      <ConnectorLabelEditor
        metrics={metrics}
        obj={obj}
        objects={objects}
        setEditingLabelId={setEditingLabelId}
        textareaRef={textareaRef}
        updateObject={updateObject}
        viewport={viewport}
      />
    );
  }

  if (obj.type !== "box" && obj.type !== "component") {
    return null;
  }

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

function ConnectorLabelEditor({
  obj,
  objects,
  viewport,
  metrics,
  updateObject,
  setEditingLabelId,
  textareaRef,
}: {
  obj: ConnectorObject;
  objects: readonly import("@wiretext/engine").WireObject[];
  viewport: import("@wiretext/engine").Viewport;
  metrics: CharMetrics;
  updateObject: (id: string, partial: Partial<ConnectorObject>) => void;
  setEditingLabelId: (id: string | null) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const path = resolveConnectorPath(obj, objects);
  if (!path || path.points.length < 2) {
    return null;
  }

  const mid = getConnectorMidpoint(path.points);
  const editorWidth = 20;
  const startCol = mid.col - Math.floor(editorWidth / 2);
  const pos = gridToScreen(startCol, mid.row, viewport, metrics);
  const inputWidth = editorWidth * metrics.charWidth * viewport.zoom;
  const lineCount = Math.max(1, (obj.label ?? "").split("\n").length);
  const inputHeight =
    Math.max(1, lineCount) * metrics.lineHeight * viewport.zoom;

  const handleBlur = () => {
    setEditingLabelId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditingLabelId(null);
    }
    // Enter without shift inserts newline (default textarea behavior)
    // Shift+Enter commits
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setEditingLabelId(null);
    }
    e.stopPropagation();
  };

  return (
    <textarea
      className="absolute z-50 resize-none border border-accent bg-bg/90 px-1 py-0 text-center font-mono text-text outline-none"
      onBlur={handleBlur}
      onChange={(e) =>
        updateObject(obj.id, {
          label: e.target.value || undefined,
        } as Partial<ConnectorObject>)
      }
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
      ref={textareaRef}
      rows={lineCount}
      spellCheck={false}
      style={{
        left: pos.x,
        top: pos.y,
        width: inputWidth,
        fontSize: `${14 * viewport.zoom}px`,
        lineHeight: "1.5",
        height: inputHeight,
      }}
      value={obj.label ?? ""}
    />
  );
}
