import { writeFileSync } from "node:fs";

import {
  compose,
  computeRenderGridSize,
  encodeDocument,
  fillDefaults,
  gridToString,
  type MinimalObject,
} from "@wiretext/engine";

const BASE_URL = "https://wiretext.app";

interface Layout {
  name: string;
  description: string;
  objects: MinimalObject[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ═══════════════════════════════════════════════════════════════
// 1. SaaS Analytics Dashboard
// ═══════════════════════════════════════════════════════════════
const dashboard: Layout = {
  name: "SaaS Analytics Dashboard",
  description:
    "Full dashboard with metric cards, ASCII revenue chart, channel breakdown sidebar, and a filterable data table",
  objects: [
    // Browser frame
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 52,
      label: "app.acme.io/dashboard",
    },
    // Navbar
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["≡ Acme", "Dashboard", "Analytics", "Reports", "⍥"],
    },
    // Section header
    {
      type: "text",
      content: "Dashboard Overview",
      position: { col: 3, row: 7 },
    },
    { type: "text", content: "Last 30 days", position: { col: 68, row: 7 } },

    // ── 4 Stat Cards ──
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 9 },
      width: 19,
      height: 8,
      label: "Revenue",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 4, row: 12 },
      icon: "$",
    },
    { type: "text", content: "$142,580", position: { col: 8, row: 13 } },
    { type: "text", content: "↑ 12.5%", position: { col: 4, row: 14 } },

    {
      type: "component",
      componentType: "card",
      position: { col: 22, row: 9 },
      width: 19,
      height: 8,
      label: "Users",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 24, row: 12 },
      icon: "⍥",
    },
    { type: "text", content: "28,493", position: { col: 28, row: 13 } },
    { type: "text", content: "↑ 8.2%", position: { col: 24, row: 14 } },

    {
      type: "component",
      componentType: "card",
      position: { col: 42, row: 9 },
      width: 19,
      height: 8,
      label: "Orders",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 44, row: 12 },
      icon: "◉",
    },
    { type: "text", content: "1,429", position: { col: 48, row: 13 } },
    { type: "text", content: "↗ 5.7%", position: { col: 44, row: 14 } },

    {
      type: "component",
      componentType: "card",
      position: { col: 62, row: 9 },
      width: 19,
      height: 8,
      label: "Avg Order",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 64, row: 12 },
      icon: "★",
    },
    { type: "text", content: "$67.20", position: { col: 68, row: 13 } },
    { type: "text", content: "↓ 2.1%", position: { col: 64, row: 14 } },

    // ── Chart Area ──
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 18 },
      width: 57,
      height: 16,
      label: "Revenue Over Time",
    },
    { type: "text", content: "40k ┤", position: { col: 5, row: 22 } },
    {
      type: "text",
      content: "30k ┤          ╭───╮",
      position: { col: 5, row: 23 },
    },
    {
      type: "text",
      content: "20k ┤    ╭───╮╭╯   ╰╮   ╭───",
      position: { col: 5, row: 24 },
    },
    {
      type: "text",
      content: "10k ┤╭───╯   ╰╯     ╰───╯",
      position: { col: 5, row: 25 },
    },
    {
      type: "text",
      content: " 0  └───────────────────────",
      position: { col: 5, row: 26 },
    },
    {
      type: "text",
      content: "    Jan  Feb  Mar  Apr  May  Jun",
      position: { col: 5, row: 28 },
    },

    // ── Sidebar ──
    {
      type: "component",
      componentType: "card",
      position: { col: 60, row: 18 },
      width: 22,
      height: 16,
      label: "Top Channels",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 62, row: 21 },
      items: ["Direct   42%", "Organic  28%", "Social   18%", "Referral 12%"],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 62, row: 26 },
      width: 18,
    },
    { type: "text", content: "Total: 84,230", position: { col: 63, row: 28 } },

    // ── Data Table ──
    {
      type: "component",
      componentType: "table",
      position: { col: 2, row: 35 },
      width: 80,
      height: 15,
      columns: ["Customer", "Plan", "MRR", "Status", "Last Active"],
      filterable: true,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 2. E-commerce Product Page
// ═══════════════════════════════════════════════════════════════
const ecommerce: Layout = {
  name: "E-commerce Product Page",
  description:
    "Product page with hero image, pricing, color radios, size selector, add-to-cart, and user review cards with ratings",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 56,
      label: "shop.example.com/products/air-max-pro",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["★ ShopCo", "New In", "Men", "Women", "Sale", "⌕"],
    },
    {
      type: "component",
      componentType: "breadcrumb",
      position: { col: 3, row: 7 },
      items: ["Home", "Shoes", "Running", "Air Max Pro"],
      separator: " > ",
    },
    // Product image
    {
      type: "component",
      componentType: "image",
      position: { col: 2, row: 9 },
      width: 38,
      height: 20,
      label: "Product Photo",
      icon: "◇",
    },
    // Product details
    {
      type: "text",
      content: "Air Max Ultra Pro 2026",
      position: { col: 42, row: 10 },
    },
    {
      type: "component",
      componentType: "rating",
      position: { col: 42, row: 12 },
      value: 4,
      maxValue: 5,
      label: "(128)",
    },
    { type: "text", content: "$189.99", position: { col: 42, row: 14 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 42, row: 16 },
      width: 38,
    },
    { type: "text", content: "Color", position: { col: 42, row: 18 } },
    {
      type: "component",
      componentType: "radio",
      position: { col: 42, row: 19 },
      label: "Midnight Blue",
      checked: true,
    },
    {
      type: "component",
      componentType: "radio",
      position: { col: 42, row: 22 },
      label: "Arctic White",
      checked: false,
    },
    { type: "text", content: "Size", position: { col: 42, row: 25 } },
    {
      type: "component",
      componentType: "select",
      position: { col: 42, row: 26 },
      width: 20,
      label: "US 10",
    },
    // Buttons
    {
      type: "component",
      componentType: "button",
      position: { col: 42, row: 30 },
      width: 38,
      label: "Add to Cart",
      icon: "⊕",
      borderStyle: "heavy",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 42, row: 33 },
      width: 38,
      label: "Buy Now",
    },

    // Reviews section
    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 37 },
      width: 80,
      label: "Customer Reviews",
    },
    // Review 1
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 39 },
      width: 39,
      height: 10,
      label: "Amazing quality!",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 4, row: 42 },
      label: "JD",
    },
    { type: "text", content: "Jane Doe", position: { col: 10, row: 43 } },
    {
      type: "component",
      componentType: "rating",
      position: { col: 4, row: 45 },
      value: 5,
      maxValue: 5,
    },
    {
      type: "text",
      content: "Best running shoes I've owned.",
      position: { col: 4, row: 46 },
    },
    // Review 2
    {
      type: "component",
      componentType: "card",
      position: { col: 42, row: 39 },
      width: 39,
      height: 10,
      label: "Solid daily runner",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 44, row: 42 },
      label: "MS",
    },
    { type: "text", content: "Mark Smith", position: { col: 50, row: 43 } },
    {
      type: "component",
      componentType: "rating",
      position: { col: 44, row: 45 },
      value: 4,
      maxValue: 5,
    },
    {
      type: "text",
      content: "Comfortable and good looking.",
      position: { col: 44, row: 46 },
    },

    // Shipping alert
    {
      type: "component",
      componentType: "alert",
      position: { col: 2, row: 50 },
      width: 80,
      height: 3,
      label: "Free shipping on orders over $100",
      alertType: "info",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 3. Email Client
// ═══════════════════════════════════════════════════════════════
const emailClient: Layout = {
  name: "Email Client",
  description:
    "Three-pane email client with folder sidebar, message list, and reading pane with full message preview",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 44,
      label: "mail.example.com/inbox",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["✉ Mail", "Inbox", "Sent", "Drafts", "⌕"],
    },

    // Left sidebar — folders
    {
      type: "component",
      componentType: "card",
      position: { col: 1, row: 6 },
      width: 20,
      height: 36,
      label: "Folders",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 9 },
      items: ["Inbox (12)", "Starred", "Sent", "Drafts (3)", "Trash", "Spam"],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 16 },
      width: 16,
      label: "Labels",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 18 },
      items: ["Work", "Personal", "Finance", "Travel"],
      listStyle: "dash",
    },

    // Middle — message list
    {
      type: "component",
      componentType: "card",
      position: { col: 21, row: 6 },
      width: 28,
      height: 36,
      label: "Messages",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 23, row: 9 },
      width: 24,
      label: "Search mail...",
      icon: "⌕",
    },
    // Message rows
    { type: "text", content: "● Alice Lee", position: { col: 23, row: 13 } },
    {
      type: "text",
      content: "  Sprint review notes",
      position: { col: 23, row: 14 },
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 23, row: 15 },
      width: 24,
    },
    { type: "text", content: "● Bob Kim", position: { col: 23, row: 17 } },
    {
      type: "text",
      content: "  Deploy v2.4 to prod",
      position: { col: 23, row: 18 },
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 23, row: 19 },
      width: 24,
    },
    { type: "text", content: "  Carol Sun", position: { col: 23, row: 21 } },
    {
      type: "text",
      content: "  Quarterly report",
      position: { col: 23, row: 22 },
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 23, row: 23 },
      width: 24,
    },
    { type: "text", content: "  Dave Park", position: { col: 23, row: 25 } },
    {
      type: "text",
      content: "  API key rotation",
      position: { col: 23, row: 26 },
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 23, row: 27 },
      width: 24,
    },
    { type: "text", content: "  Eve Zhang", position: { col: 23, row: 29 } },
    {
      type: "text",
      content: "  Design review invite",
      position: { col: 23, row: 30 },
    },

    // Right — message detail
    {
      type: "component",
      componentType: "card",
      position: { col: 49, row: 6 },
      width: 34,
      height: 36,
      label: "Sprint review notes",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 51, row: 9 },
      label: "AL",
    },
    { type: "text", content: "Alice Lee", position: { col: 57, row: 10 } },
    { type: "text", content: "Today 10:23 AM", position: { col: 67, row: 10 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 51, row: 12 },
      width: 30,
    },
    { type: "text", content: "Hi team,", position: { col: 51, row: 14 } },
    {
      type: "text",
      content: "Here are the notes from",
      position: { col: 51, row: 16 },
    },
    {
      type: "text",
      content: "today's sprint review:",
      position: { col: 51, row: 17 },
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 51, row: 19 },
      items: [
        "Auth system: done",
        "Search: 80% complete",
        "Dark mode: blocked",
        "API docs: in review",
      ],
      listStyle: "dash",
    },
    { type: "text", content: "Best,", position: { col: 51, row: 25 } },
    { type: "text", content: "Alice", position: { col: 51, row: 26 } },
    // Reply buttons
    {
      type: "component",
      componentType: "button",
      position: { col: 51, row: 38 },
      width: 14,
      label: "Reply",
      icon: "←",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 66, row: 38 },
      width: 14,
      label: "Forward",
      icon: "→",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 4. Social Media Feed
