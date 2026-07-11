import type { Metadata } from "next";

import { EditorShell } from "@/components/editor/editor-shell";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description:
    "A Unicode wireframe design tool where everything renders as box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.",
  title: "Wiretext — Unicode Wireframe Design Tool",
};

export default function EditorPage() {
  return <EditorShell />;
}
