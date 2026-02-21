import type { MinimalObject } from "@wiretext/engine";

export interface ShowcaseLayout {
  description: string;
  name: string;
  objects: MinimalObject[];
  shortId?: string;
}

// ═══════════════════════════════════════════════════════════════
// 1. SaaS Analytics Dashboard
// ═══════════════════════════════════════════════════════════════
const dashboard: ShowcaseLayout = {
  name: "SaaS Analytics Dashboard",
  description:
    "Metric cards with body stats, revenue chart, channel sidebar, and a filterable data table",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 52,
      label: "app.acme.io/dashboard",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["≡ Acme", "Dashboard", "Analytics", "Reports", "⍥"],
    },
    {
      type: "text",
      content: "Dashboard Overview",
      position: { col: 3, row: 7 },
    },
    { type: "text", content: "Last 30 days", position: { col: 68, row: 7 } },
    // 4 Stat Cards using body field
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 9 },
      width: 19,
      height: 8,
      label: "Revenue",
      body: "$142,580\n↑ 12.5%",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 22, row: 9 },
      width: 19,
      height: 8,
      label: "Users",
      body: "28,493\n↑ 8.2%",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 42, row: 9 },
      width: 19,
      height: 8,
      label: "Orders",
      body: "1,429\n↗ 5.7%",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 62, row: 9 },
      width: 19,
      height: 8,
      label: "Avg Order",
      body: "$67.20\n↓ 2.1%",
    },
    // Chart Area
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
    // Sidebar
    {
      type: "component",
      componentType: "card",
      position: { col: 60, row: 18 },
      width: 22,
      height: 16,
      label: "Top Channels",
      body: "Direct   42%\nOrganic  28%\nSocial   18%\nReferral 12%",
    },
    // Data Table
    {
      type: "component",
      componentType: "table",
      position: { col: 2, row: 35 },
      width: 80,
      height: 15,
      columns: ["Customer", "Plan", "MRR", "Status", "Last Active"],
      rows: [
        ["Acme Corp", "Enterprise", "$12,450", "Active", "2h ago"],
        ["Globex Inc", "Pro", "$4,200", "Active", "5h ago"],
        ["Initech", "Pro", "$3,800", "Active", "1d ago"],
        ["Umbrella Co", "Starter", "$0", "Trial", "3d ago"],
        ["Wayne Ent", "Enterprise", "$18,900", "Active", "12m ago"],
        ["Stark Ind", "Pro", "$7,600", "Active", "1h ago"],
        ["CHOAM", "Enterprise", "$22,100", "Active", "30m ago"],
        ["Oscorp", "Pro", "$5,100", "Paused", "7d ago"],
      ],
      filterable: true,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 2. E-commerce Product Page
// ═══════════════════════════════════════════════════════════════
const ecommerce: ShowcaseLayout = {
  name: "E-commerce Product Page",
  description:
    "Product page with image, pricing card with body text, size selector, reviews with ratings",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 50,
      label: "shop.example.com/products/air-max-pro",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["≡ ShopCo", "New", "Men", "Women", "Sale", "⌕", "⍥"],
    },
    {
      type: "component",
      componentType: "breadcrumb",
      position: { col: 3, row: 7 },
      items: ["Home", "Shoes", "Running", "Air Max Pro"],
      separator: " / ",
    },
    // Product Image
    {
      type: "component",
      componentType: "image",
      position: { col: 2, row: 9 },
      width: 38,
      height: 22,
      label: "Product Photo",
    },
    // Product Details
    {
      type: "text",
      content: "Air Max Pro 2025",
      position: { col: 43, row: 9 },
    },
    {
      type: "component",
      componentType: "rating",
      position: { col: 43, row: 11 },
      value: 4,
      maxValue: 5,
      label: "(128 reviews)",
    },
    { type: "text", content: "$189.00", position: { col: 43, row: 13 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 43, row: 15 },
      width: 38,
    },
    { type: "text", content: "Color", position: { col: 43, row: 17 } },
    {
      type: "component",
      componentType: "radio",
      position: { col: 43, row: 18 },
      label: "Black",
      checked: true,
      width: 17,
    },
    {
      type: "component",
      componentType: "radio",
      position: { col: 61, row: 18 },
      label: "White",
      checked: false,
      width: 17,
    },
    { type: "text", content: "Size", position: { col: 43, row: 22 } },
    {
      type: "component",
      componentType: "select",
      position: { col: 43, row: 23 },
      label: "US 10",
      width: 38,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 43, row: 27 },
      label: "Add to Cart",
      width: 38,
      icon: "⊕",
    },
    // Reviews Section
    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 32 },
      width: 80,
      label: "Customer Reviews",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 34 },
      width: 38,
      height: 10,
      label: "Alex M.",
      body: "Incredibly comfortable for\nlong runs. Best purchase\nthis year.",
    },
    {
      type: "component",
      componentType: "rating",
      position: { col: 4, row: 42 },
      value: 5,
      maxValue: 5,
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 42, row: 34 },
      width: 38,
      height: 10,
      label: "Sam K.",
      body: "Good shoes but runs a bit\nsmall. Order half size up.",
    },
    {
      type: "component",
      componentType: "rating",
      position: { col: 44, row: 42 },
      value: 4,
      maxValue: 5,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 3. Email Client
// ═══════════════════════════════════════════════════════════════
const emailClient: ShowcaseLayout = {
  name: "Email Client",
  description:
    "Three-pane email layout with folder list, message table, and reading pane with body text",
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
      navItems: ["✉ Mail", "Inbox (3)", "Sent", "Drafts", "⌕"],
    },
    // Sidebar folders
    {
      type: "box",
      position: { col: 1, row: 6 },
      width: 20,
      height: 37,
      borderStyle: "single",
      label: "Folders",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 9 },
      items: ["Inbox (3)", "Starred", "Sent", "Drafts (1)", "Archive", "Trash"],
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
      items: ["Work", "Personal", "Finance"],
      listStyle: "dash",
    },
    // Message List
    {
      type: "component",
      componentType: "table",
      position: { col: 21, row: 6 },
      width: 62,
      height: 15,
      columns: ["From", "Subject", "Date"],
      rows: [
        ["Jan Kowalski", "Q4 Report Ready", "10:30 AM"],
        ["GitHub", "PR #142 merged", "9:15 AM"],
        ["Stripe", "Payment received", "Yesterday"],
        ["Anna Lee", "Meeting notes", "Yesterday"],
        ["AWS", "Invoice #8821", "Mon"],
        ["Team", "Sprint planning", "Mon"],
        ["Jira", "PROJ-88 assigned", "Fri"],
      ],
    },
    // Reading pane
    {
      type: "component",
      componentType: "card",
      position: { col: 21, row: 21 },
      width: 62,
      height: 22,
      label: "Q4 Report Ready — Jan Kowalski",
      body: "Hi team,\n\nThe Q4 revenue report is ready\nfor review. Key highlights:\n\n- Revenue up 18% YoY\n- New customers: 1,240\n- Churn rate: 2.1%\n\nPlease review before Friday.\n\nBest,\nJan",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 4. Social Media Feed
// ═══════════════════════════════════════════════════════════════
const socialFeed: ShowcaseLayout = {
  name: "Social Media Feed",
  description:
    "Mobile-style social feed with post cards, avatars, image placeholders, and engagement stats",
  objects: [
    {
      type: "box",
      position: { col: 0, row: 0 },
      width: 42,
      height: 52,
      borderStyle: "rounded",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 1 },
      width: 40,
      height: 3,
      navItems: ["⌂", "⌕", "⊕", "♡", "⍥"],
    },
    // Post 1
    {
      type: "component",
      componentType: "avatar",
      position: { col: 2, row: 5 },
      label: "AL",
    },
    { type: "text", content: "alice_dev", position: { col: 8, row: 6 } },
    {
      type: "component",
      componentType: "image",
      position: { col: 2, row: 8 },
      width: 38,
      height: 10,
      label: "Sunset Photo",
    },
    {
      type: "text",
      content: "♡ 142  ¶ 23  ↗ 8",
      position: { col: 3, row: 19 },
    },
    {
      type: "text",
      content: "Golden hour never gets old",
      position: { col: 3, row: 20 },
    },
    // Post 2
    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 22 },
      width: 38,
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 2, row: 24 },
      label: "BT",
    },
    { type: "text", content: "bob_travel", position: { col: 8, row: 25 } },
    {
      type: "component",
      componentType: "image",
      position: { col: 2, row: 27 },
      width: 38,
      height: 10,
      label: "Mountain Trek",
    },
    {
      type: "text",
      content: "♡ 89  ¶ 11  ↗ 3",
      position: { col: 3, row: 38 },
    },
    {
      type: "text",
      content: "Summit reached at 4,200m!",
      position: { col: 3, row: 39 },
    },
    // Bottom nav
    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 48 },
      width: 38,
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 49 },
      width: 40,
      height: 3,
      navItems: ["⌂", "⌕", "▶", "⍥"],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 5. Kanban Board
