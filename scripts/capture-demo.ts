/**
 * Capture screenshots of all 20 wireframes and create an animated GIF.
 *
 * Usage: npx tsx scripts/capture-demo.ts
 *
 * Requires:
 *   - Dev server running on localhost:3000
 *   - Playwright browsers installed (npx playwright install chromium)
 *   - ffmpeg (brew install ffmpeg)
 */
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { SHOWCASE_LAYOUTS } from "../src/data/showcase-layouts";
import { fillDefaults, type MinimalObject } from "../src/engine/defaults";
import { resolveLayers } from "../src/engine/layers";
import { encodeDocument } from "../src/lib/sharing";

// ── Config ─────────────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL ?? "http://localhost:36000";
const OUTPUT_DIR = join(process.cwd(), "demo-captures");
const GIF_PATH = join(process.cwd(), "wiretext-demo.gif");
const MP4_PATH = join(process.cwd(), "wiretext-demo.mp4");
const VIEWPORT = { width: 1280, height: 800 };
const WAIT_MS = 500; // wait for render after navigation
const MAX_RETRIES = 3; // retry failed navigations

// ── Layout definitions ─────────────────────────────────────────
interface DemoLayout {
  name: string;
  objects: MinimalObject[];
  layers?: { id: string; name: string }[];
}

// 11. System Architecture Diagram
const architectureDiagram: DemoLayout = {
  name: "System Architecture Diagram",
  layers: [
    { id: "infra", name: "Infrastructure" },
    { id: "services", name: "Services" },
    { id: "flow", name: "Data Flow" },
    { id: "labels", name: "Labels" },
  ],
  objects: [
    {
      type: "text",
      content: "System Architecture — Microservices",
      position: { col: 18, row: 0 },
      layerId: "labels",
    },
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
      type: "component",
      componentType: "card",
      position: { col: 26, row: 4 },
      width: 20,
      height: 5,
      label: "Mobile (RN)",
      layerId: "services",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 48, row: 4 },
      width: 22,
      height: 5,
      label: "CLI Tool",
      layerId: "services",
    },
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
      type: "component",
      componentType: "card",
      position: { col: 2, row: 21 },
      width: 20,
      height: 5,
      label: "User Service",
      layerId: "services",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 24, row: 21 },
      width: 24,
      height: 5,
      label: "Order Service",
      layerId: "services",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 50, row: 21 },
      width: 20,
      height: 5,
      label: "Notification Svc",
      layerId: "services",
    },
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
      type: "component",
      componentType: "card",
      position: { col: 2, row: 36 },
      width: 20,
      height: 4,
      label: "PostgreSQL",
      layerId: "services",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 24, row: 36 },
      width: 24,
      height: 4,
      label: "Redis Cache",
      layerId: "services",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 50, row: 36 },
      width: 20,
      height: 4,
      label: "S3 Storage",
      layerId: "services",
    },
  ],
};

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
    {
      type: "arrow",
      position: { col: 61, row: 14 },
      endPosition: { col: 61, row: 17 },
    },
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

