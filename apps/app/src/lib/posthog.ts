import posthog from "posthog-js";

// Flipped to true once init succeeds. Read by lib/analytics.ts so capture
// helpers no-op cleanly on a keyless clone instead of triggering posthog-js
// "not initialized" warnings.
let initialized = false;

/** Whether PostHog was initialized with a key on this client. */
export const isPostHogEnabled = (): boolean => initialized;

/**
 * Initialize PostHog on the client, but only when a key is present.
 *
 * The key comes from server env (see env.ts) and is passed down as a prop; an
 * unset or empty key makes this a no-op, so a fork without analytics credentials
 * simply runs untracked. Analytics is reverse-proxied through `/ingest` to dodge
 * ad blockers, and session recording is disabled by default.
 */
export const initPostHog = (key: string | undefined) => {
  if (typeof window === "undefined" || key === undefined || key === "") {
    return;
  }

  initialized = true;
  posthog.init(key, {
    api_host: "/ingest",
    capture_exceptions: true,
    capture_pageleave: true,
    capture_pageview: true,
    disable_session_recording: true,
    person_profiles: "identified_only",
    ui_host: "https://eu.posthog.com",
  });
};