// ═══════════════════════════════════════════════════════════════
const kanban: ShowcaseLayout = {
  name: "Kanban Board",
  description:
    "Project board with multiline task cards using body text and progress indicators",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 42,
      label: "tasks.example.com/board/sprint-12",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["≡ Tasks", "Board", "List", "Timeline", "⍥"],
    },
    {
      type: "text",
      content: "Sprint 12 — Feb 2026",
      position: { col: 3, row: 7 },
    },
    {
      type: "component",
      componentType: "stepper",
      position: { col: 50, row: 7 },
      items: ["Plan", "Build", "Test", "Ship"],
      activeStep: 1,
    },
    // Column: To Do
    {
      type: "box",
      position: { col: 2, row: 9 },
      width: 26,
      height: 32,
      label: "To Do\n3 tasks",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 4, row: 13 },
      width: 22,
      height: 8,
      label: "Auth Refactor",
      body: "Migrate to OAuth 2.1\nEst: 5 pts",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 4, row: 22 },
      width: 22,
      height: 8,
      label: "Dark Mode",
      body: "Add theme toggle\nEst: 3 pts",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 4, row: 31 },
      width: 22,
      height: 8,
      label: "API Docs",
      body: "OpenAPI spec + examples\nEst: 2 pts",
    },
    // Column: In Progress
    {
      type: "box",
      position: { col: 29, row: 9 },
      width: 26,
      height: 32,
      label: "In Progress\n2 tasks",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 31, row: 13 },
      width: 22,
      height: 8,
      label: "Search Feature",
      body: "Full-text w/ filters\nEst: 8 pts",
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 31, row: 22 },
      width: 22,
      progress: 60,
      label: "60%",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 31, row: 26 },
      width: 22,
      height: 8,
      label: "CI Pipeline",
      body: "GitHub Actions setup\nEst: 3 pts",
    },
    // Column: Done
    {
      type: "box",
      position: { col: 56, row: 9 },
      width: 26,
      height: 32,
      label: "Done\n4 tasks",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 58, row: 13 },
      width: 22,
      height: 7,
      label: "User Profiles",
      body: "Avatar + bio fields",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 58, row: 21 },
      width: 22,
      height: 7,
      label: "Email Notifs",
      body: "Transactional emails",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 58, row: 29 },
      width: 22,
      height: 7,
      label: "Rate Limiting",
      body: "Redis-based limiter",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 6. Settings Page