// ═══════════════════════════════════════════════════════════════
const socialFeed: Layout = {
  name: "Social Media Feed",
  description:
    "Social feed with post cards featuring avatars, reactions, a trending sidebar, and suggested follows",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 52,
      label: "social.app/feed",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["⌂ Social", "Feed", "Explore", "Messages", "⍥"],
    },

    // ── Post 1 ──
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 7 },
      width: 54,
      height: 14,
      label: "Alice Lee",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 4, row: 10 },
      label: "AL",
    },
    { type: "text", content: "@alice · 2h", position: { col: 10, row: 11 } },
    {
      type: "text",
      content: "Just shipped the new dashboard!",
      position: { col: 4, row: 13 },
    },
    {
      type: "text",
      content: "So excited about this release.",
      position: { col: 4, row: 14 },
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 4, row: 16 },
      width: 50,
    },
    {
      type: "text",
      content: "♡ 42   ¶ 12   ⟳ 8",
      position: { col: 4, row: 18 },
    },

    // ── Post 2 ──
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 22 },
      width: 54,
      height: 16,
      label: "Bob Kim",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 4, row: 25 },
      label: "BK",
    },
    { type: "text", content: "@bobk · 5h", position: { col: 10, row: 26 } },
    {
      type: "text",
      content: "Check out this wireframe tool I found.",
      position: { col: 4, row: 28 },
    },
    {
      type: "text",
      content: "ASCII art for UI design — brilliant.",
      position: { col: 4, row: 29 },
    },
    {
      type: "component",
      componentType: "image",
      position: { col: 4, row: 31 },
      width: 30,
      height: 5,
      label: "wireframe.png",
    },
    {
      type: "text",
      content: "♡ 128   ¶ 34   ⟳ 56",
      position: { col: 4, row: 35 },
    },

    // ── Post 3 (compact) ──
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 39 },
      width: 54,
      height: 10,
      label: "Carol Sun",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 4, row: 42 },
      label: "CS",
    },
    { type: "text", content: "@carol · 8h", position: { col: 10, row: 43 } },
    {
      type: "text",
      content: "Anyone using the new TypeScript 6.0?",
      position: { col: 4, row: 45 },
    },
    {
      type: "text",
      content: "♡ 89   ¶ 45   ⟳ 12",
      position: { col: 4, row: 46 },
    },

    // ── Sidebar ──
    {
      type: "component",
      componentType: "card",
      position: { col: 57, row: 7 },
      width: 25,
      height: 14,
      label: "Trending",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 59, row: 10 },
      items: [
        "#typescript",
        "#wireframes",
        "#opensource",
        "#devtools",
        "#nextjs",
      ],
      listStyle: "number",
    },

    // Suggested follows
    {
      type: "component",
      componentType: "card",
      position: { col: 57, row: 22 },
      width: 25,
      height: 18,
      label: "Suggested",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 59, row: 25 },
      label: "DH",
    },
    { type: "text", content: "Dan Howells", position: { col: 65, row: 26 } },
    {
      type: "component",
      componentType: "button",
      position: { col: 59, row: 28 },
      width: 12,
      label: "Follow",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 59, row: 32 },
      label: "EZ",
    },
    { type: "text", content: "Eve Zhang", position: { col: 65, row: 33 } },
    {
      type: "component",
      componentType: "button",
      position: { col: 59, row: 35 },
      width: 12,
      label: "Follow",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 5. Kanban Board
// ═══════════════════════════════════════════════════════════════
const kanban: Layout = {
  name: "Kanban Project Board",
  description:
    "Project board with sprint stepper, three columns of task cards with progress bars, and status labels",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 44,
      label: "projects.dev/board/sprint-24",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["◉ Projects", "Board", "List", "Timeline", "⍥"],
    },
    {
      type: "text",
      content: "Sprint 24 — Feb 2026",
      position: { col: 3, row: 7 },
    },
    {
      type: "component",
      componentType: "stepper",
      position: { col: 3, row: 9 },
      width: 60,
      items: ["Planning", "In Progress", "Review", "Done"],
      activeStep: 1,
    },

    // Column headers
    { type: "text", content: "To Do (4)", position: { col: 3, row: 12 } },
    {
      type: "text",
      content: "In Progress (3)",
      position: { col: 29, row: 12 },
    },
    { type: "text", content: "Done (3)", position: { col: 56, row: 12 } },

    // ── To Do column ──
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 14 },
      width: 25,
      height: 6,
      label: "Auth system",
    },
    {
      type: "text",
      content: "Implement OAuth2 flow",
      position: { col: 4, row: 17 },
    },

    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 21 },
      width: 25,
      height: 6,
      label: "API docs",
    },
    {
      type: "text",
      content: "Write OpenAPI spec",
      position: { col: 4, row: 24 },
    },

    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 28 },
      width: 25,
      height: 6,
      label: "DB migration",
    },
    {
      type: "text",
      content: "Add user_roles table",
      position: { col: 4, row: 31 },
    },

    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 35 },
      width: 25,
      height: 6,
      label: "Rate limiter",
    },
    {
      type: "text",
      content: "Redis-based throttle",
      position: { col: 4, row: 38 },
    },

    // ── In Progress column ──
    {
      type: "component",
      componentType: "card",
      position: { col: 28, row: 14 },
      width: 26,
      height: 7,
      label: "Search index",
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 30, row: 17 },
      width: 22,
      progress: 65,
    },

    {
      type: "component",
      componentType: "card",
      position: { col: 28, row: 22 },
      width: 26,
      height: 7,
      label: "Dark mode",
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 30, row: 25 },
      width: 22,
      progress: 30,
    },

    {
      type: "component",
      componentType: "card",
      position: { col: 28, row: 30 },
      width: 26,
      height: 7,
      label: "Email templates",
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 30, row: 33 },
      width: 22,
      progress: 80,
    },

    // ── Done column ──
    {
      type: "component",
      componentType: "card",
      position: { col: 55, row: 14 },
      width: 26,
      height: 5,
      label: "Login page",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 55, row: 20 },
      width: 26,
      height: 5,
      label: "User profile",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 55, row: 26 },
      width: 26,
      height: 5,
      label: "Notifications",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 6. Admin Settings Panel
