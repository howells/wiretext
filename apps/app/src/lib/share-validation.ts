import { decodeDocument } from "@wiretext/engine";

// Structural limits enforced on shared documents beyond what decodeDocument
// checks. Documents exceeding these are rejected before storage.
const MAX_OBJECTS = 500;
const MAX_LAYERS = 50;

const VALID_OBJECT_TYPES = new Set([
  "box",
  "text",
  "line",
  "arrow",
  "connector",
  "component",
]);

const isObjectLike = (value: unknown): boolean =>
  value !== null && typeof value === "object";

/** Structural validation beyond what decodeDocument checks */
export const isValidDocument = (data: string): boolean => {
  const doc = decodeDocument(data);
  if (!doc) {
    return false;
  }
  if (!(Array.isArray(doc.objects) && Array.isArray(doc.layers))) {
    return false;
  }
  if (doc.objects.length > MAX_OBJECTS) {
    return false;
  }
  if (doc.layers.length > MAX_LAYERS) {
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
