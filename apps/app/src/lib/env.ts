/**
 * Project env schema: the single place that reads environment variables.
 * Values are read server-side and handed to client components as props,
 * so nothing depends on build-time inlining into the client bundle.
 *
 * Read via globalThis because the share route runs on the Edge runtime,
 * which exposes process.env but cannot import the node:process module.
 */
const { env } = globalThis.process;

export const serverEnv = {
  posthogKey: env.NEXT_PUBLIC_POSTHOG_KEY,
  upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN,
  upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL,
};

/**
 * Whether the hosted short-link store is available. Both Upstash credentials
 * must be present and non-empty; a self-hosted fork without them keeps the
 * editor and the `#…` fragment share (lib/sharing.ts) working, while `/api/share`
 * and `/w/:id` degrade gracefully instead of throwing (see lib/redis.ts).
 */
export const isRedisConfigured =
  serverEnv.upstashRedisRestUrl !== undefined &&
  serverEnv.upstashRedisRestUrl !== "" &&
  serverEnv.upstashRedisRestToken !== undefined &&
  serverEnv.upstashRedisRestToken !== "";
