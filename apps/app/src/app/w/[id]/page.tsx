import { decodeDocument } from "@wiretext/engine";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
import { redis } from "@/lib/redis";

export const runtime = "edge";

interface Params {
  id: string;
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { id } = await params;
  return {
    description: "A shared wireframe created with Wiretext.",
    robots: { index: false },
    title: `Wireframe ${id} — Wiretext`,
  };
};

const SharingUnavailable = () => (
  <main className="fixed inset-0 flex items-center justify-center bg-bg p-6">
    <div className="max-w-md text-center">
      <h1 className="font-mono text-base text-text">
        Sharing isn’t configured on this deployment
      </h1>
      <p className="mt-2 text-sm text-text-dim leading-relaxed">
        Short links are served from a hosted store that this deployment doesn’t
        have credentials for. You can still open the editor and share wireframes
        with a self-contained link.
      </p>
      <Link
        className="mt-4 inline-block rounded border border-border bg-surface px-3 py-1.5 text-sm text-text-dim transition-colors hover:bg-surface-hover hover:text-text"
        href="/"
      >
        Open the editor
      </Link>
    </div>
  </main>
);

export default async function ShortUrlPage({
  params,
}: {
  params: Promise<Params>;
}) {
  // No hosted store on this deployment — render a friendly state rather than
  // crashing (see lib/redis.ts). Checked before awaiting params since that
  // path needs no id.
  if (redis === null) {
    return <SharingUnavailable />;
  }

  const { id } = await params;

  // Reads try the `doc:` prefixed key first, then fall back to the bare id.
  // Links minted before the prefix was introduced stored the document under the
  // bare id, so the fallback keeps those old `/w/:id` links working.
  const data =
    (await redis.get<string>(`doc:${id}`)) ?? (await redis.get<string>(id));
  if (data === null || data === "") {
    notFound();
  }

  const doc = decodeDocument(data);
  if (!doc) {
    notFound();
  }

  return <EditorShell initialDocument={doc} />;
}
