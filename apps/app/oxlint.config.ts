import next from "@howells/lint/oxlint/next";

export default {
  extends: [next],
  overrides: [
    // hand-authored example-layout catalog; length is data, not logic
    { files: ["src/data/showcase-layouts.ts"], rules: { "max-lines": "off" } },
  ],
};
