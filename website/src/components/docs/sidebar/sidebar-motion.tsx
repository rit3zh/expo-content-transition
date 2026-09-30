"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { HoverGroup } from "@/components/ui/hover-group";

/**
 * One hover highlight for the whole list, gliding from row to row (across
 * sections too), and one pill for the current page that slides to the next.
 * Both are measured, not layout-animated, so scrolling the list can't throw them off.
 */
export function SidebarMotion({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	return (
		<HoverGroup
			item="a[data-sidebar-link]"
			pill="rounded-lg bg-surface/70 dark:bg-surface"
			active='a[aria-current="page"]'
			activeKey={pathname}
			activePill="rounded-lg bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)] dark:bg-accent"
		>
			{children}
		</HoverGroup>
	);
}
