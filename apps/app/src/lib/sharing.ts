import { encodeDocument, type Layer, type WireObject } from "@wiretext/engine";

export function getShareUrl(objects: WireObject[], layers: Layer[]): string {
  const encoded = encodeDocument(objects, layers);
  return `${window.location.origin}${window.location.pathname}#${encoded}`;
}
