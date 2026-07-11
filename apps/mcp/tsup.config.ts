import { defineConfig } from "tsup";

export default defineConfig({
  banner: { js: "#!/usr/bin/env node" },
  bundle: true,
  entry: ["src/server.ts"],
  format: ["esm"],
  minify: true,
  noExternal: [/.*/u],
  target: "node20",
});
