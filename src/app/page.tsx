"use client";

import { useCallback, useEffect, useState } from "react";
import { Canvas } from "@/components/editor/canvas";
import { ExportDialog } from "@/components/editor/export-dialog";
import { LabelEditorOverlay } from "@/components/editor/label-editor-overlay";
import { PropertiesPanel } from "@/components/editor/properties-panel";
import { StatusBar } from "@/components/editor/status-bar";
import { TextEditorOverlay } from "@/components/editor/text-editor-overlay";
import { Toolbar } from "@/components/editor/toolbar";
import { copyToClipboard } from "@/lib/clipboard";
import { decodeDocument, getShareUrl } from "@/lib/sharing";
import { useCanvasEvents } from "@/lib/use-canvas-events";
import { useCharMetrics } from "@/lib/use-char-metrics";
import { useKeyboard } from "@/lib/use-keyboard";
import { useEditorStore } from "@/store";

export default function EditorPage() {
  const { onMouseDown, onMouseMove, onMouseUp, cursor } = useCanvasEvents();
  const objects = useEditorStore((s) => s.objects);
  const metrics = useCharMetrics();
  const [hoverCoord, setHoverCoord] = useState({ col: 0, row: 0 });
  const [exportOpen, setExportOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const toggleExport = useCallback(() => setExportOpen((v) => !v), []);
  useKeyboard(toggleExport);

  // Load from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      return;
    }
    const decoded = decodeDocument(hash);
    if (decoded && decoded.length > 0) {
      const store = useEditorStore.getState();
      for (const obj of decoded) {
        store.addObject(obj);
      }
    }
  }, []);

  const handleGridHover = useCallback((col: number, row: number) => {
    setHoverCoord({ col, row });
  }, []);

  const handleShare = useCallback(async () => {
    const url = getShareUrl(useEditorStore.getState().objects);
    const ok = await copyToClipboard(url);
    if (ok) {
      window.history.replaceState(null, "", url);
      setShareMsg("URL copied!");
      setTimeout(() => setShareMsg(""), 2000);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col bg-bg">
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />

        <div className="relative flex-1" style={{ cursor }}>
          <Canvas
            onGridHover={handleGridHover}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          />
          {metrics && <TextEditorOverlay metrics={metrics} />}
          {metrics && <LabelEditorOverlay metrics={metrics} />}

          {/* Empty state prompt */}
          {objects.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-text-dim opacity-60">
                Press <kbd className="text-accent">B</kbd> to draw a box, or{" "}
                <kbd className="text-accent">T</kbd> to add text
              </p>
            </div>
          )}

          {/* Top-right action buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              className="rounded border border-border bg-surface px-3 py-1.5 text-text-dim text-xs transition-colors hover:bg-surface-hover hover:text-text"
              onClick={() => useEditorStore.getState().clearAll()}
              type="button"
            >
              Clear All
            </button>
            <button
              className="rounded border border-border bg-surface px-3 py-1.5 text-text-dim text-xs transition-colors hover:bg-surface-hover hover:text-text"
              onClick={() => setExportOpen(true)}
              type="button"
            >
              Export
            </button>
            <button
              className="rounded border border-border bg-surface px-3 py-1.5 text-text-dim text-xs transition-colors hover:bg-surface-hover hover:text-text"
              onClick={handleShare}
              type="button"
            >
              {shareMsg || "Share"}
            </button>
          </div>
        </div>

        <PropertiesPanel />
      </div>

      <StatusBar hoverCol={hoverCoord.col} hoverRow={hoverCoord.row} />
      <ExportDialog onClose={() => setExportOpen(false)} open={exportOpen} />
    </div>
  );
}