// ═══════════════════════════════════════════════════════════════
const settings: Layout = {
  name: "Admin Settings Panel",
  description:
    "Settings page with sidebar navigation, profile form, preference toggles, danger zone alert, and action buttons",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 78,
      height: 50,
      label: "app.acme.io/settings",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 76,
      height: 3,
      navItems: ["≡ Acme", "Dashboard", "Settings", "⍥"],
    },

    // Sidebar
    {
      type: "component",
      componentType: "card",
      position: { col: 1, row: 6 },
      width: 20,
      height: 42,
      label: "Settings",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 9 },
      items: [
        "● Profile",
        "  Security",
        "  Billing",
        "  Notifications",
        "  Integrations",
        "  API Keys",
      ],
      listStyle: "dash",
    },

    // Content area
    {
      type: "text",
      content: "Profile Settings",
      position: { col: 23, row: 7 },
    },

    // Profile form card
    {
      type: "component",
      componentType: "card",
      position: { col: 22, row: 9 },
      width: 54,
      height: 15,
      label: "Personal Information",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 24, row: 12 },
      width: 24,
      label: "First Name",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 50, row: 12 },
      width: 24,
      label: "Last Name",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 24, row: 15 },
      width: 50,
      label: "Email Address",
      icon: "✉",
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 24, row: 18 },
      width: 24,
      label: "Timezone",
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 50, row: 18 },
      width: 24,
      label: "Language",
    },

    // Preferences card
    {
      type: "component",
      componentType: "card",
      position: { col: 22, row: 25 },
      width: 54,
      height: 14,
      label: "Preferences",
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 24, row: 28 },
      label: "Dark Mode",
      checked: true,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 24, row: 30 },
      label: "Email Notifications",
      checked: true,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 24, row: 32 },
      label: "Two-Factor Auth",
      checked: false,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 24, row: 34 },
      label: "Public Profile",
      checked: true,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 24, row: 36 },
      label: "Usage Analytics",
      checked: false,
    },

    // Danger zone
    {
      type: "component",
      componentType: "alert",
      position: { col: 22, row: 40 },
      width: 54,
      height: 3,
      label: "Danger: Account deletion is permanent",
      alertType: "error",
    },

    // Buttons
    {
      type: "component",
      componentType: "button",
      position: { col: 50, row: 44 },
      width: 12,
      label: "Cancel",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 63, row: 44 },
      width: 12,
      label: "Save",
      borderStyle: "heavy",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 7. Chat Application
