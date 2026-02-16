/** Canonical set of Unicode icons available in Wiretext */
export interface WireIcon {
  char: string;
  label: string;
}

/** All characters are single-width in monospace fonts */
export const WIRE_ICONS: WireIcon[] = [
  { char: "⌕", label: "Search" },
  { char: "✉", label: "Mail" },
  { char: "☎", label: "Phone" },
  { char: "⊕", label: "Add" },
  { char: "♯", label: "Hash" },
  { char: "$", label: "Dollar" },
  { char: "€", label: "Euro" },
  { char: "£", label: "Pound" },
  { char: "★", label: "Star" },
  { char: "♡", label: "Heart" },
  { char: "⊞", label: "Grid" },
  { char: "◉", label: "Target" },
  { char: "≡", label: "Menu" },
  { char: "◷", label: "Time" },
  { char: "⊘", label: "Cancel" },
  { char: "⇅", label: "Sort" },
  { char: "⌂", label: "Home" },
  { char: "♫", label: "Music" },
  { char: "✓", label: "Check" },
  { char: "✕", label: "Close" },
  { char: "↓", label: "Download" },
  { char: "↑", label: "Upload" },
  { char: "⟳", label: "Refresh" },
  { char: "△", label: "Warning" },
  { char: "✎", label: "Edit" },
  { char: "⚑", label: "Flag" },
];
