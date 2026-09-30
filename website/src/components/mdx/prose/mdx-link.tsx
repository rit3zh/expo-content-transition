import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowUpRight, MoveUpRight } from "lucide";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const LINK =
	"font-medium text-foreground underline decoration-foreground/25 underline-offset-[3px] transition-[text-decoration-color] duration-150 hover:decoration-foreground";

/** Internal links route client-side; external ones say so with a small arrow. */
export function MdxLink({ href = "", className, children, ...props }: ComponentProps<"a">) {
	if (href.startsWith("/") || href.startsWith("#")) {
		return (
			<Link href={href} className={cn(LINK, className)} {...props}>
				{children}
			</Link>
		);
	}
	return (
		<a href={href} target="_blank" rel="noreferrer" className={cn(LINK, "inline-flex items-baseline gap-0.5", className)} {...props}>
			{children}
			<Icon icon={ArrowUpRight} hover={MoveUpRight} className="size-3 self-center opacity-60" />
		</a>
	);
}