// ═══════════════════════════════════════════════════════════════
const chat: Layout = {
  name: "Chat Application",
  description:
    "Messaging app with contact sidebar, search, avatar list, message bubbles, and message input",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 76,
      height: 40,
      label: "chat.example.com",
    },

    // Contacts sidebar
    {
      type: "component",
      componentType: "card",
      position: { col: 1, row: 3 },
      width: 24,
      height: 35,
      label: "Contacts",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 6 },
      width: 20,
      label: "Search...",
      icon: "⌕",
    },
    // Contacts
    {
      type: "component",
      componentType: "avatar",
      position: { col: 3, row: 10 },
      label: "AL",
    },
    { type: "text", content: "Alice Lee", position: { col: 9, row: 11 } },
    { type: "text", content: "Online", position: { col: 17, row: 11 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 13 },
      width: 20,
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 3, row: 15 },
      label: "BK",
    },
    { type: "text", content: "Bob Kim", position: { col: 9, row: 16 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 18 },
      width: 20,
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 3, row: 20 },
      label: "CS",
    },
    { type: "text", content: "Carol Sun", position: { col: 9, row: 21 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 23 },
      width: 20,
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 3, row: 25 },
      label: "DP",
    },
    { type: "text", content: "Dave Park", position: { col: 9, row: 26 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 28 },
      width: 20,
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 3, row: 30 },
      label: "EZ",
    },
    { type: "text", content: "Eve Zhang", position: { col: 9, row: 31 } },

    // Chat area
    {
      type: "component",
      componentType: "card",
      position: { col: 25, row: 3 },
      width: 50,
      height: 35,
      label: "Alice Lee",
    },
    // Messages
    {
      type: "text",
      content: "Hey! How is the project?",
      position: { col: 28, row: 7 },
    },
    {
      type: "text",
      content: "Great, just pushed the",
      position: { col: 44, row: 10 },
    },
    {
      type: "text",
      content: "latest changes to main.",
      position: { col: 44, row: 11 },
    },
    {
      type: "text",
      content: "Can you review my PR?",
      position: { col: 28, row: 14 },
    },
    {
      type: "text",
      content: "PR #247 — Auth refactor",
      position: { col: 28, row: 15 },
    },
    {
      type: "text",
      content: "Sure, looking at it now!",
      position: { col: 44, row: 18 },
    },
    {
      type: "text",
      content: "Left some comments on the",
      position: { col: 44, row: 21 },
    },
    {
      type: "text",
      content: "token refresh logic.",
      position: { col: 44, row: 22 },
    },
    {
      type: "text",
      content: "Thanks, will fix those.",
      position: { col: 28, row: 25 },
    },

    // Divider + input
    {
      type: "component",
      componentType: "divider",
      position: { col: 27, row: 33 },
      width: 46,
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 27, row: 35 },
      width: 40,
      label: "Type a message...",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 68, row: 35 },
      width: 6,
      label: "→",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 8. CMS Blog Editor
