import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
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
		<html lang="en" className={mono.variable}>
			<body className="font-mono antialiased">{children}</body>
		</html>
	);
}
