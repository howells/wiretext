import { Ratelimit } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

import { redis } from "@/lib/redis";
import { isValidDocument } from "@/lib/share-validation";

// Mints short `/w/:id` share links by persisting an encoded document to Upstash
// Redis. Runs on the Edge runtime and is the untrusted-input boundary of the
// hosted service: requests are IP rate-limited, size-capped (Content-Length and
// body), and structurally revalidated before storage. Requires UPSTASH_* creds
// (see lib/redis.ts) — without them `redis` is null and POST answers 503, while
// the client-side `#…` fragment share still works.
export const runtime = "edge";

const MAX_PAYLOAD_BYTES = 100_000;
const SHORT_ID_LENGTH = 8;
// Attempts to mint a collision-free short id before giving up (nanoid(8)
// collisions are astronomically unlikely, so 3 is ample headroom).
const SHARE_ID_ATTEMPTS = 3;

const ratelimit =
  redis === null
    ? null
    : new Ratelimit({
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        redis,
      });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

/** Extract the share payload from the request body, or an error response. */
const readPayload = async (
  req: Request
): Promise<{ data: string } | { error: Response }> => {
  try {
    const body: unknown = await req.json();
    const value = isRecord(body) ? body.data : undefined;
    if (typeof value !== "string" || value.length === 0) {
      return {
        error: Response.json({ error: "Missing data field" }, { status: 400 }),
      };
    }
    if (value.length > MAX_PAYLOAD_BYTES) {
      return {
        error: Response.json({ error: "Payload too large" }, { status: 413 }),
      };
    }
    return { data: value };
  } catch {
    return {
      error: Response.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
};

/** Resolve the public origin for the share URL from request headers. */
const resolveOrigin = (req: Request): string => {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("host") ?? "wiretext.app";
  return (
    req.headers.get("origin") ??
    (forwardedProto === null
      ? undefined
      : `${forwardedProto}://${forwardedHost}`) ??
    "https://wiretext.app"
  );
};

/**
 * Persist the document under a `doc:` prefixed key, minting a fresh nanoid on
 * the rare collision. `nx: true` makes each write refuse to overwrite an
 * existing key, so a colliding id can never clobber another user's document.
 * No TTL is set: shared documents are intended to live indefinitely.
 * Returns the bare id (without the `doc:` prefix) or null if every attempt
 * collided.
 */
const storeDocument = async (
  client: Redis,
  data: string,
  attemptsLeft: number = SHARE_ID_ATTEMPTS
): Promise<string | null> => {
  if (attemptsLeft <= 0) {
    return null;
  }
  const id = nanoid(SHORT_ID_LENGTH);
  const result = await client.set(`doc:${id}`, data, { nx: true });
  if (result !== null) {
    return id;
  }
  return await storeDocument(client, data, attemptsLeft - 1);
};

const handleSharePost = async (req: Request) => {
  // Without Upstash credentials there is no store to write to; degrade
  // gracefully so a self-hosted clone doesn't 500. The client falls back to a
  // `#…` fragment share (see editor-shell.tsx).
  if (redis === null || ratelimit === null) {
    return Response.json(
      {
        error:
          "Sharing is not configured on this deployment. Self-hosting short links requires the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.",
      },
      { status: 503 }
    );
  }

  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success, reset } = await ratelimit.limit(ip);
  if (!success) {
    return Response.json(
      { error: "Rate limit exceeded" },
      {
        headers: {
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
        status: 429,
      }
    );
  }

  // Check Content-Length header
  const contentLength = req.headers.get("content-length");
  if (
    contentLength !== null &&
    contentLength !== "" &&
    Math.trunc(Number(contentLength)) > MAX_PAYLOAD_BYTES
  ) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  const payload = await readPayload(req);
  if ("error" in payload) {
    return payload.error;
  }
  const { data } = payload;

  // Validate document structure
  if (!isValidDocument(data)) {
    return Response.json({ error: "Invalid document" }, { status: 400 });
  }

  // Generate short ID and store under the `doc:` prefix (retrying on collision)
  const id = await storeDocument(redis, data);
  if (id === null) {
    return Response.json(
      { error: "Could not allocate a unique share id, please retry" },
      { status: 500 }
    );
  }

  const url = `${resolveOrigin(req)}/w/${id}`;

  return Response.json({ id, url }, { status: 201 });
};

export { handleSharePost as POST };
