"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="font-bold text-lg">Something went wrong</h2>
      <button
        className="rounded border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