// ═══════════════════════════════════════════════════════════════
const settings: ShowcaseLayout = {
  name: "Settings Page",
  description:
    "Account settings with tabs, form inputs, toggles, and alert banners",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 72,
      height: 42,
      label: "app.example.com/settings",
    },
    {
      type: "component",
      componentType: "tabs",
      position: { col: 1, row: 3 },
      width: 70,
      height: 38,
      tabs: ["Profile", "Security", "Billing", "API"],
    },
    // Profile Form
    { type: "text", content: "Profile Settings", position: { col: 4, row: 6 } },
    {
      type: "component",
      componentType: "alert",
      position: { col: 3, row: 8 },
      width: 64,
      height: 3,
      label: "Profile updated successfully",
      alertType: "success",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 3, row: 12 },
      label: "JD",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 10, row: 12 },
      label: "Change Avatar",
      width: 20,
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 16 },
      width: 64,
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 18 },
      label: "Full Name",
      width: 30,
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 35, row: 18 },
      label: "Email",
      width: 32,
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 22 },
      label: "Company",
      width: 30,
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 35, row: 22 },
      label: "Timezone",
      width: 32,
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 26 },
      width: 64,
      label: "Notifications",
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 3, row: 28 },
      label: "Email notifications",
      checked: true,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 3, row: 30 },
      label: "Push notifications",
      checked: true,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 3, row: 32 },
      label: "Marketing emails",
      checked: false,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 3, row: 34 },
      label: "Weekly digest",
      checked: true,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 3, row: 37 },
      label: "Save Changes",
      width: 20,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 25, row: 37 },
      label: "Cancel",
      width: 14,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 7. Chat Application
// ═══════════════════════════════════════════════════════════════
const chat: ShowcaseLayout = {
  name: "Chat Application",
  description:
    "Real-time chat with sidebar contacts, message bubbles, and typing indicators",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 72,
      height: 38,
      label: "chat.example.com",
    },
    // Sidebar
    {
      type: "box",
      position: { col: 1, row: 3 },
      width: 22,
      height: 34,
      label: "Contacts",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 6 },
      label: "Search...",
      width: 18,
      icon: "⌕",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 10 },
      items: [
        "● Sarah Chen",
        "● Mike Ross",
        "○ Amy Park",
        "○ Tom Blake",
        "○ Nadia Ali",
      ],
      listStyle: "dash",
    },
    // Chat Area
    {
      type: "box",
      position: { col: 23, row: 3 },
      width: 48,
      height: 34,
    },
    { type: "text", content: "Sarah Chen ●", position: { col: 25, row: 4 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 24, row: 5 },
      width: 46,
    },
    // Messages
    {
      type: "box",
      position: { col: 25, row: 8 },
      width: 30,
      height: 4,
      borderStyle: "rounded",
      label: "Hey, are you free today?",
    },
    { type: "text", content: "10:30 AM", position: { col: 56, row: 9 } },
    {
      type: "box",
      position: { col: 35, row: 13 },
      width: 30,
      height: 4,
      borderStyle: "rounded",
      label: "Sure! Coffee at 2pm?",
    },
    { type: "text", content: "10:32 AM", position: { col: 25, row: 14 } },
    {
      type: "box",
      position: { col: 25, row: 18 },
      width: 30,
      height: 5,
      borderStyle: "rounded",
      label: "Perfect. Meet at the\nusual spot?",
    },
    { type: "text", content: "10:33 AM", position: { col: 56, row: 19 } },
    {
      type: "box",
      position: { col: 35, row: 24 },
      width: 30,
      height: 4,
      borderStyle: "rounded",
      label: "Yes, see you there!",
    },
    { type: "text", content: "10:34 AM", position: { col: 25, row: 25 } },
    {
      type: "text",
      content: "Sarah is typing...",
      position: { col: 25, row: 30 },
    },
    // Input
    {
      type: "component",
      componentType: "input",
      position: { col: 24, row: 33 },
      label: "Type a message...",
      width: 40,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 64, row: 33 },
      label: "→",
      width: 5,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 8. CMS Editor
// ═══════════════════════════════════════════════════════════════
const cmsEditor: ShowcaseLayout = {
  name: "CMS Blog Editor",
  description:
    "Rich text editor with toolbar, sidebar metadata, and live preview card",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 40,
      label: "cms.example.com/posts/new",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["≡ CMS", "Posts", "Pages", "Media", "Settings"],
    },
    // Editor
    {
      type: "component",
      componentType: "input",
      position: { col: 2, row: 7 },
      label: "Post Title",
      width: 54,
    },
    // Toolbar
    {
      type: "component",
      componentType: "navbar",
      position: { col: 2, row: 10 },
      width: 54,
      height: 3,
      navItems: ["B", "I", "U", "⊞", "♯", "¶"],
    },
    // Content area
    {
      type: "box",
      position: { col: 2, row: 13 },
      width: 54,
      height: 20,
      label:
        "Start writing your\narticle here...\n\nUse the toolbar above\nto format text.",
    },
    // Sidebar
    {
      type: "component",
      componentType: "card",
      position: { col: 58, row: 7 },
      width: 24,
      height: 14,
      label: "Metadata",
      body: "Status: Draft\nAuthor: Jane Doe\nCategory: Tech\nTags: react, web",
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 60, row: 19 },
      label: "Visibility",
      width: 20,
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 58, row: 23 },
      width: 24,
      height: 10,
      label: "SEO Preview",
      body: "Post Title\nexample.com/blog/...\nMeta description\nappears here...",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 2, row: 34 },
      label: "Save Draft",
      width: 16,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 20, row: 34 },
      label: "Publish",
      width: 14,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 36, row: 34 },
      label: "Preview",
      width: 14,
      icon: "▶",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 9. Signup Wizard
// ═══════════════════════════════════════════════════════════════
const signupWizard: ShowcaseLayout = {
  name: "Signup Wizard",
  description:
    "Multi-step registration flow with stepper, form fields, and progress tracking",
  objects: [
    {
      type: "box",
      position: { col: 0, row: 0 },
      width: 52,
      height: 36,
      borderStyle: "rounded",
    },
    {
      type: "box",
      position: { col: 5, row: 2 },
      width: 42,
      height: 5,
      borderStyle: "rounded",
      label: "Create Account\nJoin 50,000+ developers",
    },
    {
      type: "component",
      componentType: "stepper",
      position: { col: 5, row: 8 },
      items: ["Account", "Profile", "Plan", "Confirm"],
      activeStep: 1,
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 10 },
      width: 46,
    },
    { type: "text", content: "Profile Details", position: { col: 5, row: 12 } },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 14 },
      label: "Full Name",
      width: 22,
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 27, row: 14 },
      label: "Username",
      width: 22,
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 18 },
      label: "Company (optional)",
      width: 46,
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 3, row: 22 },
      label: "Role",
      width: 22,
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 27, row: 22 },
      label: "Team Size",
      width: 22,
    },
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 3, row: 26 },
      label: "I agree to Terms of Service",
      checked: true,
      width: 39,
    },
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 3, row: 29 },
      label: "Send me product updates",
      checked: false,
      width: 35,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 3, row: 32 },
      label: "← Back",
      width: 14,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 33, row: 32 },
      label: "Continue →",
      width: 16,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 10. Pricing Page