// ═══════════════════════════════════════════════════════════════
const cmsEditor: Layout = {
  name: "CMS Blog Editor",
  description:
    "Content management editor with metadata inputs, rich text area, featured image, publish controls, and status alerts",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 78,
      height: 48,
      label: "cms.blog.dev/posts/edit/new-article",
    },
    {
      type: "component",
      componentType: "breadcrumb",
      position: { col: 3, row: 4 },
      items: ["Posts", "Drafts", "Editing"],
      separator: " → ",
    },

    // Title
    {
      type: "component",
      componentType: "input",
      position: { col: 2, row: 6 },
      width: 74,
      label: "Post Title",
    },

    // Metadata row
    {
      type: "component",
      componentType: "select",
      position: { col: 2, row: 10 },
      width: 22,
      label: "Category",
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 26, row: 10 },
      width: 16,
      label: "Status",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 44, row: 10 },
      width: 32,
      label: "Slug",
    },

    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 14 },
      width: 74,
    },

    // Editor card
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 16 },
      width: 50,
      height: 22,
      label: "Content",
    },
    {
      type: "text",
      content: "Lorem ipsum dolor sit amet,",
      position: { col: 4, row: 19 },
    },
    {
      type: "text",
      content: "consectetur adipiscing elit.",
      position: { col: 4, row: 20 },
    },
    {
      type: "text",
      content: "Sed do eiusmod tempor incididunt",
      position: { col: 4, row: 21 },
    },
    {
      type: "text",
      content: "ut labore et dolore magna aliqua.",
      position: { col: 4, row: 22 },
    },
    { type: "text", content: "", position: { col: 4, row: 23 } },
    {
      type: "text",
      content: "Ut enim ad minim veniam, quis",
      position: { col: 4, row: 24 },
    },
    {
      type: "text",
      content: "nostrud exercitation ullamco.",
      position: { col: 4, row: 25 },
    },

    // Side panel
    {
      type: "component",
      componentType: "card",
      position: { col: 53, row: 16 },
      width: 23,
      height: 12,
      label: "Featured Image",
    },
    {
      type: "component",
      componentType: "image",
      position: { col: 55, row: 19 },
      width: 19,
      height: 6,
      label: "Upload",
      icon: "↑",
    },

    // Tags
    {
      type: "component",
      componentType: "card",
      position: { col: 53, row: 29 },
      width: 23,
      height: 9,
      label: "Tags",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 55, row: 32 },
      items: ["javascript", "tutorial", "beginner"],
      listStyle: "dash",
    },

    // Status alert
    {
      type: "component",
      componentType: "alert",
      position: { col: 2, row: 39 },
      width: 74,
      height: 3,
      label: "Draft saved at 2:34 PM",
      alertType: "success",
    },

    // Action buttons
    {
      type: "component",
      componentType: "button",
      position: { col: 2, row: 43 },
      width: 14,
      label: "Preview",
      icon: "◉",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 50, row: 43 },
      width: 12,
      label: "Save Draft",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 63, row: 43 },
      width: 13,
      label: "Publish",
      borderStyle: "heavy",
      icon: "▶",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 9. Multi-step Registration Wizard
