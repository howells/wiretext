"use client";

import { useCallback, useState } from "react";
import type { Layer } from "@/engine/types";
import { useEditorStore } from "@/store";

function LayerRow({ layer }: { layer: Layer }) {
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
    (o) => o.layerId === layer.id && selection.has(o.id)
  ).length;

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
    // biome-ignore lint/a11y/noStaticElementInteractions: can't use <button> because it contains child <button> elements
    <div
      className={`group flex w-full cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-left text-xs transition-colors ${
        isActive
          ? "bg-surface-hover text-text"
          : "text-text-dim hover:bg-surface-hover hover:text-text"
      }`}
      onClick={() => setActiveLayer(layer.id)}
    >
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
          autoFocus
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
          value={editName}
        />
      ) : (
        // biome-ignore lint/a11y/noStaticElementInteractions: double-click-to-rename is standard Figma-style UX
        <span
          className="min-w-0 flex-1 truncate"
          onDoubleClick={handleDoubleClick}
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
  );
}

export function LayersPanel() {
  const layers = useEditorStore((s) => s.layers);
  const addLayer = useEditorStore((s) => s.addLayer);
  const selection = useEditorStore((s) => s.selection);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const moveObjectsToLayer = useEditorStore((s) => s.moveObjectsToLayer);

  const handleMoveToActive = useCallback(() => {
    const ids = [...selection];
    if (ids.length > 0) {
      moveObjectsToLayer(ids, activeLayerId);
    }
  }, [selection, activeLayerId, moveObjectsToLayer]);

  return (
    <div className="flex flex-col gap-2">
      {/* Layer list (reversed so top layer appears first visually) */}
      <div className="flex flex-col gap-0.5">
        {[...layers].reverse().map((layer) => (
          <LayerRow key={layer.id} layer={layer} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-1">
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
  );
}
