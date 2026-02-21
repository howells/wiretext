import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node20",
  bundle: true,
  minify: true,
  banner: { js: "#!/usr/bin/env node" },
  noExternal: [/.*/],
});
