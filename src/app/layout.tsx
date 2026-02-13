import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
    "A spatial design tool where everything renders as Unicode box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.",
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
      "A spatial design tool where everything renders as Unicode box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wiretext — Unicode Wireframe Design Tool",
    description:
      "A spatial design tool where everything renders as Unicode box-drawing characters. Share as text.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Wiretext",
  applicationCategory: "DesignApplication",
  description:
    "A spatial design tool where everything renders as Unicode box-drawing characters. Create wireframes, diagrams, and mockups. Share as text.",
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
    <html className={mono.variable} lang="en">
      <body className="font-mono antialiased">
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
        {children}
      </body>
    </html>
  );
}
