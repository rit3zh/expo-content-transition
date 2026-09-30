"use client";

import { useSyncExternalStore } from "react";
import { Search, TextSearch } from "lucide";
import { Icon } from "@/components/ui/icon";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { openSearch } from "./search-events";

const noop = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);

/** A pill on wide screens, an icon button on phones. */
export function SearchTrigger({ className }: { className?: string }) {
	// The server can't know the platform, so it says Ctrl until hydrated.
	const mac = useSyncExternalStore(noop, isMac, () => false);

	return (
		<button
			type="button"
			onClick={openSearch}
			aria-label="Search documentation"
			aria-haspopup="dialog"
			aria-keyshortcuts="Meta+K Control+K"
			className={cn(
				"group/search flex h-9 items-center gap-2 rounded-full text-[13px] text-muted-foreground outline-offset-2 transition-[scale,color,background-color] duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.96]",
				"max-sm:w-9 max-sm:justify-center max-sm:hover:bg-surface sm:w-60 sm:bg-surface sm:pr-1.5 sm:pl-3 sm:hover:bg-accent",
				className,
			)}
		>
			<Icon icon={Search} hover={TextSearch} className="size-4 shrink-0" />
			<span className="hidden flex-1 text-left sm:inline">Search docs</span>
			<Kbd className="hidden h-6 rounded-full bg-background px-2 text-[11px] sm:inline-flex">
				{mac ? "⌘K" : "Ctrl K"}
			</Kbd>
		</button>
	);
}
