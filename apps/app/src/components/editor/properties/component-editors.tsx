import { ICON_CATEGORIES, WIRE_ICONS } from "@wiretext/engine";
import type { WireObject } from "@wiretext/engine";

import { useEditorStore } from "@/store";

import {
  ACTIVE_BUTTON_CLASS,
  FieldLabel,
  INACTIVE_BUTTON_CLASS,
} from "./shared-controls";

type ComponentObj = Extract<WireObject, { type: "component" }>;

type WireIcon = (typeof WIRE_ICONS)[number];

const ICONS_BY_CATEGORY = new Map<string, WireIcon[]>();
for (const icon of WIRE_ICONS) {
  const list = ICONS_BY_CATEGORY.get(icon.category);
  if (list) {
    list.push(icon);
  } else {
    ICONS_BY_CATEGORY.set(icon.category, [icon]);
  }
}

export const IconPicker = ({
  obj,
  showNone,
}: {
  obj: ComponentObj;
  showNone: boolean;
}) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  const selectIcon = (char?: string) => {
    updateObject(obj.id, { icon: char });
  };
  const hasIcon = obj.icon !== undefined && obj.icon !== "";
  return (
    <div>
      <FieldLabel>Icon</FieldLabel>
      <div className="flex flex-col gap-1.5">
        {showNone && (
          <div className="grid grid-cols-8 gap-0.5">
            <button
              aria-label="None"
              className={`rounded px-1 py-0.5 font-mono text-sm transition-colors ${
                hasIcon ? INACTIVE_BUTTON_CLASS : ACTIVE_BUTTON_CLASS
              }`}
              onClick={() => {
                selectIcon();
              }}
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
              {(ICONS_BY_CATEGORY.get(category) ?? []).map((icon) => (
                <button
                  aria-label={icon.label}
                  className={`rounded px-1 py-0.5 font-mono text-sm transition-colors ${
                    obj.icon === icon.char
                      ? ACTIVE_BUTTON_CLASS
                      : INACTIVE_BUTTON_CLASS
                  }`}
                  key={icon.char}
                  onClick={() => {
                    selectIcon(icon.char);
                  }}
                  type="button"
                >
                  {icon.char}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StepperEditor = ({ obj }: { obj: ComponentObj }) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  const items = obj.items ?? [];
  const activeStep = obj.activeStep ?? 0;
  return (
    <div>
      <FieldLabel>Steps</FieldLabel>
      <div className="flex flex-col gap-1">
        {items.map((step, stepIdx) => (
          // Position-based keys keep inputs mounted (and focused) across
          // keystrokes; value-based keys would remount on every edit.
          <div className="flex items-center gap-1" key={`step-${stepIdx}`}>
            <button
              aria-label={`Set active step to ${stepIdx + 1}`}
              className={`shrink-0 rounded px-1 py-0.5 font-mono text-[10px] transition-colors ${
                stepIdx <= activeStep
                  ? ACTIVE_BUTTON_CLASS
                  : "bg-surface-hover text-text-dim"
              }`}
              onClick={() => {
                updateObject(obj.id, {
                  activeStep: stepIdx,
                });
              }}
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
                });
              }}
              type="text"
              value={step}
            />
            {items.length > 1 && (
              <button
                aria-label="Remove step"
                className="rounded px-1 text-text-dim text-xs hover:text-text"
                onClick={() => {
                  const next = items.filter((_, j) => j !== stepIdx);
                  updateObject(obj.id, {
                    activeStep: Math.min(activeStep, next.length - 1),
                    items: next,
                  });
                }}
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
            updateObject(obj.id, {
              items: [...items, `Step ${items.length + 1}`],
            });
          }}
          type="button"
        >
          + Add step
        </button>
      </div>
    </div>
  );
};

const alertTypes = [
  { icon: "ℹ", label: "Info", value: "info" },
  { icon: "⚠", label: "Warning", value: "warning" },
  { icon: "✖", label: "Error", value: "error" },
  { icon: "✓", label: "Success", value: "success" },
] as const;

export const AlertTypeSelector = ({ obj }: { obj: ComponentObj }) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  return (
    <div>
      <FieldLabel>Type</FieldLabel>
      <div className="flex gap-1">
        {alertTypes.map((opt) => (
          <button
            aria-label={opt.label}
            className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
              (obj.alertType ?? "info") === opt.value
                ? ACTIVE_BUTTON_CLASS
                : INACTIVE_BUTTON_CLASS
            }`}
            key={opt.value}
            onClick={() => {
              updateObject(obj.id, {
                alertType: opt.value,
              });
            }}
            type="button"
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

const listStyles = [
  { label: "• Bullet", value: "bullet" },
  { label: "1. Number", value: "number" },
  { label: "- Dash", value: "dash" },
] as const;

export const ListStyleSelector = ({ obj }: { obj: ComponentObj }) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  return (
    <div>
      <FieldLabel>Style</FieldLabel>
      <div className="flex gap-1">
        {listStyles.map((opt) => (
          <button
            className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
              (obj.listStyle ?? "bullet") === opt.value
                ? ACTIVE_BUTTON_CLASS
                : INACTIVE_BUTTON_CLASS
            }`}
            key={opt.value}
            onClick={() => {
              updateObject(obj.id, {
                listStyle: opt.value,
              });
            }}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ProgressSlider = ({ obj }: { obj: ComponentObj }) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  const progress = obj.progress ?? 40;
  return (
    <div>
      <FieldLabel>Progress ({progress}%)</FieldLabel>
      <input
        className="w-full accent-accent"
        max={100}
        min={0}
        onChange={(e) => {
          updateObject(obj.id, {
            progress: Number(e.target.value),
          });
        }}
        type="range"
        value={progress}
      />
    </div>
  );
};

export const RatingSlider = ({ obj }: { obj: ComponentObj }) => {
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
        onChange={(e) => {
          updateObject(obj.id, {
            value: Number(e.target.value),
          });
        }}
        type="range"
        value={value}
      />
    </div>
  );
};
