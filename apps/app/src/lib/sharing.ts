import { encodeDocument } from "@wiretext/engine";
import type { Layer, WireObject } from "@wiretext/engine";

/**
 * Build a self-contained share link that carries the whole document in the URL
 * fragment (`#…`). The engine's `encodeDocument` produces the compressed payload
 * (the same codec `decodeDocument` reads on load); putting it after `#` keeps it
 * client-side, so this link needs no server or Redis, unlike the short `/w/:id`
 * links minted by the /api/share route. The trade-off is length: large documents
 * make long URLs, which is why the hosted short-link path also exists.
 */
export const getShareUrl = (objects: WireObject[], layers: Layer[]): string => {
  const encoded = encodeDocument(objects, layers);
  return `${window.location.origin}${window.location.pathname}#${encoded}`;
};
