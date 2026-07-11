import type { Metadata } from "next";
import { Fragment } from "react";

export const metadata: Metadata = {
  robots: { index: false },
  title: "Component Showcase — Wiretext",
};

// Keyed fragment keeps this a pure pass-through with a stable identity
const ShowcaseLayout = ({ children }: { children: React.ReactNode }) => (
  <Fragment key="showcase">{children}</Fragment>
);

export default ShowcaseLayout;
