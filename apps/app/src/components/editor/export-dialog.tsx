"use client";

import { prepareForExport } from "@wiretext/engine";
import type { GridSize, Layer, WireObject } from "@wiretext/engine";
import { useEffect, useEffectEvent, useRef, useState } from "react";

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
  github: "GitHub",
  html: "HTML",
  markdown: "Markdown",
  text: "Plain Text",
};

interface ExportDialogProps {
  onClose: () => void;
  open: boolean;
}

const buildOutput = (
  format: ExportFormat,
  exportObjects: WireObject[],
  exportGridSize: GridSize,
  objects: WireObject[],
  layers: Layer[]
): string => {
  switch (format) {
    case "text": {
      return composeToText(exportObjects, exportGridSize, layers);
    }
    case "markdown": {
      return composeToMarkdown(exportObjects, exportGridSize, layers);
    }
    case "html": {
      return composeToHtml(exportObjects, exportGridSize, layers);
    }
    case "github": {
      return composeToGitHub(
        exportObjects,
        exportGridSize,
        objects.length > 0 ? getShareUrl(objects, layers) : undefined,
        layers
      );
    }
    default: {
      return composeToText(exportObjects, exportGridSize, layers);
    }
  }
};

const FormatTabs = ({
  format,
  onSelect,
}: {
  format: ExportFormat;
  onSelect: (format: ExportFormat) => void;
}) => (
  <div className="flex gap-1 border-border border-b px-4 py-2">
    {(["text", "markdown", "html", "github"] as ExportFormat[]).map((f) => (
      <button
        className={`rounded px-3 py-1 text-xs transition-colors ${
          format === f ? "bg-accent text-bg" : "text-text-dim hover:text-text"
        }`}
        key={f}
        onClick={() => {
          onSelect(f);
        }}
        type="button"
      >
        {FORMAT_LABELS[f]}
      </button>
    ))}
  </div>
);

export const ExportDialog = ({ open, onClose }: ExportDialogProps) => {
  const objects = useEditorStore((s) => s.objects);
  const layers = useEditorStore((s) => s.layers);
  const { objects: exportObjects, gridSize: exportGridSize } = prepareForExport(
    objects,
    1
  );
  const [format, setFormat] = useState<ExportFormat>("text");
  const [copied, setCopied] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeFromBackdrop = useEffectEvent(() => {
    onClose();
  });

  const getOutput = () =>
    buildOutput(format, exportObjects, exportGridSize, objects, layers);

  const handleCopy = async () => {
    const ok = await copyToClipboard(getOutput());
    if (ok) {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      trackExport(format);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        closeFromBackdrop();
      }
    };
    dialog?.addEventListener("click", handleClick);
    return () => {
      dialog?.removeEventListener("click", handleClick);
    };
  }, []);

  const output = open ? getOutput() : "";

  return (
    <dialog
      aria-label="Export dialog"
      className="max-h-[80vh] w-[640px] flex-col rounded-lg border border-border bg-surface p-0 backdrop:bg-black/60 open:flex"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        setCopied(false);
      }}
      ref={dialogRef}
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
      <FormatTabs format={format} onSelect={setFormat} />

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
          onClick={() => {
            void handleCopy();
          }}
          type="button"
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>
    </dialog>
  );
};
