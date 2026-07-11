import type { ObjectId } from "@wiretext/engine";
import { enableMapSet } from "immer";
import { nanoid } from "nanoid";
import { create } from "zustand";

import { createClipboardActions } from "./clipboard-actions";
import { createDocumentActions, createObjectActions } from "./document-actions";
import { createLayerActions } from "./layer-actions";
import type { EditorState, EditorStore } from "./types";
import { createHistoryActions, createUiActions } from "./ui-actions";
import { createZOrderActions } from "./z-order-actions";

export type {
  ContextMenu,
  EditorActions,
  EditorState,
  EditorStore,
  HistorySnapshot,
} from "./types";

// selection is a Set held in immer-produced state, so Map/Set drafting must be
// enabled once at module load.
enableMapSet();

const DEFAULT_LAYER_ID = nanoid();

const initialState: EditorState = {
  activeLayerId: DEFAULT_LAYER_ID,
  activeTool: "select",
  clipboard: [],
  contextMenu: null,
  draft: null,
  editingLabelId: null,
  editingTextId: null,
  future: [],
  gridSize: { cols: 120, rows: 60 },
  layers: [
    {
      id: DEFAULT_LAYER_ID,
      locked: false,
      name: "Layer 1",
      visible: true,
    },
  ],
  marquee: null,
  objects: [],
  past: [],
  pendingComponent: null,
  selection: new Set<ObjectId>(),
  sidebarExpanded: true,
  snapEnabled: true,
  snapGuides: { cols: [], rows: [] },
  viewport: { panX: 0, panY: 0, zoom: 1 },
};

/**
 * The single editor store, assembled from action slices that each own one
 * concern (document mutation, clipboard, layers, z-order, transient UI, undo/redo).
 * Every slice is a factory taking zustand's `set`/`get`; spreading them onto the
 * initial state produces one flat store where any action can read the whole state.
 *
 * Slice split matters for history: document/layer/z-order actions call
 * `pushHistory` (see helpers.ts) before mutating, while UI actions in ui-actions.ts
 * (selection, tool, viewport, marquee) deliberately do not — they are not undoable.
 */
export const useEditorStore = create<EditorStore>()((set, get) => ({
  ...initialState,
  ...createObjectActions(set, get),
  ...createDocumentActions(set, get),
  ...createClipboardActions(set, get),
  ...createLayerActions(set, get),
  ...createZOrderActions(set),
  ...createUiActions(set),
  ...createHistoryActions(set),
}));
