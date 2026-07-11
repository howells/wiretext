# Open-source readiness backlog

Status: proposed (generated from a full-repo review, 2026-07-11)
Scope: everything needed for the code to read well publicly. Verified findings only —
each item cites the evidence. No secrets exist in tracked files or git history;
`.env.local` is untracked and correctly ignored.

## P0 — before flipping the repo public

1. **Fix diverged `BORDERLESS_COMPONENTS` (real bug).**
   `apps/app/src/components/editor/properties-panel.tsx:31` redeclares the set but omits
   `checkbox`/`radio`, so the Inspector shows Border/Fill controls for components the engine
   renders borderless. Import the engine's set from `@wiretext/engine` instead. Also dedupe the
   engine-internal copy in `packages/engine/src/compose.ts:23` (import from `min-width.ts`). — S

2. **Correct `repository.url` in published packages.**
   `apps/cli/package.json` and `apps/mcp/package.json` point at `github.com/howells/wiretext`;
   the actual remote is `github.com/commoninstruments/wiretext`. npm's Repository links will 404.
   Decide the final home first. — S

3. **Fix or delete broken `scripts/*.ts`.**
   All four (`capture-demo`, `generate-demo-urls`, `generate-example-urls`, `generate-layouts`)
   import pre-monorepo paths (`../src/engine/*`, `../src/lib/sharing`, `../src/data/showcase-layouts`)
   that no longer exist. Broken scripts in a public repo read badly. Either repoint at
   `@wiretext/engine` / `apps/app/src/data`, or delete. — S–M

4. **Add test CI; reconsider auto-publish.**
   `.github/workflows/publish.yml` is the only workflow: it auto-publishes to npm on any push to
   main touching package paths, and there is no PR check at all. Add `ci.yml`
   (pnpm install → build → typecheck → lint → test) on PRs + main, and switch publish to
   tag- or manually-triggered before accepting outside PRs. — M

5. **Remove dangling agent-tooling artifacts.**
   `.claude/skills/agent-dx-cli-scale` is a tracked symlink to untracked `.agents/` content
   (dangling in every fresh clone); `skills-lock.json` is tracked but empty. Delete both or
   track the real content. — S

6. **Clean the working tree.** Commit the pending Next.js 16.2.6 bump
   (`apps/app/package.json` + lockfile) or discard it. — S

## P1 — the clone-and-run story

7. **Guard the Upstash client.** `apps/app/src/lib/redis.ts:3` constructs the client with
   empty strings when env vars are absent → keyless clones 500 on `/api/share` and `/w/[id]`.
   Export a nullable client, return 503 from the share route (the client already falls back to
   hash URLs, `editor-shell.tsx:139`), and render a friendly state on `/w/[id]`. — S

8. **Gate analytics on key presence.** `apps/app/src/lib/analytics.ts` helpers call
   `posthog.capture` unconditionally even when `NEXT_PUBLIC_POSTHOG_KEY` is unset. Add one
   "analytics enabled" check so keyless clones are visibly no-op. — S

9. **README: hosted vs self-hosted section + contributing.**
   Spell out: `render`/`create` are fully offline; `share`/MCP `create_wireframe` hit
   `https://wiretext.app/api/share` by default (overridable via `--base-url`/`baseUrl`);
   self-hosting the app needs `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   (PostHog key optional). Dedupe the two identical `.env.example` files (root one is
   misplaced; only `apps/app` consumes the vars) and comment which vars are optional.
   Add a 3-line Contributing section (install/build/test, PRs welcome) — full
   CONTRIBUTING.md/CoC is ceremony at this size. — S

10. **Give the README visuals.** `wiretext-demo.gif` (868K) + `screenshots/` (~1.4MB) are
    tracked but referenced by nothing. Embed the GIF and 1–2 screenshots, or delete the
    assets. A visual tool's README currently has zero visuals. — S

## P2 — code polish for public reading

11. **MCP fixes** (`apps/mcp/src/server.ts`): version hardcoded as `"0.1.0"` vs package 0.3.3
    (import from package.json); `main()` lacks `.catch` → unhandled rejection on connect
    failure; tool description says short URL `wiretext.app/w/abc12345` while README says hash
    URL — make them agree with what `/api/share` actually returns; reconcile the object-type
    list (README omits `connector`/`component`). — S

12. **CLI packaging:** move `@howells/cli` (lint-only, never imported) from `dependencies`
    to `devDependencies` in `apps/cli/package.json`. — S

13. **CLI ergonomics** (`apps/cli/src/index.ts`): distinct error `code`s per failure class
    (everything except `UNKNOWN_COMMAND` collapses to `"ERROR"`, undercutting the JSON
    envelope); catch transport-level fetch failures in `postShare` with an actionable
    message; TTY-with-no-file invocations hang silently on `readFileSync(0)` — print a
    stdin hint; document or remove the hidden `--output json` alias; drop the cryptic
    "Axis N:" comment prefixes (keep the plain-English halves). — S–M

14. **Engine DRY polish** (`packages/engine/src/compose.ts`): merge near-twin
    `setChar`/`forceSetChar`; extract the segment loop shared by `stampLine`/`stampArrow`;
    export `Direction` from the index (currently public functions return/accept it while
    `getConnectorArrowHead` types it as bare `string`); delete the orphan `// Types` comment
    in `index.ts:3`. — S

15. **Share-route hardening** (`apps/app/src/app/api/share/route.ts:108`): keys are bare
    `nanoid(8)` — add a `doc:` prefix and `NX` with retry so a collision can't silently
    overwrite someone's document; add a one-line comment on the client-derived origin
    (or derive from `host` only). — S

16. **App tidy-ups:** rename `/test` route to `/showcase` (it's a deliberate, noindexed
    component gallery, but the name reads as abandoned scaffolding); delete the never-populated
    `ShowcaseLayout.shortId` field and its dead `href` branch
    (`examples-dialog.tsx:87`, `showcase-layouts.ts:7`). — S

## P3 — pre-contributor investment (optional now)

17. **CLI unit tests:** the pure input-hardening helpers (`validateBaseUrl`,
    `validateFilePath`, `validateHashValue`), `parseArgs`, and `parseInput` error paths are
    exactly the regression-prone logic on a public surface, currently untested. — M
18. **Engine test gaps:** direct tests for `getResizeConstraint` (branchy, zero references)
    and `getConnectorMidpoint`. — S
19. **App test gaps:** store history/grouping/z-order actions, pure geometry in
    `src/tools/select.ts` (`hitTest`, `getResizeHandle`, `objectIntersectsRect`),
    `isValidDocument` in the share route. — M
20. **Undo granularity:** `updateObject` snapshots history per keystroke; typing a long label
    flushes the 100-entry history. Coalesce continuous edits. — M
21. **`updateObject` typing:** repeated `as Partial<WireObject>` casts erase union safety;
    make it generic over the subtype, or document the tradeoff. — M

## Explicitly fine as-is (reviewed, no action)

- No secrets anywhere in tracked files or git history; `.gitignore` is solid.
- LICENSE (MIT, 2026 Daniel Howells) matches package metadata; README claims all verified.
- `compose.ts` (1,269 lines) is a flat catalog of ~40 tiny stampers — long, not a god file.
- The 566-line single-file CLI is well-sectioned; splitting would add ceremony.
- Store/properties-panel/select.ts sizes are justified and internally organized.
- `docs/plans/archive/connectors.md` is a shipped design doc that reads well publicly.
- `apps/cli/CONTEXT.md` ships in the npm tarball and is a genuinely good agent guide.
- Engine test suite: 482 passing tests, 6.4k test lines vs 4.1k source, real assertions.
