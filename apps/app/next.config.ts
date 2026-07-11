import type { NextConfig } from "next";

// PostHog reverse-proxy rewrites so analytics requests are first-party
const POSTHOG_REWRITES = [
  {
    destination: "https://eu-assets.i.posthog.com/static/:path*",
    source: "/ingest/static/:path*",
  },
  {
    destination: "https://eu.i.posthog.com/decide",
    source: "/ingest/decide",
  },
  {
    destination: "https://eu.i.posthog.com/:path*",
    source: "/ingest/:path*",
  },
];

const nextConfig: NextConfig = {
  async rewrites() {
    return await Promise.resolve(POSTHOG_REWRITES);
  },
  skipTrailingSlashRedirect: true,
  transpilePackages: ["@wiretext/engine"],
};

export default nextConfig;
