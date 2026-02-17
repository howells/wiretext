import type { Metadata } from "next";
import { SHOWCASE_LAYOUTS } from "@/data/showcase-layouts";
import { compose, gridToString } from "@/engine/compose";
import { computeRenderGridSize, fillDefaults } from "@/engine/defaults";
import { encodeDocument } from "@/lib/sharing";

export const metadata: Metadata = {
  title: "Showcase — Wiretext",
  description:
    "10 ambitious UI layouts built entirely with Wiretext's ASCII wireframe engine. Dashboards, e-commerce, email clients, and more.",
};

const BASE_URL = "https://wiretext.app";

function renderLayout(objects: (typeof SHOWCASE_LAYOUTS)[number]["objects"]) {
  const { objects: filled, layer } = fillDefaults(objects);
  const gridSize = computeRenderGridSize(filled);
  const grid = compose(filled, gridSize, [layer]);
  const ascii = gridToString(grid);
  const encoded = encodeDocument(filled, [layer]);
  const url = `${BASE_URL}/#${encoded}`;
  return { ascii, url };
}

export default function ShowcasePage() {
  const rendered = SHOWCASE_LAYOUTS.map((layout) => ({
    ...layout,
    ...renderLayout(layout.objects),
  }));

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        padding: "3rem 2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1
          style={{
            color: "#e0e0e0",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Wiretext Showcase
        </h1>
        <p
          style={{
            color: "#888",
            fontSize: "1rem",
            marginBottom: "3rem",
            lineHeight: 1.5,
          }}
        >
          10 ambitious UI layouts built entirely with Wiretext&apos;s ASCII
          wireframe engine. Every character you see is rendered from structured
          JSON objects — no manual drawing.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {rendered.map((layout, i) => (
            <div
              key={layout.name}
              style={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid #222",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      color: "#e0e0e0",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    <span style={{ color: "#555", marginRight: "0.5rem" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {layout.name}
                  </h2>
                  <p
                    style={{
                      color: "#777",
                      fontSize: "0.85rem",
                      margin: "0.25rem 0 0",
                    }}
                  >
                    {layout.description}
                  </p>
                </div>
                <a
                  href={layout.url}
                  style={{
                    color: "#0a0a0a",
                    background: "#e0e0e0",
                    padding: "0.4rem 1rem",
                    borderRadius: 4,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  target="_blank"
                >
                  Open in Editor →
                </a>
              </div>
              <div style={{ padding: "1.5rem", overflowX: "auto" }}>
                <pre
                  style={{
                    color: "#c8d6e5",
                    fontSize: "13px",
                    lineHeight: "1.3",
                    fontFamily: "var(--font-mono), monospace",
                    whiteSpace: "pre",
                    margin: 0,
                  }}
                >
                  {layout.ascii}
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "3rem 0 1rem",
            color: "#555",
            fontSize: "0.85rem",
          }}
        >
          Built with{" "}
          <a href="/" style={{ color: "#888", textDecoration: "underline" }}>
            Wiretext
          </a>
        </div>
      </div>
    </div>
  );
}
