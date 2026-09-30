import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const STYLES = {
	h1: "mt-12 mb-4 text-3xl font-semibold tracking-tight",
	h2: "mt-14 mb-4 text-[22px] font-semibold tracking-tight first:mt-0",
	h3: "mt-10 mb-3 text-[17px] font-semibold tracking-tight",
	h4: "mt-8 mb-2 text-[15px] font-semibold",
} as const;

/** Headings carry their own link, revealed on hover like a margin note. */
export function Heading({ as: Tag, id, className, children, ...props }: ComponentProps<"h2"> & { as: keyof typeof STYLES }) {
	return (
		<Tag id={id} className={cn("group/heading scroll-mt-20 text-foreground", STYLES[Tag], className)} {...props}>
			{id ? (
				<a href={`#${id}`} className="relative outline-offset-4 focus-visible:outline-2 focus-visible:outline-solid">
					{children}
					<span
						aria-hidden
						className="ml-2 inline-block text-muted-foreground/60 opacity-0 transition-opacity duration-150 group-hover/heading:opacity-100"
					>
						#
					</span>
				</a>
			) : (
				children
			)}
		</Tag>
	);
}
