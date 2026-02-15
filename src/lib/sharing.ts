import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { nanoid } from "nanoid";
import type { Layer, WireObject } from "@/engine/types";

export interface DocumentV2 {
  version: 2;
  objects: WireObject[];
  layers: Layer[];
}

export type DecodedDocument = DocumentV2;

/** Encode a document with layers into a shareable string */
export function encodeDocument(objects: WireObject[], layers: Layer[]): string {
  const doc: DocumentV2 = { version: 2, objects, layers };
  const json = JSON.stringify(doc);
  return compressToEncodedURIComponent(json);
}

/** Migrate a V1 (raw array) document to V2 by creating a default layer */
function migrateV1(objects: WireObject[]): DocumentV2 {
  const layerId = nanoid();
  const layer: Layer = {
    id: layerId,
    name: "Layer 1",
    visible: true,
    locked: false,
  };
  const migrated = objects.map((obj) => ({
    ...obj,
    layerId: obj.layerId ?? layerId,
  }));
  return { version: 2, objects: migrated, layers: [layer] };
}

export function decodeDocument(hash: string): DecodedDocument | null {
  try {
    const json = decompressFromEncodedURIComponent(hash);
    if (!json) {
      return null;
    }
    const parsed = JSON.parse(json);

    // V2: object with version field
    if (parsed && typeof parsed === "object" && parsed.version === 2) {
      return parsed as DocumentV2;
    }

    // V1: raw array of objects
    if (Array.isArray(parsed)) {
      return migrateV1(parsed as WireObject[]);
    }

    return null;
  } catch {
    return null;
  }
}

export function getShareUrl(objects: WireObject[], layers: Layer[]): string {
  const encoded = encodeDocument(objects, layers);
  return `${window.location.origin}${window.location.pathname}#${encoded}`;
}
