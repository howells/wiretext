"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Layer, WireObject } from "@wiretext/engine";
import { useCallback, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/store";

// ── Drag ID prefixes ────────────────────────────────────────────────
const LAYER_PREFIX = "layer:";
const OBJ_PREFIX = "obj:";

function layerDragId(id: string) {
  return `${LAYER_PREFIX}${id}`;
}
function objDragId(id: string) {
  return `${OBJ_PREFIX}${id}`;
}
function parseId(dragId: string): { type: "layer" | "obj"; id: string } | null {
  if (dragId.startsWith(LAYER_PREFIX)) {
    return { type: "layer", id: dragId.slice(LAYER_PREFIX.length) };
  }
  if (dragId.startsWith(OBJ_PREFIX)) {
    return { type: "obj", id: dragId.slice(OBJ_PREFIX.length) };
  }
  return null;
}

// ── Object type display helpers ─────────────────────────────────────
function getObjectIcon(obj: WireObject): string {
  switch (obj.type) {
    case "box":
      return "□";
    case "text":
      return "T";
    case "line":
      return "─";
    case "arrow":
      return "→";
    case "component":
      return "▣";
    case "connector":
      return "┌";
    default:
      return "?";
  }
}

function getDefaultLabel(obj: WireObject): string {
  switch (obj.type) {
    case "box":
      return obj.label || "Box";
    case "text":
      return obj.content.slice(0, 15) || "Text";
    case "line":
      return "Line";
    case "arrow":
      return "Arrow";
    case "connector":
      return obj.label || "Connector";
    case "component":
      return obj.label || obj.componentType;
    default:
      return "Object";
  }
}

function getObjectLabel(obj: WireObject): string {
  return obj.name || getDefaultLabel(obj);
}

// ── Sortable object row ─────────────────────────────────────────────
function SortableObjectRow({
  obj,
  isSelected,
  isLocked,
}: {
  obj: WireObject;
  isSelected: boolean;
  isLocked: boolean;
}) {
  const selectObject = useEditorStore((s) => s.selectObject);
  const updateObject = useEditorStore((s) => s.updateObject);
  const dragId = objDragId(obj.id);

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
  } = useSortable({ id: dragId, disabled: isLocked });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditName(obj.name || getDefaultLabel(obj));
      setEditing(true);
    },
    [obj],
  );

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editName.trim();
    // Clear name if it matches the default label (revert to auto-name)
    if (trimmed === "" || trimmed === getDefaultLabel(obj)) {
      if (obj.name) {
        updateObject(obj.id, { name: undefined });
      }
    } else if (trimmed !== obj.name) {
      updateObject(obj.id, { name: trimmed });
    }
    setEditing(false);
  }, [editName, obj, updateObject]);

  const label = obj.groupId ? `⫘ ${getObjectLabel(obj)}` : getObjectLabel(obj);

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
          onChange={(e) => setEditName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
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
            (
              inputRef as React.MutableRefObject<HTMLInputElement | null>
            ).current = el;
            el?.focus();
          }}
          value={editName}
        />
      ) : (
        <span
          className={`min-w-0 flex-1 truncate ${obj.name ? "text-text" : ""}`}
          onDoubleClick={handleDoubleClick}
          role="none"
        >
          {label}
        </span>
      )}
    </button>
  );
}

// ── Object list for a layer ─────────────────────────────────────────
function ObjectList({
  layerId,
  isLocked,
}: {
  layerId: string;
  isLocked: boolean;
}) {
  const objects = useEditorStore((s) => s.objects);
  const selection = useEditorStore((s) => s.selection);

  // Objects in this layer sorted by zIndex descending (highest = top, like Figma)
  const layerObjects = useMemo(() => {
    return objects
      .filter((o) => o.layerId === layerId)
      .sort((a, b) => b.zIndex - a.zIndex);
  }, [objects, layerId]);

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
}

