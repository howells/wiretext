"use client";

import { fillDefaults } from "@wiretext/engine";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef } from "react";

import { SHOWCASE_LAYOUTS } from "@/data/showcase-layouts";
import type { ShowcaseLayout } from "@/data/showcase-layouts";
import { useEditorStore } from "@/store";

interface ExamplesDialogProps {
  onClose: () => void;
  open: boolean;
}

export const ExamplesDialog = ({ open, onClose }: ExamplesDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeFromBackdrop = useEffectEvent(() => {
    onClose();
  });

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

  const handleLoadLayout = (layout: ShowcaseLayout) => {
    const { objects: filled, layer } = fillDefaults(layout.objects);
    useEditorStore.getState().loadDocument(filled, [layer]);
    onClose();
  };

  return (
    <dialog
      aria-label="Examples"
      className="max-h-[80vh] w-[480px] flex-col rounded-lg border border-border bg-surface p-0 backdrop:bg-black/60 open:flex"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
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
        {SHOWCASE_LAYOUTS.map((layout) => {
          const href =
            layout.shortId !== undefined && layout.shortId !== ""
              ? `/w/${layout.shortId}`
              : undefined;

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
        })}
      </div>
    </dialog>
  );
};
