import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { nanoid } from "nanoid";

import type { Layer, WireObject } from "./types";

export interface DocumentV2 {
  layers: Layer[];
  objects: WireObject[];
  version: 2;
}

export type DecodedDocument = DocumentV2;

/** Encode a document with layers into a shareable string */
export const encodeDocument = (
  objects: WireObject[],
  layers: Layer[]
): string => {
  const doc: DocumentV2 = { layers, objects, version: 2 };
  const json = JSON.stringify(doc);
  return compressToEncodedURIComponent(json);
};

/** Migrate a V1 (raw array) document to V2 by creating a default layer */
const migrateV1 = (objects: WireObject[]): DocumentV2 => {
  const layerId = nanoid();
  const layer: Layer = {
    id: layerId,
    locked: false,
    name: "Layer 1",
    visible: true,
  };
  const migrated = objects.map((obj) => ({
    ...obj,
    layerId: obj.layerId ?? layerId,
  }));
  return { layers: [layer], objects: migrated, version: 2 };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isDocumentV2 = (value: unknown): value is DocumentV2 =>
  isRecord(value) && value.version === 2;

/**
 * Trust boundary for legacy V1 payloads: a bare array of wire objects.
 * The element shape is trusted rather than exhaustively validated, matching
 * the original raw-array format.
 */
const isLegacyObjectArray = (value: unknown): value is WireObject[] =>
  Array.isArray(value);

/**
 * Decode a shared hash back into a document, or null on any malformed input.
 *
 * This is the trust boundary for untrusted URLs: decompression failures, bad
 * JSON, and unrecognized shapes all collapse to null rather than throwing, so
 * callers handle a single "couldn't load" case. Legacy V1 (bare array) payloads
 * are migrated to V2 with a default layer.
 */
export const decodeDocument = (hash: string): DecodedDocument | null => {
  try {
    const json = decompressFromEncodedURIComponent(hash);
    if (!json) {
      return null;
    }
    const parsed: unknown = JSON.parse(json);

    if (isDocumentV2(parsed)) {
      return parsed;
    }

    if (isLegacyObjectArray(parsed)) {
      return migrateV1(parsed);
    }

    return null;
  } catch {
    return null;
  }
};
