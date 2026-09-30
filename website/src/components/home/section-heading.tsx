import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { reveal } from "@/lib/reveal";

export function SectionHeading({
	eyebrow,
	title,
	children,
	className,
}: {
	eyebrow: string;
	title: ReactNode;
	children?: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("max-w-2xl", className)}>
			<p {...reveal(0)} className="text-[13px] font-medium text-muted-foreground">{eyebrow}</p>
			<h2 {...reveal(1)} className="mt-3 text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-[40px]">
				{title}
			</h2>
			{children && <p {...reveal(2)} className="mt-4 text-[16px] leading-relaxed text-pretty text-muted-foreground">{children}</p>}
		</div>
	);
}
