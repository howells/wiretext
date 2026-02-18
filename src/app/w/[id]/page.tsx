import { notFound } from "next/navigation";
import { EditorShell } from "@/components/editor/editor-shell";
import { redis } from "@/lib/redis";
import { decodeDocument } from "@/lib/sharing";

export const runtime = "edge";

export default async function ShortUrlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await redis.get<string>(id);
  if (!data) {
    notFound();
  }

  const doc = decodeDocument(data);
  if (!doc) {
    notFound();
  }

  return <EditorShell initialDocument={doc} />;
}
