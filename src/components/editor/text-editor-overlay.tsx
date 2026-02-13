"use client";

import { useEffect, useRef } from "react";
import type { CharMetrics, TextObject } from "@/engine/types";
import { gridToScreen } from "@/lib/coordinates";
import { useEditorStore } from "@/store";

interface TextEditorOverlayProps {
  metrics: CharMetrics;
}

export function TextEditorOverlay({ metrics }: TextEditorOverlayProps) {
  const editingTextId = useEditorStore((s) => s.editingTextId);
  const objects = useEditorStore((s) => s.objects);
  const viewport = useEditorStore((s) => s.viewport);
  const updateObject = useEditorStore((s) => s.updateObject);
  const setEditingTextId = useEditorStore((s) => s.setEditingTextId);
  const deleteObject = useEditorStore((s) => s.deleteObject);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mountedAt = useRef(0);

  const textObj = editingTextId
    ? (objects.find((o) => o.id === editingTextId) as TextObject | undefined)
    : null;

  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      mountedAt.current = Date.now();
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [editingTextId]);

  if (!textObj) {
    return null;
  }

  const pos = gridToScreen(
    textObj.position.col,
    textObj.position.row,
    viewport,
    metrics
  );

  const handleBlur = () => {
    // Ignore blur if it happens too quickly (within 100ms of mount)
    // This prevents immediate deletion from focus race conditions
    if (Date.now() - mountedAt.current < 100) {
      textareaRef.current?.focus();
      return;
    }
    if (!textObj.content.trim()) {
      deleteObject(textObj.id);
    }
    setEditingTextId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (!textObj.content.trim()) {
        deleteObject(textObj.id);
      }
      setEditingTextId(null);
    }
    // Stop propagation to prevent keyboard shortcuts from firing
    e.stopPropagation();
  };

  return (
    <textarea
      className="absolute z-50 resize-none border border-accent bg-bg/80 p-0 font-mono text-text outline-none"
      onBlur={handleBlur}
      onChange={(e) =>
        updateObject(textObj.id, {
          content: e.target.value,
        } as Partial<TextObject>)
      }
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
      ref={textareaRef}
      spellCheck={false}
      style={{
        left: pos.x,
        top: pos.y,
        fontSize: `${14 * viewport.zoom}px`,
        lineHeight: "1.5",
        minWidth: `${metrics.charWidth * viewport.zoom * 10}px`,
        minHeight: `${metrics.lineHeight * viewport.zoom}px`,
      }}
      value={textObj.content}
    />
  );
}
