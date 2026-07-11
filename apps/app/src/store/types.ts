import type {
  ComponentType,
  GridSize,
  Layer,
  LayerId,
  NewWireObject,
  ObjectId,
  ToolType,
  Viewport,
  WireObject,
} from "@wiretext/engine";
import type { StoreApi } from "zustand";

export const MAX_HISTORY = 100;

export interface ContextMenu {
  targetObjectId: ObjectId | null;
  x: number;
  y: number;
}

export interface HistorySnapshot {
  layers: Layer[];
  objects: WireObject[];
}

export interface EditorState {
  activeLayerId: LayerId;

  // UI
  activeTool: ToolType;

  // Clipboard
  clipboard: WireObject[];
  contextMenu: ContextMenu | null;
  draft: WireObject | null;
  editingLabelId: ObjectId | null;
  editingTextId: ObjectId | null;
  future: HistorySnapshot[];
  gridSize: GridSize;
  layers: Layer[];
  marquee: {
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
  } | null;
  // Document
  objects: WireObject[];

  // History
  past: HistorySnapshot[];
  pendingComponent: ComponentType | null;
  selection: Set<ObjectId>;
  sidebarExpanded: boolean;
  snapEnabled: boolean;

  // Snap / alignment guides
  snapGuides: { cols: number[]; rows: number[] };
  viewport: Viewport;
}

export interface EditorActions {
  // Layer management (push history)
  addLayer: (name?: string) => Layer;
  // Document mutations (push history)
  addObject: (obj: NewWireObject) => WireObject;
  bringForward: (ids: ObjectId[]) => void;

  // Z-ordering (push history)
  bringToFront: (ids: ObjectId[]) => void;
  clearAll: () => void;
  clearSelection: () => void;

  // Clipboard
  copySelection: () => void;
  cutSelection: () => void;
  deleteLayer: (id: LayerId) => void;
  deleteObject: (id: ObjectId) => void;
  deleteSelection: () => void;
  duplicateSelection: (offsetCol?: number, offsetRow?: number) => void;

  // Grouping
  groupSelection: () => void;
  loadDocument: (objects: WireObject[], layers: Layer[]) => void;
  moveObject: (id: ObjectId, deltaCol: number, deltaRow: number) => void;
  moveObjectsToLayer: (objectIds: ObjectId[], layerId: LayerId) => void;
  moveSelection: (deltaCol: number, deltaRow: number) => void;
  panViewport: (deltaX: number, deltaY: number) => void;
  pasteClipboard: () => void;
  redo: () => void;
  renameLayer: (id: LayerId, name: string) => void;
  reorderLayer: (id: LayerId, newIndex: number) => void;
  reorderObjectZIndex: (objectId: ObjectId, newPosition: number) => void;
  resizeObject: (id: ObjectId, newWidth: number, newHeight: number) => void;
  selectAll: () => void;
  selectObject: (id: ObjectId, toggle?: boolean) => void;
  sendBackward: (ids: ObjectId[]) => void;
  sendToBack: (ids: ObjectId[]) => void;
  setActiveLayer: (id: LayerId) => void;

  // UI mutations (no history)
  setActiveTool: (tool: ToolType) => void;
  setContextMenu: (menu: ContextMenu | null) => void;
  setDraft: (draft: WireObject | null) => void;
  setEditingLabelId: (id: ObjectId | null) => void;
  setEditingTextId: (id: ObjectId | null) => void;
  setMarquee: (
    marquee: {
      startCol: number;
      startRow: number;
      endCol: number;
      endRow: number;
    } | null
  ) => void;
  setPendingComponent: (type: ComponentType | null) => void;
  setSelection: (ids: Set<ObjectId>) => void;
  setSnapGuides: (guides: { cols: number[]; rows: number[] }) => void;
  toggleLayerLock: (id: LayerId) => void;
  toggleLayerVisibility: (id: LayerId) => void;
  toggleSidebar: () => void;
  toggleSnap: () => void;

  // History
  undo: () => void;
  ungroupSelection: () => void;
  updateObject: (id: ObjectId, patch: Partial<WireObject>) => void;
  zoomViewport: (delta: number, centerX: number, centerY: number) => void;
}

export type EditorStore = EditorState & EditorActions;

export type EditorSet = StoreApi<EditorStore>["setState"];
export type EditorGet = StoreApi<EditorStore>["getState"];
