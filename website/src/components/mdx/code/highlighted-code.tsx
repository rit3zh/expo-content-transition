import { highlight } from "fumadocs-core/highlight";
import { CodeBlock } from "./code-block";

/** Highlights code at render time with the same themes as MDX code blocks. */
export async function HighlightedCode({ code, lang = "tsx", title }: { code: string; lang?: string; title?: string }) {
	return highlight(code, {
		lang,
		themes: { light: "github-light-default", dark: "github-dark-default" },
		defaultColor: false,
		components: {
			pre: (props) => <CodeBlock {...props} title={title} />,
		},
	});
}
