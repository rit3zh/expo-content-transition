import { orderedPages, pageMarkdown } from "@/lib/markdown";

export const revalidate = false;

/** Every page in one file, for tools that want the whole manual at once. */
export async function GET() {
	const pages = await Promise.all(orderedPages().map(pageMarkdown));
	return new Response(pages.join("\n\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