// ── Sortable layer row ──────────────────────────────────────────────
function SortableLayerRow({
  layer,
  isExpanded,
  onToggleExpand,
}: {
  layer: Layer;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const objects = useEditorStore((s) => s.objects);
  const selection = useEditorStore((s) => s.selection);
  const setActiveLayer = useEditorStore((s) => s.setActiveLayer);
  const renameLayer = useEditorStore((s) => s.renameLayer);
  const toggleLayerVisibility = useEditorStore((s) => s.toggleLayerVisibility);
  const toggleLayerLock = useEditorStore((s) => s.toggleLayerLock);
  const deleteLayer = useEditorStore((s) => s.deleteLayer);
  const layers = useEditorStore((s) => s.layers);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);

  const isActive = layer.id === activeLayerId;
  const objectCount = objects.filter((o) => o.layerId === layer.id).length;
  const selectedInLayer = objects.filter(
    (o) => o.layerId === layer.id && selection.has(o.id),
  ).length;

  const dragId = layerDragId(layer.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dragId });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDoubleClick = useCallback(() => {
    setEditName(layer.name);
    setEditing(true);
  }, [layer.name]);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== layer.name) {
      renameLayer(layer.id, trimmed);
    }
    setEditing(false);
  }, [editName, layer.id, layer.name, renameLayer]);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`group flex h-7 w-full cursor-pointer items-center gap-1 rounded px-1.5 text-left text-xs transition-colors ${
          isActive
            ? "bg-surface-hover text-text"
            : "text-text-dim hover:bg-surface-hover hover:text-text"
        }`}
        onClick={() => setActiveLayer(layer.id)}
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
          className={`shrink-0 text-xs transition-opacity ${
            layer.visible ? "opacity-100" : "opacity-40"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleLayerVisibility(layer.id);
          }}
          title={layer.visible ? "Hide layer" : "Show layer"}
          type="button"
        >
          {layer.visible ? "◉" : "○"}
        </button>

        {/* Lock toggle */}
        <button
          className={`shrink-0 text-xs transition-opacity ${
            layer.locked ? "opacity-100" : "opacity-40"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleLayerLock(layer.id);
          }}
          title={layer.locked ? "Unlock layer" : "Lock layer"}
          type="button"
        >
          {layer.locked ? "◆" : "◇"}
        </button>

        {/* Layer name */}
        {editing ? (
          <input
            className="min-w-0 flex-1 rounded border border-accent bg-bg px-1 py-0.5 text-text text-xs outline-none"
            onBlur={handleRenameSubmit}
            onChange={(e) => setEditName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                handleRenameSubmit();
              }
              if (e.key === "Escape") {
                setEditing(false);
              }
            }}
            ref={(el) => el?.focus()}
            value={editName}
          />
        ) : (
          <span
            className="min-w-0 flex-1 truncate"
            onDoubleClick={handleDoubleClick}
            role="none"
          >
            {layer.name}
          </span>
        )}

        {/* Object count badge */}
        <span className="shrink-0 text-[10px] text-text-dim">
          {selectedInLayer > 0
            ? `${selectedInLayer}/${objectCount}`
            : objectCount}
        </span>

        {/* Delete button (only if more than one layer) */}
        {layers.length > 1 && (
          <button
            className="shrink-0 text-text-dim text-xs opacity-0 transition-opacity hover:text-text group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              deleteLayer(layer.id);
            }}
            title="Delete layer"
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {/* Expandable object list */}
      {isExpanded && <ObjectList isLocked={layer.locked} layerId={layer.id} />}
    </div>
  );
}

// ── Drag handlers (extracted for complexity) ────────────────────────
function handleLayerDrag(
  activeId: string,
  overId: string,
  reversedLayers: Layer[],
  totalLayers: number,
  reorderLayer: (id: string, newIndex: number) => void,
) {
  const overVisualIdx = reversedLayers.findIndex((l) => l.id === overId);
  if (overVisualIdx === -1) {
    return;
  }
  const arrayIndex = totalLayers - 1 - overVisualIdx;
  reorderLayer(activeId, arrayIndex);
}

function handleObjectDrag(
  activeId: string,
  overId: string,
  reorderObjectZIndex: (objectId: string, newPosition: number) => void,
) {
  const objects = useEditorStore.getState().objects;
  const activeObj = objects.find((o) => o.id === activeId);
  const overObj = objects.find((o) => o.id === overId);
  if (!(activeObj && overObj) || activeObj.layerId !== overObj.layerId) {
    return;
  }

  const layerObjs = objects
    .filter((o) => o.layerId === activeObj.layerId)
    .sort((a, b) => b.zIndex - a.zIndex);

  const overIdx = layerObjs.findIndex((o) => o.id === overId);
  if (overIdx !== -1) {
    reorderObjectZIndex(activeId, overIdx);
  }
}

// ── Main LayersPanel ────────────────────────────────────────────────
export function LayersPanel() {
  const layers = useEditorStore((s) => s.layers);
  const addLayer = useEditorStore((s) => s.addLayer);
  const selection = useEditorStore((s) => s.selection);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const moveObjectsToLayer = useEditorStore((s) => s.moveObjectsToLayer);
  const reorderLayer = useEditorStore((s) => s.reorderLayer);
  const reorderObjectZIndex = useEditorStore((s) => s.reorderObjectZIndex);

  // Track which layers are expanded (active layer auto-expands)
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((layerId: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  }, []);

  // Display layers reversed (top layer = last in array = first visually)
  const reversedLayers = useMemo(() => [...layers].reverse(), [layers]);
  const sortableLayerIds = useMemo(
    () => reversedLayers.map((l) => layerDragId(l.id)),
    [reversedLayers],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
          reorderLayer,
        );
      } else if (activeParsed.type === "obj" && overParsed.type === "obj") {
        handleObjectDrag(activeParsed.id, overParsed.id, reorderObjectZIndex);
      }
    },
    [layers, reversedLayers, reorderLayer, reorderObjectZIndex],
  );

  const handleMoveToActive = useCallback(() => {
    const ids = [...selection];
    if (ids.length > 0) {
      moveObjectsToLayer(ids, activeLayerId);
    }
  }, [selection, activeLayerId, moveObjectsToLayer]);

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
                  onToggleExpand={() => toggleExpand(layer.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Actions (anchored at bottom) */}
        <div className="flex shrink-0 gap-1">
          <button
            className="flex-1 rounded bg-surface-hover px-2 py-1 text-text-dim text-xs transition-colors hover:text-text"
            onClick={() => addLayer()}
            type="button"
          >
            + Layer
          </button>
          {selection.size > 0 && (
            <button
              className="flex-1 rounded bg-surface-hover px-2 py-1 text-text-dim text-xs transition-colors hover:text-text"
              onClick={handleMoveToActive}
              title="Move selected objects to active layer"
              type="button"
            >
              Move here
            </button>
          )}
        </div>
      </div>
    </DndContext>
  );
}
