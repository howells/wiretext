/**
 * One-time script: pre-generate short URLs for all showcase layouts.
 *
 * Usage:
 *   1. Start the dev server: `npm run dev`
 *   2. Run: `npx tsx scripts/generate-example-urls.ts`
 *
 * The script will POST each layout to /api/share and print shortIds
 * to paste into showcase-layouts.ts.
 */

import { encodeDocument, fillDefaults } from "@wiretext/engine";

import { SHOWCASE_LAYOUTS } from "../apps/app/src/data/showcase-layouts";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

interface ShareResponse {
  id: string;
  url: string;
}

async function generateUrls() {
  const results: { name: string; shortId: string }[] = [];

  for (const layout of SHOWCASE_LAYOUTS) {
    const { objects: filled, layer } = fillDefaults(layout.objects);
    const encoded = encodeDocument(filled, [layer]);

    const res = await fetch(`${BASE}/api/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: encoded }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed for "${layout.name}": ${res.status} ${text}`);
      continue;
    }

    const { id } = (await res.json()) as ShareResponse;
    results.push({ name: layout.name, shortId: id });
    console.log(`  "${layout.name}" → ${id}`);

    // Small delay to avoid rate limiting (20 req/min)
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n\nPaste these shortIds into showcase-layouts.ts:\n");
  for (const { name, shortId } of results) {
    console.log(`  // ${name}`);
    console.log(`  shortId: "${shortId}",`);
  }
}

generateUrls().catch(console.error);
