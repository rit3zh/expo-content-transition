import { notFound } from "next/navigation";
import { pageMarkdown } from "@/lib/markdown";
import { source } from "@/lib/source";

// Served at /docs/<page>.mdx through a rewrite in next.config.ts.
export const revalidate = false;

export async function GET(_request: Request, { params }: RouteContext<"/llms.mdx/[[...slug]]">) {
	const { slug } = await params;
	// `/docs/index.mdx` is the introduction.
	const page = source.getPage(slug?.length === 1 && slug[0] === "index" ? [] : slug);
	if (!page) notFound();
	return new Response(await pageMarkdown(page), {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}

export function generateStaticParams() {
	return [...source.generateParams(), { slug: ["index"] }];
}