// ═══════════════════════════════════════════════════════════════
const pricingPage: ShowcaseLayout = {
  name: "Pricing Page",
  description:
    "Three-tier pricing with feature cards using body text and a comparison table",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 50,
      label: "example.com/pricing",
    },
    {
      type: "box",
      position: { col: 15, row: 3 },
      width: 54,
      height: 5,
      borderStyle: "rounded",
      label: "Simple Pricing\nNo hidden fees. Cancel anytime.",
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 28, row: 9 },
      label: "Annual (save 20%)",
      checked: true,
    },
    // Starter
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 12 },
      width: 26,
      height: 18,
      label: "Starter",
      body: "$9/mo\n\n3 Projects\n1 GB Storage\nCommunity Support\nBasic Analytics",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 4, row: 26 },
      label: "Get Started",
      width: 22,
    },
    // Pro (featured)
    {
      type: "component",
      componentType: "card",
      position: { col: 29, row: 11 },
      width: 26,
      height: 20,
      borderStyle: "double",
      label: "Pro — Most Popular",
      body: "$29/mo\n\nUnlimited Projects\n50 GB Storage\nPriority Support\nAdvanced Analytics\nAPI Access",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 31, row: 27 },
      label: "Start Free Trial",
      width: 22,
    },
    // Enterprise
    {
      type: "component",
      componentType: "card",
      position: { col: 56, row: 12 },
      width: 26,
      height: 18,
      label: "Enterprise",
      body: "Custom\n\nUnlimited Everything\n500 GB Storage\nDedicated Support\nCustom Integrations",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 58, row: 26 },
      label: "Contact Sales",
      width: 22,
    },
    // Comparison Table
    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 33 },
      width: 80,
      label: "Compare Plans",
    },
    {
      type: "component",
      componentType: "table",
      position: { col: 2, row: 35 },
      width: 80,
      height: 13,
      columns: ["Feature", "Starter", "Pro", "Enterprise"],
      rows: [
        ["Projects", "3", "Unlimited", "Unlimited"],
        ["Storage", "1 GB", "50 GB", "500 GB"],
        ["Support", "Community", "Priority", "Dedicated"],
        ["API Access", "—", "✓", "✓"],
        ["SSO", "—", "—", "✓"],
        ["Custom Domain", "—", "✓", "✓"],
        ["SLA", "—", "99.9%", "99.99%"],
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 11. Music Player
// ═══════════════════════════════════════════════════════════════
const musicPlayer: ShowcaseLayout = {
  name: "Music Player",
  description:
    "Desktop music app with playlist, album art, progress bar, and now-playing card",
  objects: [
    {
      type: "box",
      position: { col: 0, row: 0 },
      width: 60,
      height: 32,
      borderStyle: "rounded",
    },
    // Top bar
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 1 },
      width: 58,
      height: 3,
      navItems: ["♩ Melody", "Library", "Browse", "Radio", "⌕"],
    },
    // Sidebar playlist
    {
      type: "box",
      position: { col: 1, row: 4 },
      width: 20,
      height: 22,
      label: "Playlists",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 7 },
      items: ["Liked Songs", "Road Trip", "Focus", "Workout", "Chill"],
      listStyle: "bullet",
    },
    // Now Playing
    {
      type: "component",
      componentType: "image",
      position: { col: 22, row: 4 },
      width: 16,
      height: 8,
      label: "Album Art",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 39, row: 4 },
      width: 19,
      height: 8,
      label: "Now Playing",
      body: "Midnight Sun\nThe Echoes\nAlbum: Drift",
    },
    // Track list
    {
      type: "component",
      componentType: "table",
      position: { col: 22, row: 13 },
      width: 36,
      height: 13,
      columns: ["#", "Title", "Duration"],
      rows: [
        ["1", "Midnight Sun", "3:42"],
        ["2", "Ocean Drive", "4:18"],
        ["3", "Neon Lights", "3:55"],
        ["4", "Echoes", "5:01"],
        ["5", "Gravity", "3:28"],
        ["6", "Starfall", "4:33"],
      ],
    },
    // Player controls
    {
      type: "component",
      componentType: "divider",
      position: { col: 1, row: 27 },
      width: 58,
    },
    { type: "text", content: "◀  ▶  ■", position: { col: 24, row: 28 } },
    {
      type: "component",
      componentType: "progress",
      position: { col: 5, row: 29 },
      width: 50,
      progress: 35,
      label: "1:18 / 3:42",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 12. Admin User Management
// ═══════════════════════════════════════════════════════════════
const adminUsers: ShowcaseLayout = {
  name: "Admin User Management",
  description:
    "Admin panel with search, filters, user table, and detail modal with body text",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 42,
      label: "admin.example.com/users",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["≡ Admin", "Users", "Roles", "Logs", "Settings"],
    },
    {
      type: "text",
      content: "User Management",
      position: { col: 3, row: 7 },
    },
    // Search + Filters
    {
      type: "component",
      componentType: "input",
      position: { col: 2, row: 9 },
      label: "Search users...",
      width: 30,
      icon: "⌕",
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 34, row: 9 },
      label: "Role: All",
      width: 16,
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 52, row: 9 },
      label: "Status: All",
      width: 16,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 70, row: 9 },
      label: "⊕ Add User",
      width: 12,
    },
    // User Table
    {
      type: "component",
      componentType: "table",
      position: { col: 2, row: 13 },
      width: 80,
      height: 15,
      columns: ["Name", "Email", "Role", "Status", "Last Login"],
      rows: [
        ["Jane Doe", "jane@acme.com", "Admin", "Active", "5 min ago"],
        ["Bob Smith", "bob@acme.com", "Editor", "Active", "1 hour ago"],
        ["Alice Wang", "alice@acme.com", "Viewer", "Active", "3 hours ago"],
        ["Tom Brown", "tom@acme.com", "Editor", "Inactive", "30 days ago"],
        ["Sara Lee", "sara@acme.com", "Admin", "Active", "2 hours ago"],
        ["Mike Chen", "mike@acme.com", "Viewer", "Pending", "Never"],
      ],
      filterable: true,
    },
    // Detail Modal
    {
      type: "component",
      componentType: "modal",
      position: { col: 20, row: 18 },
      width: 44,
      height: 20,
      label: "User Details — Jane Doe",
      body: "Email: jane@acme.com\nRole: Admin\nJoined: Jan 15, 2025\nLast Login: 5 min ago\n\nPermissions:\n- Manage users ✓\n- Edit content ✓\n- Billing access ✓\n- API keys ✓",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 13. File Manager
// ═══════════════════════════════════════════════════════════════
const fileManager: ShowcaseLayout = {
  name: "File Manager",
  description:
    "Cloud file browser with folder tree, breadcrumbs, and file grid with skeleton loading",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 72,
      height: 36,
      label: "drive.example.com/files",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 70,
      height: 3,
      navItems: ["☁ Drive", "My Files", "Shared", "Recent", "Trash"],
    },
    {
      type: "component",
      componentType: "breadcrumb",
      position: { col: 3, row: 7 },
      items: ["My Files", "Projects", "Website Redesign"],
      separator: " / ",
    },
    // Folder tree
    {
      type: "box",
      position: { col: 1, row: 9 },
      width: 20,
      height: 26,
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 10 },
      items: [
        "▼ My Files",
        "  Documents",
        "  ▼ Projects",
        "    ● Redesign",
        "    Mobile App",
        "  Images",
        "  Videos",
      ],
      listStyle: "dash",
    },
    // File grid
    {
      type: "component",
      componentType: "input",
      position: { col: 22, row: 9 },
      label: "Search files...",
      width: 30,
      icon: "⌕",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 54, row: 9 },
      label: "⊕ Upload",
      width: 14,
    },
    // File cards
    {
      type: "component",
      componentType: "card",
      position: { col: 22, row: 13 },
      width: 22,
      height: 8,
      label: "mockups.fig",
      body: "12.4 MB\nModified: Today",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 46, row: 13 },
      width: 22,
      height: 8,
      label: "brand-guide.pdf",
      body: "3.2 MB\nModified: Yesterday",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 22, row: 22 },
      width: 22,
      height: 8,
      label: "index.html",
      body: "48 KB\nModified: 2 days ago",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 46, row: 22 },
      width: 22,
      height: 8,
      label: "styles.css",
      body: "12 KB\nModified: 2 days ago",
    },
    // Loading skeleton
    {
      type: "component",
      componentType: "skeleton",
      position: { col: 22, row: 31 },
      width: 22,
    },
    {
      type: "component",
      componentType: "skeleton",
      position: { col: 46, row: 31 },
      width: 22,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 14. API Documentation
// ═══════════════════════════════════════════════════════════════
const apiDocs: ShowcaseLayout = {
  name: "API Documentation",
  description:
    "REST API docs with endpoint list, method badges, request/response code blocks",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 44,
      label: "docs.example.com/api/v2",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["≡ API", "Reference", "Guides", "SDKs", "Changelog"],
    },
    // Sidebar
    {
      type: "box",
      position: { col: 1, row: 6 },
      width: 22,
      height: 37,
      label: "Endpoints",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 9 },
      items: [
        "Authentication",
        "● Users",
        "  GET /users",
        "  POST /users",
        "  GET /users/:id",
        "Orders",
        "Products",
        "Webhooks",
      ],
      listStyle: "dash",
    },
    // Main content
    {
      type: "text",
      content: "GET /api/v2/users",
      position: { col: 25, row: 7 },
    },
    {
      type: "component",
      componentType: "alert",
      position: { col: 25, row: 9 },
      width: 56,
      height: 3,
      label: "Requires Bearer token authentication",
      alertType: "info",
    },
    // Parameters
    {
      type: "component",
      componentType: "card",
      position: { col: 25, row: 13 },
      width: 56,
      height: 12,
      label: "Parameters",
      body: "page     integer  Page number (default: 1)\nlimit    integer  Items per page (max: 100)\nsort     string   Sort field (name, email)\norder    string   asc or desc\nstatus   string   active, inactive, all",
    },
    // Response
    {
      type: "component",
      componentType: "card",
      position: { col: 25, row: 26 },
      width: 56,
      height: 16,
      label: "Response 200",
      body: '{\n  "data": [\n    {\n      "id": "usr_abc123",\n      "name": "Jane Doe",\n      "email": "jane@acme.com",\n      "status": "active"\n    }\n  ],\n  "total": 142,\n  "page": 1\n}',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 15. Calendar / Scheduling
// ═══════════════════════════════════════════════════════════════
const calendar: ShowcaseLayout = {
  name: "Calendar & Scheduling",
  description:
    "Week view calendar with time slots, event cards, and a new event modal",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 84,
      height: 40,
      label: "cal.example.com/week",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 82,
      height: 3,
      navItems: ["≡ Calendar", "Day", "Week", "Month", "⊕ New Event"],
    },
    {
      type: "text",
      content: "Feb 16 — Feb 22, 2026",
      position: { col: 3, row: 7 },
    },
    // Day headers
    { type: "text", content: "Mon 16", position: { col: 9, row: 9 } },
    { type: "text", content: "Tue 17", position: { col: 20, row: 9 } },
    { type: "text", content: "Wed 18", position: { col: 31, row: 9 } },
    { type: "text", content: "Thu 19", position: { col: 42, row: 9 } },
    { type: "text", content: "Fri 20", position: { col: 53, row: 9 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 10 },
      width: 80,
    },
    // Time column
    { type: "text", content: " 9:00", position: { col: 2, row: 11 } },
    { type: "text", content: "10:00", position: { col: 2, row: 14 } },
    { type: "text", content: "11:00", position: { col: 2, row: 17 } },
    { type: "text", content: "12:00", position: { col: 2, row: 20 } },
    { type: "text", content: " 1:00", position: { col: 2, row: 23 } },
    { type: "text", content: " 2:00", position: { col: 2, row: 26 } },
    { type: "text", content: " 3:00", position: { col: 2, row: 29 } },
    // Events
    {
      type: "box",
      position: { col: 9, row: 11 },
      width: 10,
      height: 6,
      borderStyle: "rounded",
      label: "Team\nStandup",
    },
    {
      type: "box",
      position: { col: 31, row: 14 },
      width: 10,
      height: 6,
      borderStyle: "rounded",
      label: "Design\nReview",
    },
    {
      type: "box",
      position: { col: 42, row: 20 },
      width: 10,
      height: 3,
      borderStyle: "rounded",
      label: "Lunch",
    },
    {
      type: "box",
      position: { col: 53, row: 23 },
      width: 10,
      height: 6,
      borderStyle: "rounded",
      label: "Sprint\nRetro",
    },
    // New Event Modal
    {
      type: "component",
      componentType: "modal",
      position: { col: 22, row: 12 },
      width: 40,
      height: 22,
      label: "New Event",
      body: "What: Team Planning\nWhen: Wed, 2:00 PM\nDuration: 1 hour\nRoom: Conf B",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 24, row: 22 },
      label: "Add guests...",
      width: 36,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 24, row: 26 },
      label: "Save Event",
      width: 16,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 42, row: 26 },
      label: "Cancel",
      width: 14,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 16. Invoice Builder
