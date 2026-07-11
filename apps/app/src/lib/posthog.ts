import posthog from "posthog-js";

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
