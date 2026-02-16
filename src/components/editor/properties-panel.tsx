"use client";

import { COMPONENT_BY_TYPE } from "@/engine/components";
import { WIRE_ICONS } from "@/engine/icons";
import type { BorderStyle, WireObject } from "@/engine/types";
import { useEditorStore } from "@/store";

const borderStyles: BorderStyle[] = ["single", "double", "rounded", "heavy"];
const borderPreviews: Record<BorderStyle, string> = {
  single: "┌─┐",
  double: "╔═╗",
  rounded: "╭─╮",
  heavy: "┏━┓",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider">
      {children}
    </span>
  );
}

export function PropertiesPanel() {
  const selection = useEditorStore((s) => s.selection);
  const objects = useEditorStore((s) => s.objects);

  const selectedObjects = objects.filter((o) => selection.has(o.id));

  if (selectedObjects.length === 0) {
    return <p className="text-text-dim text-xs">No selection</p>;
  }

  if (selectedObjects.length > 1) {
    // Check if selection forms a single group
    const groupIds = new Set(
      selectedObjects.map((o) => o.groupId).filter(Boolean)
    );
    const isSingleGroup =
      groupIds.size === 1 &&
      selectedObjects.every((o) => o.groupId === [...groupIds][0]);

    return (
      <div className="flex flex-col gap-2">
        <p className="text-text-dim text-xs">
          {isSingleGroup
            ? `Group (${selectedObjects.length} objects)`
            : `${selectedObjects.length} objects selected`}
        </p>
        {isSingleGroup && (
          <button
            className="rounded bg-surface-hover px-2 py-1 text-text-dim text-xs transition-colors hover:text-text"
            onClick={() => useEditorStore.getState().ungroupSelection()}
            type="button"
          >
            Ungroup
          </button>
        )}
      </div>
    );
  }

  const obj = selectedObjects[0];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <FieldLabel>Type</FieldLabel>
        <span className="text-text text-xs">{obj.type}</span>
      </div>

      <div>
        <FieldLabel>Position</FieldLabel>
        <span className="text-text text-xs">
          {obj.position.col}, {obj.position.row}
        </span>
      </div>

      {obj.type === "box" && <BoxProperties obj={obj} />}
      {obj.type === "text" && <TextProperties obj={obj} />}
      {obj.type === "arrow" && <ArrowProperties obj={obj} />}
      {obj.type === "component" && <ComponentProperties obj={obj} />}

      <AnnotationField obj={obj} />
    </div>
  );
}

