import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const mono = localFont({
  src: "./fonts/JetBrainsMono-Regular.woff2",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wiretext — Wireframe with text",
  description:
    "A spatial design tool where everything renders as Unicode box-drawing characters. Share as text.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={mono.variable} lang="en">
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
