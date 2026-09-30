import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteToaster } from "@/components/layout/site-toaster";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { themeScript } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";
import { searchSuggestions } from "@/lib/navigation";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
	description: site.description,
	applicationName: site.name,
	keywords: ["expo", "react native", "numeric text", "content transition", "animated number", "counter", "swiftui numericText", "animation"],
	authors: [{ name: site.author.name, url: site.author.url }],
	openGraph: {
		type: "website",
		siteName: site.name,
		url: "/",
		images: [{ url: "/expo-content-transition-banner.png", width: 3840, height: 2160, alt: `${site.name}: ${site.tagline}` }],
	},
	twitter: { card: "summary_large_image", images: ["/expo-content-transition-banner.png"] },
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#121213" },
	],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		// data-scroll-behavior: Next turns smooth scrolling off while it changes
		// pages, so a new page starts at the top instead of gliding from the old spot.
		<html
			lang="en"
			data-scroll-behavior="smooth"
			className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			suppressHydrationWarning
		>
			<head>
				{/* Before first paint, so a saved theme never flashes the other one. */}
				{/* A plain script in the server HTML: it runs before first paint, and React
				    only hydrates it, so it never builds a script element on the client. */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				{/* Scroll reveals need JS to play; without it, just show everything. */}
				<noscript>
					<style>{"[data-reveal]{opacity:1!important}"}</style>
				</noscript>
			</head>
			<body className="min-h-dvh">
				<TooltipProvider delay={300}>
					{children}
					<SearchDialog suggestions={searchSuggestions()} />
					<SiteToaster />
					<RevealOnScroll />
				</TooltipProvider>
			</body>
		</html>
	);
}
