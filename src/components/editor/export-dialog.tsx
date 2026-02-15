"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getEffectiveGridSize } from "@/engine/grid-size";
import { trackExport } from "@/lib/analytics";
import {
  composeToGitHub,
  composeToHtml,
  composeToMarkdown,
  composeToText,
  copyToClipboard,
} from "@/lib/clipboard";
import { getShareUrl } from "@/lib/sharing";
import { useEditorStore } from "@/store";

type ExportFormat = "text" | "markdown" | "html" | "github";

const FORMAT_LABELS: Record<ExportFormat, string> = {
  text: "Plain Text",
  markdown: "Markdown",
  html: "HTML",
  github: "GitHub",
};

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const objects = useEditorStore((s) => s.objects);
  const layers = useEditorStore((s) => s.layers);
  const gridSize = useEditorStore((s) => s.gridSize);
  const effectiveGridSize = useMemo(
    () => getEffectiveGridSize(objects, gridSize),
    [objects, gridSize]
  );
  const [format, setFormat] = useState<ExportFormat>("text");
  const [copied, setCopied] = useState(false);

  const getOutput = useCallback(() => {
    switch (format) {
      case "text":
        return composeToText(objects, effectiveGridSize, layers);
      case "markdown":
        return composeToMarkdown(objects, effectiveGridSize, layers);
      case "html":
        return composeToHtml(objects, effectiveGridSize, layers);
      case "github":
        return composeToGitHub(
          objects,
          effectiveGridSize,
          objects.length > 0 ? getShareUrl(objects, layers) : undefined,
          layers
        );
      default:
        return composeToText(objects, effectiveGridSize, layers);
    }
  }, [objects, effectiveGridSize, format, layers]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(getOutput());
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackExport(format);
    }
  }, [getOutput, format]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const output = getOutput();

  return (
    <div
      aria-label="Export dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="flex max-h-[80vh] w-[640px] flex-col rounded-lg border border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="flex items-center justify-between border-border border-b px-4 py-3">
          <h2 className="font-medium text-sm text-text">Export</h2>
          <button
            className="text-text-dim hover:text-text"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        {/* Format tabs */}
        <div className="flex gap-1 border-border border-b px-4 py-2">
          {(["text", "markdown", "html", "github"] as ExportFormat[]).map(
            (f) => (
              <button
                className={`rounded px-3 py-1 text-xs transition-colors ${
                  format === f
                    ? "bg-accent text-bg"
                    : "text-text-dim hover:text-text"
                }`}
                key={f}
                onClick={() => setFormat(f)}
                type="button"
              >
                {FORMAT_LABELS[f]}
              </button>
            )
          )}
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="max-h-80 overflow-auto whitespace-pre rounded border border-border bg-bg p-3 font-mono text-text text-xs leading-[1.5]">
            {output}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-border border-t px-4 py-3">
          <button
            className="rounded bg-accent px-4 py-1.5 font-medium text-bg text-xs transition-colors hover:opacity-90"
            onClick={handleCopy}
            type="button"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
