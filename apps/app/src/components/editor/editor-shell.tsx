"use client";

import type { DecodedDocument } from "@wiretext/engine";
import { decodeDocument, encodeDocument } from "@wiretext/engine";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { trackDocumentLoaded, trackShare } from "@/lib/analytics";
import { copyToClipboard } from "@/lib/clipboard";
import { getShareUrl } from "@/lib/sharing";
import { useCanvasEvents } from "@/lib/use-canvas-events";
import { useCharMetrics } from "@/lib/use-char-metrics";
import { useKeyboard } from "@/lib/use-keyboard";
import { useEditorStore } from "@/store";
import { Canvas } from "./canvas";
import { ContextMenu } from "./context-menu";
import { ExamplesDialog } from "./examples-dialog";
import { ExportDialog } from "./export-dialog";
import { LabelEditorOverlay } from "./label-editor-overlay";
import { McpDialog } from "./mcp-dialog";
import { PropertiesPanel } from "./properties-panel";
import { StatusBar } from "./status-bar";
import { TextEditorOverlay } from "./text-editor-overlay";
import { Toolbar } from "./toolbar";

interface EditorShellProps {
  initialDocument?: DecodedDocument | null;
}

export function EditorShell({ initialDocument }: EditorShellProps) {
  const { onMouseDown, onMouseMove, onMouseUp, cursor } = useCanvasEvents();
  const objects = useEditorStore((s) => s.objects);
  const metrics = useCharMetrics();
  const [hoverCoord, setHoverCoord] = useState({ col: 0, row: 0 });
  const [exportOpen, setExportOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [mcpOpen, setMcpOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const toggleExport = useCallback(() => setExportOpen((v) => !v), []);
  useKeyboard(toggleExport);

  // Tracks whether the browser bar currently shows a short URL (/w/...)
  const shortUrlActive = useRef(false);

  // Load document: from prop (short URL) or hash (hash URL)
  useLayoutEffect(() => {
    const store = useEditorStore.getState();

    if (initialDocument) {
      store.loadDocument(initialDocument.objects, initialDocument.layers);
      shortUrlActive.current = true;
      trackDocumentLoaded();
      return;
    }

    const hash = window.location.hash.slice(1);
    if (!hash) {
      return;
    }
    const decoded = decodeDocument(hash);
    if (decoded && decoded.objects.length > 0) {
      store.loadDocument(decoded.objects, decoded.layers);
      trackDocumentLoaded();
    }
  }, [initialDocument]);

  // Clear short URL from browser bar when document content changes
  useEffect(() => {
    let prevObjects = useEditorStore.getState().objects;
    let prevLayers = useEditorStore.getState().layers;

    const unsub = useEditorStore.subscribe((state) => {
      if (!shortUrlActive.current) {
        prevObjects = state.objects;
        prevLayers = state.layers;
        return;
      }
      if (state.objects !== prevObjects || state.layers !== prevLayers) {
        shortUrlActive.current = false;
        window.history.replaceState(null, "", "/");
      }
      prevObjects = state.objects;
      prevLayers = state.layers;
    });
    return unsub;
  }, []);

  const handleGridHover = useCallback((col: number, row: number) => {
    setHoverCoord({ col, row });
  }, []);

  const handleShare = useCallback(async () => {
    const state = useEditorStore.getState();
    const encoded = encodeDocument(state.objects, state.layers);

    // Try short URL first
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: encoded }),
      });
      if (res.ok) {
        const { id, url } = await res.json();
        await copyToClipboard(url);
        window.history.replaceState(null, "", `/w/${id}`);
        shortUrlActive.current = true;
        setShareMsg("URL copied!");
        setTimeout(() => setShareMsg(""), 2000);
        trackShare();
        return;
      }
    } catch {
      // Fall through to hash URL
    }

    // Fallback: hash URL
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
    <div className="fixed inset-0 flex flex-col bg-bg">
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
              onClick={() => setExamplesOpen(true)}
              type="button"
            >
              Examples
            </button>
            <button
              className="rounded border border-border bg-surface px-3 py-1.5 text-text-dim text-xs transition-colors hover:bg-surface-hover hover:text-text"
              onClick={() => setMcpOpen(true)}
              type="button"
            >
              MCP
            </button>
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

        {/* Inspector sidebar */}
        <div className="flex w-52 flex-col border-border border-l bg-surface">
          <div className="flex items-center border-border border-b px-3 py-2">
            <span className="text-[10px] text-text-dim uppercase tracking-wider">
              Inspector
            </span>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <PropertiesPanel />
          </div>
        </div>
      </div>

      <StatusBar hoverCol={hoverCoord.col} hoverRow={hoverCoord.row} />
      <ExportDialog onClose={() => setExportOpen(false)} open={exportOpen} />
      <ExamplesDialog
        onClose={() => setExamplesOpen(false)}
        open={examplesOpen}
      />
      <McpDialog onClose={() => setMcpOpen(false)} open={mcpOpen} />
      <ContextMenu />
    </div>
  );
}
