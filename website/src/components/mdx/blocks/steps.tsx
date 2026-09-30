import type { ReactNode } from "react";

/** Numbered down a faint line; each step's first heading sits by its number. */
export function Steps({ children }: { children: ReactNode }) {
	return <div className="my-8 ml-3 border-l border-surface pl-8 [counter-reset:step]">{children}</div>;
}

export function Step({ children }: { children: ReactNode }) {
	return (
		<div className="relative pb-2 [counter-increment:step] before:absolute before:top-0 before:-left-[45px] before:grid before:size-7 before:place-items-center before:rounded-full before:bg-surface before:font-mono before:text-xs before:text-foreground/70 before:content-[counter(step)] [&>h3:first-child]:mt-0.5 [&>h4:first-child]:mt-1">
			{children}
		</div>
	);
}