// ═══════════════════════════════════════════════════════════════
const invoiceBuilder: ShowcaseLayout = {
  name: "Invoice Builder",
  description:
    "Professional invoice template with company info, line items table, and payment details",
  objects: [
    {
      type: "box",
      position: { col: 0, row: 0 },
      width: 72,
      height: 42,
      borderStyle: "double",
    },
    // Header
    {
      type: "box",
      position: { col: 2, row: 2 },
      width: 30,
      height: 5,
      borderStyle: "rounded",
      label: "ACME CORP\nSoftware Solutions",
    },
    {
      type: "text",
      content: "INVOICE #2026-0042",
      position: { col: 44, row: 2 },
    },
    {
      type: "text",
      content: "Date: Feb 18, 2026",
      position: { col: 44, row: 3 },
    },
    {
      type: "text",
      content: "Due:  Mar 18, 2026",
      position: { col: 44, row: 4 },
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 2, row: 8 },
      width: 68,
    },
    // Addresses
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 10 },
      width: 32,
      height: 8,
      label: "Bill To",
      body: "Globex Corporation\n123 Main Street\nSuite 400\nSan Francisco, CA 94102",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 38, row: 10 },
      width: 32,
      height: 8,
      label: "Ship To",
      body: "Globex Corp — HQ\n456 Market Street\nFloor 12\nSan Francisco, CA 94105",
    },
    // Line items
    {
      type: "component",
      componentType: "table",
      position: { col: 2, row: 19 },
      width: 68,
      height: 11,
      columns: ["Item", "Qty", "Rate", "Amount"],
      rows: [
        ["Platform License", "1", "$5,000.00", "$5,000.00"],
        ["API Integration", "40 hrs", "$150.00", "$6,000.00"],
        ["Support Plan", "1", "$1,200.00", "$1,200.00"],
        ["Data Migration", "1", "$2,500.00", "$2,500.00"],
      ],
    },
    // Totals
    {
      type: "component",
      componentType: "divider",
      position: { col: 42, row: 31 },
      width: 28,
    },
    {
      type: "text",
      content: "Subtotal:  $14,700.00",
      position: { col: 44, row: 32 },
    },
    {
      type: "text",
      content: "Tax (8%):   $1,176.00",
      position: { col: 44, row: 33 },
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 42, row: 34 },
      width: 28,
    },
    {
      type: "text",
      content: "TOTAL:     $15,876.00",
      position: { col: 44, row: 35 },
    },
    // Payment info
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 31 },
      width: 36,
      height: 9,
      label: "Payment Info",
      body: "Bank: First National\nAccount: ****4821\nRouting: ****7639\n\nPayment Terms: Net 30",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 17. Onboarding Flow
