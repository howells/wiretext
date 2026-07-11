import { Redis } from "@upstash/redis";

import { isRedisConfigured, serverEnv } from "./env";

/**
 * Upstash Redis client backing the hosted short-link store (`/api/share` writes,
 * `/w/:id` reads). This is the boundary to the paid hosted service.
 *
 * When the UPSTASH_* env vars are unset the client is `null` (see
 * {@link isRedisConfigured}) rather than a half-constructed instance with empty
 * credentials. Callers must null-check: `/api/share` answers 503 and `/w/:id`
 * renders a "sharing not configured" state, so a self-hosted fork loses short
 * links but the offline `#…` fragment share (lib/sharing.ts) keeps working.
 */
export const redis: Redis | null = isRedisConfigured
  ? new Redis({
      token: serverEnv.upstashRedisRestToken ?? "",
      url: serverEnv.upstashRedisRestUrl ?? "",
    })
  : null;
