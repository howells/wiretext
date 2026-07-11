"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Layer, WireObject } from "@wiretext/engine";
import { useRef, useState } from "react";

import { useEditorStore } from "@/store";

// Layers and objects share one dnd-kit context, so every draggable id is
// prefixed to disambiguate the two and carry the underlying id. parseId reverses
// this at drop time to route the drag to the right reorder handler.
// ── Drag ID prefixes ────────────────────────────────────────────────
const LAYER_PREFIX = "layer:";
const OBJ_PREFIX = "obj:";

const layerDragId = (id: string) => `${LAYER_PREFIX}${id}`;
const objDragId = (id: string) => `${OBJ_PREFIX}${id}`;
const parseId = (
  dragId: string
): { type: "layer" | "obj"; id: string } | null => {
  if (dragId.startsWith(LAYER_PREFIX)) {
    return { id: dragId.slice(LAYER_PREFIX.length), type: "layer" };
  }
  if (dragId.startsWith(OBJ_PREFIX)) {
    return { id: dragId.slice(OBJ_PREFIX.length), type: "obj" };
  }
  return null;
};

// ── Object type display helpers ─────────────────────────────────────
const OBJECT_ICONS: Record<WireObject["type"], string> = {
  arrow: "→",
  box: "□",
  component: "▣",
  connector: "┌",
  line: "─",
  text: "T",
};

const getObjectIcon = (obj: WireObject): string => OBJECT_ICONS[obj.type];

const getDefaultLabel = (obj: WireObject): string => {
  switch (obj.type) {
    case "box": {
      return obj.label ?? "Box";
    }
    case "text": {
      return obj.content.slice(0, 15) || "Text";
    }
    case "line": {
      return "Line";
    }
    case "arrow": {
      return "Arrow";
    }
    case "connector": {
      return obj.label ?? "Connector";
    }
    case "component": {
      return obj.label ?? obj.componentType;
    }
    default: {
      return "Object";
    }
  }
};

const getObjectLabel = (obj: WireObject): string =>
  obj.name ?? getDefaultLabel(obj);

