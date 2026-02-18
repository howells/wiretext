import { resolve } from "node:path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["server.ts"],
  format: ["esm"],
  target: "node20",
  bundle: true,
  minify: true,
  banner: { js: "#!/usr/bin/env node" },
  noExternal: [/.*/],
  esbuildOptions(options) {
    options.alias = {
      "@": resolve(process.cwd(), "../src"),
    };
    options.nodePaths = [resolve(process.cwd(), "node_modules")];
  },
});
