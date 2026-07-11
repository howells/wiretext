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
  description:
    "Metric cards with body stats, revenue chart, channel sidebar, and a filterable data table",
  name: "SaaS Analytics Dashboard",
  objects: [
    {
      componentType: "browser",
      height: 52,
      label: "app.acme.io/dashboard",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["≡ Acme", "Dashboard", "Analytics", "Reports", "⍥"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 82,
    },
    {
      content: "Dashboard Overview",
      position: { col: 3, row: 7 },
      type: "text",
    },
    { content: "Last 30 days", position: { col: 68, row: 7 }, type: "text" },
    // 4 Stat Cards using body field
    {
      body: "$142,580\n↑ 12.5%",
      componentType: "card",
      height: 8,
      label: "Revenue",
      position: { col: 2, row: 9 },
      type: "component",
      width: 19,
    },
    {
      body: "28,493\n↑ 8.2%",
      componentType: "card",
      height: 8,
      label: "Users",
      position: { col: 22, row: 9 },
      type: "component",
      width: 19,
    },
    {
      body: "1,429\n↗ 5.7%",
      componentType: "card",
      height: 8,
      label: "Orders",
      position: { col: 42, row: 9 },
      type: "component",
      width: 19,
    },
    {
      body: "$67.20\n↓ 2.1%",
      componentType: "card",
      height: 8,
      label: "Avg Order",
      position: { col: 62, row: 9 },
      type: "component",
      width: 19,
    },
    // Chart Area
    {
      componentType: "card",
      height: 16,
      label: "Revenue Over Time",
      position: { col: 2, row: 18 },
      type: "component",
      width: 57,
    },
    { content: "40k ┤", position: { col: 5, row: 22 }, type: "text" },
    {
      content: "30k ┤          ╭───╮",
      position: { col: 5, row: 23 },
      type: "text",
    },
    {
      content: "20k ┤    ╭───╮╭╯   ╰╮   ╭───",
      position: { col: 5, row: 24 },
      type: "text",
    },
    {
      content: "10k ┤╭───╯   ╰╯     ╰───╯",
      position: { col: 5, row: 25 },
      type: "text",
    },
    {
      content: " 0  └───────────────────────",
      position: { col: 5, row: 26 },
      type: "text",
    },
    {
      content: "    Jan  Feb  Mar  Apr  May  Jun",
      position: { col: 5, row: 28 },
      type: "text",
    },
    // Sidebar
    {
      body: "Direct   42%\nOrganic  28%\nSocial   18%\nReferral 12%",
      componentType: "card",
      height: 16,
      label: "Top Channels",
      position: { col: 60, row: 18 },
      type: "component",
      width: 22,
    },
    // Data Table
    {
      columns: ["Customer", "Plan", "MRR", "Status", "Last Active"],
      componentType: "table",
      filterable: true,
      height: 15,
      position: { col: 2, row: 35 },
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
      type: "component",
      width: 80,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 2. E-commerce Product Page
// ═══════════════════════════════════════════════════════════════
const ecommerce: ShowcaseLayout = {
  description:
    "Product page with image, pricing card with body text, size selector, reviews with ratings",
  name: "E-commerce Product Page",
  objects: [
    {
      componentType: "browser",
      height: 50,
      label: "shop.example.com/products/air-max-pro",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["≡ ShopCo", "New", "Men", "Women", "Sale", "⌕", "⍥"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 82,
    },
    {
      componentType: "breadcrumb",
      items: ["Home", "Shoes", "Running", "Air Max Pro"],
      position: { col: 3, row: 7 },
      separator: " / ",
      type: "component",
    },
    // Product Image
    {
      componentType: "image",
      height: 22,
      label: "Product Photo",
      position: { col: 2, row: 9 },
      type: "component",
      width: 38,
    },
    // Product Details
    {
      content: "Air Max Pro 2025",
      position: { col: 43, row: 9 },
      type: "text",
    },
    {
      componentType: "rating",
      label: "(128 reviews)",
      maxValue: 5,
      position: { col: 43, row: 11 },
      type: "component",
      value: 4,
    },
    { content: "$189.00", position: { col: 43, row: 13 }, type: "text" },
    {
      componentType: "divider",
      position: { col: 43, row: 15 },
      type: "component",
      width: 38,
    },
    { content: "Color", position: { col: 43, row: 17 }, type: "text" },
    {
      checked: true,
      componentType: "radio",
      label: "Black",
      position: { col: 43, row: 18 },
      type: "component",
      width: 17,
    },
    {
      checked: false,
      componentType: "radio",
      label: "White",
      position: { col: 61, row: 18 },
      type: "component",
      width: 17,
    },
    { content: "Size", position: { col: 43, row: 22 }, type: "text" },
    {
      componentType: "select",
      label: "US 10",
      position: { col: 43, row: 23 },
      type: "component",
      width: 38,
    },
    {
      componentType: "button",
      icon: "⊕",
      label: "Add to Cart",
      position: { col: 43, row: 27 },
      type: "component",
      width: 38,
    },
    // Reviews Section
    {
      componentType: "divider",
      label: "Customer Reviews",
      position: { col: 2, row: 32 },
      type: "component",
      width: 80,
    },
    {
      body: "Incredibly comfortable for\nlong runs. Best purchase\nthis year.",
      componentType: "card",
      height: 10,
      label: "Alex M.",
      position: { col: 2, row: 34 },
      type: "component",
      width: 38,
    },
    {
      componentType: "rating",
      maxValue: 5,
      position: { col: 4, row: 42 },
      type: "component",
      value: 5,
    },
    {
      body: "Good shoes but runs a bit\nsmall. Order half size up.",
      componentType: "card",
      height: 10,
      label: "Sam K.",
      position: { col: 42, row: 34 },
      type: "component",
      width: 38,
    },
    {
      componentType: "rating",
      maxValue: 5,
      position: { col: 44, row: 42 },
      type: "component",
      value: 4,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 3. Email Client
// ═══════════════════════════════════════════════════════════════
const emailClient: ShowcaseLayout = {
  description:
    "Three-pane email layout with folder list, message table, and reading pane with body text",
  name: "Email Client",
  objects: [
    {
      componentType: "browser",
      height: 44,
      label: "mail.example.com/inbox",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["✉ Mail", "Inbox (3)", "Sent", "Drafts", "⌕"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 82,
    },
    // Sidebar folders
    {
      borderStyle: "single",
      height: 37,
      label: "Folders",
      position: { col: 1, row: 6 },
      type: "box",
      width: 20,
    },
    {
      componentType: "list",
      items: ["Inbox (3)", "Starred", "Sent", "Drafts (1)", "Archive", "Trash"],
      listStyle: "bullet",
      position: { col: 3, row: 9 },
      type: "component",
    },
    {
      componentType: "divider",
      label: "Labels",
      position: { col: 3, row: 16 },
      type: "component",
      width: 16,
    },
    {
      componentType: "list",
      items: ["Work", "Personal", "Finance"],
      listStyle: "dash",
      position: { col: 3, row: 18 },
      type: "component",
    },
    // Message List
    {
      columns: ["From", "Subject", "Date"],
      componentType: "table",
      height: 15,
      position: { col: 21, row: 6 },
      rows: [
        ["Jan Kowalski", "Q4 Report Ready", "10:30 AM"],
        ["GitHub", "PR #142 merged", "9:15 AM"],
        ["Stripe", "Payment received", "Yesterday"],
        ["Anna Lee", "Meeting notes", "Yesterday"],
        ["AWS", "Invoice #8821", "Mon"],
        ["Team", "Sprint planning", "Mon"],
        ["Jira", "PROJ-88 assigned", "Fri"],
      ],
      type: "component",
      width: 62,
    },
    // Reading pane
    {
      body: "Hi team,\n\nThe Q4 revenue report is ready\nfor review. Key highlights:\n\n- Revenue up 18% YoY\n- New customers: 1,240\n- Churn rate: 2.1%\n\nPlease review before Friday.\n\nBest,\nJan",
      componentType: "card",
      height: 22,
      label: "Q4 Report Ready — Jan Kowalski",
      position: { col: 21, row: 21 },
      type: "component",
      width: 62,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 4. Social Media Feed
// ═══════════════════════════════════════════════════════════════
const socialFeed: ShowcaseLayout = {
  description:
    "Mobile-style social feed with post cards, avatars, image placeholders, and engagement stats",
  name: "Social Media Feed",
  objects: [
    {
      borderStyle: "rounded",
      height: 52,
      position: { col: 0, row: 0 },
      type: "box",
      width: 42,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["⌂", "⌕", "⊕", "♡", "⍥"],
      position: { col: 1, row: 1 },
      type: "component",
      width: 40,
    },
    // Post 1
    {
      componentType: "avatar",
      label: "AL",
      position: { col: 2, row: 5 },
      type: "component",
    },
    { content: "alice_dev", position: { col: 8, row: 6 }, type: "text" },
    {
      componentType: "image",
      height: 10,
      label: "Sunset Photo",
      position: { col: 2, row: 8 },
      type: "component",
      width: 38,
    },
    {
      content: "♡ 142  ¶ 23  ↗ 8",
      position: { col: 3, row: 19 },
      type: "text",
    },
    {
      content: "Golden hour never gets old",
      position: { col: 3, row: 20 },
      type: "text",
    },
    // Post 2
    {
      componentType: "divider",
      position: { col: 2, row: 22 },
      type: "component",
      width: 38,
    },
    {
      componentType: "avatar",
      label: "BT",
      position: { col: 2, row: 24 },
      type: "component",
    },
    { content: "bob_travel", position: { col: 8, row: 25 }, type: "text" },
    {
      componentType: "image",
      height: 10,
      label: "Mountain Trek",
      position: { col: 2, row: 27 },
      type: "component",
      width: 38,
    },
    {
      content: "♡ 89  ¶ 11  ↗ 3",
      position: { col: 3, row: 38 },
      type: "text",
    },
    {
      content: "Summit reached at 4,200m!",
      position: { col: 3, row: 39 },
      type: "text",
    },
    // Bottom nav
    {
      componentType: "divider",
      position: { col: 2, row: 48 },
      type: "component",
      width: 38,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["⌂", "⌕", "▶", "⍥"],
      position: { col: 1, row: 49 },
      type: "component",
      width: 40,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 5. Kanban Board
// ═══════════════════════════════════════════════════════════════
const kanban: ShowcaseLayout = {
  description:
    "Project board with multiline task cards using body text and progress indicators",
  name: "Kanban Board",
  objects: [
    {
      componentType: "browser",
      height: 42,
      label: "tasks.example.com/board/sprint-12",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["≡ Tasks", "Board", "List", "Timeline", "⍥"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 82,
    },
    {
      content: "Sprint 12 — Feb 2026",
      position: { col: 3, row: 7 },
      type: "text",
    },
    {
      activeStep: 1,
      componentType: "stepper",
      items: ["Plan", "Build", "Test", "Ship"],
      position: { col: 50, row: 7 },
      type: "component",
    },
    // Column: To Do
    {
      height: 32,
      label: "To Do\n3 tasks",
      position: { col: 2, row: 9 },
      type: "box",
      width: 26,
    },
    {
      body: "Migrate to OAuth 2.1\nEst: 5 pts",
      componentType: "card",
      height: 8,
      label: "Auth Refactor",
      position: { col: 4, row: 13 },
      type: "component",
      width: 22,
    },
    {
      body: "Add theme toggle\nEst: 3 pts",
      componentType: "card",
      height: 8,
      label: "Dark Mode",
      position: { col: 4, row: 22 },
      type: "component",
      width: 22,
    },
    {
      body: "OpenAPI spec + examples\nEst: 2 pts",
      componentType: "card",
      height: 8,
      label: "API Docs",
      position: { col: 4, row: 31 },
      type: "component",
      width: 22,
    },
    // Column: In Progress
    {
      height: 32,
      label: "In Progress\n2 tasks",
      position: { col: 29, row: 9 },
      type: "box",
      width: 26,
    },
    {
      body: "Full-text w/ filters\nEst: 8 pts",
      componentType: "card",
      height: 8,
      label: "Search Feature",
      position: { col: 31, row: 13 },
      type: "component",
      width: 22,
    },
    {
      componentType: "progress",
      label: "60%",
      position: { col: 31, row: 22 },
      progress: 60,
      type: "component",
      width: 22,
    },
    {
      body: "GitHub Actions setup\nEst: 3 pts",
      componentType: "card",
      height: 8,
      label: "CI Pipeline",
      position: { col: 31, row: 26 },
      type: "component",
      width: 22,
    },
    // Column: Done
    {
      height: 32,
      label: "Done\n4 tasks",
      position: { col: 56, row: 9 },
      type: "box",
      width: 26,
    },
    {
      body: "Avatar + bio fields",
      componentType: "card",
      height: 7,
      label: "User Profiles",
      position: { col: 58, row: 13 },
      type: "component",
      width: 22,
    },
    {
      body: "Transactional emails",
      componentType: "card",
      height: 7,
      label: "Email Notifs",
      position: { col: 58, row: 21 },
      type: "component",
      width: 22,
    },
    {
      body: "Redis-based limiter",
      componentType: "card",
      height: 7,
      label: "Rate Limiting",
      position: { col: 58, row: 29 },
      type: "component",
      width: 22,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 6. Settings Page
// ═══════════════════════════════════════════════════════════════
const settings: ShowcaseLayout = {
  description:
    "Account settings with tabs, form inputs, toggles, and alert banners",
  name: "Settings Page",
  objects: [
    {
      componentType: "browser",
      height: 42,
      label: "app.example.com/settings",
      position: { col: 0, row: 0 },
      type: "component",
      width: 72,
    },
    {
      componentType: "tabs",
      height: 38,
      position: { col: 1, row: 3 },
      tabs: ["Profile", "Security", "Billing", "API"],
      type: "component",
      width: 70,
    },
    // Profile Form
    { content: "Profile Settings", position: { col: 4, row: 6 }, type: "text" },
    {
      alertType: "success",
      componentType: "alert",
      height: 3,
      label: "Profile updated successfully",
      position: { col: 3, row: 8 },
      type: "component",
      width: 64,
    },
    {
      componentType: "avatar",
      label: "JD",
      position: { col: 3, row: 12 },
      type: "component",
    },
    {
      componentType: "button",
      label: "Change Avatar",
      position: { col: 10, row: 12 },
      type: "component",
      width: 20,
    },
    {
      componentType: "divider",
      position: { col: 3, row: 16 },
      type: "component",
      width: 64,
    },
    {
      componentType: "input",
      label: "Full Name",
      position: { col: 3, row: 18 },
      type: "component",
      width: 30,
    },
    {
      componentType: "input",
      label: "Email",
      position: { col: 35, row: 18 },
      type: "component",
      width: 32,
    },
    {
      componentType: "input",
      label: "Company",
      position: { col: 3, row: 22 },
      type: "component",
      width: 30,
    },
    {
      componentType: "select",
      label: "Timezone",
      position: { col: 35, row: 22 },
      type: "component",
      width: 32,
    },
    {
      componentType: "divider",
      label: "Notifications",
      position: { col: 3, row: 26 },
      type: "component",
      width: 64,
    },
    {
      checked: true,
      componentType: "toggle",
      label: "Email notifications",
      position: { col: 3, row: 28 },
      type: "component",
    },
    {
      checked: true,
      componentType: "toggle",
      label: "Push notifications",
      position: { col: 3, row: 30 },
      type: "component",
    },
    {
      checked: false,
      componentType: "toggle",
      label: "Marketing emails",
      position: { col: 3, row: 32 },
      type: "component",
    },
    {
      checked: true,
      componentType: "toggle",
      label: "Weekly digest",
      position: { col: 3, row: 34 },
      type: "component",
    },
    {
      componentType: "button",
      label: "Save Changes",
      position: { col: 3, row: 37 },
      type: "component",
      width: 20,
    },
    {
      componentType: "button",
      label: "Cancel",
      position: { col: 25, row: 37 },
      type: "component",
      width: 14,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 7. Chat Application
// ═══════════════════════════════════════════════════════════════
const chat: ShowcaseLayout = {
  description:
    "Real-time chat with sidebar contacts, message bubbles, and typing indicators",
  name: "Chat Application",
  objects: [
    {
      componentType: "browser",
      height: 38,
      label: "chat.example.com",
      position: { col: 0, row: 0 },
      type: "component",
      width: 72,
    },
    // Sidebar
    {
      height: 34,
      label: "Contacts",
      position: { col: 1, row: 3 },
      type: "box",
      width: 22,
    },
    {
      componentType: "input",
      icon: "⌕",
      label: "Search...",
      position: { col: 3, row: 6 },
      type: "component",
      width: 18,
    },
    {
      componentType: "list",
      items: [
        "● Sarah Chen",
        "● Mike Ross",
        "○ Amy Park",
        "○ Tom Blake",
        "○ Nadia Ali",
      ],
      listStyle: "dash",
      position: { col: 3, row: 10 },
      type: "component",
    },
    // Chat Area
    {
      height: 34,
      position: { col: 23, row: 3 },
      type: "box",
      width: 48,
    },
    { content: "Sarah Chen ●", position: { col: 25, row: 4 }, type: "text" },
    {
      componentType: "divider",
      position: { col: 24, row: 5 },
      type: "component",
      width: 46,
    },
    // Messages
    {
      borderStyle: "rounded",
      height: 4,
      label: "Hey, are you free today?",
      position: { col: 25, row: 8 },
      type: "box",
      width: 30,
    },
    { content: "10:30 AM", position: { col: 56, row: 9 }, type: "text" },
    {
      borderStyle: "rounded",
      height: 4,
      label: "Sure! Coffee at 2pm?",
      position: { col: 35, row: 13 },
      type: "box",
      width: 30,
    },
    { content: "10:32 AM", position: { col: 25, row: 14 }, type: "text" },
    {
      borderStyle: "rounded",
      height: 5,
      label: "Perfect. Meet at the\nusual spot?",
      position: { col: 25, row: 18 },
      type: "box",
      width: 30,
    },
    { content: "10:33 AM", position: { col: 56, row: 19 }, type: "text" },
    {
      borderStyle: "rounded",
      height: 4,
      label: "Yes, see you there!",
      position: { col: 35, row: 24 },
      type: "box",
      width: 30,
    },
    { content: "10:34 AM", position: { col: 25, row: 25 }, type: "text" },
    {
      content: "Sarah is typing...",
      position: { col: 25, row: 30 },
      type: "text",
    },
    // Input
    {
      componentType: "input",
      label: "Type a message...",
      position: { col: 24, row: 33 },
      type: "component",
      width: 40,
    },
    {
      componentType: "button",
      label: "→",
      position: { col: 64, row: 33 },
      type: "component",
      width: 5,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 8. CMS Editor
// ═══════════════════════════════════════════════════════════════
const cmsEditor: ShowcaseLayout = {
  description:
    "Rich text editor with toolbar, sidebar metadata, and live preview card",
  name: "CMS Blog Editor",
  objects: [
    {
      componentType: "browser",
      height: 40,
      label: "cms.example.com/posts/new",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["≡ CMS", "Posts", "Pages", "Media", "Settings"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 82,
    },
    // Editor
    {
      componentType: "input",
      label: "Post Title",
      position: { col: 2, row: 7 },
      type: "component",
      width: 54,
    },
    // Toolbar
    {
      componentType: "navbar",
      height: 3,
      navItems: ["B", "I", "U", "⊞", "♯", "¶"],
      position: { col: 2, row: 10 },
      type: "component",
      width: 54,
    },
    // Content area
    {
      height: 20,
      label:
        "Start writing your\narticle here...\n\nUse the toolbar above\nto format text.",
      position: { col: 2, row: 13 },
      type: "box",
      width: 54,
    },
    // Sidebar
    {
      body: "Status: Draft\nAuthor: Jane Doe\nCategory: Tech\nTags: react, web",
      componentType: "card",
      height: 14,
      label: "Metadata",
      position: { col: 58, row: 7 },
      type: "component",
      width: 24,
    },
    {
      componentType: "select",
      label: "Visibility",
      position: { col: 60, row: 19 },
      type: "component",
      width: 20,
    },
    {
      body: "Post Title\nexample.com/blog/...\nMeta description\nappears here...",
      componentType: "card",
      height: 10,
      label: "SEO Preview",
      position: { col: 58, row: 23 },
      type: "component",
      width: 24,
    },
    {
      componentType: "button",
      label: "Save Draft",
      position: { col: 2, row: 34 },
      type: "component",
      width: 16,
    },
    {
      componentType: "button",
      label: "Publish",
      position: { col: 20, row: 34 },
      type: "component",
      width: 14,
    },
    {
      componentType: "button",
      icon: "▶",
      label: "Preview",
      position: { col: 36, row: 34 },
      type: "component",
      width: 14,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 9. Signup Wizard
// ═══════════════════════════════════════════════════════════════
const signupWizard: ShowcaseLayout = {
  description:
    "Multi-step registration flow with stepper, form fields, and progress tracking",
  name: "Signup Wizard",
  objects: [
    {
      borderStyle: "rounded",
      height: 36,
      position: { col: 0, row: 0 },
      type: "box",
      width: 52,
    },
    {
      borderStyle: "rounded",
      height: 5,
      label: "Create Account\nJoin 50,000+ developers",
      position: { col: 5, row: 2 },
      type: "box",
      width: 42,
    },
    {
      activeStep: 1,
      componentType: "stepper",
      items: ["Account", "Profile", "Plan", "Confirm"],
      position: { col: 5, row: 8 },
      type: "component",
    },
    {
      componentType: "divider",
      position: { col: 3, row: 10 },
      type: "component",
      width: 46,
    },
    { content: "Profile Details", position: { col: 5, row: 12 }, type: "text" },
    {
      componentType: "input",
      label: "Full Name",
      position: { col: 3, row: 14 },
      type: "component",
      width: 22,
    },
    {
      componentType: "input",
      label: "Username",
      position: { col: 27, row: 14 },
      type: "component",
      width: 22,
    },
    {
      componentType: "input",
      label: "Company (optional)",
      position: { col: 3, row: 18 },
      type: "component",
      width: 46,
    },
    {
      componentType: "select",
      label: "Role",
      position: { col: 3, row: 22 },
      type: "component",
      width: 22,
    },
    {
      componentType: "select",
      label: "Team Size",
      position: { col: 27, row: 22 },
      type: "component",
      width: 22,
    },
    {
      checked: true,
      componentType: "checkbox",
      label: "I agree to Terms of Service",
      position: { col: 3, row: 26 },
      type: "component",
      width: 39,
    },
    {
      checked: false,
      componentType: "checkbox",
      label: "Send me product updates",
      position: { col: 3, row: 29 },
      type: "component",
      width: 35,
    },
    {
      componentType: "button",
      label: "← Back",
      position: { col: 3, row: 32 },
      type: "component",
      width: 14,
    },
    {
      componentType: "button",
      label: "Continue →",
      position: { col: 33, row: 32 },
      type: "component",
      width: 16,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 10. Pricing Page
// ═══════════════════════════════════════════════════════════════
const pricingPage: ShowcaseLayout = {
  description:
    "Three-tier pricing with feature cards using body text and a comparison table",
  name: "Pricing Page",
  objects: [
    {
      componentType: "browser",
      height: 50,
      label: "example.com/pricing",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      borderStyle: "rounded",
      height: 5,
      label: "Simple Pricing\nNo hidden fees. Cancel anytime.",
      position: { col: 15, row: 3 },
      type: "box",
      width: 54,
    },
    {
      checked: true,
      componentType: "toggle",
      label: "Annual (save 20%)",
      position: { col: 28, row: 9 },
      type: "component",
    },
    // Starter
    {
      body: "$9/mo\n\n3 Projects\n1 GB Storage\nCommunity Support\nBasic Analytics",
      componentType: "card",
      height: 18,
      label: "Starter",
      position: { col: 2, row: 12 },
      type: "component",
      width: 26,
    },
    {
      componentType: "button",
      label: "Get Started",
      position: { col: 4, row: 26 },
      type: "component",
      width: 22,
    },
    // Pro (featured)
    {
      body: "$29/mo\n\nUnlimited Projects\n50 GB Storage\nPriority Support\nAdvanced Analytics\nAPI Access",
      borderStyle: "double",
      componentType: "card",
      height: 20,
      label: "Pro — Most Popular",
      position: { col: 29, row: 11 },
      type: "component",
      width: 26,
    },
    {
      componentType: "button",
      label: "Start Free Trial",
      position: { col: 31, row: 27 },
      type: "component",
      width: 22,
    },
    // Enterprise
    {
      body: "Custom\n\nUnlimited Everything\n500 GB Storage\nDedicated Support\nCustom Integrations",
      componentType: "card",
      height: 18,
      label: "Enterprise",
      position: { col: 56, row: 12 },
      type: "component",
      width: 26,
    },
    {
      componentType: "button",
      label: "Contact Sales",
      position: { col: 58, row: 26 },
      type: "component",
      width: 22,
    },
    // Comparison Table
    {
      componentType: "divider",
      label: "Compare Plans",
      position: { col: 2, row: 33 },
      type: "component",
      width: 80,
    },
    {
      columns: ["Feature", "Starter", "Pro", "Enterprise"],
      componentType: "table",
      height: 13,
      position: { col: 2, row: 35 },
      rows: [
        ["Projects", "3", "Unlimited", "Unlimited"],
        ["Storage", "1 GB", "50 GB", "500 GB"],
        ["Support", "Community", "Priority", "Dedicated"],
        ["API Access", "—", "✓", "✓"],
        ["SSO", "—", "—", "✓"],
        ["Custom Domain", "—", "✓", "✓"],
        ["SLA", "—", "99.9%", "99.99%"],
      ],
      type: "component",
      width: 80,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 11. Music Player
// ═══════════════════════════════════════════════════════════════
const musicPlayer: ShowcaseLayout = {
  description:
    "Desktop music app with playlist, album art, progress bar, and now-playing card",
  name: "Music Player",
  objects: [
    {
      borderStyle: "rounded",
      height: 32,
      position: { col: 0, row: 0 },
      type: "box",
      width: 60,
    },
    // Top bar
    {
      componentType: "navbar",
      height: 3,
      navItems: ["♩ Melody", "Library", "Browse", "Radio", "⌕"],
      position: { col: 1, row: 1 },
      type: "component",
      width: 58,
    },
    // Sidebar playlist
    {
      height: 22,
      label: "Playlists",
      position: { col: 1, row: 4 },
      type: "box",
      width: 20,
    },
    {
      componentType: "list",
      items: ["Liked Songs", "Road Trip", "Focus", "Workout", "Chill"],
      listStyle: "bullet",
      position: { col: 3, row: 7 },
      type: "component",
    },
    // Now Playing
    {
      componentType: "image",
      height: 8,
      label: "Album Art",
      position: { col: 22, row: 4 },
      type: "component",
      width: 16,
    },
    {
      body: "Midnight Sun\nThe Echoes\nAlbum: Drift",
      componentType: "card",
      height: 8,
      label: "Now Playing",
      position: { col: 39, row: 4 },
      type: "component",
      width: 19,
    },
    // Track list
    {
      columns: ["#", "Title", "Duration"],
      componentType: "table",
      height: 13,
      position: { col: 22, row: 13 },
      rows: [
        ["1", "Midnight Sun", "3:42"],
        ["2", "Ocean Drive", "4:18"],
        ["3", "Neon Lights", "3:55"],
        ["4", "Echoes", "5:01"],
        ["5", "Gravity", "3:28"],
        ["6", "Starfall", "4:33"],
      ],
      type: "component",
      width: 36,
    },
    // Player controls
    {
      componentType: "divider",
      position: { col: 1, row: 27 },
      type: "component",
      width: 58,
    },
    { content: "◀  ▶  ■", position: { col: 24, row: 28 }, type: "text" },
    {
      componentType: "progress",
      label: "1:18 / 3:42",
      position: { col: 5, row: 29 },
      progress: 35,
      type: "component",
      width: 50,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 12. Admin User Management
// ═══════════════════════════════════════════════════════════════
const adminUsers: ShowcaseLayout = {
  description:
    "Admin panel with search, filters, user table, and detail modal with body text",
  name: "Admin User Management",
  objects: [
    {
      componentType: "browser",
      height: 42,
      label: "admin.example.com/users",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["≡ Admin", "Users", "Roles", "Logs", "Settings"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 82,
    },
    {
      content: "User Management",
      position: { col: 3, row: 7 },
      type: "text",
    },
    // Search + Filters
    {
      componentType: "input",
      icon: "⌕",
      label: "Search users...",
      position: { col: 2, row: 9 },
      type: "component",
      width: 30,
    },
    {
      componentType: "select",
      label: "Role: All",
      position: { col: 34, row: 9 },
      type: "component",
      width: 16,
    },
    {
      componentType: "select",
      label: "Status: All",
      position: { col: 52, row: 9 },
      type: "component",
      width: 16,
    },
    {
      componentType: "button",
      label: "⊕ Add User",
      position: { col: 70, row: 9 },
      type: "component",
      width: 12,
    },
    // User Table
    {
      columns: ["Name", "Email", "Role", "Status", "Last Login"],
      componentType: "table",
      filterable: true,
      height: 15,
      position: { col: 2, row: 13 },
      rows: [
        ["Jane Doe", "jane@acme.com", "Admin", "Active", "5 min ago"],
        ["Bob Smith", "bob@acme.com", "Editor", "Active", "1 hour ago"],
        ["Alice Wang", "alice@acme.com", "Viewer", "Active", "3 hours ago"],
        ["Tom Brown", "tom@acme.com", "Editor", "Inactive", "30 days ago"],
        ["Sara Lee", "sara@acme.com", "Admin", "Active", "2 hours ago"],
        ["Mike Chen", "mike@acme.com", "Viewer", "Pending", "Never"],
      ],
      type: "component",
      width: 80,
    },
    // Detail Modal
    {
      body: "Email: jane@acme.com\nRole: Admin\nJoined: Jan 15, 2025\nLast Login: 5 min ago\n\nPermissions:\n- Manage users ✓\n- Edit content ✓\n- Billing access ✓\n- API keys ✓",
      componentType: "modal",
      height: 20,
      label: "User Details — Jane Doe",
      position: { col: 20, row: 18 },
      type: "component",
      width: 44,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 13. File Manager
// ═══════════════════════════════════════════════════════════════
const fileManager: ShowcaseLayout = {
  description:
    "Cloud file browser with folder tree, breadcrumbs, and file grid with skeleton loading",
  name: "File Manager",
  objects: [
    {
      componentType: "browser",
      height: 36,
      label: "drive.example.com/files",
      position: { col: 0, row: 0 },
      type: "component",
      width: 72,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["☁ Drive", "My Files", "Shared", "Recent", "Trash"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 70,
    },
    {
      componentType: "breadcrumb",
      items: ["My Files", "Projects", "Website Redesign"],
      position: { col: 3, row: 7 },
      separator: " / ",
      type: "component",
    },
    // Folder tree
    {
      height: 26,
      position: { col: 1, row: 9 },
      type: "box",
      width: 20,
    },
    {
      componentType: "list",
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
      position: { col: 3, row: 10 },
      type: "component",
    },
    // File grid
    {
      componentType: "input",
      icon: "⌕",
      label: "Search files...",
      position: { col: 22, row: 9 },
      type: "component",
      width: 30,
    },
    {
      componentType: "button",
      label: "⊕ Upload",
      position: { col: 54, row: 9 },
      type: "component",
      width: 14,
    },
    // File cards
    {
      body: "12.4 MB\nModified: Today",
      componentType: "card",
      height: 8,
      label: "mockups.fig",
      position: { col: 22, row: 13 },
      type: "component",
      width: 22,
    },
    {
      body: "3.2 MB\nModified: Yesterday",
      componentType: "card",
      height: 8,
      label: "brand-guide.pdf",
      position: { col: 46, row: 13 },
      type: "component",
      width: 22,
    },
    {
      body: "48 KB\nModified: 2 days ago",
      componentType: "card",
      height: 8,
      label: "index.html",
      position: { col: 22, row: 22 },
      type: "component",
      width: 22,
    },
    {
      body: "12 KB\nModified: 2 days ago",
      componentType: "card",
      height: 8,
      label: "styles.css",
      position: { col: 46, row: 22 },
      type: "component",
      width: 22,
    },
    // Loading skeleton
    {
      componentType: "skeleton",
      position: { col: 22, row: 31 },
      type: "component",
      width: 22,
    },
    {
      componentType: "skeleton",
      position: { col: 46, row: 31 },
      type: "component",
      width: 22,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 14. API Documentation
// ═══════════════════════════════════════════════════════════════
const apiDocs: ShowcaseLayout = {
  description:
    "REST API docs with endpoint list, method badges, request/response code blocks",
  name: "API Documentation",
  objects: [
    {
      componentType: "browser",
      height: 44,
      label: "docs.example.com/api/v2",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["≡ API", "Reference", "Guides", "SDKs", "Changelog"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 82,
    },
    // Sidebar
    {
      height: 37,
      label: "Endpoints",
      position: { col: 1, row: 6 },
      type: "box",
      width: 22,
    },
    {
      componentType: "list",
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
      position: { col: 3, row: 9 },
      type: "component",
    },
    // Main content
    {
      content: "GET /api/v2/users",
      position: { col: 25, row: 7 },
      type: "text",
    },
    {
      alertType: "info",
      componentType: "alert",
      height: 3,
      label: "Requires Bearer token authentication",
      position: { col: 25, row: 9 },
      type: "component",
      width: 56,
    },
    // Parameters
    {
      body: "page     integer  Page number (default: 1)\nlimit    integer  Items per page (max: 100)\nsort     string   Sort field (name, email)\norder    string   asc or desc\nstatus   string   active, inactive, all",
      componentType: "card",
      height: 12,
      label: "Parameters",
      position: { col: 25, row: 13 },
      type: "component",
      width: 56,
    },
    // Response
    {
      body: '{\n  "data": [\n    {\n      "id": "usr_abc123",\n      "name": "Jane Doe",\n      "email": "jane@acme.com",\n      "status": "active"\n    }\n  ],\n  "total": 142,\n  "page": 1\n}',
      componentType: "card",
      height: 16,
      label: "Response 200",
      position: { col: 25, row: 26 },
      type: "component",
      width: 56,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 15. Calendar / Scheduling
// ═══════════════════════════════════════════════════════════════
const calendar: ShowcaseLayout = {
  description:
    "Week view calendar with time slots, event cards, and a new event modal",
  name: "Calendar & Scheduling",
  objects: [
    {
      componentType: "browser",
      height: 40,
      label: "cal.example.com/week",
      position: { col: 0, row: 0 },
      type: "component",
      width: 84,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["≡ Calendar", "Day", "Week", "Month", "⊕ New Event"],
      position: { col: 1, row: 3 },
      type: "component",
      width: 82,
    },
    {
      content: "Feb 16 — Feb 22, 2026",
      position: { col: 3, row: 7 },
      type: "text",
    },
    // Day headers
    { content: "Mon 16", position: { col: 9, row: 9 }, type: "text" },
    { content: "Tue 17", position: { col: 20, row: 9 }, type: "text" },
    { content: "Wed 18", position: { col: 31, row: 9 }, type: "text" },
    { content: "Thu 19", position: { col: 42, row: 9 }, type: "text" },
    { content: "Fri 20", position: { col: 53, row: 9 }, type: "text" },
    {
      componentType: "divider",
      position: { col: 2, row: 10 },
      type: "component",
      width: 80,
    },
    // Time column
    { content: " 9:00", position: { col: 2, row: 11 }, type: "text" },
    { content: "10:00", position: { col: 2, row: 14 }, type: "text" },
    { content: "11:00", position: { col: 2, row: 17 }, type: "text" },
    { content: "12:00", position: { col: 2, row: 20 }, type: "text" },
    { content: " 1:00", position: { col: 2, row: 23 }, type: "text" },
    { content: " 2:00", position: { col: 2, row: 26 }, type: "text" },
    { content: " 3:00", position: { col: 2, row: 29 }, type: "text" },
    // Events
    {
      borderStyle: "rounded",
      height: 6,
      label: "Team\nStandup",
      position: { col: 9, row: 11 },
      type: "box",
      width: 10,
    },
    {
      borderStyle: "rounded",
      height: 6,
      label: "Design\nReview",
      position: { col: 31, row: 14 },
      type: "box",
      width: 10,
    },
    {
      borderStyle: "rounded",
      height: 3,
      label: "Lunch",
      position: { col: 42, row: 20 },
      type: "box",
      width: 10,
    },
    {
      borderStyle: "rounded",
      height: 6,
      label: "Sprint\nRetro",
      position: { col: 53, row: 23 },
      type: "box",
      width: 10,
    },
    // New Event Modal
    {
      body: "What: Team Planning\nWhen: Wed, 2:00 PM\nDuration: 1 hour\nRoom: Conf B",
      componentType: "modal",
      height: 22,
      label: "New Event",
      position: { col: 22, row: 12 },
      type: "component",
      width: 40,
    },
    {
      componentType: "input",
      label: "Add guests...",
      position: { col: 24, row: 22 },
      type: "component",
      width: 36,
    },
    {
      componentType: "button",
      label: "Save Event",
      position: { col: 24, row: 26 },
      type: "component",
      width: 16,
    },
    {
      componentType: "button",
      label: "Cancel",
      position: { col: 42, row: 26 },
      type: "component",
      width: 14,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 16. Invoice Builder
// ═══════════════════════════════════════════════════════════════
const invoiceBuilder: ShowcaseLayout = {
  description:
    "Professional invoice template with company info, line items table, and payment details",
  name: "Invoice Builder",
  objects: [
    {
      borderStyle: "double",
      height: 42,
      position: { col: 0, row: 0 },
      type: "box",
      width: 72,
    },
    // Header
    {
      borderStyle: "rounded",
      height: 5,
      label: "ACME CORP\nSoftware Solutions",
      position: { col: 2, row: 2 },
      type: "box",
      width: 30,
    },
    {
      content: "INVOICE #2026-0042",
      position: { col: 44, row: 2 },
      type: "text",
    },
    {
      content: "Date: Feb 18, 2026",
      position: { col: 44, row: 3 },
      type: "text",
    },
    {
      content: "Due:  Mar 18, 2026",
      position: { col: 44, row: 4 },
      type: "text",
    },
    {
      componentType: "divider",
      position: { col: 2, row: 8 },
      type: "component",
      width: 68,
    },
    // Addresses
    {
      body: "Globex Corporation\n123 Main Street\nSuite 400\nSan Francisco, CA 94102",
      componentType: "card",
      height: 8,
      label: "Bill To",
      position: { col: 2, row: 10 },
      type: "component",
      width: 32,
    },
    {
      body: "Globex Corp — HQ\n456 Market Street\nFloor 12\nSan Francisco, CA 94105",
      componentType: "card",
      height: 8,
      label: "Ship To",
      position: { col: 38, row: 10 },
      type: "component",
      width: 32,
    },
    // Line items
    {
      columns: ["Item", "Qty", "Rate", "Amount"],
      componentType: "table",
      height: 11,
      position: { col: 2, row: 19 },
      rows: [
        ["Platform License", "1", "$5,000.00", "$5,000.00"],
        ["API Integration", "40 hrs", "$150.00", "$6,000.00"],
        ["Support Plan", "1", "$1,200.00", "$1,200.00"],
        ["Data Migration", "1", "$2,500.00", "$2,500.00"],
      ],
      type: "component",
      width: 68,
    },
    // Totals
    {
      componentType: "divider",
      position: { col: 42, row: 31 },
      type: "component",
      width: 28,
    },
    {
      content: "Subtotal:  $14,700.00",
      position: { col: 44, row: 32 },
      type: "text",
    },
    {
      content: "Tax (8%):   $1,176.00",
      position: { col: 44, row: 33 },
      type: "text",
    },
    {
      componentType: "divider",
      position: { col: 42, row: 34 },
      type: "component",
      width: 28,
    },
    {
      content: "TOTAL:     $15,876.00",
      position: { col: 44, row: 35 },
      type: "text",
    },
    // Payment info
    {
      body: "Bank: First National\nAccount: ****4821\nRouting: ****7639\n\nPayment Terms: Net 30",
      componentType: "card",
      height: 9,
      label: "Payment Info",
      position: { col: 2, row: 31 },
      type: "component",
      width: 36,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 17. Onboarding Flow
// ═══════════════════════════════════════════════════════════════
const onboarding: ShowcaseLayout = {
  description:
    "Welcome screen with feature cards, progress stepper, and getting-started checklist",
  name: "Onboarding Flow",
  objects: [
    {
      componentType: "browser",
      height: 42,
      label: "app.example.com/welcome",
      position: { col: 0, row: 0 },
      type: "component",
      width: 72,
    },
    {
      borderStyle: "rounded",
      height: 5,
      label: "Welcome to Acme!\nLet's get you set up in 3 steps.",
      position: { col: 10, row: 3 },
      type: "box",
      width: 52,
    },
    {
      activeStep: 0,
      componentType: "stepper",
      items: ["Connect", "Configure", "Launch"],
      position: { col: 14, row: 9 },
      type: "component",
    },
    {
      componentType: "progress",
      label: "Step 1 of 3",
      position: { col: 10, row: 11 },
      progress: 33,
      type: "component",
      width: 52,
    },
    // Feature cards
    {
      body: "Full-text search\nacross all your\ndata in seconds.",
      componentType: "card",
      height: 10,
      label: "⌕ Search",
      position: { col: 2, row: 14 },
      type: "component",
      width: 22,
    },
    {
      body: "Real-time sync\nacross all your\ndevices.",
      componentType: "card",
      height: 10,
      label: "⇅ Sync",
      position: { col: 25, row: 14 },
      type: "component",
      width: 22,
    },
    {
      body: "Custom dashboards\nand automated\nreports.",
      componentType: "card",
      height: 10,
      label: "⚑ Reports",
      position: { col: 48, row: 14 },
      type: "component",
      width: 22,
    },
    // Checklist
    {
      componentType: "divider",
      label: "Getting Started",
      position: { col: 10, row: 25 },
      type: "component",
      width: 52,
    },
    {
      checked: true,
      componentType: "checkbox",
      label: "Connect your data source",
      position: { col: 10, row: 27 },
      type: "component",
      width: 38,
    },
    {
      checked: false,
      componentType: "checkbox",
      label: "Invite your team members",
      position: { col: 10, row: 30 },
      type: "component",
      width: 38,
    },
    {
      checked: false,
      componentType: "checkbox",
      label: "Create your first dashboard",
      position: { col: 10, row: 33 },
      type: "component",
      width: 38,
    },
    {
      componentType: "button",
      label: "Connect Data Source →",
      position: { col: 10, row: 37 },
      type: "component",
      width: 28,
    },
    {
      componentType: "button",
      label: "Skip for now",
      position: { col: 42, row: 37 },
      type: "component",
      width: 18,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 18. Dashboard with Flowchart
// ═══════════════════════════════════════════════════════════════
const flowchart: ShowcaseLayout = {
  description:
    "System architecture diagram with boxes, arrows, and annotations showing a deploy pipeline",
  name: "CI/CD Pipeline Diagram",
  objects: [
    {
      borderStyle: "double",
      height: 30,
      label: "CI/CD Pipeline\nAcme Platform v2",
      position: { col: 0, row: 0 },
      type: "box",
      width: 72,
    },
    // Stage 1: Source
    {
      borderStyle: "rounded",
      height: 5,
      label: "Git Push\n(main)",
      position: { col: 4, row: 5 },
      type: "box",
      width: 14,
    },
    {
      endPosition: { col: 22, row: 7 },
      position: { col: 18, row: 7 },
      type: "arrow",
    },
    // Stage 2: Build
    {
      borderStyle: "rounded",
      height: 5,
      label: "Build\n& Lint",
      position: { col: 22, row: 5 },
      type: "box",
      width: 14,
    },
    {
      endPosition: { col: 40, row: 7 },
      position: { col: 36, row: 7 },
      type: "arrow",
    },
    // Stage 3: Test
    {
      borderStyle: "rounded",
      height: 5,
      label: "Test\nSuite",
      position: { col: 40, row: 5 },
      type: "box",
      width: 14,
    },
    {
      endPosition: { col: 58, row: 7 },
      position: { col: 54, row: 7 },
      type: "arrow",
    },
    // Stage 4: Deploy
    {
      borderStyle: "heavy",
      height: 5,
      label: "Deploy",
      position: { col: 58, row: 5 },
      type: "box",
      width: 12,
    },
    // Parallel paths from Test
    {
      endPosition: { col: 47, row: 14 },
      position: { col: 47, row: 10 },
      type: "arrow",
    },
    {
      borderStyle: "rounded",
      height: 5,
      label: "Integration\nTests",
      position: { col: 38, row: 14 },
      type: "box",
      width: 18,
    },
    {
      endPosition: { col: 29, row: 14 },
      position: { col: 29, row: 7 },
      type: "arrow",
    },
    {
      borderStyle: "rounded",
      height: 5,
      label: "Security\nScan",
      position: { col: 20, row: 14 },
      type: "box",
      width: 18,
    },
    // Environments
    {
      componentType: "divider",
      label: "Environments",
      position: { col: 4, row: 21 },
      type: "component",
      width: 64,
    },
    {
      body: "auto-deploy\n● Running",
      componentType: "card",
      height: 6,
      label: "Staging",
      position: { col: 4, row: 23 },
      type: "component",
      width: 20,
    },
    {
      endPosition: { col: 28, row: 26 },
      position: { col: 24, row: 26 },
      type: "arrow",
    },
    {
      body: "per-PR deploy\n● Running",
      componentType: "card",
      height: 6,
      label: "Preview",
      position: { col: 28, row: 23 },
      type: "component",
      width: 20,
    },
    {
      endPosition: { col: 52, row: 26 },
      position: { col: 48, row: 26 },
      type: "arrow",
    },
    {
      body: "manual gate\n● Live",
      componentType: "card",
      height: 6,
      label: "Production",
      position: { col: 52, row: 23 },
      type: "component",
      width: 16,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 19. Mobile App Wireframe
// ═══════════════════════════════════════════════════════════════
const mobileApp: ShowcaseLayout = {
  description:
    "Side-by-side mobile screens showing login, home feed, and profile views",
  name: "Mobile App Wireframes",
  objects: [
    // Screen 1: Login
    {
      borderStyle: "rounded",
      height: 36,
      position: { col: 0, row: 0 },
      type: "box",
      width: 26,
    },
    {
      content: "Login",
      position: { col: 10, row: 1 },
      type: "text",
    },
    {
      componentType: "icon",
      icon: "★",
      position: { col: 11, row: 4 },
      type: "component",
    },
    {
      borderStyle: "rounded",
      height: 5,
      label: "Welcome Back\nSign in to continue",
      position: { col: 3, row: 8 },
      type: "box",
      width: 20,
    },
    {
      componentType: "input",
      label: "Email",
      position: { col: 3, row: 14 },
      type: "component",
      width: 20,
    },
    {
      componentType: "input",
      label: "Password",
      position: { col: 3, row: 18 },
      type: "component",
      width: 20,
    },
    {
      componentType: "button",
      label: "Sign In",
      position: { col: 3, row: 22 },
      type: "component",
      width: 20,
    },
    {
      componentType: "divider",
      label: "or",
      position: { col: 3, row: 26 },
      type: "component",
      width: 20,
    },
    {
      componentType: "button",
      label: "Continue with SSO",
      position: { col: 3, row: 28 },
      type: "component",
      width: 20,
    },
    {
      content: "Forgot password?",
      position: { col: 5, row: 32 },
      type: "text",
    },

    // Screen 2: Home
    {
      borderStyle: "rounded",
      height: 36,
      position: { col: 28, row: 0 },
      type: "box",
      width: 26,
    },
    {
      content: "Home",
      position: { col: 39, row: 1 },
      type: "text",
    },
    {
      componentType: "input",
      icon: "⌕",
      label: "Search...",
      position: { col: 30, row: 3 },
      type: "component",
      width: 22,
    },
    {
      body: "3 tasks due\n2 messages",
      componentType: "card",
      height: 7,
      label: "Daily Summary",
      position: { col: 30, row: 7 },
      type: "component",
      width: 22,
    },
    {
      body: "New task\nScan document\nJoin meeting",
      componentType: "card",
      height: 7,
      label: "Quick Actions",
      position: { col: 30, row: 15 },
      type: "component",
      width: 22,
    },
    {
      body: "report.pdf\nnotes.md\nslides.pptx",
      componentType: "card",
      height: 7,
      label: "Recent Files",
      position: { col: 30, row: 23 },
      type: "component",
      width: 22,
    },
    {
      componentType: "navbar",
      height: 3,
      navItems: ["⌂", "⌕", "⍥"],
      position: { col: 29, row: 33 },
      type: "component",
      width: 24,
    },

    // Screen 3: Profile
    {
      borderStyle: "rounded",
      height: 36,
      position: { col: 56, row: 0 },
      type: "box",
      width: 26,
    },
    {
      content: "Profile",
      position: { col: 66, row: 1 },
      type: "text",
    },
    {
      componentType: "avatar",
      label: "JD",
      position: { col: 67, row: 4 },
      type: "component",
    },
    { content: "Jane Doe", position: { col: 64, row: 8 }, type: "text" },
    { content: "jane@acme.com", position: { col: 62, row: 9 }, type: "text" },
    {
      componentType: "divider",
      position: { col: 58, row: 11 },
      type: "component",
      width: 22,
    },
    {
      componentType: "list",
      items: [
        "Edit Profile",
        "Notifications",
        "Privacy",
        "Help Center",
        "Sign Out",
      ],
      listStyle: "bullet",
      position: { col: 58, row: 13 },
      type: "component",
    },
    {
      componentType: "divider",
      label: "Stats",
      position: { col: 58, row: 19 },
      type: "component",
      width: 22,
    },
    { content: "Projects: 12", position: { col: 59, row: 21 }, type: "text" },
    { content: "Tasks:    48", position: { col: 59, row: 22 }, type: "text" },
    { content: "Files:   234", position: { col: 59, row: 23 }, type: "text" },
    // Arrows connecting screens
    {
      endPosition: { col: 28, row: 18 },
      position: { col: 26, row: 18 },
      type: "arrow",
    },
    {
      endPosition: { col: 56, row: 18 },
      position: { col: 54, row: 18 },
      type: "arrow",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 20. Component Showcase
// ═══════════════════════════════════════════════════════════════
const componentShowcase: ShowcaseLayout = {
  description:
    "Every UI component in one view — buttons, inputs, toggles, tables, alerts, ratings, and more",
  name: "Component Library",
  objects: [
    {
      borderStyle: "double",
      height: 52,
      label: "Wiretext\nComponent Library",
      position: { col: 0, row: 0 },
      type: "box",
      width: 84,
    },
    // Row 1: Buttons
    { content: "Buttons", position: { col: 3, row: 5 }, type: "text" },
    {
      componentType: "button",
      label: "Primary",
      position: { col: 3, row: 6 },
      type: "component",
      width: 14,
    },
    {
      componentType: "button",
      icon: "★",
      label: "With Icon",
      position: { col: 19, row: 6 },
      type: "component",
      width: 16,
    },
    {
      align: "left",
      componentType: "button",
      label: "Left Aligned",
      position: { col: 37, row: 6 },
      type: "component",
      width: 18,
    },
    {
      componentType: "button",
      icon: "→",
      iconPosition: "right",
      label: "Icon Right →",
      position: { col: 57, row: 6 },
      type: "component",
      width: 18,
    },
    // Row 2: Inputs
    { content: "Form Controls", position: { col: 3, row: 10 }, type: "text" },
    {
      componentType: "input",
      label: "Text Input",
      position: { col: 3, row: 11 },
      type: "component",
      width: 20,
    },
    {
      componentType: "input",
      icon: "⌕",
      label: "With Icon",
      position: { col: 25, row: 11 },
      type: "component",
      width: 20,
    },
    {
      componentType: "select",
      label: "Dropdown",
      position: { col: 47, row: 11 },
      type: "component",
      width: 18,
    },
    // Row 3: Toggles & Checks
    {
      checked: true,
      componentType: "checkbox",
      label: "Checked",
      position: { col: 3, row: 15 },
      type: "component",
      width: 18,
    },
    {
      checked: false,
      componentType: "checkbox",
      label: "Unchecked",
      position: { col: 23, row: 15 },
      type: "component",
      width: 20,
    },
    {
      checked: true,
      componentType: "radio",
      label: "Selected",
      position: { col: 45, row: 15 },
      type: "component",
      width: 18,
    },
    {
      checked: true,
      componentType: "toggle",
      label: "Toggle On",
      position: { col: 3, row: 19 },
      type: "component",
    },
    {
      checked: false,
      componentType: "toggle",
      label: "Toggle Off",
      position: { col: 30, row: 19 },
      type: "component",
    },
    // Row 4: Feedback
    { content: "Feedback", position: { col: 3, row: 21 }, type: "text" },
    {
      alertType: "info",
      componentType: "alert",
      height: 3,
      label: "Info message",
      position: { col: 3, row: 22 },
      type: "component",
      width: 38,
    },
    {
      alertType: "success",
      componentType: "alert",
      height: 3,
      label: "Success!",
      position: { col: 43, row: 22 },
      type: "component",
      width: 38,
    },
    {
      alertType: "warning",
      componentType: "alert",
      height: 3,
      label: "Warning notice",
      position: { col: 3, row: 25 },
      type: "component",
      width: 38,
    },
    {
      alertType: "error",
      componentType: "alert",
      height: 3,
      label: "Error occurred",
      position: { col: 43, row: 25 },
      type: "component",
      width: 38,
    },
    // Row 5: Progress & Rating
    {
      componentType: "progress",
      label: "72%",
      position: { col: 3, row: 29 },
      progress: 72,
      type: "component",
      width: 30,
    },
    {
      componentType: "rating",
      label: "4/5",
      maxValue: 5,
      position: { col: 36, row: 30 },
      type: "component",
      value: 4,
    },
    {
      activeStep: 1,
      componentType: "stepper",
      items: ["A", "B", "C"],
      position: { col: 52, row: 30 },
      type: "component",
    },
    // Row 6: Data
    { content: "Data Display", position: { col: 3, row: 33 }, type: "text" },
    {
      columns: ["Name", "Role", "Status"],
      componentType: "table",
      filterable: true,
      height: 9,
      position: { col: 3, row: 34 },
      rows: [
        ["Jane", "Admin", "Active"],
        ["Bob", "Editor", "Active"],
        ["Alice", "Viewer", "Pending"],
      ],
      type: "component",
      width: 40,
    },
    {
      componentType: "list",
      items: ["Bullet list item", "Second item", "Third item"],
      listStyle: "bullet",
      position: { col: 46, row: 34 },
      type: "component",
    },
    {
      componentType: "list",
      items: ["Numbered first", "Numbered second", "Numbered third"],
      listStyle: "number",
      position: { col: 46, row: 38 },
      type: "component",
    },
    // Row 7: Misc
    { content: "Other", position: { col: 3, row: 44 }, type: "text" },
    {
      componentType: "avatar",
      label: "JD",
      position: { col: 3, row: 45 },
      type: "component",
    },
    {
      componentType: "icon",
      icon: "★",
      position: { col: 10, row: 45 },
      type: "component",
    },
    {
      componentType: "icon",
      icon: "♡",
      position: { col: 15, row: 45 },
      type: "component",
    },
    {
      componentType: "icon",
      icon: "⌕",
      position: { col: 20, row: 45 },
      type: "component",
    },
    {
      componentType: "breadcrumb",
      items: ["Home", "Products", "Detail"],
      position: { col: 26, row: 46 },
      separator: " > ",
      type: "component",
    },
    {
      componentType: "divider",
      label: "Divider with label",
      position: { col: 3, row: 48 },
      type: "component",
      width: 78,
    },
    {
      componentType: "skeleton",
      position: { col: 3, row: 50 },
      type: "component",
      width: 30,
    },
    {
      componentType: "skeleton",
      position: { col: 36, row: 50 },
      type: "component",
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
