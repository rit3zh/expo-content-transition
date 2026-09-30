import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
	dir: "content/docs",
	docs: {
		// Lets the page header offer "Copy page" with the original Markdown.
		postprocess: { includeProcessedMarkdown: true },
	},
});

export default defineConfig({
	mdxOptions: {
		rehypeCodeOptions: {
			themes: { light: "github-light-default", dark: "github-dark-default" },
			defaultColor: false,
		},
	},
});
