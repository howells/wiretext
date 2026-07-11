/**
 * Generate 20 wireframe URLs for the Twitter demo.
 * Uses the Wiretext engine directly (same as the MCP server would).
 * Run with: npx tsx /tmp/wiretext-demo-urls.ts
 */

import {
  encodeDocument,
  fillDefaults,
  type MinimalObject,
  resolveLayers,
} from "@wiretext/engine";

import { SHOWCASE_LAYOUTS } from "../apps/app/src/data/showcase-layouts";

const BASE_URL = "https://wiretext.app";

interface DemoLayout {
  name: string;
  objects: MinimalObject[];
  layers?: { id: string; name: string }[];
}

// ═══════════════════════════════════════════════════════════════
// 11. System Architecture Diagram
// ═══════════════════════════════════════════════════════════════
const architectureDiagram: DemoLayout = {
  name: "System Architecture Diagram",
  layers: [
    { id: "infra", name: "Infrastructure" },
    { id: "services", name: "Services" },
    { id: "flow", name: "Data Flow" },
    { id: "labels", name: "Labels" },
  ],
  objects: [
    // Title
    {
      type: "text",
      content: "System Architecture — Microservices",
      position: { col: 18, row: 0 },
      layerId: "labels",
    },
    // Client tier
    {
      type: "box",
      position: { col: 0, row: 2 },
      width: 72,
      height: 8,
      label: "Client Tier",
      borderStyle: "double",
      fill: "solid",
      layerId: "infra",
    },
    {
      type: "component",
      componentType: "browser",
      position: { col: 2, row: 4 },
      width: 22,
      height: 5,
      label: "Web App (React)",
      layerId: "services",
    },
    {
      type: "box",
      position: { col: 26, row: 4 },
      width: 20,
      height: 5,
      label: "Mobile (RN)",
      layerId: "services",
    },
    {
      type: "box",
      position: { col: 48, row: 4 },
      width: 22,
      height: 5,
      label: "CLI Tool",
      layerId: "services",
    },
    // Arrows client → gateway
    {
      type: "arrow",
      position: { col: 13, row: 10 },
      endPosition: { col: 13, row: 12 },
      layerId: "flow",
    },
    {
      type: "arrow",
      position: { col: 36, row: 10 },
      endPosition: { col: 36, row: 12 },
      layerId: "flow",
    },
    {
      type: "arrow",
      position: { col: 59, row: 10 },
      endPosition: { col: 59, row: 12 },
      layerId: "flow",
    },
    // API Gateway
    {
      type: "box",
      position: { col: 8, row: 12 },
      width: 56,
      height: 5,
      label: "API Gateway (Kong)",
      borderStyle: "heavy",
      fill: "solid",
      layerId: "infra",
    },
    {
      type: "text",
      content: "Rate Limit  Auth  Logging  Routing",
      position: { col: 18, row: 14 },
      layerId: "labels",
    },
    // Arrows gateway → services
    {
      type: "arrow",
      position: { col: 12, row: 17 },
      endPosition: { col: 12, row: 19 },
      layerId: "flow",
    },
    {
      type: "arrow",
      position: { col: 36, row: 17 },
      endPosition: { col: 36, row: 19 },
      layerId: "flow",
    },
    {
      type: "arrow",
      position: { col: 60, row: 17 },
      endPosition: { col: 60, row: 19 },
      layerId: "flow",
    },
    // Service tier
    {
      type: "box",
      position: { col: 0, row: 19 },
      width: 72,
      height: 8,
      label: "Service Tier",
      borderStyle: "double",
      fill: "solid",
      layerId: "infra",
    },
    {
      type: "box",
      position: { col: 2, row: 21 },
      width: 20,
      height: 5,
      label: "User Service",
      layerId: "services",
    },
    {
      type: "box",
      position: { col: 24, row: 21 },
      width: 24,
      height: 5,
      label: "Order Service",
      layerId: "services",
    },
    {
      type: "box",
      position: { col: 50, row: 21 },
      width: 20,
      height: 5,
      label: "Notification Svc",
      layerId: "services",
    },
    // Message bus
    {
      type: "arrow",
      position: { col: 12, row: 27 },
      endPosition: { col: 12, row: 29 },
      layerId: "flow",
    },
    {
      type: "arrow",
      position: { col: 36, row: 27 },
      endPosition: { col: 36, row: 29 },
      layerId: "flow",
    },
    {
      type: "arrow",
      position: { col: 60, row: 27 },
      endPosition: { col: 60, row: 29 },
      layerId: "flow",
    },
    {
      type: "box",
      position: { col: 8, row: 29 },
      width: 56,
      height: 3,
      label: "Message Bus (Kafka)",
      borderStyle: "rounded",
      layerId: "infra",
    },
    // Data tier
    {
      type: "arrow",
      position: { col: 12, row: 32 },
      endPosition: { col: 12, row: 34 },
      layerId: "flow",
    },
    {
      type: "arrow",
      position: { col: 36, row: 32 },
      endPosition: { col: 36, row: 34 },
      layerId: "flow",
    },
    {
      type: "arrow",
      position: { col: 60, row: 32 },
      endPosition: { col: 60, row: 34 },
      layerId: "flow",
    },
    {
      type: "box",
      position: { col: 0, row: 34 },
      width: 72,
      height: 7,
      label: "Data Tier",
      borderStyle: "double",
      fill: "solid",
      layerId: "infra",
    },
    {
      type: "box",
      position: { col: 2, row: 36 },
      width: 20,
      height: 4,
      label: "PostgreSQL",
      layerId: "services",
    },
    {
      type: "box",
      position: { col: 24, row: 36 },
      width: 24,
      height: 4,
      label: "Redis Cache",
      layerId: "services",
    },
    {
      type: "box",
      position: { col: 50, row: 36 },
      width: 20,
      height: 4,
      label: "S3 Storage",
      layerId: "services",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 12. CI/CD Pipeline Diagram
// ═══════════════════════════════════════════════════════════════
const cicdPipeline: DemoLayout = {
  name: "CI/CD Pipeline",
  objects: [
    {
      type: "text",
      content: "CI/CD Pipeline — Production Deployment",
      position: { col: 14, row: 0 },
    },
    {
      type: "component",
      componentType: "stepper",
      position: { col: 2, row: 2 },
      width: 66,
      items: ["Commit", "Build", "Test", "Stage", "Deploy"],
      activeStep: 3,
    },
    // Commit stage
    {
      type: "component",
      componentType: "card",
      position: { col: 0, row: 5 },
      width: 22,
      height: 9,
      label: "1. Source",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 2, row: 8 },
      icon: "⟳",
    },
    { type: "text", content: "git push origin", position: { col: 6, row: 9 } },
    { type: "text", content: "main", position: { col: 6, row: 10 } },
    {
      type: "arrow",
      position: { col: 22, row: 9 },
      endPosition: { col: 25, row: 9 },
    },
    // Build stage
    {
      type: "component",
      componentType: "card",
      position: { col: 25, row: 5 },
      width: 22,
      height: 9,
      label: "2. Build",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 27, row: 8 },
      items: ["Install deps", "Type check", "Lint", "Bundle"],
      listStyle: "number",
    },
    {
      type: "arrow",
      position: { col: 47, row: 9 },
      endPosition: { col: 50, row: 9 },
    },
    // Test stage
    {
      type: "component",
      componentType: "card",
      position: { col: 50, row: 5 },
      width: 22,
      height: 9,
      label: "3. Test",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 52, row: 8 },
      items: [
        "Unit tests",
        "Integration",
        "E2E (Playwright)",
        "Coverage > 80%",
      ],
      listStyle: "number",
    },
    // Second row
    {
      type: "arrow",
      position: { col: 61, row: 14 },
      endPosition: { col: 61, row: 17 },
    },
    // Stage
    {
      type: "component",
      componentType: "card",
      position: { col: 50, row: 17 },
      width: 22,
      height: 9,
      label: "4. Staging",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 52, row: 20 },
      items: ["Deploy preview", "Smoke tests", "Visual diff", "Approval gate"],
      listStyle: "dash",
    },
    {
      type: "arrow",
      position: { col: 50, row: 21 },
      endPosition: { col: 47, row: 21 },
    },
    // Deploy
    {
      type: "component",
      componentType: "card",
      position: { col: 25, row: 17 },
      width: 22,
      height: 9,
      label: "5. Production",
      borderStyle: "heavy",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 27, row: 20 },
      items: [
        "Blue/green deploy",
        "Health checks",
        "Canary 5%→100%",
        "Notify Slack",
      ],
      listStyle: "dash",
    },
    {
      type: "arrow",
      position: { col: 25, row: 21 },
      endPosition: { col: 22, row: 21 },
    },
    // Monitor
    {
      type: "component",
      componentType: "card",
      position: { col: 0, row: 17 },
      width: 22,
      height: 9,
      label: "6. Monitor",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 2, row: 20 },
      items: [
        "Error tracking",
        "Performance APM",
        "Log aggregation",
        "Alerts → PagerDuty",
      ],
      listStyle: "dash",
    },
    // Status
    {
      type: "component",
      componentType: "alert",
      position: { col: 0, row: 27 },
      width: 72,
      height: 3,
      label: "Pipeline healthy — last deploy: 2 mins ago (v3.14.1)",
      alertType: "success",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 13. Database ER Diagram
// ═══════════════════════════════════════════════════════════════
const erDiagram: DemoLayout = {
  name: "Database ER Diagram",
  objects: [
    {
      type: "text",
      content: "E-Commerce Database Schema",
      position: { col: 20, row: 0 },
    },
    // Users table
    {
      type: "component",
      componentType: "table",
      position: { col: 0, row: 2 },
      width: 28,
      height: 10,
      columns: ["users", "type"],
      rows: [
        ["id", "uuid PK"],
        ["email", "varchar UNIQUE"],
        ["name", "varchar"],
        ["password_hash", "varchar"],
        ["created_at", "timestamp"],
      ],
    },
    // Orders table
    {
      type: "component",
      componentType: "table",
      position: { col: 34, row: 2 },
      width: 28,
      height: 10,
      columns: ["orders", "type"],
      rows: [
        ["id", "uuid PK"],
        ["user_id", "uuid FK →"],
        ["status", "enum"],
        ["total", "decimal"],
        ["placed_at", "timestamp"],
      ],
    },
    // Products table
    {
      type: "component",
      componentType: "table",
      position: { col: 0, row: 16 },
      width: 28,
      height: 10,
      columns: ["products", "type"],
      rows: [
        ["id", "uuid PK"],
        ["name", "varchar"],
        ["price", "decimal"],
        ["stock", "integer"],
        ["category_id", "uuid FK →"],
      ],
    },
    // Order items
    {
      type: "component",
      componentType: "table",
      position: { col: 34, row: 16 },
      width: 28,
      height: 9,
      columns: ["order_items", "type"],
      rows: [
        ["id", "uuid PK"],
        ["order_id", "uuid FK →"],
        ["product_id", "uuid FK →"],
        ["quantity", "integer"],
      ],
    },
    // Categories
    {
      type: "component",
      componentType: "table",
      position: { col: 34, row: 28 },
      width: 28,
      height: 8,
      columns: ["categories", "type"],
      rows: [
        ["id", "uuid PK"],
        ["name", "varchar"],
        ["parent_id", "uuid FK → self"],
      ],
    },
    // Relationships
    {
      type: "arrow",
      position: { col: 28, row: 6 },
      endPosition: { col: 34, row: 6 },
    },
    { type: "text", content: "1:N", position: { col: 30, row: 5 } },
    {
      type: "arrow",
      position: { col: 48, row: 12 },
      endPosition: { col: 48, row: 16 },
    },
    { type: "text", content: "1:N", position: { col: 49, row: 13 } },
    {
      type: "arrow",
      position: { col: 28, row: 20 },
      endPosition: { col: 34, row: 20 },
    },
    { type: "text", content: "1:N", position: { col: 30, row: 19 } },
    {
      type: "arrow",
      position: { col: 28, row: 24 },
      endPosition: { col: 34, row: 32 },
    },
    { type: "text", content: "1:N", position: { col: 30, row: 27 } },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 14. User Flow / Journey Map
// ═══════════════════════════════════════════════════════════════
const userFlow: DemoLayout = {
  name: "User Onboarding Flow",
  objects: [
    {
      type: "text",
      content: "User Onboarding Flow",
      position: { col: 28, row: 0 },
    },
    // Start
    {
      type: "box",
      position: { col: 0, row: 2 },
      width: 16,
      height: 5,
      label: "Landing Page",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 16, row: 4 },
      endPosition: { col: 20, row: 4 },
    },
    // Sign up
    {
      type: "box",
      position: { col: 20, row: 2 },
      width: 16,
      height: 5,
      label: "Sign Up",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 36, row: 4 },
      endPosition: { col: 40, row: 4 },
    },
    // Verify
    {
      type: "box",
      position: { col: 40, row: 2 },
      width: 16,
      height: 5,
      label: "Verify Email",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 56, row: 4 },
      endPosition: { col: 60, row: 4 },
    },
    // Onboarding
    {
      type: "box",
      position: { col: 60, row: 2 },
      width: 16,
      height: 5,
      label: "Onboarding",
      borderStyle: "heavy",
    },
    // Branch down from onboarding
    {
      type: "arrow",
      position: { col: 68, row: 7 },
      endPosition: { col: 68, row: 10 },
    },
    // Choose path
    {
      type: "box",
      position: { col: 54, row: 10 },
      width: 22,
      height: 3,
      label: "Choose your role",
    },
    // Two branches
    {
      type: "arrow",
      position: { col: 58, row: 13 },
      endPosition: { col: 34, row: 16 },
    },
    {
      type: "arrow",
      position: { col: 72, row: 13 },
      endPosition: { col: 72, row: 16 },
    },
    // Developer path
    {
      type: "box",
      position: { col: 22, row: 16 },
      width: 22,
      height: 5,
      label: "Developer Setup",
      borderStyle: "rounded",
      fill: "solid",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 24, row: 19 },
      items: ["Connect GitHub", "Import repo", "Configure CI"],
      listStyle: "number",
    },
    // Designer path
    {
      type: "box",
      position: { col: 60, row: 16 },
      width: 22,
      height: 5,
      label: "Designer Setup",
      borderStyle: "rounded",
      fill: "solid",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 62, row: 19 },
      items: ["Upload assets", "Choose template", "Set brand colors"],
      listStyle: "number",
    },
    // Converge
    {
      type: "arrow",
      position: { col: 33, row: 23 },
      endPosition: { col: 48, row: 26 },
    },
    {
      type: "arrow",
      position: { col: 71, row: 23 },
      endPosition: { col: 56, row: 26 },
    },
    // Dashboard
    {
      type: "box",
      position: { col: 40, row: 26 },
      width: 20,
      height: 5,
      label: "Dashboard",
      borderStyle: "heavy",
    },
    // Success metrics
    {
      type: "component",
      componentType: "divider",
      position: { col: 0, row: 32 },
      width: 78,
      label: "Success Metrics",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 0, row: 34 },
      width: 19,
      height: 6,
      label: "Signup Rate",
    },
    { type: "text", content: "68% → 82%", position: { col: 2, row: 38 } },
    {
      type: "component",
      componentType: "card",
      position: { col: 20, row: 34 },
      width: 19,
      height: 6,
      label: "Verify Rate",
    },
    { type: "text", content: "45% → 71%", position: { col: 22, row: 38 } },
    {
      type: "component",
      componentType: "card",
      position: { col: 40, row: 34 },
      width: 19,
      height: 6,
      label: "Completion",
    },
    { type: "text", content: "30% → 55%", position: { col: 42, row: 38 } },
    {
      type: "component",
      componentType: "card",
      position: { col: 60, row: 34 },
      width: 19,
      height: 6,
      label: "Time to Value",
    },
    { type: "text", content: "12m → 4m", position: { col: 62, row: 38 } },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 15. Network Topology Diagram
