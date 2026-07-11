import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { PostHogProvider } from "@/components/posthog-provider";
import { serverEnv } from "@/lib/env";

import "./globals.css";

const APP_TITLE = "Wiretext — Unicode Wireframe Design Tool";
const APP_DESCRIPTION =
  "A Unicode wireframe design tool where everything renders as box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.";

const mono = localFont({
  display: "swap",
  src: "./fonts/JetBrainsMono-Regular.woff2",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL("https://wiretext.app"),
  openGraph: {
    description: APP_DESCRIPTION,
    locale: "en_US",
    siteName: "Wiretext",
    title: APP_TITLE,
    type: "website",
    url: "/",
  },
  title: APP_TITLE,
  twitter: {
    card: "summary_large_image",
    description:
      "A Unicode wireframe design tool where everything renders as box-drawing characters. Share as text.",
    title: APP_TITLE,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#f8f8fb", media: "(prefers-color-scheme: light)" },
    { color: "#0a0a0f", media: "(prefers-color-scheme: dark)" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  applicationCategory: "DesignApplication",
  description: APP_DESCRIPTION,
  name: "Wiretext",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  operatingSystem: "Any (Web-based)",
  url: "https://wiretext.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={mono.variable} lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("wiretext-theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`}
        </Script>
      </head>
      <body className="font-mono antialiased">
        <Script
          id="json-ld"
          strategy="beforeInteractive"
          type="application/ld+json"
        >
          {JSON.stringify(jsonLd)}
        </Script>
        <PostHogProvider posthogKey={serverEnv.posthogKey}>
          {children}
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
