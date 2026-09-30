import { docs } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";
import type { Item, Node, Root } from "fumadocs-core/page-tree";

export const source = loader({
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
});

export type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;

/** Every page in sidebar order, for previous/next links. */
export function flattenTree(tree: Root): Item[] {
	const walk = (nodes: Node[]): Item[] =>
		nodes.flatMap((node) => {
			if (node.type === "page") return node.external ? [] : [node];
			if (node.type === "folder") return [...(node.index ? [node.index] : []), ...walk(node.children)];
			return [];
		});
	return walk(tree.children);
}

export function neighbours(url: string) {
	const pages = flattenTree(source.getPageTree());
	const index = pages.findIndex((page) => page.url === url);
	return {
		previous: index > 0 ? pages[index - 1] : undefined,
		next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : undefined,
	};
}