// ═══════════════════════════════════════════════════════════════
const networkTopology: DemoLayout = {
  name: "Network Topology",
  objects: [
    {
      type: "text",
      content: "Production Network Topology",
      position: { col: 20, row: 0 },
    },
    // Internet
    {
      type: "box",
      position: { col: 26, row: 2 },
      width: 18,
      height: 3,
      label: "Internet",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 35, row: 5 },
      endPosition: { col: 35, row: 7 },
    },
    // CDN
    {
      type: "box",
      position: { col: 22, row: 7 },
      width: 26,
      height: 3,
      label: "CDN (Cloudflare)",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 35, row: 10 },
      endPosition: { col: 35, row: 12 },
    },
    // Firewall
    {
      type: "box",
      position: { col: 20, row: 12 },
      width: 30,
      height: 3,
      label: "WAF / Firewall",
      borderStyle: "heavy",
    },
    {
      type: "arrow",
      position: { col: 35, row: 15 },
      endPosition: { col: 35, row: 17 },
    },
    // Load Balancer
    {
      type: "box",
      position: { col: 18, row: 17 },
      width: 34,
      height: 3,
      label: "Load Balancer (ALB)",
      borderStyle: "double",
    },
    // Fan out to app servers
    {
      type: "arrow",
      position: { col: 24, row: 20 },
      endPosition: { col: 10, row: 22 },
    },
    {
      type: "arrow",
      position: { col: 35, row: 20 },
      endPosition: { col: 35, row: 22 },
    },
    {
      type: "arrow",
      position: { col: 46, row: 20 },
      endPosition: { col: 60, row: 22 },
    },
    // App servers
    {
      type: "box",
      position: { col: 0, row: 22 },
      width: 20,
      height: 5,
      label: "App Server 1",
      fill: "solid",
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 2, row: 24 },
      width: 16,
      progress: 45,
    },
    {
      type: "box",
      position: { col: 25, row: 22 },
      width: 20,
      height: 5,
      label: "App Server 2",
      fill: "solid",
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 27, row: 24 },
      width: 16,
      progress: 72,
    },
    {
      type: "box",
      position: { col: 50, row: 22 },
      width: 20,
      height: 5,
      label: "App Server 3",
      fill: "solid",
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 52, row: 24 },
      width: 16,
      progress: 30,
    },
    // Arrows down to DB
    {
      type: "arrow",
      position: { col: 10, row: 27 },
      endPosition: { col: 22, row: 29 },
    },
    {
      type: "arrow",
      position: { col: 35, row: 27 },
      endPosition: { col: 35, row: 29 },
    },
    {
      type: "arrow",
      position: { col: 60, row: 27 },
      endPosition: { col: 48, row: 29 },
    },
    // Database cluster
    {
      type: "box",
      position: { col: 10, row: 29 },
      width: 50,
      height: 7,
      label: "Database Cluster",
      borderStyle: "double",
      fill: "solid",
    },
    {
      type: "box",
      position: { col: 12, row: 31 },
      width: 14,
      height: 4,
      label: "Primary (RW)",
    },
    {
      type: "box",
      position: { col: 28, row: 31 },
      width: 14,
      height: 4,
      label: "Replica 1 (R)",
    },
    {
      type: "box",
      position: { col: 44, row: 31 },
      width: 14,
      height: 4,
      label: "Replica 2 (R)",
    },
    {
      type: "arrow",
      position: { col: 26, row: 33 },
      endPosition: { col: 28, row: 33 },
    },
    {
      type: "arrow",
      position: { col: 42, row: 33 },
      endPosition: { col: 44, row: 33 },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 16. State Machine Diagram
// ═══════════════════════════════════════════════════════════════
const stateMachine: DemoLayout = {
  name: "Order State Machine",
  objects: [
    {
      type: "text",
      content: "Order State Machine",
      position: { col: 24, row: 0 },
    },
    // States
    {
      type: "box",
      position: { col: 0, row: 3 },
      width: 14,
      height: 3,
      label: "Created",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 14, row: 4 },
      endPosition: { col: 20, row: 4 },
    },
    { type: "text", content: "pay", position: { col: 15, row: 3 } },

    {
      type: "box",
      position: { col: 20, row: 3 },
      width: 14,
      height: 3,
      label: "Pending",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 34, row: 4 },
      endPosition: { col: 40, row: 4 },
    },
    { type: "text", content: "confirm", position: { col: 35, row: 3 } },

    {
      type: "box",
      position: { col: 40, row: 3 },
      width: 14,
      height: 3,
      label: "Confirmed",
      borderStyle: "heavy",
    },
    // Down to processing
    {
      type: "arrow",
      position: { col: 47, row: 6 },
      endPosition: { col: 47, row: 9 },
    },
    { type: "text", content: "process", position: { col: 48, row: 7 } },

    {
      type: "box",
      position: { col: 40, row: 9 },
      width: 14,
      height: 3,
      label: "Processing",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 47, row: 12 },
      endPosition: { col: 47, row: 15 },
    },
    { type: "text", content: "ship", position: { col: 48, row: 13 } },

    {
      type: "box",
      position: { col: 40, row: 15 },
      width: 14,
      height: 3,
      label: "Shipped",
      borderStyle: "rounded",
    },
    {
      type: "arrow",
      position: { col: 47, row: 18 },
      endPosition: { col: 47, row: 21 },
    },
    { type: "text", content: "deliver", position: { col: 48, row: 19 } },

    {
      type: "box",
      position: { col: 40, row: 21 },
      width: 14,
      height: 3,
      label: "Delivered",
      borderStyle: "heavy",
    },

    // Cancel path from Pending
    {
      type: "arrow",
      position: { col: 27, row: 6 },
      endPosition: { col: 27, row: 15 },
    },
    { type: "text", content: "cancel", position: { col: 28, row: 10 } },
    {
      type: "box",
      position: { col: 20, row: 15 },
      width: 14,
      height: 3,
      label: "Cancelled",
      borderStyle: "double",
    },

    // Refund path from Delivered
    {
      type: "arrow",
      position: { col: 40, row: 22 },
      endPosition: { col: 14, row: 22 },
    },
    { type: "text", content: "refund", position: { col: 24, row: 21 } },
    {
      type: "box",
      position: { col: 0, row: 21 },
      width: 14,
      height: 3,
      label: "Refunded",
      borderStyle: "double",
    },

    // Failed payment path
    {
      type: "arrow",
      position: { col: 20, row: 4 },
      endPosition: { col: 14, row: 10 },
    },
    { type: "text", content: "fail", position: { col: 14, row: 6 } },
    {
      type: "box",
      position: { col: 0, row: 9 },
      width: 14,
      height: 3,
      label: "Failed",
      borderStyle: "double",
    },
    // Retry from failed
    {
      type: "arrow",
      position: { col: 14, row: 10 },
      endPosition: { col: 20, row: 5 },
      startHead: false,
      endHead: true,
    },
    { type: "text", content: "retry", position: { col: 15, row: 8 } },

    // Legend
    {
      type: "component",
      componentType: "divider",
      position: { col: 0, row: 25 },
      width: 56,
      label: "Legend",
    },
    {
      type: "box",
      position: { col: 0, row: 27 },
      width: 10,
      height: 3,
      label: "Start",
      borderStyle: "rounded",
    },
    {
      type: "box",
      position: { col: 12, row: 27 },
      width: 10,
      height: 3,
      label: "End",
      borderStyle: "heavy",
    },
    {
      type: "box",
      position: { col: 24, row: 27 },
      width: 10,
      height: 3,
      label: "Terminal",
      borderStyle: "double",
    },
    { type: "text", content: "→ = transition", position: { col: 38, row: 28 } },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 17. Org Chart
