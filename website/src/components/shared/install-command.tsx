import { highlight } from "fumadocs-core/highlight";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

/**
 * The install line as a pill, copyable in one click. The button never
 * changes size: its icon morphs to a check and a toast confirms the copy.
 * The command is highlighted with the same themes as the code blocks.
 */
export async function InstallCommand({ className }: { className?: string }) {
	const command = await highlight(site.install, {
		lang: "bash",
		themes: { light: "github-light-default", dark: "github-dark-default" },
		defaultColor: false,
		components: {
			// Inline, not a block: the pill owns layout, Shiki only colours tokens.
			pre: ({ children }) => <>{children}</>,
			code: ({ children }) => (
				<code className="min-w-0 flex-1 truncate text-left text-foreground [&_span]:[color:light-dark(var(--shiki-light),var(--shiki-dark))]">
					{children}
				</code>
			),
		},
	});

	return (
		<div
			className={cn(
				"flex h-11 max-w-full items-center gap-3 rounded-full bg-surface pr-1.5 pl-5 font-mono text-[13px]",
				className,
			)}
		>
			<span aria-hidden className="text-muted-foreground select-none">
				$
			</span>
			{command}
			<CopyButton value={site.install} label="Copy install command" toast="Copied install command" className="rounded-full" />
		</div>
	);
}
