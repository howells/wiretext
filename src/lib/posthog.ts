import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function initPostHog() {
  if (typeof window === "undefined" || !POSTHOG_KEY) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: "/i",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    capture_exceptions: true,
    disable_session_recording: true,
    disable_compression: true,
    ui_host: "https://eu.posthog.com",
  });
}
