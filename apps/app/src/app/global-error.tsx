"use client";

import NextError from "next/error";
import posthog from "posthog-js";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <NextError statusCode={0} />
          <button
            className="rounded border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