// ═══════════════════════════════════════════════════════════════
const onboarding: ShowcaseLayout = {
  name: "Onboarding Flow",
  description:
    "Welcome screen with feature cards, progress stepper, and getting-started checklist",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 72,
      height: 42,
      label: "app.example.com/welcome",
    },
    {
      type: "box",
      position: { col: 10, row: 3 },
      width: 52,
      height: 5,
      borderStyle: "rounded",
      label: "Welcome to Acme!\nLet's get you set up in 3 steps.",
    },
    {
      type: "component",
      componentType: "stepper",
      position: { col: 14, row: 9 },
      items: ["Connect", "Configure", "Launch"],
      activeStep: 0,
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 10, row: 11 },
      width: 52,
      progress: 33,
      label: "Step 1 of 3",
    },
    // Feature cards
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 14 },
      width: 22,
      height: 10,
      label: "⌕ Search",
      body: "Full-text search\nacross all your\ndata in seconds.",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 25, row: 14 },
      width: 22,
      height: 10,
      label: "⇅ Sync",
      body: "Real-time sync\nacross all your\ndevices.",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 48, row: 14 },
      width: 22,
      height: 10,
      label: "⚑ Reports",
      body: "Custom dashboards\nand automated\nreports.",
    },
    // Checklist
    {
      type: "component",
      componentType: "divider",
      position: { col: 10, row: 25 },
      width: 52,
      label: "Getting Started",
    },
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 10, row: 27 },
      label: "Connect your data source",
      checked: true,
      width: 38,
    },
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 10, row: 30 },
      label: "Invite your team members",
      checked: false,
      width: 38,
    },
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 10, row: 33 },
      label: "Create your first dashboard",
      checked: false,
      width: 38,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 10, row: 37 },
      label: "Connect Data Source →",
      width: 28,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 42, row: 37 },
      label: "Skip for now",
      width: 18,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 18. Dashboard with Flowchart