// ═══════════════════════════════════════════════════════════════
const orgChart: DemoLayout = {
  name: "Organization Chart",
  objects: [
    {
      type: "text",
      content: "Engineering Organization",
      position: { col: 22, row: 0 },
    },
    // CEO
    {
      type: "component",
      componentType: "card",
      position: { col: 24, row: 2 },
      width: 20,
      height: 6,
      label: "CEO",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 26, row: 5 },
      label: "JC",
    },
    { type: "text", content: "Jane Chen", position: { col: 32, row: 6 } },
    // Lines down
    {
      type: "line",
      position: { col: 34, row: 8 },
      endPosition: { col: 34, row: 10 },
    },
    {
      type: "line",
      position: { col: 12, row: 10 },
      endPosition: { col: 56, row: 10 },
    },
    {
      type: "line",
      position: { col: 12, row: 10 },
      endPosition: { col: 12, row: 11 },
    },
    {
      type: "line",
      position: { col: 34, row: 10 },
      endPosition: { col: 34, row: 11 },
    },
    {
      type: "line",
      position: { col: 56, row: 10 },
      endPosition: { col: 56, row: 11 },
    },
    // VP Eng
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 11 },
      width: 20,
      height: 6,
      label: "VP Engineering",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 4, row: 14 },
      label: "BK",
    },
    { type: "text", content: "Bob Kim", position: { col: 10, row: 15 } },
    // VP Product
    {
      type: "component",
      componentType: "card",
      position: { col: 24, row: 11 },
      width: 20,
      height: 6,
      label: "VP Product",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 26, row: 14 },
      label: "AL",
    },
    { type: "text", content: "Alice Lee", position: { col: 32, row: 15 } },
    // VP Design
    {
      type: "component",
      componentType: "card",
      position: { col: 46, row: 11 },
      width: 20,
      height: 6,
      label: "VP Design",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 48, row: 14 },
      label: "CS",
    },
    { type: "text", content: "Carol Sun", position: { col: 54, row: 15 } },
    // Lines from VP Eng
    {
      type: "line",
      position: { col: 12, row: 17 },
      endPosition: { col: 12, row: 19 },
    },
    {
      type: "line",
      position: { col: 4, row: 19 },
      endPosition: { col: 20, row: 19 },
    },
    {
      type: "line",
      position: { col: 4, row: 19 },
      endPosition: { col: 4, row: 20 },
    },
    {
      type: "line",
      position: { col: 20, row: 19 },
      endPosition: { col: 20, row: 20 },
    },
    // Teams
    {
      type: "component",
      componentType: "card",
      position: { col: 0, row: 20 },
      width: 14,
      height: 8,
      label: "Frontend",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 2, row: 24 },
      items: ["React", "3 eng"],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 16, row: 20 },
      width: 14,
      height: 8,
      label: "Backend",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 18, row: 24 },
      items: ["Go / Rust", "5 eng"],
      listStyle: "bullet",
    },
    // Lines from VP Product
    {
      type: "line",
      position: { col: 34, row: 17 },
      endPosition: { col: 34, row: 20 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 30, row: 20 },
      width: 14,
      height: 8,
      label: "Product",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 32, row: 24 },
      items: ["Growth PM", "Core PM"],
      listStyle: "bullet",
    },
    // Lines from VP Design
    {
      type: "line",
      position: { col: 56, row: 17 },
      endPosition: { col: 56, row: 20 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 46, row: 20 },
      width: 20,
      height: 8,
      label: "Design",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 48, row: 24 },
      items: ["UX Research", "Visual Design", "Design Systems"],
      listStyle: "bullet",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 18. Music Player UI
