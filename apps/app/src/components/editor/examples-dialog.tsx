"use client";

import { fillDefaults } from "@wiretext/engine";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ShowcaseLayout } from "@/data/showcase-layouts";
import { useEditorStore } from "@/store";

interface ExamplesDialogProps {
  onClose: () => void;
  open: boolean;
}

export function ExamplesDialog({ open, onClose }: ExamplesDialogProps) {
  const [layouts, setLayouts] = useState<ShowcaseLayout[] | null>(null);

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

  // Lazy-load layout data on first open
  useEffect(() => {
    if (open && !layouts) {
      import("@/data/showcase-layouts").then((m) =>
        setLayouts(m.SHOWCASE_LAYOUTS),
      );
    }
  }, [open, layouts]);

  const handleLoadLayout = useCallback(
    (layout: ShowcaseLayout) => {
      const { objects: filled, layer } = fillDefaults(layout.objects);
      useEditorStore.getState().loadDocument(filled, [layer]);
      onClose();
    },
    [onClose],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      aria-label="Examples"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        type="button"
      />
      <div className="relative flex max-h-[80vh] w-[480px] flex-col rounded-lg border border-border bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-border border-b px-5 py-4">
          <div>
            <h2 className="font-mono text-base text-text">Examples</h2>
            <p className="mt-0.5 text-[11px] text-text-dim">
              Load a layout into the editor
            </p>
          </div>
          <button
            className="text-text-dim hover:text-text"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Layout list */}
        <div className="flex-1 overflow-y-auto">
          {layouts ? (
            layouts.map((layout) => {
              const href = layout.shortId ? `/w/${layout.shortId}` : undefined;

              return (
                <Link
                  className="block border-border border-b px-5 py-3 transition-colors last:border-b-0 hover:bg-surface-hover"
                  href={href ?? "/"}
                  key={layout.name}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLoadLayout(layout);
                  }}
                >
                  <span className="text-sm text-text">{layout.name}</span>
                  <span className="mt-0.5 block text-[11px] text-text-dim leading-snug">
                    {layout.description}
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="px-5 py-8 text-center text-[11px] text-text-dim">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
