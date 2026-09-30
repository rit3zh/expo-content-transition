"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SidebarLink({ href, children, swatch }: { href: string; children: ReactNode; swatch?: string }) {
	const active = usePathname() === href;
	const ref = useRef<HTMLAnchorElement>(null);

	// Arriving on a page brings its row toward the middle of the list, clear
	// of the fades at either end. Only the list scrolls, never the page.
	useEffect(() => {
		const element = ref.current;
		const list = element?.closest<HTMLElement>("[data-sidebar-scroll]");
		if (!active || !element || !list) return;
		const top = element.offsetTop - list.offsetTop;
		if (top < list.scrollTop + 40 || top > list.scrollTop + list.clientHeight - 80) {
			list.scrollTo({ top: top - list.clientHeight / 2 + element.offsetHeight / 2 });
		}
	}, [active]);

	return (
		<Link
			ref={ref}
			href={href}
			aria-current={active ? "page" : undefined}
			data-sidebar-link
			className={cn(
				"flex h-8 items-center gap-2.5 rounded-lg px-3 text-[13px] outline-none transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid",
				active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
			)}
		>
			{swatch && (
				<span
					aria-hidden
					className="size-3 shrink-0 rounded-[4px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]"
					style={{ background: swatch }}
				/>
			)}
			<span className="truncate">{children}</span>
		</Link>
	);
}