// ═══════════════════════════════════════════════════════════════
const signupWizard: Layout = {
  name: "Multi-step Registration Wizard",
  description:
    "Account creation modal with stepper navigation, form inputs, agreement checkboxes, and progress indicator",
  objects: [
    // Background box (dimmed)
    {
      type: "box",
      position: { col: 0, row: 0 },
      width: 70,
      height: 42,
      fill: "solid",
      borderStyle: "single",
    },
    // Modal
    {
      type: "component",
      componentType: "modal",
      position: { col: 8, row: 3 },
      width: 54,
      height: 36,
      label: "Create Your Account",
    },

    // Stepper
    {
      type: "component",
      componentType: "stepper",
      position: { col: 12, row: 7 },
      width: 46,
      items: ["Account", "Profile", "Preferences", "Review"],
      activeStep: 1,
    },

    // Progress bar
    {
      type: "component",
      componentType: "progress",
      position: { col: 12, row: 9 },
      width: 46,
      progress: 50,
    },

    {
      type: "component",
      componentType: "divider",
      position: { col: 10, row: 12 },
      width: 50,
    },

    {
      type: "text",
      content: "Tell us about yourself",
      position: { col: 12, row: 14 },
    },

    // Form fields
    {
      type: "component",
      componentType: "input",
      position: { col: 12, row: 16 },
      width: 22,
      label: "First Name",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 36, row: 16 },
      width: 22,
      label: "Last Name",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 12, row: 20 },
      width: 46,
      label: "Email Address",
      icon: "✉",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 12, row: 24 },
      width: 46,
      label: "Password",
    },

    // Selects
    {
      type: "component",
      componentType: "select",
      position: { col: 12, row: 28 },
      width: 22,
      label: "Country",
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 36, row: 28 },
      width: 22,
      label: "Role",
    },

    // Checkboxes
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 12, row: 32 },
      label: "I agree to the Terms",
      checked: true,
    },
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 12, row: 35 },
      label: "Subscribe to newsletter",
      checked: false,
    },

    // Buttons
    {
      type: "component",
      componentType: "button",
      position: { col: 12, row: 38 },
      width: 14,
      label: "← Back",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 44, row: 38 },
      width: 14,
      label: "Next →",
      borderStyle: "heavy",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 10. Pricing Page
