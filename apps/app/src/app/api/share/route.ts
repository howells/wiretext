import { Ratelimit } from "@upstash/ratelimit";
import { decodeDocument } from "@wiretext/engine";
import { nanoid } from "nanoid";

import { redis } from "@/lib/redis";

// Mints short `/w/:id` share links by persisting an encoded document to Upstash
// Redis. Runs on the Edge runtime and is the untrusted-input boundary of the
// hosted service: requests are IP rate-limited, size-capped (Content-Length and
// body), and structurally revalidated before storage. Requires UPSTASH_* creds
// (see lib/redis.ts) — without them redis.set rejects and POST 500s, while the
// client-side `#…` fragment share still works.
export const runtime = "edge";

const MAX_PAYLOAD_BYTES = 100_000;
const SHORT_ID_LENGTH = 8;

const VALID_OBJECT_TYPES = new Set([
  "box",
  "text",
  "line",
  "arrow",
  "connector",
  "component",
]);

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  redis,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

const isObjectLike = (value: unknown): boolean =>
  value !== null && typeof value === "object";

/** Structural validation beyond what decodeDocument checks */
const isValidDocument = (data: string): boolean => {
  const doc = decodeDocument(data);
  if (!doc) {
    return false;
  }
  if (!(Array.isArray(doc.objects) && Array.isArray(doc.layers))) {
    return false;
  }
  if (doc.objects.length > 500) {
    return false;
  }
  if (doc.layers.length > 50) {
    return false;
  }

  for (const obj of doc.objects) {
    if (!isObjectLike(obj)) {
      return false;
    }
    if (!VALID_OBJECT_TYPES.has(obj.type)) {
      return false;
    }
    if (typeof obj.id !== "string") {
      return false;
    }
  }

  for (const layer of doc.layers) {
    if (!isObjectLike(layer)) {
      return false;
    }
    if (typeof layer.id !== "string" || typeof layer.name !== "string") {
      return false;
    }
  }

  return true;
};

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

const handleSharePost = async (req: Request) => {
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

  // Generate short ID and store
  const id = nanoid(SHORT_ID_LENGTH);
  await redis.set(id, data);

  const url = `${resolveOrigin(req)}/w/${id}`;

  return Response.json({ id, url }, { status: 201 });
};

export { handleSharePost as POST };
