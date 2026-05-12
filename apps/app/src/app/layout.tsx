import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { PostHogProvider } from "@/components/posthog-provider";
import "./globals.css";

const mono = localFont({
  src: "./fonts/JetBrainsMono-Regular.woff2",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wiretext.app"),
  title: "Wiretext — Unicode Wireframe Design Tool",
  description:
    "A Unicode wireframe design tool where everything renders as box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Wiretext",
    title: "Wiretext — Unicode Wireframe Design Tool",
    description:
      "A Unicode wireframe design tool where everything renders as box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wiretext — Unicode Wireframe Design Tool",
    description:
      "A Unicode wireframe design tool where everything renders as box-drawing characters. Share as text.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Wiretext",
  applicationCategory: "DesignApplication",
  description:
    "A Unicode wireframe design tool where everything renders as box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.",
  url: "https://wiretext.app",
  operatingSystem: "Any (Web-based)",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={mono.variable} lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("wiretext-theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-mono antialiased">
        <Script
          id="json-ld"
          strategy="beforeInteractive"
          type="application/ld+json"
        >
          {JSON.stringify(jsonLd)}
        </Script>
        <PostHogProvider>{children}</PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
