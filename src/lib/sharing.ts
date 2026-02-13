import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import type { WireObject } from "@/engine/types";

export function encodeDocument(objects: WireObject[]): string {
  const json = JSON.stringify(objects);
  return compressToEncodedURIComponent(json);
}

export function decodeDocument(hash: string): WireObject[] | null {
  try {
    const json = decompressFromEncodedURIComponent(hash);
    if (!json) {
      return null;
    }
    return JSON.parse(json) as WireObject[];
  } catch {
    return null;
  }
}

export function getShareUrl(objects: WireObject[]): string {
  const encoded = encodeDocument(objects);
  return `${window.location.origin}${window.location.pathname}#${encoded}`;
}
