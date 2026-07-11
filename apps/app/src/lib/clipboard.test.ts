import type { BoxObject, GridSize } from "@wiretext/engine";
import { describe, expect, it } from "vitest";

import { composeToGitHub } from "./clipboard";

const gridSize: GridSize = { cols: 20, rows: 10 };

const box: BoxObject = {
  borderStyle: "single",
  height: 3,
  id: "1",
  layerId: "layer-1",
  position: { col: 0, row: 0 },
  type: "box",
  width: 6,
  zIndex: 0,
};

describe("composeToGitHub", () => {
  it("wraps output in a collapsible details tag with code fence", () => {
    const result = composeToGitHub([box], gridSize);
    expect(result).toContain("<details>");
    expect(result).toContain("<summary>Wireframe</summary>");
    expect(result).toContain("```");
    expect(result).toContain("</details>");
  });

  it("includes share URL when provided", () => {
    const url = "https://wiretext.app#abc123";
    const result = composeToGitHub([box], gridSize, url);
    expect(result).toContain(`[Edit in Wiretext](${url})`);
  });

  it("omits share link when no URL provided", () => {
    const result = composeToGitHub([box], gridSize);
    expect(result).not.toContain("Edit in Wiretext");
  });

  it("renders the wireframe content inside the code fence", () => {
    const result = composeToGitHub([box], gridSize);
    expect(result).toContain("┌────┐");
    expect(result).toContain("└────┘");
  });
});
