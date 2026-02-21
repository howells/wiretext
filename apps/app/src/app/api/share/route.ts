import { Ratelimit } from "@upstash/ratelimit";
import { decodeDocument } from "@wiretext/engine";
import { nanoid } from "nanoid";
import { redis } from "@/lib/redis";

export const runtime = "edge";

const MAX_PAYLOAD_BYTES = 100_000;
const SHORT_ID_LENGTH = 8;

const VALID_OBJECT_TYPES = new Set([
  "box",
  "text",
  "line",
  "arrow",
  "component",
]);

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

/** Structural validation beyond what decodeDocument checks */
function isValidDocument(data: string): boolean {
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
    if (!obj || typeof obj !== "object") {
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
    if (!layer || typeof layer !== "object") {
      return false;
    }
    if (typeof layer.id !== "string" || typeof layer.name !== "string") {
      return false;
    }
  }

  return true;
}

export async function POST(req: Request) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success, reset } = await ratelimit.limit(ip);
  if (!success) {
    return Response.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  // Check Content-Length header
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  // Parse body
  let data: string;
  try {
    const body = await req.json();
    data = body?.data;
    if (typeof data !== "string" || data.length === 0) {
      return Response.json({ error: "Missing data field" }, { status: 400 });
    }
    if (data.length > MAX_PAYLOAD_BYTES) {
      return Response.json({ error: "Payload too large" }, { status: 413 });
    }
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate document structure
  if (!isValidDocument(data)) {
    return Response.json({ error: "Invalid document" }, { status: 400 });
  }

  // Generate short ID and store
  const id = nanoid(SHORT_ID_LENGTH);
  await redis.set(id, data);

  const origin =
    req.headers.get("origin") ??
    req.headers
      .get("x-forwarded-proto")
      ?.concat("://", req.headers.get("host") ?? "wiretext.app") ??
    "https://wiretext.app";
  const url = `${origin}/w/${id}`;

  return Response.json({ id, url }, { status: 201 });
}