const erDiagram: DemoLayout = {
  name: "Database ER Diagram",
  objects: [
    {
      type: "text",
      content: "E-Commerce Database Schema",
      position: { col: 20, row: 0 },
    },
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

const userFlow: DemoLayout = {
  name: "User Onboarding Flow",
  objects: [
    {
      type: "text",
      content: "User Onboarding Flow",
      position: { col: 28, row: 0 },
    },
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
    {
      type: "box",
      position: { col: 60, row: 2 },
      width: 16,
      height: 5,
      label: "Onboarding",
      borderStyle: "heavy",
    },
    {
      type: "arrow",
      position: { col: 68, row: 7 },
      endPosition: { col: 68, row: 10 },
    },
    {
      type: "box",
      position: { col: 54, row: 10 },
      width: 22,
      height: 3,
      label: "Choose your role",
    },
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
    {
      type: "box",
      position: { col: 40, row: 26 },
      width: 20,
      height: 5,
      label: "Dashboard",
      borderStyle: "heavy",
    },
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
      height: 5,
      label: "Signup Rate",
    },
    { type: "text", content: "68% → 82%", position: { col: 2, row: 37 } },
    {
      type: "component",
      componentType: "card",
      position: { col: 20, row: 34 },
      width: 19,
      height: 5,
      label: "Verify Rate",
    },
    { type: "text", content: "45% → 71%", position: { col: 22, row: 37 } },
    {
      type: "component",
      componentType: "card",
      position: { col: 40, row: 34 },
      width: 19,
      height: 5,
      label: "Completion",
    },
    { type: "text", content: "30% → 55%", position: { col: 42, row: 37 } },
    {
      type: "component",
      componentType: "card",
      position: { col: 60, row: 34 },
      width: 19,
      height: 5,
      label: "Time to Value",
    },
    { type: "text", content: "12m → 4m", position: { col: 62, row: 37 } },
  ],
};

const networkTopology: DemoLayout = {
  name: "Network Topology",
  objects: [
    {
      type: "text",
      content: "Production Network Topology",
      position: { col: 20, row: 0 },
    },
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
    {
      type: "box",
      position: { col: 18, row: 17 },
      width: 34,
      height: 3,
      label: "Load Balancer (ALB)",
      borderStyle: "double",
    },
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
      type: "component",
      componentType: "card",
      position: { col: 12, row: 31 },
      width: 14,
      height: 4,
      label: "Primary (RW)",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 28, row: 31 },
      width: 14,
      height: 4,
      label: "Replica 1 (R)",
    },
    {
      type: "component",
      componentType: "card",
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

const stateMachine: DemoLayout = {
  name: "Order State Machine",
  objects: [
    {
      type: "text",
      content: "Order State Machine",
      position: { col: 24, row: 0 },
    },
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
    {
      type: "arrow",
      position: { col: 14, row: 10 },
      endPosition: { col: 20, row: 5 },
      startHead: false,
      endHead: true,
    },
    { type: "text", content: "retry", position: { col: 15, row: 8 } },
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

const orgChart: DemoLayout = {
  name: "Organization Chart",
  objects: [
    {
      type: "text",
      content: "Engineering Organization",
      position: { col: 22, row: 0 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 24, row: 2 },
      width: 20,
      height: 5,
      label: "CEO",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 26, row: 4 },
      label: "JC",
    },
    { type: "text", content: "Jane Chen", position: { col: 32, row: 5 } },
    {
      type: "line",
      position: { col: 34, row: 7 },
      endPosition: { col: 34, row: 9 },
    },
    {
      type: "line",
      position: { col: 12, row: 9 },
      endPosition: { col: 56, row: 9 },
    },
    {
      type: "line",
      position: { col: 12, row: 9 },
      endPosition: { col: 12, row: 10 },
    },
    {
      type: "line",
      position: { col: 34, row: 9 },
      endPosition: { col: 34, row: 10 },
    },
    {
      type: "line",
      position: { col: 56, row: 9 },
      endPosition: { col: 56, row: 10 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 2, row: 10 },
      width: 20,
      height: 5,
      label: "VP Engineering",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 4, row: 12 },
      label: "BK",
    },
    { type: "text", content: "Bob Kim", position: { col: 10, row: 13 } },
    {
      type: "component",
      componentType: "card",
      position: { col: 24, row: 10 },
      width: 20,
      height: 5,
      label: "VP Product",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 26, row: 12 },
      label: "AL",
    },
    { type: "text", content: "Alice Lee", position: { col: 32, row: 13 } },
    {
      type: "component",
      componentType: "card",
      position: { col: 46, row: 10 },
      width: 20,
      height: 5,
      label: "VP Design",
    },
    {
      type: "component",
      componentType: "avatar",
      position: { col: 48, row: 12 },
      label: "CS",
    },
    { type: "text", content: "Carol Sun", position: { col: 54, row: 13 } },
    {
      type: "line",
      position: { col: 12, row: 15 },
      endPosition: { col: 12, row: 17 },
    },
    {
      type: "line",
      position: { col: 4, row: 17 },
      endPosition: { col: 20, row: 17 },
    },
    {
      type: "line",
      position: { col: 4, row: 17 },
      endPosition: { col: 4, row: 18 },
    },
    {
      type: "line",
      position: { col: 20, row: 17 },
      endPosition: { col: 20, row: 18 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 0, row: 18 },
      width: 14,
      height: 7,
      label: "Frontend",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 2, row: 21 },
      items: ["React", "3 eng"],
      listStyle: "bullet",
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 16, row: 18 },
      width: 14,
      height: 7,
      label: "Backend",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 18, row: 21 },
      items: ["Go / Rust", "5 eng"],
      listStyle: "bullet",
    },
    {
      type: "line",
      position: { col: 34, row: 15 },
      endPosition: { col: 34, row: 18 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 30, row: 18 },
      width: 14,
      height: 7,
      label: "Product",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 32, row: 21 },
      items: ["Growth PM", "Core PM"],
      listStyle: "bullet",
    },
    {
      type: "line",
      position: { col: 56, row: 15 },
      endPosition: { col: 56, row: 18 },
    },
    {
      type: "component",
      componentType: "card",
      position: { col: 46, row: 18 },
      width: 20,
      height: 7,
      label: "Design",
    },
    {
      type: "component",
      componentType: "list",
      position: { col: 48, row: 21 },
      items: ["UX Research", "Visual Design", "Design Systems"],
      listStyle: "bullet",
    },
  ],
};

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
    },
    { type: "text", content: "2:15 / 5:23", position: { col: 42, row: 24 } },
    {
      type: "component",
      componentType: "icon",
      position: { col: 37, row: 26 },
      icon: "◀",
    },
    {
      type: "component",
      componentType: "button",
      position: { col: 41, row: 26 },
      width: 7,
      label: "▶",
      borderStyle: "heavy",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 50, row: 26 },
      icon: "▶",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 31, row: 26 },
      icon: "⟳",
    },
    {
      type: "component",
      componentType: "icon",
      position: { col: 56, row: 26 },
      icon: "♡",
    },
    {
      type: "component",
      componentType: "divider",
      position: { col: 23, row: 29 },
      width: 48,
      label: "Up Next",
    },
    {
      type: "text",
      content: "1. Electric Dreams — Neon Wave",
      position: { col: 24, row: 31 },
    },
    {
      type: "component",
      componentType: "navbar",
      position: { col: 1, row: 34 },
      width: 72,
      height: 3,
      navItems: ["◀", "▶ Playing", "♩ Midnight Highway", "≡"],
    },
    {
      type: "component",
      componentType: "progress",
      position: { col: 1, row: 37 },
      width: 72,
      progress: 65,
    },
  ],
};

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
    { type: "text", content: "9am", position: { col: 1, row: 12 } },
    { type: "text", content: "10am", position: { col: 1, row: 16 } },
    { type: "text", content: "11am", position: { col: 1, row: 20 } },
    { type: "text", content: "12pm", position: { col: 1, row: 24 } },
    { type: "text", content: "1pm", position: { col: 1, row: 28 } },
    { type: "text", content: "2pm", position: { col: 1, row: 32 } },
    { type: "text", content: "3pm", position: { col: 1, row: 36 } },
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

