/** Canonical set of Unicode icons available in Wiretext */
interface WireIcon {
  category: string;
  char: string;
  label: string;
}

/**
 * All characters are single-width in JetBrains Mono and common monospace fonts.
 * Grouped by category for the icon picker UI.
 */
export const WIRE_ICONS: WireIcon[] = [
  // ── Navigation ──────────────────────────────────────────
  { char: "←", label: "Left", category: "Navigation" },
  { char: "→", label: "Right", category: "Navigation" },
  { char: "↑", label: "Up", category: "Navigation" },
  { char: "↓", label: "Down", category: "Navigation" },
  { char: "↗", label: "Up-Right", category: "Navigation" },
  { char: "↘", label: "Down-Right", category: "Navigation" },
  { char: "↙", label: "Down-Left", category: "Navigation" },
  { char: "↖", label: "Up-Left", category: "Navigation" },
  { char: "⌂", label: "Home", category: "Navigation" },
  { char: "≡", label: "Menu", category: "Navigation" },
  { char: "⇅", label: "Sort", category: "Navigation" },

  // ── Actions ─────────────────────────────────────────────
  { char: "⊕", label: "Add", category: "Actions" },
  { char: "⊖", label: "Remove", category: "Actions" },
  { char: "✓", label: "Check", category: "Actions" },
  { char: "✕", label: "Close", category: "Actions" },
  { char: "✎", label: "Edit", category: "Actions" },
  { char: "⌕", label: "Search", category: "Actions" },
  { char: "⟳", label: "Refresh", category: "Actions" },
  { char: "⊗", label: "Cancel", category: "Actions" },
  { char: "⊘", label: "Block", category: "Actions" },
  { char: "⏎", label: "Enter", category: "Actions" },
  { char: "⌫", label: "Delete", category: "Actions" },

  // ── Status ──────────────────────────────────────────────
  { char: "●", label: "Active", category: "Status" },
  { char: "○", label: "Inactive", category: "Status" },
  { char: "△", label: "Warning", category: "Status" },
  { char: "⚑", label: "Flag", category: "Status" },
  { char: "ℹ", label: "Info", category: "Status" },
  { char: "✦", label: "New", category: "Status" },

  // ── Communication ───────────────────────────────────────
  { char: "✉", label: "Mail", category: "Communication" },
  { char: "☎", label: "Phone", category: "Communication" },
  { char: "♯", label: "Hash", category: "Communication" },
  { char: "¶", label: "Comment", category: "Communication" },
  { char: "§", label: "Section", category: "Communication" },

  // ── Content ─────────────────────────────────────────────
  { char: "★", label: "Star", category: "Content" },
  { char: "♡", label: "Heart", category: "Content" },
  { char: "♩", label: "Music", category: "Content" },
  { char: "⍥", label: "User", category: "Content" },
  { char: "◉", label: "Target", category: "Content" },
  { char: "⊞", label: "Grid", category: "Content" },
  { char: "◷", label: "Time", category: "Content" },
  { char: "☁", label: "Cloud", category: "Content" },
  { char: "⌘", label: "Command", category: "Content" },

  // ── Media ───────────────────────────────────────────────
  { char: "▶", label: "Play", category: "Media" },
  { char: "■", label: "Stop", category: "Media" },
  { char: "◀", label: "Rewind", category: "Media" },
  { char: "⏏", label: "Eject", category: "Media" },

  // ── Shapes ──────────────────────────────────────────────
  { char: "▲", label: "Triangle Up", category: "Shapes" },
  { char: "▼", label: "Triangle Down", category: "Shapes" },
  { char: "◆", label: "Diamond", category: "Shapes" },
  { char: "◇", label: "Diamond Outline", category: "Shapes" },
  { char: "□", label: "Square", category: "Shapes" },
  { char: "▾", label: "Caret Down", category: "Shapes" },
  { char: "▴", label: "Caret Up", category: "Shapes" },
  { char: "◁", label: "Caret Left", category: "Shapes" },
  { char: "▷", label: "Caret Right", category: "Shapes" },

  // ── Commerce ────────────────────────────────────────────
  { char: "$", label: "Dollar", category: "Commerce" },
  { char: "€", label: "Euro", category: "Commerce" },
  { char: "£", label: "Pound", category: "Commerce" },
  { char: "¥", label: "Yen", category: "Commerce" },
  { char: "¢", label: "Cent", category: "Commerce" },

  // ── Math & Logic ────────────────────────────────────────
  { char: "×", label: "Multiply", category: "Math" },
  { char: "÷", label: "Divide", category: "Math" },
  { char: "±", label: "Plus-Minus", category: "Math" },
  { char: "≠", label: "Not Equal", category: "Math" },
  { char: "≤", label: "LTE", category: "Math" },
  { char: "≥", label: "GTE", category: "Math" },
  { char: "∞", label: "Infinity", category: "Math" },
  { char: "∑", label: "Sum", category: "Math" },
  { char: "√", label: "Root", category: "Math" },
  { char: "π", label: "Pi", category: "Math" },
  { char: "%", label: "Percent", category: "Math" },

  // ── Punctuation & Misc ──────────────────────────────────
  { char: "©", label: "Copyright", category: "Misc" },
  { char: "®", label: "Registered", category: "Misc" },
  { char: "°", label: "Degree", category: "Misc" },
  { char: "†", label: "Dagger", category: "Misc" },
  { char: "‡", label: "Double Dagger", category: "Misc" },
  { char: "…", label: "Ellipsis", category: "Misc" },
  { char: "•", label: "Bullet", category: "Misc" },
  { char: "※", label: "Reference", category: "Misc" },
];

/** Get unique category names in display order */
export const ICON_CATEGORIES = [
  ...new Set(WIRE_ICONS.map((icon) => icon.category)),
];