// ── Sortable object row ─────────────────────────────────────────────
const SortableObjectRow = ({
  obj,
  isSelected,
  isLocked,
}: {
  obj: WireObject;
  isSelected: boolean;
  isLocked: boolean;
}) => {
  const selectObject = useEditorStore((s) => s.selectObject);
  const updateObject = useEditorStore((s) => s.updateObject);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ disabled: isLocked, id: objDragId(obj.id) });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(obj.name ?? getDefaultLabel(obj));
    setEditing(true);
  };

  const renameTo = (value?: string) => {
    updateObject(obj.id, { name: value });
  };

  const handleRenameSubmit = () => {
    const trimmed = editName.trim();
    // Clear name if it matches the default label (revert to auto-name)
    if (trimmed === "" || trimmed === getDefaultLabel(obj)) {
      if (obj.name !== undefined && obj.name !== "") {
        renameTo();
      }
    } else if (trimmed !== obj.name) {
      renameTo(trimmed);
    }
    setEditing(false);
  };

  const label =
    obj.groupId !== undefined && obj.groupId !== ""
      ? `⫘ ${getObjectLabel(obj)}`
      : getObjectLabel(obj);

  return (
    <button
      className={`flex h-6 w-full items-center gap-1 rounded border-none pr-1 pl-5 text-left text-[11px] ${
        isSelected
          ? "bg-accent/20 text-text"
          : "text-text-dim hover:bg-surface-hover hover:text-text"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!editing) {
          selectObject(obj.id, e.metaKey || e.ctrlKey || e.shiftKey);
        }
      }}
      ref={setNodeRef}
      style={style}
      type="button"
    >
      {/* Drag handle */}
      {!isLocked && (
        <span
          className="cursor-grab text-text-dim/50 hover:text-text-dim"
          suppressHydrationWarning
          {...attributes}
          {...listeners}
        >
          ⋮
        </span>
      )}
      <span className="shrink-0 font-mono text-text-dim">
        {getObjectIcon(obj)}
      </span>
      {editing ? (
        <input
          className="min-w-0 flex-1 rounded border border-accent bg-bg px-1 py-0 text-[11px] text-text outline-none"
          onBlur={handleRenameSubmit}
          onChange={(e) => {
            setEditName(e.target.value);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              handleRenameSubmit();
            }
            if (e.key === "Escape") {
              setEditing(false);
            }
          }}
          ref={(el) => {
            inputRef.current = el;
            el?.focus();
          }}
          value={editName}
        />
      ) : (
        <span
          className={`min-w-0 flex-1 truncate ${obj.name !== undefined && obj.name !== "" ? "text-text" : ""}`}
          onDoubleClick={handleDoubleClick}
          role="none"
        >
          {label}
        </span>
      )}
    </button>
  );
};

// ── Object list for a layer ─────────────────────────────────────────
const ObjectList = ({
  layerId,
  isLocked,
}: {
  layerId: string;
  isLocked: boolean;
}) => {
  const objects = useEditorStore((s) => s.objects);
  const selection = useEditorStore((s) => s.selection);

  // Objects in this layer sorted by zIndex descending (highest = top, like Figma)
  const layerObjects = objects
    .filter((o) => o.layerId === layerId)
    .toSorted((a, b) => b.zIndex - a.zIndex);

  if (layerObjects.length === 0) {
    return (
      <div className="py-1 pl-5 text-[10px] text-text-dim/50 italic">Empty</div>
    );
  }

  // Items for SortableContext: reversed zIndex order (visual top = first)
  const sortableItems = layerObjects.map((o) => objDragId(o.id));

  return (
    <SortableContext
      items={sortableItems}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex flex-col">
        {layerObjects.map((obj) => (
          <SortableObjectRow
            isLocked={isLocked}
            isSelected={selection.has(obj.id)}
            key={obj.id}
            obj={obj}
          />
        ))}
      </div>
    </SortableContext>
  );
};

// ── Layer row toggle buttons (expand / visibility / lock) ──────────
const LayerRowToggles = ({
  isExpanded,
  layer,
  onToggleExpand,
}: {
  isExpanded: boolean;
  layer: Layer;
  onToggleExpand: () => void;
}) => {
  const toggleLayerVisibility = useEditorStore((s) => s.toggleLayerVisibility);
  const toggleLayerLock = useEditorStore((s) => s.toggleLayerLock);

  return (
    <>
      {/* Expand/collapse toggle */}
      <button
        className="shrink-0 text-[10px] text-text-dim"
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        type="button"
      >
        {isExpanded ? "▾" : "▸"}
      </button>

      {/* Visibility toggle */}
      <button
        aria-label={layer.visible ? "Hide layer" : "Show layer"}
        className={`shrink-0 text-xs transition-opacity ${
          layer.visible ? "opacity-100" : "opacity-40"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          toggleLayerVisibility(layer.id);
        }}
        type="button"
      >
        {layer.visible ? "◉" : "○"}
      </button>

      {/* Lock toggle */}
      <button
        aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
        className={`shrink-0 text-xs transition-opacity ${
          layer.locked ? "opacity-100" : "opacity-40"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          toggleLayerLock(layer.id);
        }}
        type="button"
      >
        {layer.locked ? "◆" : "◇"}
      </button>
    </>
  );
};

// ── Layer name (inline-editable) ────────────────────────────────────
const LayerNameField = ({
  editing,
  name,
  onCancel,
  onChange,
  onDoubleClick,
  onSubmit,
  value,
}: {
  editing: boolean;
  name: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onDoubleClick: () => void;
  onSubmit: () => void;
  value: string;
}) => {
  if (editing) {
    return (
      <input
        className="min-w-0 flex-1 rounded border border-accent bg-bg px-1 py-0.5 text-text text-xs outline-none"
        onBlur={onSubmit}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            onSubmit();
          }
          if (e.key === "Escape") {
            onCancel();
          }
        }}
        ref={(el) => el?.focus()}
        value={value}
      />
    );
  }
  return (
    <span
      className="min-w-0 flex-1 truncate"
      onDoubleClick={onDoubleClick}
      role="none"
    >
      {name}
    </span>
  );
};

// ── Delete layer button ─────────────────────────────────────────────
const DeleteLayerButton = ({ layerId }: { layerId: string }) => {
  const deleteLayer = useEditorStore((s) => s.deleteLayer);

  return (
    <button
      aria-label="Delete layer"
      className="shrink-0 text-text-dim text-xs opacity-0 transition-opacity hover:text-text group-hover:opacity-100"
      onClick={(e) => {
        e.stopPropagation();
        deleteLayer(layerId);
      }}
      type="button"
    >
      ×
    </button>
  );
};

// ── Sortable layer row ──────────────────────────────────────────────
const SortableLayerRow = ({
  layer,
  isExpanded,
  onToggleExpand,
}: {
  layer: Layer;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const objects = useEditorStore((s) => s.objects);
  const selection = useEditorStore((s) => s.selection);
  const setActiveLayer = useEditorStore((s) => s.setActiveLayer);
  const renameLayer = useEditorStore((s) => s.renameLayer);
  const layers = useEditorStore((s) => s.layers);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);

  const isActive = layer.id === activeLayerId;
  const objectCount = objects.filter((o) => o.layerId === layer.id).length;
  const selectedInLayer = objects.filter(
    (o) => o.layerId === layer.id && selection.has(o.id)
  ).length;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layerDragId(layer.id) });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDoubleClick = () => {
    setEditName(layer.name);
    setEditing(true);
  };

  const handleRenameSubmit = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== layer.name) {
      renameLayer(layer.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`group flex h-7 w-full cursor-pointer items-center gap-1 rounded px-1.5 text-left text-xs transition-colors ${
          isActive
            ? "bg-surface-hover text-text"
            : "text-text-dim hover:bg-surface-hover hover:text-text"
        }`}
        onClick={() => {
          setActiveLayer(layer.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActiveLayer(layer.id);
          }
        }}
        role="none"
      >
        {/* Drag handle */}
        <span
          className="shrink-0 cursor-grab text-text-dim/50 hover:text-text-dim"
          suppressHydrationWarning
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </span>

        <LayerRowToggles
          isExpanded={isExpanded}
          layer={layer}
          onToggleExpand={onToggleExpand}
        />

        {/* Layer name */}
        <LayerNameField
          editing={editing}
          name={layer.name}
          onCancel={() => {
            setEditing(false);
          }}
          onChange={setEditName}
          onDoubleClick={handleDoubleClick}
          onSubmit={handleRenameSubmit}
          value={editName}
        />

        {/* Object count badge */}
        <span className="shrink-0 text-[10px] text-text-dim">
          {selectedInLayer > 0
            ? `${selectedInLayer}/${objectCount}`
            : objectCount}
        </span>

        {/* Delete button (only if more than one layer) */}
        {layers.length > 1 && <DeleteLayerButton layerId={layer.id} />}
      </div>

      {/* Expandable object list */}
      {isExpanded && <ObjectList isLocked={layer.locked} layerId={layer.id} />}
    </div>
  );
};

// ── Drag handlers (extracted for complexity) ────────────────────────
// The panel renders both layers and objects top-down (highest first), the
// reverse of their storage order: layers are drawn from the reversed array and
// objects sorted by zIndex descending. So a drop's *visual* index must be mapped
// back to a storage index before it reaches the store — hence the arithmetic
// below. Layer and object drags are kept separate; a drag that crosses between
// the two kinds, or across layers, is ignored.
const handleLayerDrag = (
  activeId: string,
  overId: string,
  reversedLayers: Layer[],
  totalLayers: number,
  reorderLayer: (id: string, newIndex: number) => void
) => {
  const overVisualIdx = reversedLayers.findIndex((l) => l.id === overId);
  if (overVisualIdx === -1) {
    return;
  }
  const arrayIndex = totalLayers - 1 - overVisualIdx;
  reorderLayer(activeId, arrayIndex);
};

const handleObjectDrag = (
  activeId: string,
  overId: string,
  reorderObjectZIndex: (objectId: string, newPosition: number) => void
) => {
  const { objects } = useEditorStore.getState();
  const activeObj = objects.find((o) => o.id === activeId);
  const overObj = objects.find((o) => o.id === overId);
  if (!(activeObj && overObj) || activeObj.layerId !== overObj.layerId) {
    return;
  }

  const layerObjs = objects
    .filter((o) => o.layerId === activeObj.layerId)
    .toSorted((a, b) => b.zIndex - a.zIndex);

  const overIdx = layerObjs.findIndex((o) => o.id === overId);
  if (overIdx !== -1) {
    reorderObjectZIndex(activeId, overIdx);
  }
};

// ── Main LayersPanel ────────────────────────────────────────────────
export const LayersPanel = () => {
  const layers = useEditorStore((s) => s.layers);
  const addLayer = useEditorStore((s) => s.addLayer);
  const selection = useEditorStore((s) => s.selection);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const moveObjectsToLayer = useEditorStore((s) => s.moveObjectsToLayer);
  const reorderLayer = useEditorStore((s) => s.reorderLayer);
  const reorderObjectZIndex = useEditorStore((s) => s.reorderObjectZIndex);

  // Track which layers are expanded (active layer auto-expands)
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const toggleExpand = (layerId: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  // Display layers reversed (top layer = last in array = first visually)
  const reversedLayers = [...layers].toReversed();
  const sortableLayerIds = reversedLayers.map((l) => layerDragId(l.id));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const activeParsed = parseId(String(active.id));
    const overParsed = parseId(String(over.id));
    if (!(activeParsed && overParsed)) {
      return;
    }

    if (activeParsed.type === "layer" && overParsed.type === "layer") {
      handleLayerDrag(
        activeParsed.id,
        overParsed.id,
        reversedLayers,
        layers.length,
        reorderLayer
      );
    } else if (activeParsed.type === "obj" && overParsed.type === "obj") {
      handleObjectDrag(activeParsed.id, overParsed.id, reorderObjectZIndex);
    }
  };

  const handleMoveToActive = () => {
    const ids = [...selection];
    if (ids.length > 0) {
      moveObjectsToLayer(ids, activeLayerId);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {/* Scrollable layer list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SortableContext
            items={sortableLayerIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-0.5">
              {reversedLayers.map((layer) => (
                <SortableLayerRow
                  isExpanded={
                    expandedLayers.has(layer.id) || layer.id === activeLayerId
                  }
                  key={layer.id}
                  layer={layer}
                  onToggleExpand={() => {
                    toggleExpand(layer.id);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Actions (anchored at bottom) */}
        <div className="flex shrink-0 gap-1">
          <button
            className="flex-1 rounded bg-surface-hover px-2 py-1 text-text-dim text-xs transition-colors hover:text-text"
            onClick={() => {
              addLayer();
            }}
            type="button"
          >
            + Layer
          </button>
          {selection.size > 0 && (
            <button
              aria-label="Move selected objects to active layer"
              className="flex-1 rounded bg-surface-hover px-2 py-1 text-text-dim text-xs transition-colors hover:text-text"
              onClick={handleMoveToActive}
              type="button"
            >
              Move here
            </button>
          )}
        </div>
      </div>
    </DndContext>
  );
};
