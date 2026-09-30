import { Fragment } from "react";

/**
 * Search snippets arrive as Markdown with `<mark>` around matches. Only the
 * marks matter here; everything else is shown as plain text, never as HTML.
 */
export function Highlight({ text }: { text: string }) {
	const parts = text.split(/(<mark>[\s\S]*?<\/mark>)/g);
	return (
		<>
			{parts.map((part, index) => {
				const match = /^<mark>([\s\S]*)<\/mark>$/.exec(part);
				const plain = (match ? match[1] : part).replace(/[`*_]/g, "");
				return match ? (
					<mark key={index} className="rounded-[3px] bg-transparent font-medium text-foreground underline decoration-foreground/35 underline-offset-2">
						{plain}
					</mark>
				) : (
					<Fragment key={index}>{plain}</Fragment>
				);
			})}
		</>
	);
}
