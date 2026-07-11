"use client";

import { Fragment, useEffect } from "react";

import { initPostHog } from "@/lib/posthog";

export const PostHogProvider = ({
  children,
  posthogKey,
}: {
  children: React.ReactNode;
  posthogKey: string | undefined;
}) => {
  useEffect(() => {
    initPostHog(posthogKey);
  }, [posthogKey]);

  // Keyed fragment keeps this a pure pass-through with a stable identity
  return <Fragment key="posthog">{children}</Fragment>;
};
