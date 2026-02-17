import { describe, expect, it } from "vitest";
import { BORDERLESS_COMPONENTS, getComponentMinWidth } from "./min-width";
import type { ComponentType } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function minWidth(
  componentType: ComponentType,
  overrides: Partial<{
    label: string;
    icon: string;
    navItems: string[];
    tabs: string[];
    columns: string[];
    items: string[];
    separator: string;
    listStyle: string;
    maxValue: number;
  }> = {}
): number {
  return getComponentMinWidth({ componentType, ...overrides });
}

// ---------------------------------------------------------------------------
// BORDERLESS_COMPONENTS membership
// ---------------------------------------------------------------------------

describe("BORDERLESS_COMPONENTS", () => {
  const expected: ComponentType[] = [
    "icon",
    "divider",
    "toggle",
    "breadcrumb",
    "list",
    "stepper",
    "rating",
    "skeleton",
  ];

  it("contains exactly the expected component types", () => {
    expect(BORDERLESS_COMPONENTS.size).toBe(expected.length);
    for (const type of expected) {
      expect(BORDERLESS_COMPONENTS.has(type)).toBe(true);
    }
  });

  it("does not contain bordered component types", () => {
    const bordered: ComponentType[] = [
      "button",
      "input",
      "select",
      "checkbox",
      "radio",
      "card",
      "modal",
      "browser",
      "alert",
      "image",
      "table",
      "navbar",
      "tabs",
      "progress",
      "avatar",
    ];
    for (const type of bordered) {
      expect(BORDERLESS_COMPONENTS.has(type)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Label-based components
// ---------------------------------------------------------------------------

describe("getComponentMinWidth — label-based components", () => {
  describe("button", () => {
    it("should return fallback of 3 when label is absent", () => {
      expect(minWidth("button")).toBe(3);
    });

    it("should return fallback of 3 when label is empty string", () => {
      expect(minWidth("button", { label: "" })).toBe(3);
    });

    it("should return label length plus padding of 4 for a short label", () => {
      // "OK" = 2 chars + 4 = 6
      expect(minWidth("button", { label: "OK" })).toBe(6);
    });

    it("should return label length plus padding of 4 for a long label", () => {
      // "Submit Form" = 11 chars + 4 = 15
      expect(minWidth("button", { label: "Submit Form" })).toBe(15);
    });
  });

  describe("input", () => {
    it("should return fallback of 3 when label is absent", () => {
      expect(minWidth("input")).toBe(3);
    });

    it("should return fallback of 3 when label is empty", () => {
      expect(minWidth("input", { label: "" })).toBe(3);
    });

    it("should return label length plus padding of 4 without an icon", () => {
      // "Email" = 5 chars + 4 = 9
      expect(minWidth("input", { label: "Email" })).toBe(9);
    });

    it("should add 2 extra chars when an icon is present with a label", () => {
      // "Email" = 5 chars + 4 padding + 2 icon = 11
      expect(minWidth("input", { label: "Email", icon: "mail" })).toBe(11);
    });

    it("should return fallback of 3 even when icon is present but label is absent", () => {
      expect(minWidth("input", { icon: "mail" })).toBe(3);
    });

    it("should return fallback of 3 even when icon is present but label is empty", () => {
      expect(minWidth("input", { label: "", icon: "mail" })).toBe(3);
    });
  });

  describe("select", () => {
    it("should return fallback of 3 when label is absent", () => {
      expect(minWidth("select")).toBe(3);
    });

    it("should return label length plus padding of 5 for a short label", () => {
      // "Age" = 3 chars + 5 = 8
      expect(minWidth("select", { label: "Age" })).toBe(8);
    });

    it("should return label length plus padding of 5 for a long label", () => {
      // "Country" = 7 chars + 5 = 12
      expect(minWidth("select", { label: "Country" })).toBe(12);
    });
  });

  describe("checkbox", () => {
    it("should return fallback of 3 when label is absent", () => {
      expect(minWidth("checkbox")).toBe(3);
    });

    it("should return label length plus padding of 8 for a short label", () => {
      // "Yes" = 3 chars + 8 = 11
      expect(minWidth("checkbox", { label: "Yes" })).toBe(11);
    });

    it("should return label length plus padding of 8 for a long label", () => {
      // "Remember me" = 11 chars + 8 = 19
      expect(minWidth("checkbox", { label: "Remember me" })).toBe(19);
    });
  });

  describe("radio", () => {
    it("should return fallback of 3 when label is absent", () => {
      expect(minWidth("radio")).toBe(3);
    });

    it("should return label length plus padding of 8 for a short label", () => {
      // "No" = 2 chars + 8 = 10
      expect(minWidth("radio", { label: "No" })).toBe(10);
    });

    it("should return label length plus padding of 8 for a long label", () => {
      // "Option A" = 8 chars + 8 = 16
      expect(minWidth("radio", { label: "Option A" })).toBe(16);
    });
  });

  describe("card", () => {
    it("should return fallback of 5 when label is absent", () => {
      expect(minWidth("card")).toBe(5);
    });

    it("should return label length plus padding of 4 for a short label", () => {
      // "Hi" = 2 chars + 4 = 6
      expect(minWidth("card", { label: "Hi" })).toBe(6);
    });

    it("should return label length plus padding of 4 for a long label", () => {
      // "User Profile" = 12 chars + 4 = 16
      expect(minWidth("card", { label: "User Profile" })).toBe(16);
    });
  });

  describe("modal", () => {
    it("should return fallback of 5 when label is absent", () => {
      expect(minWidth("modal")).toBe(5);
    });

    it("should return label length plus padding of 4 for a short label", () => {
      // "OK" = 2 chars + 4 = 6
      expect(minWidth("modal", { label: "OK" })).toBe(6);
    });

    it("should return label length plus padding of 4 for a long label", () => {
      // "Confirm Delete" = 14 chars + 4 = 18
      expect(minWidth("modal", { label: "Confirm Delete" })).toBe(18);
    });
  });

  describe("browser", () => {
    it("should return fallback of 12 when label is absent", () => {
      expect(minWidth("browser")).toBe(12);
    });

    it("should return label length plus padding of 12 for a short URL", () => {
      // "example.com" = 11 chars + 12 = 23
      expect(minWidth("browser", { label: "example.com" })).toBe(23);
    });

    it("should return label length plus padding of 12 for a long URL", () => {
      // "https://www.example.com/page" = 28 chars + 12 = 40
      expect(
        minWidth("browser", { label: "https://www.example.com/page" })
      ).toBe(40);
    });
  });

  describe("alert", () => {
    it("should return fallback of 5 when label is absent", () => {
      expect(minWidth("alert")).toBe(5);
    });

    it("should return label length plus padding of 6 for a short label", () => {
      // "Error" = 5 chars + 6 = 11
      expect(minWidth("alert", { label: "Error" })).toBe(11);
    });

    it("should return label length plus padding of 6 for a long label", () => {
      // "Something went wrong" = 20 chars + 6 = 26
      expect(minWidth("alert", { label: "Something went wrong" })).toBe(26);
    });
  });

  describe("image", () => {
    it("should return fallback of 3 when label is absent", () => {
      expect(minWidth("image")).toBe(3);
    });

    it("should return label length plus padding of 4 for a short label", () => {
      // "Alt" = 3 chars + 4 = 7
      expect(minWidth("image", { label: "Alt" })).toBe(7);
    });

    it("should return label length plus padding of 4 for a long label", () => {
      // "Profile photo" = 13 chars + 4 = 17
      expect(minWidth("image", { label: "Profile photo" })).toBe(17);
    });
  });

  describe("toggle", () => {
    it("should return fallback of 5 when label is absent", () => {
      expect(minWidth("toggle")).toBe(5);
    });

    it("should return label length plus padding of 6 for a short label", () => {
      // "On" = 2 chars + 6 = 8
      expect(minWidth("toggle", { label: "On" })).toBe(8);
    });

    it("should return label length plus padding of 6 for a long label", () => {
      // "Enable notifications" = 20 chars + 6 = 26
      expect(minWidth("toggle", { label: "Enable notifications" })).toBe(26);
    });
  });

  describe("divider", () => {
    it("should return fallback of 1 when label is absent", () => {
      expect(minWidth("divider")).toBe(1);
    });

    it("should return label length plus padding of 5 for a short label", () => {
      // "Or" = 2 chars + 5 = 7
      expect(minWidth("divider", { label: "Or" })).toBe(7);
    });

    it("should return label length plus padding of 5 for a long label", () => {
      // "Section Header" = 14 chars + 5 = 19
      expect(minWidth("divider", { label: "Section Header" })).toBe(19);
    });
  });
});

// ---------------------------------------------------------------------------
// Items-based components
// ---------------------------------------------------------------------------

describe("getComponentMinWidth — items-based components", () => {
  describe("navbar", () => {
    it("should return 3 when navItems is absent", () => {
      expect(minWidth("navbar")).toBe(3);
    });

    it("should return 3 when navItems is empty", () => {
      expect(minWidth("navbar", { navItems: [] })).toBe(3);
    });

    it("should return joined length plus 7 for a single item", () => {
      // "Home" joined = "Home" (4 chars), + 7 = 11
      expect(minWidth("navbar", { navItems: ["Home"] })).toBe(11);
    });

    it("should return joined length plus 7 for multiple items", () => {
      // "Home" + "  " + "About" + "  " + "Contact" = 4+2+5+2+7 = 20, + 7 = 27
      expect(
        minWidth("navbar", { navItems: ["Home", "About", "Contact"] })
      ).toBe(27);
    });
  });

  describe("tabs", () => {
    it("should return 3 when tabs is absent", () => {
      expect(minWidth("tabs")).toBe(3);
    });

    it("should return 3 when tabs is empty", () => {
      expect(minWidth("tabs", { tabs: [] })).toBe(3);
    });

    it("should return joined length plus 4 for a single tab", () => {
      // "Profile" = 7 chars, + 4 = 11
      expect(minWidth("tabs", { tabs: ["Profile"] })).toBe(11);
    });

    it("should return joined length plus 4 for multiple tabs", () => {
      // "Tab 1" + " │ " + "Tab 2" = 5+3+5 = 13, + 4 = 17
      expect(minWidth("tabs", { tabs: ["Tab 1", "Tab 2"] })).toBe(17);
    });
  });

  describe("table", () => {
    it("should return 3 when columns is absent", () => {
      expect(minWidth("table")).toBe(3);
    });

    it("should return 3 when columns is empty", () => {
      expect(minWidth("table", { columns: [] })).toBe(3);
    });

    it("should return sum of (col.length + 2) per column plus 2 for a single column", () => {
      // "Name" = 4, +2 = 6, +2 outer = 8
      expect(minWidth("table", { columns: ["Name"] })).toBe(8);
    });

    it("should return correct total for multiple columns", () => {
      // "Name"(4+2) + "Age"(3+2) + "City"(4+2) = 6+5+6 = 17, +2 = 19
      expect(minWidth("table", { columns: ["Name", "Age", "City"] })).toBe(19);
    });
  });

  describe("breadcrumb", () => {
    it("should return 1 when items is absent", () => {
      expect(minWidth("breadcrumb")).toBe(1);
    });

    it("should return 1 when items is empty", () => {
      expect(minWidth("breadcrumb", { items: [] })).toBe(1);
    });

    it("should return total length using default separator for a single item", () => {
      // "Home" = 4 chars (no separator with single item)
      expect(minWidth("breadcrumb", { items: ["Home"] })).toBe(4);
    });

    it("should return total length using default separator ' > ' for multiple items", () => {
      // "Home" + " > " + "About" = 4+3+5 = 12
      expect(minWidth("breadcrumb", { items: ["Home", "About"] })).toBe(12);
    });

    it("should use custom separator when provided", () => {
      // "Home" + " / " + "About" = 4+3+5 = 12
      expect(
        minWidth("breadcrumb", { items: ["Home", "About"], separator: " / " })
      ).toBe(12);
    });

    it("should use custom separator with different length", () => {
      // "Home" + ">" + "About" = 4+1+5 = 10
      expect(
        minWidth("breadcrumb", { items: ["Home", "About"], separator: ">" })
      ).toBe(10);
    });
  });

  describe("list", () => {
    it("should return 1 when items is absent", () => {
      expect(minWidth("list")).toBe(1);
    });

    it("should return 1 when items is empty", () => {
      expect(minWidth("list", { items: [] })).toBe(1);
    });

    it("should return prefix length 2 plus longest item for bullet style", () => {
      // prefix = 2, "Apple" = 5, total = 7
      expect(
        minWidth("list", { items: ["Apple", "Fig"], listStyle: "bullet" })
      ).toBe(7);
    });

    it("should return prefix length 2 plus longest item for dash style", () => {
      // prefix = 2, "Banana" = 6, total = 8
      expect(
        minWidth("list", { items: ["Banana", "Date"], listStyle: "dash" })
      ).toBe(8);
    });

    it("should return prefix length 3 plus longest item for number style", () => {
      // prefix = 3, "Cherry" = 6, total = 9
      expect(
        minWidth("list", { items: ["Kiwi", "Cherry"], listStyle: "number" })
      ).toBe(9);
    });

    it("should default to prefix length 2 when listStyle is absent", () => {
      // prefix = 2, "Item" = 4, total = 6
      expect(minWidth("list", { items: ["Item"] })).toBe(6);
    });

    it("should use the longest item when items vary in length", () => {
      // prefix = 2, "Longest item here" = 17, total = 19
      expect(
        minWidth("list", { items: ["Short", "Longest item here", "Mid"] })
      ).toBe(19);
    });
  });

  describe("stepper", () => {
    it("should return 1 when items is absent", () => {
      expect(minWidth("stepper")).toBe(1);
    });

    it("should return 1 when items is empty", () => {
      expect(minWidth("stepper", { items: [] })).toBe(1);
    });

    it("should calculate correctly for a single item with a label", () => {
      // i=0: 1 + 1 + 4 = 6, no separators
      expect(minWidth("stepper", { items: ["Step"] })).toBe(6);
    });

    it("should add 3 per separator between items", () => {
      // i=0: 1+1+4=6, sep +3, i=1: 1+1+5=7 → total = 16
      expect(minWidth("stepper", { items: ["Step", "Place"] })).toBe(16);
    });

    it("should handle three items correctly", () => {
      // i=0: 1+1+1=3, sep +3, i=1: 1+1+2=4, sep +3, i=2: 1+1+4=6 → total = 19
      expect(minWidth("stepper", { items: ["A", "Go", "Done"] })).toBe(19);
    });

    it("should count 1 for an empty string item", () => {
      // i=0: 1 (empty item, no label part), sep +3, i=1: 1+1+4=6 → total = 10
      expect(minWidth("stepper", { items: ["", "Step"] })).toBe(10);
    });
  });

  describe("rating", () => {
    it("should return default maxValue of 5 when no label and no maxValue", () => {
      expect(minWidth("rating")).toBe(5);
    });

    it("should return custom maxValue when no label", () => {
      expect(minWidth("rating", { maxValue: 10 })).toBe(10);
    });

    it("should return maxValue plus 1 plus label length when label is present", () => {
      // maxValue=5, "Rate" = 4, total = 5+1+4 = 10
      expect(minWidth("rating", { label: "Rate" })).toBe(10);
    });

    it("should return custom maxValue plus 1 plus label length", () => {
      // maxValue=10, "Score" = 5, total = 10+1+5 = 16
      expect(minWidth("rating", { maxValue: 10, label: "Score" })).toBe(16);
    });

    it("should return maxValue only when label is empty string", () => {
      expect(minWidth("rating", { label: "" })).toBe(5);
    });
  });
});

// ---------------------------------------------------------------------------
// Fallback behaviour for unhandled types
// ---------------------------------------------------------------------------

describe("getComponentMinWidth — fallback for components without label or items rules", () => {
  it("should return 1 for icon (borderless, no label rule)", () => {
    expect(minWidth("icon")).toBe(1);
  });

  it("should return 1 for skeleton (borderless)", () => {
    expect(minWidth("skeleton")).toBe(1);
  });

  it("should return 3 for progress (bordered, no label rule)", () => {
    expect(minWidth("progress")).toBe(3);
  });

  it("should return 3 for avatar (bordered, no label rule)", () => {
    expect(minWidth("avatar")).toBe(3);
  });
});
