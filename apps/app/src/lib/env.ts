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
