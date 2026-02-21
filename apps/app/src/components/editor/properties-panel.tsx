"use client";

import type {
  BorderStyle,
  ComponentType,
  ConnectorSide,
  WireObject,
} from "@wiretext/engine";
import {
  COMPONENT_BY_TYPE,
  ICON_CATEGORIES,
  WIRE_ICONS,
} from "@wiretext/engine";
import { useEditorStore } from "@/store";

const BORDERLESS_COMPONENTS: ReadonlySet<ComponentType> = new Set([
  "icon",
  "divider",
  "toggle",
  "breadcrumb",
  "list",
  "stepper",
  "rating",
  "skeleton",
]);

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

function CheckedToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: [string, string];
  onChange: (val: boolean) => void;
}) {
  return (
    <div>
      <FieldLabel>State</FieldLabel>
      <div className="flex gap-1">
        <button
          className={`rounded px-2 py-0.5 text-xs transition-colors ${
            checked
              ? "bg-accent text-bg"
              : "bg-surface-hover text-text-dim hover:text-text"
          }`}
          onClick={() => onChange(true)}
          type="button"
        >
          {label[0]}
        </button>
        <button
          className={`rounded px-2 py-0.5 text-xs transition-colors ${
            checked
              ? "bg-surface-hover text-text-dim hover:text-text"
              : "bg-accent text-bg"
          }`}
          onClick={() => onChange(false)}
          type="button"
        >
          {label[1]}
        </button>
      </div>
    </div>
  );
}

const ICON_PICKER_TYPES: ReadonlySet<ComponentType> = new Set([
  "input",
  "icon",
  "image",
]);

const checkedLabels: Partial<Record<ComponentType, [string, string]>> = {
  checkbox: ["Checked", "Unchecked"],
  radio: ["Selected", "Unselected"],
  toggle: ["On", "Off"],
};

const TRAILING_S = /s$/;

