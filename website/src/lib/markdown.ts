import { EXAMPLES, type ExampleId } from "./examples";
import { PROP_TABLES, type PropRow, type PropTableName } from "./props";
import rawDocs from "./raw-docs.generated.json";
import { site } from "./site";
import { flattenTree, source, type DocsPage } from "./source";

/** The Markdown twin of a docs page, at `/docs/<page>.mdx`. */
export const markdownUrl = (url: string) => `${url === "/docs" ? "/docs/index" : url}.mdx`;

const absolute = (path: string) => new URL(path, site.url).toString();

const fence = (code: string, lang = "tsx") => `\`\`\`${lang}\n${code}\n\`\`\``;

function table(rows: PropRow[]): string {
	const cell = (text: string) => text.replaceAll("|", "\\|");
	return [
		"| Prop | Type | Default | Description |",
		"| --- | --- | --- | --- |",
		...rows.map(
			(row) =>
				`| \`${row.name}\`${row.required ? " (required)" : ""} | \`${cell(row.type)}\` | ${row.default ? `\`${cell(row.default)}\`` : ""} | ${cell(row.description)}${row.platform ? ` ${cell(row.platform)}` : ""} |`,
		),
	].join("\n");
}

const anchor = (id: ExampleId) => EXAMPLES[id].title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function exampleList(ids?: string): string {
	const list = ids ? (JSON.parse(ids) as ExampleId[]) : (Object.keys(EXAMPLES) as ExampleId[]);
	return list.map((id) => `- [${EXAMPLES[id].title}](${absolute(`/docs/examples#${anchor(id)}`)}): ${EXAMPLES[id].description}`).join("\n");
}

/**
 * Turns the site's MDX into plain Markdown: live examples become the code
 * that produces them, data-driven tables become tables, and purely visual
 * blocks are dropped.
 */
function toMarkdown(mdx: string): string {
	return (
		mdx
			// Frontmatter is replaced by the title block.
			.replace(/^---\n[\s\S]*?\n---\n/, "")
			.replace(/<Example id="(\w+)"[^>]*\/>/g, (_, id: ExampleId) => fence(EXAMPLES[id].code))
			.replace(/<ExampleGrid(?: ids=\{(\[[^\]]*\])\})? \/>/g, (_, ids?: string) => exampleList(ids))
			.replace(/<PropsTable of="(\w+)"(?: only=\{(\[[^\]]*\])\})? \/>/g, (_, name: PropTableName, only?: string) => {
				const names = only ? (JSON.parse(only) as string[]) : null;
				return table(PROP_TABLES[name].filter((row) => !names || names.includes(row.name)));
			})
			.replace(/<Playground \/>/g, `Try every prop live in the [playground](${absolute("/docs/playground")}).`)
			// Side-by-side comparisons only make sense on screen. Their
			// attributes can span lines but never contain "/>".
			.replace(/<Compare\b[\s\S]*?\/>\n?/g, "")
			.replace(/<CommandTabs([\s\S]*?)commands=\{\{([\s\S]*?)\}\}[\s\S]*?\/>/g, (_, attributes: string, body: string) => {
				const commands = [...body.matchAll(/:\s*"([^"]+)"/g)].map((match) => match[1]);
				// Package managers are alternatives, so one is enough; anything else (platforms) is all needed.
				const lines = attributes.includes('groupId="package-manager"') ? commands.slice(0, 1) : commands;
				return lines.length ? fence(lines.join("\n"), "bash") : "";
			})
			.replace(/<Callout(?: type="\w+")?(?: title="([^"]*)")?>\n?([\s\S]*?)\n?<\/Callout>/g, (_, title = "Note", body: string) =>
				`> **${title}**\n>\n${body
					.trim()
					.split("\n")
					.map((line) => `> ${line.trim()}`)
					.join("\n")}`,
			)
			.replace(/<Card href="([^"]+)" title="([^"]+)">\s*([\s\S]*?)\s*<\/Card>/g, (_, href: string, title: string, body: string) =>
				`- [${title}](${absolute(href)}): ${body.trim()}`,
			)
			.replace(/<\/?(Cards|Steps|Step)>\n?/g, "")
			// Site-relative links work anywhere once they're absolute.
			.replace(/\]\((\/[^)]*)\)/g, (_, path: string) => `](${absolute(path)})`)
			.replace(/\n{3,}/g, "\n\n")
			.trim()
	);
}

/** A page as Markdown: title, description, then the body. */
export async function pageMarkdown(page: DocsPage): Promise<string> {
	// Read from the build-time bundle: Workers have no filesystem to read the MDX from.
	const raw = (rawDocs as Record<string, string>)[page.path];
	if (raw === undefined) throw new Error(`No bundled source for ${page.path}; run \`npm run docs\`.`);
	const body = toMarkdown(raw);
	const description = page.data.description ? `\n\n> ${page.data.description}` : "";
	return `# ${page.data.title}${description}\n\nSource: ${absolute(page.url)}\n\n${body}\n`;
}

/** Every page, in the order the sidebar reads. */
export function orderedPages(): DocsPage[] {
	return flattenTree(source.getPageTree()).flatMap((item) => source.getPageByUrl(item.url) ?? []);
}

/** llms.txt: every page with a one-line summary. */
export function llmsIndex(): string {
	const lines = orderedPages().map((page) => {
		const summary = page.data.description ? `: ${page.data.description}` : "";
		return `- [${page.data.title}](${absolute(markdownUrl(page.url))})${summary}`;
	});
	return `# ${site.name}\n\n> ${site.description}\n\nEvery page is also available as Markdown by adding \`.mdx\` to its URL.\n\n## Docs\n\n${lines.join("\n")}\n`;
}