function BoxProperties({ obj }: { obj: Extract<WireObject, { type: "box" }> }) {
  const updateObject = useEditorStore((s) => s.updateObject);

  return (
    <>
      <div>
        <FieldLabel>Size</FieldLabel>
        <span className="text-text text-xs">
          {obj.width} x {obj.height}
        </span>
      </div>

      <div>
        <FieldLabel>Border</FieldLabel>
        <div className="flex gap-1">
          {borderStyles.map((style) => (
            <button
              className={`rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
                obj.borderStyle === style
                  ? "bg-accent text-bg"
                  : "bg-surface-hover text-text-dim hover:text-text"
              }`}
              key={style}
              onClick={() =>
                updateObject(obj.id, {
                  borderStyle: style,
                } as Partial<WireObject>)
              }
              title={style}
              type="button"
            >
              {borderPreviews[style]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Fill</FieldLabel>
        <div className="flex gap-1">
          {(["solid", "transparent"] as const).map((fill) => (
            <button
              className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
                (obj.fill ?? "solid") === fill
                  ? "bg-accent text-bg"
                  : "bg-surface-hover text-text-dim hover:text-text"
              }`}
              key={fill}
              onClick={() =>
                updateObject(obj.id, {
                  fill,
                } as Partial<WireObject>)
              }
              type="button"
            >
              {fill === "solid" ? "Solid" : "Clear"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider"
          htmlFor="box-label"
        >
          Label
        </label>
        <input
          className="w-full rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
          id="box-label"
          onChange={(e) =>
            updateObject(obj.id, {
              label: e.target.value || undefined,
            } as Partial<WireObject>)
          }
          placeholder="Optional label"
          type="text"
          value={obj.label ?? ""}
        />
      </div>
    </>
  );
}

function TextProperties({
  obj,
}: {
  obj: Extract<WireObject, { type: "text" }>;
}) {
  return (
    <div>
      <FieldLabel>Content</FieldLabel>
      <span className="text-text text-xs">
        {obj.content.length > 30
          ? `${obj.content.slice(0, 30)}...`
          : obj.content || "(empty)"}
      </span>
    </div>
  );
}

function ArrowProperties({
  obj,
}: {
  obj: Extract<WireObject, { type: "arrow" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const startHead = obj.startHead === true;
  const endHead = obj.endHead !== false;

  // Toggling a head off forces the other one on
  const toggleStart = () => {
    const newStart = !startHead;
    const patch: Partial<WireObject> = { startHead: newStart };
    if (!(newStart || endHead)) {
      patch.endHead = true;
    }
    updateObject(obj.id, patch);
  };

  const toggleEnd = () => {
    const newEnd = !endHead;
    const patch: Partial<WireObject> = { endHead: newEnd };
    if (!(newEnd || startHead)) {
      patch.startHead = true;
    }
    updateObject(obj.id, patch);
  };

  return (
    <div>
      <FieldLabel>Heads</FieldLabel>
      <div className="flex gap-1">
        <button
          className={`rounded px-2 py-0.5 font-mono text-xs transition-colors ${
            startHead
              ? "bg-accent text-bg"
              : "bg-surface-hover text-text-dim hover:text-text"
          }`}
          onClick={toggleStart}
          title="Start head"
          type="button"
        >
          {startHead ? "◂─" : "──"}
        </button>
        <button
          className={`rounded px-2 py-0.5 font-mono text-xs transition-colors ${
            endHead
              ? "bg-accent text-bg"
              : "bg-surface-hover text-text-dim hover:text-text"
          }`}
          onClick={toggleEnd}
          title="End head"
          type="button"
        >
          {endHead ? "─▸" : "──"}
        </button>
      </div>
    </div>
  );
}

function ComponentProperties({
  obj,
}: {
  obj: Extract<WireObject, { type: "component" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const def = COMPONENT_BY_TYPE[obj.componentType];

  return (
    <>
      <div>
        <FieldLabel>Component</FieldLabel>
        <span className="text-text text-xs">{def.name}</span>
      </div>

      <div>
        <FieldLabel>Size</FieldLabel>
        <span className="text-text text-xs">
          {obj.width} x {obj.height}
        </span>
      </div>

      <div>
        <FieldLabel>Border</FieldLabel>
        <div className="flex gap-1">
          {borderStyles.map((style) => (
            <button
              className={`rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
                obj.borderStyle === style
                  ? "bg-accent text-bg"
                  : "bg-surface-hover text-text-dim hover:text-text"
              }`}
              key={style}
              onClick={() =>
                updateObject(obj.id, {
                  borderStyle: style,
                } as Partial<WireObject>)
              }
              title={style}
              type="button"
            >
              {borderPreviews[style]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Fill</FieldLabel>
        <div className="flex gap-1">
          {(["solid", "transparent"] as const).map((fill) => (
            <button
              className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
                (obj.fill ?? "solid") === fill
                  ? "bg-accent text-bg"
                  : "bg-surface-hover text-text-dim hover:text-text"
              }`}
              key={fill}
              onClick={() =>
                updateObject(obj.id, {
                  fill,
                } as Partial<WireObject>)
              }
              type="button"
            >
              {fill === "solid" ? "Solid" : "Clear"}
            </button>
          ))}
        </div>
      </div>

      {/* Icon picker for input and icon components */}
      {(obj.componentType === "input" || obj.componentType === "icon") && (
        <div>
          <FieldLabel>Icon</FieldLabel>
          <div className="grid grid-cols-6 gap-0.5">
            {obj.componentType === "input" && (
              <button
                className={`rounded px-1 py-0.5 font-mono text-sm transition-colors ${
                  obj.icon
                    ? "bg-surface-hover text-text-dim hover:text-text"
                    : "bg-accent text-bg"
                }`}
                onClick={() =>
                  updateObject(obj.id, {
                    icon: undefined,
                  } as Partial<WireObject>)
                }
                title="None"
                type="button"
              >
                ∅
              </button>
            )}
            {WIRE_ICONS.map((icon) => (
              <button
                className={`rounded px-1 py-0.5 font-mono text-sm transition-colors ${
                  obj.icon === icon.char
                    ? "bg-accent text-bg"
                    : "bg-surface-hover text-text-dim hover:text-text"
                }`}
                key={icon.char}
                onClick={() =>
                  updateObject(obj.id, {
                    icon: icon.char,
                  } as Partial<WireObject>)
                }
                title={icon.label}
                type="button"
              >
                {icon.char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Checkbox: checked toggle */}
      {obj.componentType === "checkbox" && (
        <div>
          <FieldLabel>State</FieldLabel>
          <button
            className={`rounded px-2 py-0.5 text-xs transition-colors ${
              obj.checked !== false
                ? "bg-accent text-bg"
                : "bg-surface-hover text-text-dim hover:text-text"
            }`}
            onClick={() =>
              updateObject(obj.id, {
                checked: obj.checked === false,
              } as Partial<WireObject>)
            }
            type="button"
          >
            {obj.checked !== false ? "Checked" : "Unchecked"}
          </button>
        </div>
      )}

      {/* Radio: selected toggle */}
      {obj.componentType === "radio" && (
        <div>
          <FieldLabel>State</FieldLabel>
          <button
            className={`rounded px-2 py-0.5 text-xs transition-colors ${
              obj.checked !== false
                ? "bg-accent text-bg"
                : "bg-surface-hover text-text-dim hover:text-text"
            }`}
            onClick={() =>
              updateObject(obj.id, {
                checked: obj.checked === false,
              } as Partial<WireObject>)
            }
            type="button"
          >
            {obj.checked !== false ? "Selected" : "Unselected"}
          </button>
        </div>
      )}

      {/* Progress: percentage slider */}
      {obj.componentType === "progress" && (
        <div>
          <FieldLabel>Progress ({obj.progress ?? 40}%)</FieldLabel>
          <input
            className="w-full accent-accent"
            max={100}
            min={0}
            onChange={(e) =>
              updateObject(obj.id, {
                progress: Number(e.target.value),
              } as Partial<WireObject>)
            }
            type="range"
            value={obj.progress ?? 40}
          />
        </div>
      )}

      {/* Table: column management */}
      {obj.componentType === "table" && (
        <div>
          <FieldLabel>Columns</FieldLabel>
          <div className="flex flex-col gap-1">
            {(obj.columns ?? []).map((colName, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: editable list without stable IDs
              <div className="flex items-center gap-1" key={i}>
                <input
                  className="flex-1 rounded border border-border bg-bg px-1.5 py-0.5 text-text text-xs outline-none focus:border-accent"
                  onChange={(e) => {
                    const cols = [...(obj.columns ?? [])];
                    cols[i] = e.target.value;
                    updateObject(obj.id, {
                      columns: cols,
                    } as Partial<WireObject>);
                  }}
                  type="text"
                  value={colName}
                />
                {(obj.columns ?? []).length > 1 && (
                  <button
                    className="rounded px-1 text-text-dim text-xs hover:text-text"
                    onClick={() => {
                      const cols = [...(obj.columns ?? [])];
                      cols.splice(i, 1);
                      updateObject(obj.id, {
                        columns: cols,
                      } as Partial<WireObject>);
                    }}
                    title="Remove column"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              className="rounded bg-surface-hover px-2 py-0.5 text-text-dim text-xs hover:text-text"
              onClick={() => {
                const cols = [...(obj.columns ?? [])];
                cols.push(`Col ${String.fromCharCode(65 + cols.length)}`);
                updateObject(obj.id, { columns: cols } as Partial<WireObject>);
              }}
              type="button"
            >
              + Add column
            </button>
          </div>
        </div>
      )}

      {/* Navbar: nav item management */}
      {obj.componentType === "navbar" && (
        <div>
          <FieldLabel>Nav Items</FieldLabel>
          <div className="flex flex-col gap-1">
            {(obj.navItems ?? []).map((itemName, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: editable list without stable IDs
              <div className="flex items-center gap-1" key={i}>
                <input
                  className="flex-1 rounded border border-border bg-bg px-1.5 py-0.5 text-text text-xs outline-none focus:border-accent"
                  onChange={(e) => {
                    const items = [...(obj.navItems ?? [])];
                    items[i] = e.target.value;
                    updateObject(obj.id, {
                      navItems: items,
                    } as Partial<WireObject>);
                  }}
                  type="text"
                  value={itemName}
                />
                {(obj.navItems ?? []).length > 1 && (
                  <button
                    className="rounded px-1 text-text-dim text-xs hover:text-text"
                    onClick={() => {
                      const items = [...(obj.navItems ?? [])];
                      items.splice(i, 1);
                      updateObject(obj.id, {
                        navItems: items,
                      } as Partial<WireObject>);
                    }}
                    title="Remove item"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              className="rounded bg-surface-hover px-2 py-0.5 text-text-dim text-xs hover:text-text"
              onClick={() => {
                const items = [...(obj.navItems ?? [])];
                items.push(`Item ${items.length + 1}`);
                updateObject(obj.id, {
                  navItems: items,
                } as Partial<WireObject>);
              }}
              type="button"
            >
              + Add item
            </button>
          </div>
        </div>
      )}

      {/* Tabs: tab management */}
      {obj.componentType === "tabs" && (
        <div>
          <FieldLabel>Tabs</FieldLabel>
          <div className="flex flex-col gap-1">
            {(obj.tabs ?? []).map((tabName, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: editable list without stable IDs
              <div className="flex items-center gap-1" key={i}>
                <input
                  className="flex-1 rounded border border-border bg-bg px-1.5 py-0.5 text-text text-xs outline-none focus:border-accent"
                  onChange={(e) => {
                    const tabs = [...(obj.tabs ?? [])];
                    tabs[i] = e.target.value;
                    updateObject(obj.id, { tabs } as Partial<WireObject>);
                  }}
                  type="text"
                  value={tabName}
                />
                {(obj.tabs ?? []).length > 1 && (
                  <button
                    className="rounded px-1 text-text-dim text-xs hover:text-text"
                    onClick={() => {
                      const tabs = [...(obj.tabs ?? [])];
                      tabs.splice(i, 1);
                      updateObject(obj.id, { tabs } as Partial<WireObject>);
                    }}
                    title="Remove tab"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              className="rounded bg-surface-hover px-2 py-0.5 text-text-dim text-xs hover:text-text"
              onClick={() => {
                const tabs = [...(obj.tabs ?? [])];
                tabs.push(`Tab ${tabs.length + 1}`);
                updateObject(obj.id, { tabs } as Partial<WireObject>);
              }}
              type="button"
            >
              + Add tab
            </button>
          </div>
        </div>
      )}

      <div>
        <label
          className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider"
          htmlFor="component-label"
        >
          Label
        </label>
        <input
          className="w-full rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
          id="component-label"
          onChange={(e) =>
            updateObject(obj.id, {
              label: e.target.value || undefined,
            } as Partial<WireObject>)
          }
          placeholder="Optional label"
          type="text"
          value={obj.label ?? ""}
        />
      </div>
    </>
  );
}

function AnnotationField({ obj }: { obj: WireObject }) {
  const updateObject = useEditorStore((s) => s.updateObject);

  return (
    <div>
      <label
        className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider"
        htmlFor="annotation"
      >
        Annotation
      </label>
      <input
        className="w-full rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
        id="annotation"
        onChange={(e) =>
          updateObject(obj.id, {
            annotation: e.target.value || undefined,
          } as Partial<WireObject>)
        }
        placeholder="Add note..."
        type="text"
        value={obj.annotation ?? ""}
      />
    </div>
  );
}
