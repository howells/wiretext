"use client";

import { COMPONENT_CATEGORIES, COMPONENT_DEFS } from "@wiretext/engine";
import type {
  ComponentCategory,
  ComponentType,
  ToolType,
} from "@wiretext/engine";
import { useState } from "react";

import { useEditorStore } from "@/store";

import { AboutDialog } from "./about-dialog";
import { LayersPanel } from "./layers-panel";

const drawTools: {
  type: ToolType;
  label: string;
  shortcut: string;
  preview: string;
}[] = [
  { label: "Box", preview: "┌─┐", shortcut: "B", type: "box" },
  { label: "Text", preview: "Aa", shortcut: "T", type: "text" },
  { label: "Line", preview: "───", shortcut: "L", type: "line" },
  { label: "Arrow", preview: "──▸", shortcut: "A", type: "arrow" },
  { label: "Connector", preview: "┌─▸", shortcut: "C", type: "connector" },
];

const categoryLabels: Record<ComponentCategory, string> = {
  display: "Display",
  input: "Input",
  layout: "Layout",
};

const activeToolClass = "bg-accent text-bg";
const inactiveToolClass =
  "text-text-dim hover:bg-surface-hover hover:text-text";

const CollapsibleDrawTools = ({
  activeTool,
  onSelect,
}: {
  activeTool: ToolType;
  onSelect: (type: ToolType) => void;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        className="flex w-full items-center gap-1 rounded px-1 py-1 text-left text-[10px] text-text-dim uppercase tracking-wider hover:text-text"
        onClick={() => {
          setOpen((v) => !v);
        }}
        type="button"
      >
        <span className="w-3 text-center text-[9px]">{open ? "▾" : "▸"}</span>
        Draw
      </button>

      {open && (
        <div className="flex flex-col gap-0.5">
          {drawTools.map((tool) => (
            <button
              className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                activeTool === tool.type ? activeToolClass : inactiveToolClass
              }`}
              key={tool.type}
              onClick={() => {
                onSelect(tool.type);
              }}
              type="button"
            >
              <span className="w-10 shrink-0 font-mono text-[10px]">
                {tool.preview}
              </span>
              <span className="flex-1">{tool.label}</span>
              <span className="font-mono text-[10px] opacity-40">
                {tool.shortcut}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CollapsibleCategory = ({
  category,
  label,
  pendingComponent,
  onSelect,
}: {
  category: ComponentCategory;
  label: string;
  pendingComponent: ComponentType | null;
  onSelect: (type: ComponentType) => void;
}) => {
  const [open, setOpen] = useState(true);
  const items = COMPONENT_DEFS.filter((d) => d.category === category);

  return (
    <div className="mb-1">
      <button
        className="flex w-full items-center gap-1 rounded px-1 py-1 text-left text-[10px] text-text-dim uppercase tracking-wider hover:text-text"
        onClick={() => {
          setOpen((v) => !v);
        }}
        type="button"
      >
        <span className="w-3 text-center text-[9px]">{open ? "▾" : "▸"}</span>
        {label}
      </button>

      {open && (
        <div className="flex flex-col gap-0.5">
          {items.map((def) => (
            <button
              className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                pendingComponent === def.type
                  ? activeToolClass
                  : inactiveToolClass
              }`}
              key={def.type}
              onClick={() => {
                onSelect(def.type);
              }}
              type="button"
            >
              <span className="w-10 shrink-0 font-mono text-[10px]">
                {def.preview}
              </span>
              <span>{def.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CollapsedToolbar = ({
  activeTool,
  onExpand,
  onSelectTool,
}: {
  activeTool: ToolType;
  onExpand: () => void;
  onSelectTool: (type: ToolType) => void;
}) => (
  <div className="flex w-10 flex-col items-center gap-1 border-border border-r bg-surface py-2">
    {/* Expand */}
    <button
      aria-label="Expand sidebar (P)"
      className="flex h-8 w-8 items-center justify-center rounded text-text-dim text-xs hover:bg-surface-hover hover:text-text"
      onClick={onExpand}
      type="button"
    >
      &rsaquo;
    </button>
    <div className="mx-2 my-1 h-px w-6 bg-border" />
    <button
      aria-label="Select (V)"
      className={`flex h-8 w-8 items-center justify-center rounded text-xs transition-colors ${
        activeTool === "select" ? activeToolClass : inactiveToolClass
      }`}
      onClick={() => {
        onSelectTool("select");
      }}
      type="button"
    >
      V
    </button>

    <div className="mx-2 my-1 h-px w-6 bg-border" />

    {drawTools.map((tool) => (
      <button
        aria-label={`${tool.label} (${tool.shortcut})`}
        className={`flex h-8 w-8 items-center justify-center rounded text-xs transition-colors ${
          activeTool === tool.type ? activeToolClass : inactiveToolClass
        }`}
        key={tool.type}
        onClick={() => {
          onSelectTool(tool.type);
        }}
        type="button"
      >
        {tool.shortcut}
      </button>
    ))}
  </div>
);

const LayersSection = ({
  onToggle,
  open,
}: {
  onToggle: () => void;
  open: boolean;
}) => (
  <div className="border-border border-b">
    <div className="flex items-center justify-between px-3 py-2">
      <button
        className="flex items-center gap-1 text-[10px] text-text-dim uppercase tracking-wider hover:text-text"
        onClick={onToggle}
        type="button"
      >
        <span className="w-3 text-center text-[9px]">{open ? "▾" : "▸"}</span>
        Layers
      </button>
    </div>
    {open && (
      <div className="flex max-h-[50vh] flex-col px-2 pb-2">
        <LayersPanel />
      </div>
    )}
  </div>
);

export const Toolbar = () => {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const expanded = useEditorStore((s) => s.sidebarExpanded);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const pendingComponent = useEditorStore((s) => s.pendingComponent);
  const setPendingComponent = useEditorStore((s) => s.setPendingComponent);
  const [layersOpen, setLayersOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);

  if (!expanded) {
    return (
      <CollapsedToolbar
        activeTool={activeTool}
        onExpand={toggleSidebar}
        onSelectTool={setActiveTool}
      />
    );
  }

  return (
    <div className="flex w-52 flex-col border-border border-r bg-surface">
      {/* Logo header */}
      <div className="flex items-center justify-between border-border border-b px-3 py-2">
        <button
          aria-label="About Wiretext"
          className="font-mono text-text text-xs transition-colors hover:text-accent"
          onClick={() => {
            setAboutOpen(true);
          }}
          type="button"
        >
          ┌─ Wiretext ─┐
        </button>
        <button
          aria-label="Collapse sidebar (P)"
          className="text-text-dim text-xs hover:text-text"
          onClick={toggleSidebar}
          type="button"
        >
          &lsaquo;
        </button>
      </div>

      {/* Layers section (collapsible) */}
      <LayersSection
        onToggle={() => {
          setLayersOpen((v) => !v);
        }}
        open={layersOpen}
      />

      {/* Tools section */}
      <div className="flex-1 overflow-y-auto">
        {/* Select tool — standalone */}
        <div className="p-2">
          <button
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
              activeTool === "select" ? activeToolClass : inactiveToolClass
            }`}
            onClick={() => {
              setActiveTool("select");
            }}
            type="button"
          >
            <span className="w-10 shrink-0 font-mono text-[10px]">↖</span>
            <span className="flex-1">Select</span>
            <span className="font-mono text-[10px] opacity-40">V</span>
          </button>
        </div>

        <div className="mx-2 h-px bg-border" />

        {/* Drawing tools */}
        <div className="p-2">
          <CollapsibleDrawTools
            activeTool={activeTool}
            onSelect={setActiveTool}
          />
        </div>

        <div className="mx-2 h-px bg-border" />

        {/* Component categories */}
        <div className="p-2">
          {COMPONENT_CATEGORIES.map((cat, i) => (
            <div key={cat}>
              {i > 0 && <div className="mx-0 my-1 h-px bg-border" />}
              <CollapsibleCategory
                category={cat}
                label={categoryLabels[cat]}
                onSelect={(type) => {
                  setPendingComponent(type === pendingComponent ? null : type);
                }}
                pendingComponent={pendingComponent}
              />
            </div>
          ))}
        </div>
      </div>
      <AboutDialog
        onClose={() => {
          setAboutOpen(false);
        }}
        open={aboutOpen}
      />
    </div>
  );
};
