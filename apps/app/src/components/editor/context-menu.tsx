"use client";

import type { Layer, ObjectId } from "@wiretext/engine";
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

const isSeparator = (entry: MenuEntry): entry is MenuSeparator =>
  "type" in entry && entry.type === "separator";

const isSubmenu = (entry: MenuEntry): entry is SubMenuItem => "items" in entry;

const MenuItemRow = ({ item }: { item: MenuItem }) => (
  <button
    className="flex w-full items-center justify-between gap-4 rounded px-2 py-1 text-left text-text text-xs transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
    disabled={item.disabled}
    onClick={() => {
      item.action();
    }}
    type="button"
  >
    <span>{item.label}</span>
    {item.shortcut !== undefined && item.shortcut !== "" && (
      <span className="text-[10px] text-text-dim">{item.shortcut}</span>
    )}
  </button>
);

const SubmenuRow = ({ item }: { item: SubMenuItem }) => (
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

interface SelectionEntryContext {
  act: (fn: () => void) => () => void;
  canGroup: boolean;
  hasClipboard: boolean;
  hasGroupInSelection: boolean;
  otherLayers: Layer[];
  selection: Set<ObjectId>;
}

const buildSelectionEntries = ({
  act,
  canGroup,
  hasClipboard,
  hasGroupInSelection,
  otherLayers,
  selection,
}: SelectionEntryContext): MenuEntry[] => {
  const entries: MenuEntry[] = [
    {
      action: act(() => {
        useEditorStore.getState().copySelection();
      }),
      label: "Copy",
      shortcut: "⌘C",
    },
    {
      action: act(() => {
        useEditorStore.getState().cutSelection();
      }),
      label: "Cut",
      shortcut: "⌘X",
    },
    {
      action: act(() => {
        useEditorStore.getState().pasteClipboard();
      }),
      disabled: !hasClipboard,
      label: "Paste",
      shortcut: "⌘V",
    },
    {
      action: act(() => {
        useEditorStore.getState().duplicateSelection();
      }),
      label: "Duplicate",
      shortcut: "⌘D",
    },
    {
      action: act(() => {
        useEditorStore.getState().deleteSelection();
      }),
      label: "Delete",
      shortcut: "⌫",
    },
    { id: "sep-edit-order", type: "separator" },
    {
      action: act(() => {
        useEditorStore.getState().bringToFront([...selection]);
      }),
      label: "Bring to Front",
      shortcut: "⌘]",
    },
    {
      action: act(() => {
        useEditorStore.getState().bringForward([...selection]);
      }),
      label: "Bring Forward",
      shortcut: "]",
    },
    {
      action: act(() => {
        useEditorStore.getState().sendBackward([...selection]);
      }),
      label: "Send Backward",
      shortcut: "[",
    },
    {
      action: act(() => {
        useEditorStore.getState().sendToBack([...selection]);
      }),
      label: "Send to Back",
      shortcut: "⌘[",
    },
  ];

  if (otherLayers.length > 0) {
    entries.push(
      { id: "sep-order-layer", type: "separator" },
      {
        items: otherLayers.map((l) => ({
          action: act(() => {
            useEditorStore.getState().moveObjectsToLayer([...selection], l.id);
          }),
          label: l.name,
        })),
        label: "Move to Layer",
      }
    );
  }

  entries.push(
    { id: "sep-layer-group", type: "separator" },
    {
      action: act(() => {
        useEditorStore.getState().groupSelection();
      }),
      disabled: !canGroup,
      label: "Group Selection",
      shortcut: "⌘G",
    },
    {
      action: act(() => {
        useEditorStore.getState().ungroupSelection();
      }),
      disabled: !hasGroupInSelection,
      label: "Ungroup",
      shortcut: "⌘⇧G",
    }
  );

  return entries;
};

// Empty canvas context menu
const buildEmptyCanvasEntries = (
  act: (fn: () => void) => () => void,
  hasClipboard: boolean
): MenuEntry[] => [
  {
    action: act(() => {
      useEditorStore.getState().pasteClipboard();
    }),
    disabled: !hasClipboard,
    label: "Paste",
    shortcut: "⌘V",
  },
  {
    action: act(() => {
      useEditorStore.getState().selectAll();
    }),
    label: "Select All",
    shortcut: "⌘A",
  },
];

export const ContextMenu = () => {
  const contextMenu = useEditorStore((s) => s.contextMenu);
  const setContextMenu = useEditorStore((s) => s.setContextMenu);
  const selection = useEditorStore((s) => s.selection);
  const objects = useEditorStore((s) => s.objects);
  const layers = useEditorStore((s) => s.layers);
  const clipboard = useEditorStore((s) => s.clipboard);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!contextMenu) {
        return;
      }
      if (
        menuRef.current &&
        e.target instanceof Node &&
        !menuRef.current.contains(e.target)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
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

  const close = () => {
    setContextMenu(null);
  };
  const act = (fn: () => void) => () => {
    fn();
    close();
  };

  const hasSelection = selection.size > 0;
  const hasClipboard = clipboard.length > 0;

  const selectedObjs = objects.filter((o) => selection.has(o.id));
  const selectedLayerIds = new Set(selectedObjs.map((o) => o.layerId));
  const allSameLayer = selectedLayerIds.size === 1;
  const canGroup = selection.size >= 2 && allSameLayer;
  const hasGroupInSelection = selectedObjs.some(
    (o) => o.groupId !== undefined && o.groupId !== ""
  );

  // Other layers for "Move to Layer" submenu
  const otherLayers = layers.filter((l) => {
    if (selectedLayerIds.size === 1) {
      return l.id !== [...selectedLayerIds][0];
    }
    return true;
  });

  const entries: MenuEntry[] = hasSelection
    ? buildSelectionEntries({
        act,
        canGroup,
        hasClipboard,
        hasGroupInSelection,
        otherLayers,
        selection,
      })
    : buildEmptyCanvasEntries(act, hasClipboard);

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
};
