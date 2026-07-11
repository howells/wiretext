"use client";

import type {
  CharMetrics,
  ConnectorObject,
  Viewport,
  WireObject,
} from "@wiretext/engine";
import { getConnectorMidpoint, resolveConnectorPath } from "@wiretext/engine";
import { useEffect, useRef } from "react";

import { gridToScreen } from "@/lib/coordinates";
import { useEditorStore } from "@/store";

interface LabelEditorOverlayProps {
  metrics: CharMetrics;
}

const ConnectorLabelEditor = ({
  obj,
  objects,
  viewport,
  metrics,
  updateObject,
  setEditingLabelId,
  textareaRef,
}: {
  obj: ConnectorObject;
  objects: readonly WireObject[];
  viewport: Viewport;
  metrics: CharMetrics;
  updateObject: (id: string, partial: Partial<ConnectorObject>) => void;
  setEditingLabelId: (id: string | null) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) => {
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
      onChange={(e) => {
        updateObject(obj.id, {
          label: e.target.value || undefined,
        });
      }}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      ref={textareaRef}
      rows={lineCount}
      spellCheck={false}
      style={{
        fontSize: `${14 * viewport.zoom}px`,
        height: inputHeight,
        left: pos.x,
        lineHeight: "1.5",
        top: pos.y,
        width: inputWidth,
      }}
      value={obj.label ?? ""}
    />
  );
};

/**
 * In-place editor for an object's label, dispatching by the edited object's type.
 *
 * Connectors get a multi-line textarea centered on the routed path's midpoint;
 * boxes and components get a single-line input centered on the shape. As with
 * the text overlay, edits write live through updateObject (empty string clears
 * the label to undefined) and there is no separate commit — closing on blur or
 * Escape just stops editing. Other object types render nothing.
 */
export const LabelEditorOverlay = ({ metrics }: LabelEditorOverlayProps) => {
  const editingLabelId = useEditorStore((s) => s.editingLabelId);
  const objects = useEditorStore((s) => s.objects);
  const viewport = useEditorStore((s) => s.viewport);
  const updateObject = useEditorStore((s) => s.updateObject);
  const setEditingLabelId = useEditorStore((s) => s.setEditingLabelId);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const obj =
    editingLabelId !== null && editingLabelId !== ""
      ? objects.find((o) => o.id === editingLabelId)
      : null;

  useEffect(() => {
    if (editingLabelId === null || editingLabelId === "") {
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
      onChange={(e) => {
        updateObject(obj.id, {
          label: e.target.value || undefined,
        });
      }}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      ref={inputRef}
      spellCheck={false}
      style={{
        fontSize: `${14 * viewport.zoom}px`,
        height: `${metrics.lineHeight * viewport.zoom}px`,
        left: pos.x,
        lineHeight: "1.5",
        top: pos.y,
        width: inputWidth,
      }}
      type="text"
      value={obj.label ?? ""}
    />
  );
};
