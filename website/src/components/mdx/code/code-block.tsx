"use client";

import { createContext, useContext, useRef, type ComponentProps } from "react";
import { CopyButton } from "@/components/shared/copy-button";
import { cn } from "@/lib/utils";

/** Set by a tab group, whose frame then wraps the block instead. */
export const InsideTabs = createContext(false);

type PreProps = ComponentProps<"pre"> & {
	title?: string;
	/** An SVG string for the language, added by rehype-code at build time. */
	icon?: string;
	allowCopy?: string | boolean;
};

export function CodeBlock({ title, icon, allowCopy, className, children, style, ...props }: PreProps) {
	const inTabs = useContext(InsideTabs);
	const pre = useRef<HTMLPreElement>(null);
	const copyable = allowCopy !== "false" && allowCopy !== false;
	const copy = copyable ? <CopyButton label="Copy code" getValue={() => pre.current?.textContent ?? ""} /> : null;

	return (
		<figure
			dir="ltr"
			className={cn(
				"group/code relative my-6 overflow-hidden bg-code text-[13px]",
				inTabs ? "my-0" : "rounded-xl",
			)}
		>
			{title && (
				<figcaption className="flex h-10 items-center gap-2 pt-1 pr-1.5 pl-4 text-[13px] text-muted-foreground">
					{icon && (
						<span
							aria-hidden
							className="size-3.5 shrink-0 [&_svg]:size-full"
							// Build-time SVG from rehype-code's language icons.
							dangerouslySetInnerHTML={{ __html: icon }}
						/>
					)}
					<span className="min-w-0 flex-1 truncate font-mono text-xs">{title}</span>
					{copy}
				</figcaption>
			)}
			{!title && copy && (
				<div className="absolute top-2 right-2 z-10 rounded-md bg-code opacity-0 transition-opacity duration-150 group-hover/code:opacity-100 has-focus-visible:opacity-100 max-sm:opacity-100">
					{copy}
				</div>
			)}
			<pre
				ref={pre}
				{...props}
				style={{ ...style, backgroundColor: undefined }}
				className={cn("no-scrollbar max-h-[560px] overflow-auto py-4 font-mono leading-[1.7] outline-none", className)}
			>
				{children}
			</pre>
		</figure>
	);
}
