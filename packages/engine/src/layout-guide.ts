export const LAYOUT_GUIDE = `
CRITICAL LAYOUT RULES — read carefully to avoid rendering bugs:

COORDINATE SYSTEM:
- Grid is character-based: 1 cell = 1 character wide, 1 character tall
- position {col, row} is the top-left corner of the object (0-based)
- An object at col=5, width=20 occupies cols 5 through 24 (inclusive)

BORDER SIZING:
- Boxes and components have a 1-cell border on all sides
- Interior usable space = width - 2 (cols) × height - 2 (rows)
- A box of width=20 has 18 usable interior columns

NESTING CHILDREN INSIDE CONTAINERS:
- To place an object inside a container, offset position by at least +2 col, +2 row from the container's position
- Child must end at least 2 cols/rows before container's far edge
- Formula: child.col >= parent.col + 2, child.col + child.width <= parent.col + parent.width - 2
- Same rule applies vertically

BOX LABELS:
- Box labels support multiline via \\n (e.g., "Line 1\\nLine 2")
- Each line is individually centered horizontally
- The block of lines is vertically centered within the box interior
- Min width is based on the widest line + 4

EVEN CENTERING:
- Labels are centered using floor division, so odd remainders cause 1 extra space on the right
- For perfectly even padding around a label: width and label length must have the same parity (both even or both odd)
- Example: "Save" (4 chars) → use width 8 (even+even), NOT 7. Width 8 = 2 border + 2 pad + 4 label = symmetric
- Example: "Login" (5 chars) → use width 9 (odd+odd). Width 9 = 2 border + 1 pad + 5 label + 1 pad = symmetric
- Same rule applies vertically: for centered vertical content, match height parity to content line count
- Formula: width = label.length + 4 gives minimum symmetric width. Add 2 to widen while keeping symmetry

TEXT SIZING:
- Each character in text content = 1 cell wide
- Text at col=10 with 15 characters occupies cols 10-24
- To fit text inside a container: text.length <= container.width - 4 (2 for borders + 2 for padding)
- Use shorter text or wider containers to avoid overflow

VERTICAL STACKING (inputs, checkboxes, etc.):
- Most input components are height=3 (top border + content + bottom border)
- To stack vertically WITHOUT overlapping: next.row = previous.row + previous.height
- Example: input at row=10 (height 3) → next input at row=13, NOT row=12
- Overlapping components corrupt each other's borders

COMPONENT SIZES:
- button: min width = label.length + 4, height 3
- input/select: min width = label.length + 6, height 3
- checkbox/radio: height 1, borderless [✓]/( ●) indicator + label, uses checked field
- table: min height 5, width should fit all column headers
- card/modal: min height 6 (border + title + padding row + separator + content + border). Body text (via body field) renders left-aligned starting at row+4. Use \\n for multiline body text.
- browser: min height 5 (URL bar + separator + content)
- tabs: height should be tall enough for content below the tab labels (labels render at vertical center)
- progress: min width = 8, height 3 (bar renders inside borders)
- icon: width 3, height 3 (renders single char at center)
- navbar: height 3
- image: default 20×10, bordered with ░ fill and centered label/icon
- divider: height 1, borderless ─── line (optional centered label)
- toggle: height 1, borderless [●──] or [──●] + label, uses checked field
- alert: default 40×5, bordered with icon prefix (i ! x ✓) per alertType
- breadcrumb: height 1, borderless items joined by separator
- avatar: default 5×3, bordered with 1-2 char initials from label or single icon char
- list: height = items.length, borderless rows with bullet/number/dash prefix
- stepper: height 1, borderless ● Step ─ ○ Step chain, uses activeStep
- rating: height 1, borderless ●●●○○ dots based on value/maxValue
- skeleton: height 1, borderless ░ fill block

TABS COMPONENT WARNING:
- Tab labels render at the vertical center of the tabs component
- Do NOT place other objects at that row — they will collide
- Place content objects ABOVE the center row (in the top half)

PROGRESS BAR INSIDE CARDS:
- A progress bar (height 3) inside a card must end at least 1 row above the card's bottom border
- Card bottom border = card.row + card.height - 1
- Progress bottom = progress.row + 2
- Ensure: progress.row + 2 < card.row + card.height - 1

CONNECTORS:
- Use type "connector" to draw orthogonal (right-angle) lines between boxes/components
- Set fromId and toId to reference the IDs of the connected objects
- Path is auto-routed with horizontal and vertical segments (no diagonals)
- fromSide/toSide are optional — omit for auto-detection based on object positions
- endHead defaults to true (arrow at end), startHead defaults to false
- Connectors move automatically when connected objects are moved
- Give connected objects explicit id values so connectors can reference them
- Optional label field renders text centered at the path midpoint (supports multiline via \\n, max 20 chars per line)

GROUPING:
- Set the same groupId string on multiple objects to group them
- Grouped objects move and select together in the editor
- Use any string as groupId (e.g., "header-group", "form-1")
- Omit groupId to leave objects ungrouped

Z-INDEX:
- Higher zIndex objects render on top and overwrite lower ones
- Place container objects (browser, card, box) at lower zIndex
- Place content objects (text, buttons, inputs) at higher zIndex
`.trim();