function EditableItemList({
  items,
  label,
  newItemLabel,
  onChange,
}: {
  items: string[];
  label: string;
  newItemLabel: (count: number) => string;
  onChange: (items: string[]) => void;
}) {
  const singular = label.toLowerCase().replace(TRAILING_S, "");
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const itemKey = `${singular}-${item}`;
          return (
            <div className="flex items-center gap-1" key={itemKey}>
              <input
                className="flex-1 rounded border border-border bg-bg px-1.5 py-0.5 text-text text-xs outline-none focus:border-accent"
                onChange={(e) => {
                  const idx = items.indexOf(item);
                  const next = items.map((v, j) =>
                    j === idx ? e.target.value : v
                  );
                  onChange(next);
                }}
                type="text"
                value={item}
              />
              {items.length > 1 && (
                <button
                  className="rounded px-1 text-text-dim text-xs hover:text-text"
                  onClick={() => {
                    const idx = items.indexOf(item);
                    onChange(items.filter((_, j) => j !== idx));
                  }}
                  title={`Remove ${singular}`}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <button
          className="rounded bg-surface-hover px-2 py-0.5 text-text-dim text-xs hover:text-text"
          onClick={() => onChange([...items, newItemLabel(items.length)])}
          type="button"
        >
          + Add {singular}
        </button>
      </div>
    </div>
  );
}

function BorderFillSection({
  obj,
}: {
  obj: Extract<WireObject, { type: "component" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  return (
    <>
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
                updateObject(obj.id, { fill } as Partial<WireObject>)
              }
              type="button"
            >
              {fill === "solid" ? "Solid" : "Clear"}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function IconPicker({
  obj,
  showNone,
}: {
  obj: Extract<WireObject, { type: "component" }>;
  showNone: boolean;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  return (
    <div>
      <FieldLabel>Icon</FieldLabel>
      <div className="flex flex-col gap-1.5">
        {showNone && (
          <div className="grid grid-cols-8 gap-0.5">
            <button
              className={`rounded px-1 py-0.5 font-mono text-sm transition-colors ${
                obj.icon
                  ? "bg-surface-hover text-text-dim hover:text-text"
                  : "bg-accent text-bg"
              }`}
              onClick={() =>
                updateObject(obj.id, { icon: undefined } as Partial<WireObject>)
              }
              title="None"
              type="button"
            >
              ∅
            </button>
          </div>
        )}
        {ICON_CATEGORIES.map((category) => (
          <div key={category}>
            <span className="mb-0.5 block text-[10px] text-text-dim uppercase tracking-wider">
              {category}
            </span>
            <div className="grid grid-cols-8 gap-0.5">
              {WIRE_ICONS.filter((icon) => icon.category === category).map(
                (icon) => (
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
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepperEditor({
  obj,
}: {
  obj: Extract<WireObject, { type: "component" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const items = obj.items ?? [];
  const activeStep = obj.activeStep ?? 0;
  return (
    <div>
      <FieldLabel>Steps</FieldLabel>
      <div className="flex flex-col gap-1">
        {items.map((step) => {
          const stepIdx = items.indexOf(step);
          const stepKey = `step-${step}`;
          return (
            <div className="flex items-center gap-1" key={stepKey}>
              <button
                className={`shrink-0 rounded px-1 py-0.5 font-mono text-[10px] transition-colors ${
                  stepIdx <= activeStep
                    ? "bg-accent text-bg"
                    : "bg-surface-hover text-text-dim"
                }`}
                onClick={() =>
                  updateObject(obj.id, {
                    activeStep: stepIdx,
                  } as Partial<WireObject>)
                }
                title={`Set active step to ${stepIdx + 1}`}
                type="button"
              >
                {stepIdx <= activeStep ? "●" : "○"}
              </button>
              <input
                className="flex-1 rounded border border-border bg-bg px-1.5 py-0.5 text-text text-xs outline-none focus:border-accent"
                onChange={(e) => {
                  const next = items.map((v, j) =>
                    j === stepIdx ? e.target.value : v
                  );
                  updateObject(obj.id, {
                    items: next,
                  } as Partial<WireObject>);
                }}
                type="text"
                value={step}
              />
              {items.length > 1 && (
                <button
                  className="rounded px-1 text-text-dim text-xs hover:text-text"
                  onClick={() => {
                    const next = items.filter((_, j) => j !== stepIdx);
                    updateObject(obj.id, {
                      items: next,
                      activeStep: Math.min(activeStep, next.length - 1),
                    } as Partial<WireObject>);
                  }}
                  title="Remove step"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <button
          className="rounded bg-surface-hover px-2 py-0.5 text-text-dim text-xs hover:text-text"
          onClick={() =>
            updateObject(obj.id, {
              items: [...items, `Step ${items.length + 1}`],
            } as Partial<WireObject>)
          }
          type="button"
        >
          + Add step
        </button>
      </div>
    </div>
  );
}

const alertTypes = [
  { value: "info", icon: "ℹ", label: "Info" },
  { value: "warning", icon: "⚠", label: "Warning" },
  { value: "error", icon: "✖", label: "Error" },
  { value: "success", icon: "✓", label: "Success" },
] as const;

function AlertTypeSelector({
  obj,
}: {
  obj: Extract<WireObject, { type: "component" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  return (
    <div>
      <FieldLabel>Type</FieldLabel>
      <div className="flex gap-1">
        {alertTypes.map((opt) => (
          <button
            className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
              (obj.alertType ?? "info") === opt.value
                ? "bg-accent text-bg"
                : "bg-surface-hover text-text-dim hover:text-text"
            }`}
            key={opt.value}
            onClick={() =>
              updateObject(obj.id, {
                alertType: opt.value,
              } as Partial<WireObject>)
            }
            title={opt.label}
            type="button"
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

const listStyles = [
  { value: "bullet", label: "• Bullet" },
  { value: "number", label: "1. Number" },
  { value: "dash", label: "- Dash" },
] as const;

function ListStyleSelector({
  obj,
}: {
  obj: Extract<WireObject, { type: "component" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  return (
    <div>
      <FieldLabel>Style</FieldLabel>
      <div className="flex gap-1">
        {listStyles.map((opt) => (
          <button
            className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
              (obj.listStyle ?? "bullet") === opt.value
                ? "bg-accent text-bg"
                : "bg-surface-hover text-text-dim hover:text-text"
            }`}
            key={opt.value}
            onClick={() =>
              updateObject(obj.id, {
                listStyle: opt.value,
              } as Partial<WireObject>)
            }
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressSlider({
  obj,
}: {
  obj: Extract<WireObject, { type: "component" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const progress = obj.progress ?? 40;
  return (
    <div>
      <FieldLabel>Progress ({progress}%)</FieldLabel>
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
        value={progress}
      />
    </div>
  );
}

function RatingSlider({
  obj,
}: {
  obj: Extract<WireObject, { type: "component" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const value = obj.value ?? 0;
  const maxValue = obj.maxValue ?? 5;
  return (
    <div>
      <FieldLabel>
        Rating ({value}/{maxValue})
      </FieldLabel>
      <input
        className="w-full accent-accent"
        max={maxValue}
        min={0}
        onChange={(e) =>
          updateObject(obj.id, {
            value: Number(e.target.value),
          } as Partial<WireObject>)
        }
        type="range"
        value={value}
      />
    </div>
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
      {obj.type === "connector" && <ConnectorProperties obj={obj} />}
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
        <textarea
          className="w-full resize-y rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
          id="box-label"
          onChange={(e) =>
            updateObject(obj.id, {
              label: e.target.value || undefined,
            } as Partial<WireObject>)
          }
          placeholder="Optional label (use Enter for multiline)"
          rows={2}
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

function BodyTextField({
  obj,
}: {
  obj: Extract<WireObject, { type: "component" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  if (obj.componentType !== "card" && obj.componentType !== "modal") {
    return null;
  }
  return (
    <div>
      <label
        className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider"
        htmlFor="component-body"
      >
        Body
      </label>
      <textarea
        className="w-full resize-y rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
        id="component-body"
        onChange={(e) =>
          updateObject(obj.id, {
            body: e.target.value || undefined,
          } as Partial<WireObject>)
        }
        placeholder="Body text (use Enter for multiline)"
        rows={3}
        value={obj.body ?? ""}
      />
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

      {/* Border and Fill only for bordered components */}
      {!BORDERLESS_COMPONENTS.has(obj.componentType) && (
        <BorderFillSection obj={obj} />
      )}

      {/* Icon picker for input, icon, and image components */}
      {ICON_PICKER_TYPES.has(obj.componentType) && (
        <IconPicker obj={obj} showNone={obj.componentType !== "icon"} />
      )}

      {/* Checked state toggle for checkbox/radio/toggle */}
      {checkedLabels[obj.componentType] != null && (
        <CheckedToggle
          checked={obj.checked !== false}
          label={checkedLabels[obj.componentType] as [string, string]}
          onChange={(val) =>
            updateObject(obj.id, { checked: val } as Partial<WireObject>)
          }
        />
      )}

      {/* Alert: type selector */}
      {obj.componentType === "alert" && <AlertTypeSelector obj={obj} />}

      {/* Progress: percentage slider */}
      {obj.componentType === "progress" && <ProgressSlider obj={obj} />}

      {/* Rating: value slider */}
      {obj.componentType === "rating" && <RatingSlider obj={obj} />}

      {/* Stepper: step management + active step */}
      {obj.componentType === "stepper" && <StepperEditor obj={obj} />}

      {/* Breadcrumb: item management */}
      {obj.componentType === "breadcrumb" && (
        <EditableItemList
          items={obj.items ?? []}
          label="Items"
          newItemLabel={(n) => `Page ${n + 1}`}
          onChange={(items) =>
            updateObject(obj.id, { items } as Partial<WireObject>)
          }
        />
      )}

      {/* List: style selector */}
      {obj.componentType === "list" && <ListStyleSelector obj={obj} />}

      {/* List: item management */}
      {obj.componentType === "list" && (
        <EditableItemList
          items={obj.items ?? []}
          label="Items"
          newItemLabel={(n) => `Item ${n + 1}`}
          onChange={(items) =>
            updateObject(obj.id, {
              items,
              height: items.length,
            } as Partial<WireObject>)
          }
        />
      )}

      {/* Table: column management */}
      {obj.componentType === "table" && (
        <EditableItemList
          items={obj.columns ?? []}
          label="Columns"
          newItemLabel={(n) => `Col ${String.fromCharCode(65 + n)}`}
          onChange={(columns) =>
            updateObject(obj.id, { columns } as Partial<WireObject>)
          }
        />
      )}

      {/* Navbar: nav item management */}
      {obj.componentType === "navbar" && (
        <EditableItemList
          items={obj.navItems ?? []}
          label="Nav Items"
          newItemLabel={(n) => `Item ${n + 1}`}
          onChange={(navItems) =>
            updateObject(obj.id, { navItems } as Partial<WireObject>)
          }
        />
      )}

      {/* Tabs: tab management */}
      {obj.componentType === "tabs" && (
        <EditableItemList
          items={obj.tabs ?? []}
          label="Tabs"
          newItemLabel={(n) => `Tab ${n + 1}`}
          onChange={(tabs) =>
            updateObject(obj.id, { tabs } as Partial<WireObject>)
          }
        />
      )}

      {/* Label field — hidden for components where it has no effect */}
      {obj.componentType !== "skeleton" && (
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
      )}

      <BodyTextField obj={obj} />
    </>
  );
}

const connectorSides: (ConnectorSide | "auto")[] = [
  "auto",
  "top",
  "bottom",
  "left",
  "right",
];

function ConnectorProperties({
  obj,
}: {
  obj: Extract<WireObject, { type: "connector" }>;
}) {
  const updateObject = useEditorStore((s) => s.updateObject);
  const objects = useEditorStore((s) => s.objects);
  const fromObj = objects.find((o) => o.id === obj.fromId);
  const toObj = objects.find((o) => o.id === obj.toId);
  const startHead = obj.startHead === true;
  const endHead = obj.endHead !== false;

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
    <>
      <div>
        <FieldLabel>From</FieldLabel>
        <span className="text-text text-xs">
          {fromObj?.name ?? fromObj?.type ?? "unknown"}
        </span>
      </div>

      <div>
        <FieldLabel>To</FieldLabel>
        <span className="text-text text-xs">
          {toObj?.name ?? toObj?.type ?? "unknown"}
        </span>
      </div>

      <div>
        <FieldLabel>From side</FieldLabel>
        <select
          className="w-full rounded bg-surface-hover px-1.5 py-1 text-text text-xs outline-none"
          onChange={(e) =>
            updateObject(obj.id, {
              fromSide: e.target.value === "auto" ? undefined : e.target.value,
            } as Partial<WireObject>)
          }
          value={obj.fromSide ?? "auto"}
        >
          {connectorSides.map((side) => (
            <option key={side} value={side}>
              {side}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel>To side</FieldLabel>
        <select
          className="w-full rounded bg-surface-hover px-1.5 py-1 text-text text-xs outline-none"
          onChange={(e) =>
            updateObject(obj.id, {
              toSide: e.target.value === "auto" ? undefined : e.target.value,
            } as Partial<WireObject>)
          }
          value={obj.toSide ?? "auto"}
        >
          {connectorSides.map((side) => (
            <option key={side} value={side}>
              {side}
            </option>
          ))}
        </select>
      </div>

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

      <div>
        <label
          className="mb-1 block text-[10px] text-text-dim uppercase tracking-wider"
          htmlFor="connector-label"
        >
          Label
        </label>
        <input
          className="w-full rounded border border-border bg-bg px-2 py-1 text-text text-xs outline-none focus:border-accent"
          id="connector-label"
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
