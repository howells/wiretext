import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Component Test — Wiretext",
  robots: { index: false },
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
