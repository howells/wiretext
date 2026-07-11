import { BORDERLESS_COMPONENTS, COMPONENT_BY_TYPE } from "@wiretext/engine";
import type { ComponentType, WireObject } from "@wiretext/engine";

import { useEditorStore } from "@/store";

import {
  AlertTypeSelector,
  IconPicker,
  ListStyleSelector,
  ProgressSlider,
  RatingSlider,
  StepperEditor,
} from "./component-editors";
import {
  ACTIVE_BUTTON_CLASS,
  BorderFillFields,
  EditableItemList,
  FieldLabel,
  INACTIVE_BUTTON_CLASS,
} from "./shared-controls";

type ComponentObj = Extract<WireObject, { type: "component" }>;

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

const CheckedToggle = ({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: [string, string];
  onChange: (val: boolean) => void;
}) => (
  <div>
    <FieldLabel>State</FieldLabel>
    <div className="flex gap-1">
      <button
        className={`rounded px-2 py-0.5 text-xs transition-colors ${
          checked ? ACTIVE_BUTTON_CLASS : INACTIVE_BUTTON_CLASS
        }`}
        onClick={() => {
          onChange(true);
        }}
        type="button"
      >
        {label[0]}
      </button>
      <button
        className={`rounded px-2 py-0.5 text-xs transition-colors ${
          checked ? INACTIVE_BUTTON_CLASS : ACTIVE_BUTTON_CLASS
        }`}
        onClick={() => {
          onChange(false);
        }}
        type="button"
      >
        {label[1]}
      </button>
    </div>
  </div>
);

const BodyTextField = ({ obj }: { obj: ComponentObj }) => {
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
        onChange={(e) => {
          updateObject(obj.id, {
            body: e.target.value || undefined,
          });
        }}
        placeholder="Body text (use Enter for multiline)"
        rows={3}
        value={obj.body ?? ""}
      />
    </div>
  );
};

/** Item, column, and tab editors for the component types that carry lists. */
const ComponentListFields = ({ obj }: { obj: ComponentObj }) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  return (
    <>
      {/* Breadcrumb: item management */}
      {obj.componentType === "breadcrumb" && (
        <EditableItemList
          items={obj.items ?? []}
          label="Items"
          newItemLabel={(n) => `Page ${n + 1}`}
          onChange={(items) => {
            updateObject(obj.id, { items });
          }}
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
          onChange={(items) => {
            updateObject(obj.id, {
              height: items.length,
              items,
            });
          }}
        />
      )}

      {/* Table: column management */}
      {obj.componentType === "table" && (
        <EditableItemList
          items={obj.columns ?? []}
          label="Columns"
          newItemLabel={(n) => `Col ${String.fromCodePoint(65 + n)}`}
          onChange={(columns) => {
            updateObject(obj.id, { columns });
          }}
        />
      )}

      {/* Navbar: nav item management */}
      {obj.componentType === "navbar" && (
        <EditableItemList
          items={obj.navItems ?? []}
          label="Nav Items"
          newItemLabel={(n) => `Item ${n + 1}`}
          onChange={(navItems) => {
            updateObject(obj.id, { navItems });
          }}
        />
      )}

      {/* Tabs: tab management */}
      {obj.componentType === "tabs" && (
        <EditableItemList
          items={obj.tabs ?? []}
          label="Tabs"
          newItemLabel={(n) => `Tab ${n + 1}`}
          onChange={(tabs) => {
            updateObject(obj.id, { tabs });
          }}
        />
      )}
    </>
  );
};

export const ComponentProperties = ({ obj }: { obj: ComponentObj }) => {
  const updateObject = useEditorStore((s) => s.updateObject);
  const def = COMPONENT_BY_TYPE[obj.componentType];
  const checkedLabel = checkedLabels[obj.componentType];

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
        <BorderFillFields obj={obj} />
      )}

      {/* Icon picker for input, icon, and image components */}
      {ICON_PICKER_TYPES.has(obj.componentType) && (
        <IconPicker obj={obj} showNone={obj.componentType !== "icon"} />
      )}

      {/* Checked state toggle for checkbox/radio/toggle */}
      {checkedLabel !== undefined && (
        <CheckedToggle
          checked={obj.checked !== false}
          label={checkedLabel}
          onChange={(val) => {
            updateObject(obj.id, { checked: val });
          }}
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

      <ComponentListFields obj={obj} />

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
            onChange={(e) => {
              updateObject(obj.id, {
                label: e.target.value || undefined,
              });
            }}
            placeholder="Optional label"
            type="text"
            value={obj.label ?? ""}
          />
        </div>
      )}

      <BodyTextField obj={obj} />
    </>
  );
};
