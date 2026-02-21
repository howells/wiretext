"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store";

interface MenuItem {
  action: () => void;
  disabled?: boolean;
  label: string;
  shortcut?: string;
}

interface MenuSeparator {
  id: string;
  type: "separator";
}

interface SubMenuItem {
  items: MenuItem[];
  label: string;
}

type MenuEntry = MenuItem | MenuSeparator | SubMenuItem;

function isSeparator(entry: MenuEntry): entry is MenuSeparator {
  return "type" in entry && entry.type === "separator";
}

function isSubmenu(entry: MenuEntry): entry is SubMenuItem {
  return "items" in entry;
}

function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <button
      className="flex w-full items-center justify-between gap-4 rounded px-2 py-1 text-left text-text text-xs transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
      disabled={item.disabled}
      onClick={item.action}
      type="button"
    >
      <span>{item.label}</span>
      {item.shortcut && (
        <span className="text-[10px] text-text-dim">{item.shortcut}</span>
      )}
    </button>
  );
}

function SubmenuRow({ item }: { item: SubMenuItem }) {
  return (
    <div className="group/sub relative">
      <div className="flex w-full items-center justify-between gap-4 rounded px-2 py-1 text-left text-text text-xs transition-colors hover:bg-surface-hover">
        <span>{item.label}</span>
        <span className="text-[10px] text-text-dim">▸</span>
      </div>
      <div className="invisible absolute top-0 left-full ml-1 min-w-[120px] rounded border border-border bg-surface p-1 shadow-lg group-hover/sub:visible">
        {item.items.map((subItem) => (
          <MenuItemRow item={subItem} key={subItem.label} />
        ))}
      </div>
    </div>
  );
}

export function ContextMenu() {
  const contextMenu = useEditorStore((s) => s.contextMenu);
  const setContextMenu = useEditorStore((s) => s.setContextMenu);
  const selection = useEditorStore((s) => s.selection);
  const objects = useEditorStore((s) => s.objects);
  const layers = useEditorStore((s) => s.layers);
  const clipboard = useEditorStore((s) => s.clipboard);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!contextMenu) {
      return;
    }
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [contextMenu, setContextMenu]);

  // Clamp position to viewport
  useEffect(() => {
    if (!(contextMenu && menuRef.current)) {
      return;
    }
    const el = menuRef.current;
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    if (contextMenu.x > maxX || contextMenu.y > maxY) {
      setContextMenu({
        ...contextMenu,
        x: Math.max(8, Math.min(contextMenu.x, maxX)),
        y: Math.max(8, Math.min(contextMenu.y, maxY)),
      });
    }
  }, [contextMenu, setContextMenu]);

  if (!contextMenu) {
    return null;
  }

  const close = () => setContextMenu(null);
  const act = (fn: () => void) => () => {
    fn();
    close();
  };

  const store = useEditorStore.getState();
  const hasSelection = selection.size > 0;
  const hasClipboard = clipboard.length > 0;

  const selectedObjs = objects.filter((o) => selection.has(o.id));
  const selectedLayerIds = new Set(selectedObjs.map((o) => o.layerId));
  const allSameLayer = selectedLayerIds.size === 1;
  const canGroup = selection.size >= 2 && allSameLayer;
  const hasGroupInSelection = selectedObjs.some((o) => o.groupId);

  // Other layers for "Move to Layer" submenu
  const otherLayers = layers.filter((l) => {
    if (selectedLayerIds.size === 1) {
      return l.id !== [...selectedLayerIds][0];
    }
    return true;
  });

  const entries: MenuEntry[] = [];

  if (hasSelection) {
    entries.push(
      {
        label: "Copy",
        shortcut: "⌘C",
        action: act(() => store.copySelection()),
      },
      { label: "Cut", shortcut: "⌘X", action: act(() => store.cutSelection()) },
      {
        label: "Paste",
        shortcut: "⌘V",
        action: act(() => store.pasteClipboard()),
        disabled: !hasClipboard,
      },
      {
        label: "Duplicate",
        shortcut: "⌘D",
        action: act(() => store.duplicateSelection()),
      },
      {
        label: "Delete",
        shortcut: "⌫",
        action: act(() => store.deleteSelection()),
      },
      { type: "separator", id: "sep-edit-order" },
      {
        label: "Bring to Front",
        shortcut: "⌘]",
        action: act(() => store.bringToFront([...selection])),
      },
      {
        label: "Bring Forward",
        shortcut: "]",
        action: act(() => store.bringForward([...selection])),
      },
      {
        label: "Send Backward",
        shortcut: "[",
        action: act(() => store.sendBackward([...selection])),
      },
      {
        label: "Send to Back",
        shortcut: "⌘[",
        action: act(() => store.sendToBack([...selection])),
      }
    );

    if (otherLayers.length > 0) {
      entries.push(
        { type: "separator", id: "sep-order-layer" },
        {
          label: "Move to Layer",
          items: otherLayers.map((l) => ({
            label: l.name,
            action: act(() => store.moveObjectsToLayer([...selection], l.id)),
          })),
        }
      );
    }

    entries.push({ type: "separator", id: "sep-layer-group" });
    entries.push({
      label: "Group Selection",
      shortcut: "⌘G",
      action: act(() => store.groupSelection()),
      disabled: !canGroup,
    });
    entries.push({
      label: "Ungroup",
      shortcut: "⌘⇧G",
      action: act(() => store.ungroupSelection()),
      disabled: !hasGroupInSelection,
    });
  } else {
    // Empty canvas context menu
    entries.push(
      {
        label: "Paste",
        shortcut: "⌘V",
        action: act(() => store.pasteClipboard()),
        disabled: !hasClipboard,
      },
      {
        label: "Select All",
        shortcut: "⌘A",
        action: act(() => store.selectAll()),
      }
    );
  }

  return (
    <div
      className="fixed z-50 min-w-[180px] rounded border border-border bg-surface p-1 shadow-lg"
      ref={menuRef}
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      {entries.map((entry) => {
        if (isSeparator(entry)) {
          return <div className="my-1 border-border border-t" key={entry.id} />;
        }
        if (isSubmenu(entry)) {
          return <SubmenuRow item={entry} key={entry.label} />;
        }
        return <MenuItemRow item={entry} key={entry.label} />;
      })}
    </div>
  );
}
