import { decodeDocument } from "@wiretext/engine";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorShell } from "@/components/editor/editor-shell";
import { redis } from "@/lib/redis";

export const runtime = "edge";

interface Params {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Wireframe ${id} — Wiretext`,
    description: "A shared wireframe created with Wiretext.",
    robots: { index: false },
  };
}

export default async function ShortUrlPage({
  params,
}: {
  params: Promise<Params>;
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
