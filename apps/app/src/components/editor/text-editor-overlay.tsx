"use client";

import type { CharMetrics } from "@wiretext/engine";
import { useEffect, useRef } from "react";

import { gridToScreen } from "@/lib/coordinates";
import { useEditorStore } from "@/store";

interface TextEditorOverlayProps {
  metrics: CharMetrics;
}

/**
 * Floating textarea for editing a text object in place, positioned over the
 * object in screen space via gridToScreen.
 *
 * There is no explicit save: every keystroke writes straight to the object
 * through updateObject, so the canvas updates live. Editing ends on blur or
 * Escape, and if the content is blank at that point the (empty) object is
 * deleted. A 100ms guard after mount swallows the spurious blur that can fire
 * during focus hand-off, which would otherwise delete a just-created object.
 */
export const TextEditorOverlay = ({ metrics }: TextEditorOverlayProps) => {
  const editingTextId = useEditorStore((s) => s.editingTextId);
  const objects = useEditorStore((s) => s.objects);
  const viewport = useEditorStore((s) => s.viewport);
  const updateObject = useEditorStore((s) => s.updateObject);
  const setEditingTextId = useEditorStore((s) => s.setEditingTextId);
  const deleteObject = useEditorStore((s) => s.deleteObject);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canBlurRef = useRef(false);

  const found =
    editingTextId !== null && editingTextId !== ""
      ? objects.find((o) => o.id === editingTextId)
      : undefined;
  const textObj = found?.type === "text" ? found : null;

  useEffect(() => {
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    if (editingTextId !== null && editingTextId !== "" && textareaRef.current) {
      canBlurRef.current = false;
      readyTimer = setTimeout(() => {
        canBlurRef.current = true;
      }, 100);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
    return () => {
      clearTimeout(readyTimer);
    };
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
    // Ignore blur that happens too quickly after mount (within 100ms).
    // This prevents immediate deletion from focus race conditions.
    if (!canBlurRef.current) {
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

  const lines = textObj.content.split("\n");
  const longestLine = Math.max(...lines.map((l) => l.length), 1);
  const charW = metrics.charWidth * viewport.zoom;
  const lineH = metrics.lineHeight * viewport.zoom;
  // +1 char for cursor room, minimum 2 chars wide
  const contentWidth = Math.max(longestLine + 1, 2) * charW;
  // +1 line so there's room to start a new line
  const contentHeight = (lines.length + 1) * lineH;

  return (
    <textarea
      className="absolute z-50 resize-none border border-accent bg-bg/80 p-0 font-mono text-text outline-none"
      onBlur={handleBlur}
      onChange={(e) => {
        updateObject(textObj.id, {
          content: e.target.value,
        });
      }}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      ref={textareaRef}
      spellCheck={false}
      style={{
        fontSize: `${14 * viewport.zoom}px`,
        height: contentHeight,
        left: pos.x,
        lineHeight: "1.5",
        top: pos.y,
        width: contentWidth,
      }}
      value={textObj.content}
    />
  );
};
