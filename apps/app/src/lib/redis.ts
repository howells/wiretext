import { Redis } from "@upstash/redis";

import { serverEnv } from "./env";

/**
 * Upstash Redis client backing the hosted short-link store (`/api/share` writes,
 * `/w/:id` reads). This is the boundary to the paid hosted service: with the
 * UPSTASH_* env vars unset the client falls back to empty url/token and every
 * call rejects at request time, so a self-hosted fork loses short links but the
 * offline `#…` fragment share (see lib/sharing.ts) keeps working.
 */
export const redis = new Redis({
  token: serverEnv.upstashRedisRestToken ?? "",
  url: serverEnv.upstashRedisRestUrl ?? "",
});