// ═══════════════════════════════════════════════════════════════
const pricingPage: Layout = {
  name: "Pricing Page",
  description:
    "SaaS pricing page with three-tier pricing cards, feature lists, billing toggle, and comparison table",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 52,
      label: "acme.io/pricing",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["★ Acme", "Product", "Pricing", "Docs", "Sign In"],
    },

    {
      type: "text",
      content: "Choose Your Plan",
      position: { col: 32, row: 8 },
    },
    {
      type: "text",
      content: "Start free, upgrade when you need to.",
      position: { col: 22, row: 10 },
    },

    // Toggle
    { type: "text", content: "Monthly", position: { col: 30, row: 12 } },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 39, row: 12 },
      label: "Annual (save 20%)",
      checked: true,
    },

    // ── Starter ──
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 14 },
      width: 26,
      height: 24,
      label: "Starter",
    },
    { type: "text", content: "$0", position: { col: 4, row: 17 } },
    { type: "text", content: "Free forever", position: { col: 8, row: 17 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 4, row: 19 },
      width: 22,
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 4, row: 21 },
      items: [
        "3 projects",
        "1 GB storage",
        "Community support",
        "Basic analytics",
        "1 team member",
      ],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 4, row: 33 },
      width: 22,
      label: "Get Started",
    },

    // ── Pro (featured) ──
    {
      type: "component",
      componentType: "card",
      position: { col: 29, row: 14 },
      width: 26,
      height: 24,
      label: "Pro — Most Popular",
      borderStyle: "heavy",
    },
    { type: "text", content: "$29", position: { col: 31, row: 17 } },
    { type: "text", content: "/month", position: { col: 35, row: 17 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 31, row: 19 },
      width: 22,
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 31, row: 21 },
      items: [
        "Unlimited projects",
        "50 GB storage",
        "Priority support",
        "Advanced analytics",
        "Custom domains",
        "API access",
      ],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 31, row: 33 },
      width: 22,
      label: "Upgrade to Pro",
      borderStyle: "heavy",
    },

    // ── Enterprise ──
    {
      type: "component",
      componentType: "card",
      position: { col: 56, row: 14 },
      width: 26,
      height: 24,
      label: "Enterprise",
    },
    { type: "text", content: "Custom", position: { col: 58, row: 17 } },
    { type: "text", content: "pricing", position: { col: 65, row: 17 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 58, row: 19 },
      width: 22,
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 58, row: 21 },
      items: [
        "Everything in Pro",
        "SSO / SAML",
        "Dedicated support",
        "SLA guarantee",
        "Audit logs",
        "Custom contracts",
      ],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 58, row: 33 },
      width: 22,
      label: "Contact Sales",
    },

    // Comparison table
    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 39 },
      width: 80,
      label: "Feature Comparison",
    },
    {
      type: "component",
      componentType: "table",
      position: { col: 2, row: 41 },
      width: 80,
      height: 9,
      columns: ["Feature", "Starter", "Pro", "Enterprise"],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Collect all layouts
// ═══════════════════════════════════════════════════════════════
const layouts: Layout[] = [
  dashboard,
  ecommerce,
  emailClient,
  socialFeed,
  kanban,
  settings,
  chat,
  cmsEditor,
  signupWizard,
  pricingPage,
];

// ═══════════════════════════════════════════════════════════════
// Generate and output
// ═══════════════════════════════════════════════════════════════
interface Result {
  name: string;
  description: string;
  ascii: string;
  url: string;
}

const results: Result[] = layouts.map((layout) => {
  const { objects, layer } = fillDefaults(layout.objects);
  const gridSize = computeRenderGridSize(objects);
  const grid = compose(objects, gridSize, [layer]);
  const ascii = gridToString(grid);
  const encoded = encodeDocument(objects, [layer]);
  const url = `${BASE_URL}/#${encoded}`;
  return { name: layout.name, description: layout.description, ascii, url };
});

// Print to console
for (const [i, r] of results.entries()) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${i + 1}. ${r.name}`);
  console.log(`${"═".repeat(60)}`);
  console.log(r.ascii);
  console.log(`\nURL: ${r.url}\n`);
}

// ═══════════════════════════════════════════════════════════════
// Generate HTML showcase
// ═══════════════════════════════════════════════════════════════
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Wiretext Showcase — 10 UI Layouts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'JetBrains Mono', monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #fff;
    }

    .subtitle {
      color: #666;
      margin-bottom: 40px;
      font-size: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .card {
      background: #111;
      border: 1px solid #222;
      border-radius: 8px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #222;
    }

    .card-header h2 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    .card-header a {
      color: #3b82f6;
      text-decoration: none;
      font-size: 13px;
      white-space: nowrap;
    }

    .card-header a:hover {
      color: #60a5fa;
      text-decoration: underline;
    }

    .card-body {
      padding: 12px 20px 16px;
    }

    .description {
      color: #888;
      font-size: 12px;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .preview-wrapper {
      overflow-x: auto;
      border: 1px solid #1a1a1a;
      border-radius: 4px;
      background: #050505;
    }

    .preview {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      line-height: 1.35;
      padding: 12px;
      color: #c8c8c8;
      white-space: pre;
      margin: 0;
    }

    .counter {
      display: inline-block;
      background: #222;
      color: #888;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 8px;
    }

    footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #222;
      text-align: center;
      color: #444;
      font-size: 12px;
    }

    footer a { color: #3b82f6; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Wiretext Showcase</h1>
  <p class="subtitle">10 ambitious UI layouts rendered as ASCII/Unicode wireframes. Click "Open in Editor" to customize.</p>

  <div class="grid">
${results
  .map(
    (r, i) => `    <div class="card">
      <div class="card-header">
        <h2><span class="counter">${i + 1}</span>${escapeHtml(r.name)}</h2>
        <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">Open in Editor →</a>
      </div>
      <div class="card-body">
        <p class="description">${escapeHtml(r.description)}</p>
        <div class="preview-wrapper">
          <pre class="preview">${escapeHtml(r.ascii)}</pre>
        </div>
      </div>
    </div>`
  )
  .join("\n")}
  </div>

  <footer>
    Built with <a href="https://wiretext.app" target="_blank">Wiretext</a> — ASCII wireframes for UI design
  </footer>
</body>
</html>`;

writeFileSync("scripts/showcase.html", html);
console.log("\n✓ Generated scripts/showcase.html");
