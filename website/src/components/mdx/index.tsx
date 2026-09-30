import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";
import { Playground } from "@/components/playground/playground";
import { cn } from "@/lib/utils";
import { Callout } from "./blocks/callout";
import { Card, Cards } from "./blocks/cards";
import { Compare } from "./blocks/compare";
import { Example } from "./blocks/example";
import { ExampleGrid } from "./blocks/example-grid";
import { PropsTable } from "./blocks/props-table";
import { Step, Steps } from "./blocks/steps";
import { CodeBlock } from "./code/code-block";
import { CommandTabs } from "./code/command-tabs";
import { CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger } from "./code/code-tabs";
import { Heading } from "./prose/heading";
import { MdxLink } from "./prose/mdx-link";

/** Every element and component MDX pages can use. */
export function getMDXComponents(overrides?: MDXComponents): MDXComponents {
	return {
		h1: (props: ComponentProps<"h1">) => <Heading as="h1" {...props} />,
		h2: (props: ComponentProps<"h2">) => <Heading as="h2" {...props} />,
		h3: (props: ComponentProps<"h3">) => <Heading as="h3" {...props} />,
		h4: (props: ComponentProps<"h4">) => <Heading as="h4" {...props} />,
		p: ({ className, ...props }) => <p className={cn("my-4 leading-[1.75] text-foreground/85", className)} {...props} />,
		a: MdxLink,
		strong: ({ className, ...props }) => <strong className={cn("font-semibold text-foreground", className)} {...props} />,
		ul: ({ className, ...props }) => (
			<ul className={cn("my-4 flex list-disc flex-col gap-1.5 pl-5 marker:text-muted-foreground/60", className)} {...props} />
		),
		ol: ({ className, ...props }) => (
			<ol className={cn("my-4 flex list-decimal flex-col gap-1.5 pl-5 marker:text-muted-foreground", className)} {...props} />
		),
		li: ({ className, ...props }) => <li className={cn("pl-1 leading-[1.7] text-foreground/85", className)} {...props} />,
		blockquote: ({ className, ...props }) => (
			<blockquote className={cn("my-6 rounded-r-lg bg-surface/60 py-2 pr-4 pl-4 text-muted-foreground shadow-[inset_2px_0_0_var(--muted-foreground)] [&>p]:my-1", className)} {...props} />
		),
		hr: () => <hr className="my-14 h-px border-0 bg-[linear-gradient(to_right,var(--border),transparent)]" />,
		code: ({ className, ...props }) => (
			<code
				className={cn(
					"rounded-md bg-surface px-[0.4em] py-[0.15em] font-mono text-[0.86em] text-foreground",
					// Inside a code block the block does the styling.
					"in-[pre]:rounded-none in-[pre]:bg-transparent in-[pre]:p-0 in-[pre]:text-[1em] in-[pre]:shadow-none",
					className,
				)}
				{...props}
			/>
		),
		pre: CodeBlock,
		table: ({ className, ...props }) => (
			<div className="no-scrollbar my-6 overflow-x-auto rounded-xl bg-surface/50">
				<table className={cn("w-full border-collapse text-[13.5px]", className)} {...props} />
			</div>
		),
		thead: (props) => <thead className="bg-surface" {...props} />,
		th: ({ className, ...props }) => (
			<th className={cn("px-4 py-2.5 text-left text-xs font-medium whitespace-nowrap text-muted-foreground", className)} {...props} />
		),
		td: ({ className, ...props }) => (
			<td className={cn("border-b border-background px-4 py-2.5 align-top text-foreground/85 [tr:last-child_&]:border-b-0", className)} {...props} />
		),
		img: ({ className, alt, ...props }) => (
			// eslint-disable-next-line @next/next/no-img-element -- MDX images have no known size
			<img alt={alt ?? ""} className={cn("my-6 rounded-xl", className)} {...props} />
		),

		CodeBlockTabs,
		CodeBlockTabsList,
		CodeBlockTabsTrigger,
		CodeBlockTab,
		CommandTabs,
		Callout,
		Cards,
		Card,
		Steps,
		Step,
		PropsTable,
		Example,
		ExampleGrid,
		Compare,
		Playground,
		...overrides,
	};
}
