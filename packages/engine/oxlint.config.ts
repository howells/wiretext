import core from "@howells/lint/oxlint/core";

export default {
  extends: [core],
  overrides: [
    {
      // ObjectId/LayerId are deliberate domain vocabulary in the public API,
      // not redundant aliases — they document intent at every use site.
      files: ["src/types.ts"],
      rules: { "sonarjs/redundant-type-aliases": "off" },
    },
  ],
};
