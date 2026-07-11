"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { version } from "@/../package.json";

interface AboutDialogProps {
  onClose: () => void;
  open: boolean;
}

const KEYBOARD_SHORTCUTS = [
  { action: "Select", keys: "V" },
  { action: "Box", keys: "B" },
  { action: "Text", keys: "T" },
  { action: "Line", keys: "L" },
  { action: "Arrow", keys: "A" },
  { action: "Undo", keys: "⌘Z" },
  { action: "Redo", keys: "⌘⇧Z" },
  { action: "Copy", keys: "⌘C" },
  { action: "Duplicate", keys: "⌘D" },
  { action: "Delete", keys: "⌫" },
  { action: "Reorder", keys: "[ ]" },
  { action: "Export", keys: "⌘E" },
] as const;

export const AboutDialog = ({ open, onClose }: AboutDialogProps) => {
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

  return (
    <dialog
      aria-label="About Wiretext"
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
          <h2 className="font-mono text-base text-text">┌─ Wiretext ─┐</h2>
          <p className="mt-0.5 text-[11px] text-text-dim">
            Unicode wireframe design tool
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

      <div className="flex-1 overflow-y-auto">
        {/* About */}
        <div className="border-border border-b px-5 py-4">
          <p className="text-text-dim text-xs leading-relaxed">
            Figma, but everything is text. What started as a joke turns out to
            be useful. Draw the simplest possible wireframe, and export as pure
            text or markdown — share quick thoughts with Claude Code, or drop a
            diagram into a GitHub issue. An experiment by{" "}
            <a
              className="text-accent underline decoration-accent/30 hover:decoration-accent"
              href="https://danielhowells.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Howells
            </a>
            .
          </p>
        </div>

        {/* Keyboard shortcuts */}
        <div className="px-5 py-4">
          <h3 className="mb-3 text-[10px] text-text-dim uppercase tracking-wider">
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
            {KEYBOARD_SHORTCUTS.map((item) => (
              <div className="flex items-center gap-2" key={item.action}>
                <kbd className="shrink-0 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text">
                  {item.keys}
                </kbd>
                <span className="text-[11px] text-text-dim">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-border border-t px-5 py-3">
        <span className="font-mono text-[10px] text-text-dim">v{version}</span>
        <span className="font-mono text-[10px] text-text-dim">
          └────────────────┘
        </span>
      </div>
    </dialog>
  );
};
