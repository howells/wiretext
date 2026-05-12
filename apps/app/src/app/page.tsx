import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/editor-shell";

export const metadata: Metadata = {
  title: "Wiretext — Unicode Wireframe Design Tool",
  description:
    "A Unicode wireframe design tool where everything renders as box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.",
  alternates: {
    canonical: "/",
  },
};

export default function EditorPage() {
  return <EditorShell />;
}
