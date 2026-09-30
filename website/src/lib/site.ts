// The facts every page, metadata block and link repeats, kept in one place.
export const site = {
	name: "Content Transition",
	tagline: "Rolling text for Expo",
	description:
		"NumericText for React Native and Expo: text whose glyphs roll, scale and blur individually when the value changes. Native on iOS and Android, DOM-based on the web.",
	version: "0.1.3",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	repo: "https://github.com/rit3zh/expo-content-transition",
	npm: "https://www.npmjs.com/package/expo-content-transition",
	install: "npx expo install expo-content-transition",
	author: { name: "rit3zh", url: "https://github.com/rit3zh" },
} as const;

/** Where a docs page's source lives, for "Edit on GitHub". */
export const editUrl = (path: string) => `${site.repo}/blob/main/website/content/docs/${path}`;