// ── Collect all 20 ─────────────────────────────────────────────
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

function generateUrl(layout: DemoLayout): string {
  const { objects: filled, layer: defaultLayer } = fillDefaults(layout.objects);
  const { objects: finalObjects, layers } = resolveLayers(
    filled,
    defaultLayer,
    layout.layers,
  );
  const encoded = encodeDocument(finalObjects, layers);
  return `${BASE_URL}/#${encoded}`;
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log(`Capturing ${allLayouts.length} wireframes...`);

  // Clean / create output dir
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();

  // Wait for the dev server to be ready
  console.log(`Connecting to ${BASE_URL}...`);
  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 10000 });
  } catch {
    console.error(
      `Could not connect to ${BASE_URL}. Is the dev server running?`,
    );
    console.error("Start it with: npm run dev");
    await browser.close();
    process.exit(1);
  }

  // Capture each wireframe
  for (let i = 0; i < allLayouts.length; i++) {
    const layout = allLayouts[i];
    const url = generateUrl(layout);
    const localUrl = url.replace("https://wiretext.app", BASE_URL);

    console.log(`  [${i + 1}/${allLayouts.length}] ${layout.name}`);

    let loaded = false;
    for (let attempt = 0; attempt < MAX_RETRIES && !loaded; attempt++) {
      if (attempt > 0) console.log(`    retry ${attempt}...`);
      // Navigate to the hash URL, then reload so the React component
      // mounts fresh and reads window.location.hash in useLayoutEffect.
      await page.goto(localUrl, { waitUntil: "commit", timeout: 15000 });
      await page.reload({ waitUntil: "networkidle", timeout: 15000 });
      // Wait for the editor to render objects (any span showing "N objects" where N > 0)
      loaded = await page
        .waitForFunction(
          () => {
            const spans = document.querySelectorAll("span");
            for (const s of spans) {
              const t = s.textContent ?? "";
              if (t.match(/\d+ objects/) && !t.includes("0 objects"))
                return true;
            }
            return false;
          },
          { timeout: 5000 },
        )
        .then(() => true)
        .catch(() => false);
    }

    if (!loaded) {
      console.warn(
        `    WARNING: ${layout.name} still shows 0 objects after ${MAX_RETRIES} attempts`,
      );
    }

    await page.waitForTimeout(WAIT_MS);

    // Screenshot
    const filename = `${String(i + 1).padStart(2, "0")}-${layout.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    await page.screenshot({
      path: join(OUTPUT_DIR, filename),
      fullPage: false,
    });
  }

  await browser.close();

  // List captured files
  const files = readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort();
  console.log(`\nCaptured ${files.length} screenshots in ${OUTPUT_DIR}`);

  // Create MP4 with ffmpeg (better for Twitter than GIF)
  console.log("\nCreating MP4 video...");
  const ffmpegCmd = [
    "ffmpeg -y",
    `-framerate 1/2`, // 2 seconds per frame
    `-i "${OUTPUT_DIR}/%02d-*.png"`,
    // Use glob pattern
    `-pattern_type glob`,
    `-i "${OUTPUT_DIR}/*.png"`,
    `-vf "scale=1280:800:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p"`,
    `-c:v libx264 -preset slow -crf 18`,
    `-movflags +faststart`,
    `"${MP4_PATH}"`,
  ].join(" ");

  // Simpler ffmpeg approach with explicit file list
  const fileList = files.map((f) => `file '${join(OUTPUT_DIR, f)}'`).join("\n");
  const listFile = join(OUTPUT_DIR, "filelist.txt");
  const { writeFileSync } = await import("node:fs");

  // Create concat demuxer file with durations
  const concatList = files
    .map((f) => `file '${join(OUTPUT_DIR, f)}'\nduration 0.8`)
    .join("\n");
  // Add last file again (ffmpeg concat requires it)
  const lastFile = files[files.length - 1];
  writeFileSync(
    listFile,
    `${concatList}\nfile '${join(OUTPUT_DIR, lastFile)}'`,
  );

  try {
    execSync(
      [
        "ffmpeg -y -f concat -safe 0",
        `-i "${listFile}"`,
        `-vf "scale=1280:800:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p"`,
        `-c:v libx264 -preset slow -crf 18`,
        `-movflags +faststart`,
        `"${MP4_PATH}"`,
      ].join(" "),
      { stdio: "pipe" },
    );
    console.log(`\nMP4 created: ${MP4_PATH}`);
  } catch (err) {
    console.error("ffmpeg MP4 failed, trying GIF...");
  }

  // Also create GIF as fallback
  try {
    execSync(
      [
        "ffmpeg -y -f concat -safe 0",
        `-i "${listFile}"`,
        `-vf "fps=1,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"`,
        `"${GIF_PATH}"`,
      ].join(" "),
      { stdio: "pipe" },
    );
    console.log(`GIF created: ${GIF_PATH}`);
  } catch (err) {
    console.error("ffmpeg GIF failed:", err);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
