import { source } from "./source";
import type { SearchSuggestion } from "@/components/search/search-events";

/** Shown in search before anything is typed. */
const SUGGESTED = [
	"/docs",
	"/docs/installation",
	"/docs/quick-start",
	"/docs/playground",
	"/docs/components/numeric-text",
	"/docs/guides/transitions",
	"/docs/guides/formatting",
	"/docs/examples",
];

export function searchSuggestions(): SearchSuggestion[] {
	return SUGGESTED.flatMap((url) => {
		const page = source.getPageByUrl(url);
		if (!page) return [];
		const section = page.slugs.length > 1 ? page.slugs[0].replace(/^\w/, (c) => c.toUpperCase()) : "Getting started";
		return [{ title: page.data.title, url: page.url, section }];
	});
}

/** Primary links in the headers. */
export const headerLinks = [
	{ label: "Docs", href: "/docs" },
	{ label: "Playground", href: "/docs/playground" },
	{ label: "Examples", href: "/docs/examples" },
	{ label: "API", href: "/docs/components/numeric-text" },
];
