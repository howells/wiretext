"use client";

import { useCallback, useEffect, useState } from "react";
import { Canvas } from "@/components/editor/canvas";
import { ExportDialog } from "@/components/editor/export-dialog";
import { LabelEditorOverlay } from "@/components/editor/label-editor-overlay";
import { LayersPanel } from "@/components/editor/layers-panel";
import { PropertiesPanel } from "@/components/editor/properties-panel";
import { StatusBar } from "@/components/editor/status-bar";
import { TextEditorOverlay } from "@/components/editor/text-editor-overlay";
import { Toolbar } from "@/components/editor/toolbar";
import { trackDocumentLoaded, trackShare } from "@/lib/analytics";
import { copyToClipboard } from "@/lib/clipboard";
import { decodeDocument, getShareUrl } from "@/lib/sharing";
import { useCanvasEvents } from "@/lib/use-canvas-events";
import { useCharMetrics } from "@/lib/use-char-metrics";
import { useKeyboard } from "@/lib/use-keyboard";
import type { SidebarTab } from "@/store";
import { useEditorStore } from "@/store";

export default function EditorPage() {
  const { onMouseDown, onMouseMove, onMouseUp, cursor } = useCanvasEvents();
  const objects = useEditorStore((s) => s.objects);
  const sidebarTab = useEditorStore((s) => s.sidebarTab);
  const setSidebarTab = useEditorStore((s) => s.setSidebarTab);
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
    if (decoded && decoded.objects.length > 0) {
      const store = useEditorStore.getState();
      store.loadDocument(decoded.objects, decoded.layers);
      trackDocumentLoaded();
    }
  }, []);

  const handleGridHover = useCallback((col: number, row: number) => {
    setHoverCoord({ col, row });
  }, []);

  const handleShare = useCallback(async () => {
    const state = useEditorStore.getState();
    const url = getShareUrl(state.objects, state.layers);
    const ok = await copyToClipboard(url);
    if (ok) {
      window.history.replaceState(null, "", url);
      setShareMsg("URL copied!");
      setTimeout(() => setShareMsg(""), 2000);
      trackShare();
    }
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col bg-bg">
      <h1 className="sr-only">
        Wiretext: Unicode wireframe design tool — draw with text
      </h1>
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

        {/* Tabbed sidebar */}
        <div className="flex w-52 flex-col border-border border-l bg-surface">
          <div className="flex border-border border-b">
            {(["properties", "layers"] as SidebarTab[]).map((tab) => (
              <button
                className={`flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                  sidebarTab === tab
                    ? "border-accent border-b-2 text-text"
                    : "text-text-dim hover:text-text"
                }`}
                key={tab}
                onClick={() => setSidebarTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-3">
            {sidebarTab === "properties" ? (
              <PropertiesPanel />
            ) : (
              <LayersPanel />
            )}
          </div>
        </div>
      </div>

      <StatusBar hoverCol={hoverCoord.col} hoverRow={hoverCoord.row} />
      <ExportDialog onClose={() => setExportOpen(false)} open={exportOpen} />
    </div>
  );
}