// ═══════════════════════════════════════════════════════════════
const flowchart: ShowcaseLayout = {
  name: "CI/CD Pipeline Diagram",
  description:
    "System architecture diagram with boxes, arrows, and annotations showing a deploy pipeline",
  objects: [
    {
      type: "box",
      position: { col: 0, row: 0 },
      width: 72,
      height: 30,
      borderStyle: "double",
      label: "CI/CD Pipeline\nAcme Platform v2",
    },
    // Stage 1: Source
    {
      type: "box",
      position: { col: 4, row: 5 },
      width: 14,
      height: 5,
      borderStyle: "rounded",
      label: "Git Push\n(main)",
    },
    {
      type: "arrow",
      position: { col: 18, row: 7 },
      endPosition: { col: 22, row: 7 },
    },
    // Stage 2: Build
    {
      type: "box",
      position: { col: 22, row: 5 },
      width: 14,
      height: 5,
      borderStyle: "rounded",
      label: "Build\n& Lint",
    },
    {
      type: "arrow",
      position: { col: 36, row: 7 },
      endPosition: { col: 40, row: 7 },
    },
    // Stage 3: Test
    {
      type: "box",
      position: { col: 40, row: 5 },
      width: 14,
      height: 5,
      borderStyle: "rounded",
      label: "Test\nSuite",
    },
    {
      type: "arrow",
      position: { col: 54, row: 7 },
      endPosition: { col: 58, row: 7 },
    },
    // Stage 4: Deploy
    {
      type: "box",
      position: { col: 58, row: 5 },
      width: 12,
      height: 5,
      borderStyle: "heavy",
      label: "Deploy",
    },
    // Parallel paths from Test
    {
      type: "arrow",
      position: { col: 47, row: 10 },
      endPosition: { col: 47, row: 14 },
    },
    {
      type: "box",
      position: { col: 38, row: 14 },
      width: 18,
      height: 5,
      borderStyle: "rounded",
      label: "Integration\nTests",
    },
    {
      type: "arrow",
      position: { col: 29, row: 7 },
      endPosition: { col: 29, row: 14 },
    },
    {
      type: "box",
      position: { col: 20, row: 14 },
      width: 18,
      height: 5,
      borderStyle: "rounded",
      label: "Security\nScan",
    },
    // Environments
    {
      type: "component",
      componentType: "divider",
      position: { col: 4, row: 21 },
      width: 64,
      label: "Environments",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 4, row: 23 },
      width: 20,
      height: 6,
      label: "Staging",
      body: "auto-deploy\n● Running",
    },
    {
      type: "arrow",
      position: { col: 24, row: 26 },
      endPosition: { col: 28, row: 26 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 28, row: 23 },
      width: 20,
      height: 6,
      label: "Preview",
      body: "per-PR deploy\n● Running",
    },
    {
      type: "arrow",
      position: { col: 48, row: 26 },
      endPosition: { col: 52, row: 26 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 52, row: 23 },
      width: 16,
      height: 6,
      label: "Production",
      body: "manual gate\n● Live",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 19. Mobile App Wireframe
// ═══════════════════════════════════════════════════════════════
const mobileApp: ShowcaseLayout = {
  name: "Mobile App Wireframes",
  description:
    "Side-by-side mobile screens showing login, home feed, and profile views",
  objects: [
    // Screen 1: Login
    {
      type: "box",
      position: { col: 0, row: 0 },
      width: 26,
      height: 36,
      borderStyle: "rounded",
    },
    {
      type: "text",
      content: "Login",
      position: { col: 10, row: 1 },
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 11, row: 4 },
      icon: "★",
    },
    {
      type: "box",
      position: { col: 3, row: 8 },
      width: 20,
      height: 5,
      borderStyle: "rounded",
      label: "Welcome Back\nSign in to continue",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 14 },
      label: "Email",
      width: 20,
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 18 },
      label: "Password",
      width: 20,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 3, row: 22 },
      label: "Sign In",
      width: 20,
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 26 },
      width: 20,
      label: "or",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 3, row: 28 },
      label: "Continue with SSO",
      width: 20,
    },
    {
      type: "text",
      content: "Forgot password?",
      position: { col: 5, row: 32 },
    },

    // Screen 2: Home
    {
      type: "box",
      position: { col: 28, row: 0 },
      width: 26,
      height: 36,
      borderStyle: "rounded",
    },
    {
      type: "text",
      content: "Home",
      position: { col: 39, row: 1 },
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 30, row: 3 },
      label: "Search...",
      width: 22,
      icon: "⌕",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 30, row: 7 },
      width: 22,
      height: 7,
      label: "Daily Summary",
      body: "3 tasks due\n2 messages",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 30, row: 15 },
      width: 22,
      height: 7,
      label: "Quick Actions",
      body: "New task\nScan document\nJoin meeting",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 30, row: 23 },
      width: 22,
      height: 7,
      label: "Recent Files",
      body: "report.pdf\nnotes.md\nslides.pptx",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 29, row: 33 },
      width: 24,
      height: 3,
      navItems: ["⌂", "⌕", "⍥"],
    },

    // Screen 3: Profile
    {
      type: "box",
      position: { col: 56, row: 0 },
      width: 26,
      height: 36,
      borderStyle: "rounded",
    },
    {
      type: "text",
      content: "Profile",
      position: { col: 66, row: 1 },
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 67, row: 4 },
      label: "JD",
    },
    { type: "text", content: "Jane Doe", position: { col: 64, row: 8 } },
    { type: "text", content: "jane@acme.com", position: { col: 62, row: 9 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 58, row: 11 },
      width: 22,
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 58, row: 13 },
      items: [
        "Edit Profile",
        "Notifications",
        "Privacy",
        "Help Center",
        "Sign Out",
      ],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 58, row: 19 },
      width: 22,
      label: "Stats",
    },
    { type: "text", content: "Projects: 12", position: { col: 59, row: 21 } },
    { type: "text", content: "Tasks:    48", position: { col: 59, row: 22 } },
    { type: "text", content: "Files:   234", position: { col: 59, row: 23 } },
    // Arrows connecting screens
    {
      type: "arrow",
      position: { col: 26, row: 18 },
      endPosition: { col: 28, row: 18 },
    },
    {
      type: "arrow",
      position: { col: 54, row: 18 },
      endPosition: { col: 56, row: 18 },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 20. Component Showcase
// ═══════════════════════════════════════════════════════════════
const componentShowcase: ShowcaseLayout = {
  name: "Component Library",
  description:
    "Every UI component in one view — buttons, inputs, toggles, tables, alerts, ratings, and more",
  objects: [
    {
      type: "box",
      position: { col: 0, row: 0 },
      width: 84,
      height: 52,
      borderStyle: "double",
      label: "Wiretext\nComponent Library",
    },
    // Row 1: Buttons
    { type: "text", content: "Buttons", position: { col: 3, row: 5 } },
    {
      type: "component",
      componentType: "button",
      position: { col: 3, row: 6 },
      label: "Primary",
      width: 14,
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 19, row: 6 },
      label: "With Icon",
      width: 16,
      icon: "★",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 37, row: 6 },
      label: "Left Aligned",
      width: 18,
      align: "left",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 57, row: 6 },
      label: "Icon Right →",
      width: 18,
      icon: "→",
      iconPosition: "right",
    },
    // Row 2: Inputs
    { type: "text", content: "Form Controls", position: { col: 3, row: 10 } },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 11 },
      label: "Text Input",
      width: 20,
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 25, row: 11 },
      label: "With Icon",
      width: 20,
      icon: "⌕",
    },
    {
      type: "component",
      componentType: "select",
      position: { col: 47, row: 11 },
      label: "Dropdown",
      width: 18,
    },
    // Row 3: Toggles & Checks
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 3, row: 15 },
      label: "Checked",
      checked: true,
      width: 18,
    },
    {
      type: "component",
      componentType: "checkbox",
      position: { col: 23, row: 15 },
      label: "Unchecked",
      checked: false,
      width: 20,
    },
    {
      type: "component",
      componentType: "radio",
      position: { col: 45, row: 15 },
      label: "Selected",
      checked: true,
      width: 18,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 3, row: 19 },
      label: "Toggle On",
      checked: true,
    },
    {
      type: "component",
      componentType: "toggle",
      position: { col: 30, row: 19 },
      label: "Toggle Off",
      checked: false,
    },
    // Row 4: Feedback
    { type: "text", content: "Feedback", position: { col: 3, row: 21 } },
    {
      type: "component",
      componentType: "alert",
      position: { col: 3, row: 22 },
      width: 38,
      height: 3,
      label: "Info message",
      alertType: "info",
    },
    {
      type: "component",
      componentType: "alert",
      position: { col: 43, row: 22 },
      width: 38,
      height: 3,
      label: "Success!",
      alertType: "success",
    },
    {
      type: "component",
      componentType: "alert",
      position: { col: 3, row: 25 },
      width: 38,
      height: 3,
      label: "Warning notice",
      alertType: "warning",
    },
    {
      type: "component",
      componentType: "alert",
      position: { col: 43, row: 25 },
      width: 38,
      height: 3,
      label: "Error occurred",
      alertType: "error",
    },
    // Row 5: Progress & Rating
    {
      type: "component",
      componentType: "progress",
      position: { col: 3, row: 29 },
      width: 30,
      progress: 72,
      label: "72%",
    },
    {
      type: "component",
      componentType: "rating",
      position: { col: 36, row: 30 },
      value: 4,
      maxValue: 5,
      label: "4/5",
    },
    {
      type: "component",
      componentType: "stepper",
      position: { col: 52, row: 30 },
      items: ["A", "B", "C"],
      activeStep: 1,
    },
    // Row 6: Data
    { type: "text", content: "Data Display", position: { col: 3, row: 33 } },
    {
      type: "component",
      componentType: "table",
      position: { col: 3, row: 34 },
      width: 40,
      height: 9,
      columns: ["Name", "Role", "Status"],
      rows: [
        ["Jane", "Admin", "Active"],
        ["Bob", "Editor", "Active"],
        ["Alice", "Viewer", "Pending"],
      ],
      filterable: true,
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 46, row: 34 },
      items: ["Bullet list item", "Second item", "Third item"],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 46, row: 38 },
      items: ["Numbered first", "Numbered second", "Numbered third"],
      listStyle: "number",
    },
    // Row 7: Misc
    { type: "text", content: "Other", position: { col: 3, row: 44 } },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 3, row: 45 },
      label: "JD",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 10, row: 45 },
      icon: "★",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 15, row: 45 },
      icon: "♡",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 20, row: 45 },
      icon: "⌕",
    },
    {
      type: "component",
      componentType: "breadcrumb",
      position: { col: 26, row: 46 },
      items: ["Home", "Products", "Detail"],
      separator: " > ",
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 48 },
      width: 78,
      label: "Divider with label",
    },
    {
      type: "component",
      componentType: "skeleton",
      position: { col: 3, row: 50 },
      width: 30,
    },
    {
      type: "component",
      componentType: "skeleton",
      position: { col: 36, row: 50 },
      width: 30,
    },
  ],
};

export const SHOWCASE_LAYOUTS: ShowcaseLayout[] = [
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
  musicPlayer,
  adminUsers,
  fileManager,
  apiDocs,
  calendar,
  invoiceBuilder,
  onboarding,
  flowchart,
  mobileApp,
  componentShowcase,
];
