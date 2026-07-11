import type { Metadata } from "next";
import { Fragment } from "react";

export const metadata: Metadata = {
  robots: { index: false },
  title: "Component Test — Wiretext",
};

// Keyed fragment keeps this a pure pass-through with a stable identity
const TestLayout = ({ children }: { children: React.ReactNode }) => (
  <Fragment key="test">{children}</Fragment>
);

export default TestLayout;