// ═══════════════════════════════════════════════════════════════
const musicPlayer: DemoLayout = {
  name: "Music Streaming Player",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 74,
      height: 40,
      label: "play.music.io/library",
    },
    // Sidebar
    {
      type: "component",
      componentType: "card",
      position: { col: 1, row: 3 },
      width: 20,
      height: 30,
      label: "Library",
    },
    {
      type: "component",
      componentType: "input",
      position: { col: 3, row: 6 },
      width: 16,
      label: "Search",
      icon: "⌕",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 10 },
      items: [
        "⌂ Home",
        "⌕ Browse",
        "♡ Liked Songs",
        "♩ Playlists",
        "★ Top Charts",
      ],
      listStyle: "dash",
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 16 },
      width: 16,
      label: "Playlists",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 18 },
      items: ["Chill Vibes", "Workout", "Focus", "Road Trip", "90s Hits"],
      listStyle: "bullet",
    },
    // Main content
    {
      type: "component",
      componentType: "card",
      position: { col: 21, row: 3 },
      width: 52,
      height: 30,
      label: "Now Playing",
    },
    {
      type: "component",
      componentType: "image",
      position: { col: 32, row: 6 },
      width: 28,
      height: 12,
      label: "Album Art",
      icon: "♩",
    },
    {
      type: "text",
      content: "Midnight Highway",
      position: { col: 36, row: 19 },
    },
    { type: "text", content: "The Wanderers", position: { col: 38, row: 20 } },
    {
      type: "component",
      componentType: "progress",
      position: { col: 28, row: 22 },
      width: 38,
      progress: 42,
      label: "2:15 / 5:23",
    },
    // Controls
    {
      type: "component",
      componentType: "icon",
      position: { col: 37, row: 25 },
      icon: "◀",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 41, row: 25 },
      width: 7,
      label: "▶",
      borderStyle: "heavy",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 50, row: 25 },
      icon: "▶",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 31, row: 25 },
      icon: "⟳",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 56, row: 25 },
      icon: "♡",
    },
    // Queue
    {
      type: "component",
      componentType: "divider",
      position: { col: 23, row: 28 },
      width: 48,
      label: "Up Next",
    },
    {
      type: "text",
      content: "1. Electric Dreams — Neon Wave",
      position: { col: 24, row: 30 },
    },
    {
      type: "text",
      content: "2. Golden Hour — Sunset Trio",
      position: { col: 24, row: 31 },
    },
    // Player bar
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 34 },
      width: 72,
      height: 3,
      navItems: [
        "◀",
        "▶ Playing",
        "♩ Midnight Highway — The Wanderers",
        "🔊 ━━━━●━━",
        "≡",
      ],
    },
    // Volume
    {
      type: "component",
      componentType: "progress",
      position: { col: 1, row: 37 },
      width: 72,
      progress: 65,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 19. API Documentation Page
// ═══════════════════════════════════════════════════════════════
const apiDocs: DemoLayout = {
  name: "API Documentation",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 80,
      height: 46,
      label: "docs.api.dev/v2/users",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 78,
      height: 3,
      navItems: ["◉ API Docs", "v2.4.1", "Reference", "Guides", "SDKs", "⌕"],
    },
    // Sidebar
    {
      type: "component",
      componentType: "card",
      position: { col: 1, row: 6 },
      width: 22,
      height: 38,
      label: "Endpoints",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 9 },
      items: [
        "Authentication",
        "● Users",
        "  Teams",
        "  Projects",
        "  Webhooks",
        "  Billing",
      ],
      listStyle: "dash",
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 3, row: 16 },
      width: 18,
      label: "Users",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 3, row: 18 },
      items: [
        "GET /users",
        "POST /users",
        "GET /users/:id",
        "PATCH /users/:id",
        "DELETE /users/:id",
      ],
      listStyle: "dash",
    },
    // Main content
    {
      type: "text",
      content: "GET /v2/users/:id",
      position: { col: 25, row: 7 },
    },
    {
      type: "text",
      content: "Retrieve a user by their unique ID.",
      position: { col: 25, row: 9 },
    },
    // Request
    {
      type: "component",
      componentType: "card",
      position: { col: 24, row: 11 },
      width: 54,
      height: 9,
      label: "Request",
    },
    {
      type: "text",
      content: "GET https://api.example.com/v2/users/usr_123",
      position: { col: 26, row: 14 },
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 26, row: 15 },
      width: 50,
    },
    {
      type: "text",
      content: "Authorization: Bearer <token>",
      position: { col: 26, row: 16 },
    },
    {
      type: "text",
      content: "Content-Type: application/json",
      position: { col: 26, row: 17 },
    },
    // Response
    {
      type: "component",
      componentType: "card",
      position: { col: 24, row: 21 },
      width: 54,
      height: 16,
      label: "Response — 200 OK",
    },
    { type: "text", content: "{", position: { col: 26, row: 24 } },
    {
      type: "text",
      content: '  "id": "usr_123",',
      position: { col: 26, row: 25 },
    },
    {
      type: "text",
      content: '  "email": "alice@acme.co",',
      position: { col: 26, row: 26 },
    },
    {
      type: "text",
      content: '  "name": "Alice Lee",',
      position: { col: 26, row: 27 },
    },
    {
      type: "text",
      content: '  "role": "admin",',
      position: { col: 26, row: 28 },
    },
    {
      type: "text",
      content: '  "created_at": "2026-01-15",',
      position: { col: 26, row: 29 },
    },
    { type: "text", content: '  "team": {', position: { col: 26, row: 30 } },
    {
      type: "text",
      content: '    "id": "team_456",',
      position: { col: 26, row: 31 },
    },
    {
      type: "text",
      content: '    "name": "Engineering"',
      position: { col: 26, row: 32 },
    },
    { type: "text", content: "  }", position: { col: 26, row: 33 } },
    { type: "text", content: "}", position: { col: 26, row: 34 } },
    // Error codes
    {
      type: "component",
      componentType: "table",
      position: { col: 24, row: 38 },
      width: 54,
      height: 6,
      columns: ["Status", "Description"],
      rows: [
        ["200", "User found"],
        ["401", "Unauthorized — invalid token"],
        ["404", "User not found"],
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// 20. Calendar / Schedule App
// ═══════════════════════════════════════════════════════════════
const calendarApp: DemoLayout = {
  name: "Calendar App",
  objects: [
    {
      type: "component",
      componentType: "browser",
      position: { col: 0, row: 0 },
      width: 78,
      height: 42,
      label: "calendar.app/week",
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 3 },
      width: 76,
      height: 3,
      navItems: ["◷ Calendar", "Day", "Week", "Month", "⊕ Event", "⍥"],
    },
    {
      type: "text",
      content: "← February 2026 →",
      position: { col: 30, row: 7 },
    },
    // Day headers
    { type: "text", content: "Mon 16", position: { col: 3, row: 9 } },
    { type: "text", content: "Tue 17", position: { col: 14, row: 9 } },
    { type: "text", content: "Wed 18", position: { col: 25, row: 9 } },
    { type: "text", content: "Thu 19", position: { col: 36, row: 9 } },
    { type: "text", content: "Fri 20", position: { col: 47, row: 9 } },
    { type: "text", content: "Sat 21", position: { col: 58, row: 9 } },
    { type: "text", content: "Sun 22", position: { col: 69, row: 9 } },
    {
      type: "component",
      componentType: "divider",
      position: { col: 1, row: 10 },
      width: 76,
    },
    // Time labels
    { type: "text", content: "9am", position: { col: 1, row: 12 } },
    { type: "text", content: "10am", position: { col: 1, row: 16 } },
    { type: "text", content: "11am", position: { col: 1, row: 20 } },
    { type: "text", content: "12pm", position: { col: 1, row: 24 } },
    { type: "text", content: "1pm", position: { col: 1, row: 28 } },
    { type: "text", content: "2pm", position: { col: 1, row: 32 } },
    { type: "text", content: "3pm", position: { col: 1, row: 36 } },
    // Events
    {
      type: "box",
      position: { col: 6, row: 12 },
      width: 9,
      height: 4,
      label: "Standup",
      borderStyle: "rounded",
      fill: "solid",
    },
    {
      type: "box",
      position: { col: 17, row: 12 },
      width: 9,
      height: 4,
      label: "Standup",
      borderStyle: "rounded",
      fill: "solid",
    },
    {
      type: "box",
      position: { col: 28, row: 12 },
      width: 9,
      height: 4,
      label: "Standup",
      borderStyle: "rounded",
      fill: "solid",
    },
    {
      type: "box",
      position: { col: 39, row: 12 },
      width: 9,
      height: 4,
      label: "Standup",
      borderStyle: "rounded",
      fill: "solid",
    },
    {
      type: "box",
      position: { col: 50, row: 12 },
      width: 9,
      height: 4,
      label: "Standup",
      borderStyle: "rounded",
      fill: "solid",
    },
    // Longer events
    {
      type: "box",
      position: { col: 17, row: 18 },
      width: 9,
      height: 8,
      label: "Sprint",
      borderStyle: "heavy",
      fill: "solid",
    },
    { type: "text", content: "Review", position: { col: 18, row: 21 } },
    {
      type: "box",
      position: { col: 39, row: 20 },
      width: 9,
      height: 6,
      label: "Design",
      borderStyle: "double",
      fill: "solid",
    },
    { type: "text", content: "Review", position: { col: 40, row: 23 } },
    {
      type: "box",
      position: { col: 50, row: 28 },
      width: 9,
      height: 4,
      label: "1:1",
      borderStyle: "rounded",
      fill: "solid",
    },
    {
      type: "box",
      position: { col: 6, row: 24 },
      width: 9,
      height: 8,
      label: "Deep",
      borderStyle: "single",
      fill: "solid",
    },
    { type: "text", content: "Work", position: { col: 8, row: 27 } },
    {
      type: "box",
      position: { col: 28, row: 28 },
      width: 9,
      height: 6,
      label: "Retro",
      borderStyle: "heavy",
      fill: "solid",
    },
    // Legend
    {
      type: "component",
      componentType: "alert",
      position: { col: 1, row: 38 },
      width: 76,
      height: 3,
      label: "3 conflicts this week — click to resolve",
      alertType: "warning",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Collect all layouts
// ═══════════════════════════════════════════════════════════════

const showcaseLayouts: DemoLayout[] = SHOWCASE_LAYOUTS.map((l) => ({
  name: l.name,
  objects: l.objects,
}));

const newLayouts: DemoLayout[] = [
  architectureDiagram,
  cicdPipeline,
  erDiagram,
  userFlow,
  networkTopology,
  stateMachine,
  orgChart,
  musicPlayer,
  apiDocs,
  calendarApp,
];

const allLayouts = [...showcaseLayouts, ...newLayouts];

// Generate URLs
for (const layout of allLayouts) {
  const { objects: filled, layer: defaultLayer } = fillDefaults(layout.objects);
  const { objects: finalObjects, layers } = resolveLayers(
    filled,
    defaultLayer,
    layout.layers
  );
  const encoded = encodeDocument(finalObjects, layers);
  const url = `${BASE_URL}/#${encoded}`;
  console.log(`${layout.name}\t${url}`);
}
