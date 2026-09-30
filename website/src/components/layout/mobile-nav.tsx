"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, Menu, X } from "lucide";
import { Icon } from "@/components/ui/icon";
import { siNpm } from "simple-icons";
import { GitHubIcon, SimpleIcon } from "@/components/icons";
import { site } from "@/lib/site";
import { Brand } from "./brand";

/** The sidebar, as a drawer, on screens too narrow for the column. */
export function MobileNav({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const [lastPath, setLastPath] = useState(pathname);

	// Picking a page navigates, and the drawer gets out of the way.
	if (pathname !== lastPath) {
		setLastPath(pathname);
		setOpen(false);
	}

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger
				aria-label="Open navigation"
				className="-ml-2 grid size-9 touch-manipulation place-items-center rounded-full text-muted-foreground outline-offset-2 transition-[color,scale] duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.96] lg:hidden"
			>
				<Icon icon={open ? X : Menu} className="size-4" strokeWidth={1.5} />
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 ease-drawer data-ending-style:opacity-0 data-starting-style:opacity-0 lg:hidden" />
				<Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-[min(300px,85vw)] flex-col bg-background shadow-raised outline-none transition-transform duration-300 ease-drawer data-ending-style:-translate-x-full data-ending-style:duration-200 data-starting-style:-translate-x-full motion-reduce:transition-none lg:hidden">
					<Dialog.Title className="sr-only">Navigation</Dialog.Title>
					<div className="flex h-14 shrink-0 items-center justify-between pr-3 pl-5">
						<Brand />
						<Dialog.Close
							aria-label="Close navigation"
							className="grid size-9 touch-manipulation place-items-center rounded-full text-muted-foreground outline-offset-2 transition-[color,scale] duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.96]"
						>
							<Icon icon={X} hover={ChevronLeft} className="size-4" strokeWidth={1.5} />
						</Dialog.Close>
					</div>
					<nav aria-label="Documentation" data-sidebar-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-5 pb-10">
						{children}
					</nav>
					{/* The header hides these on phones to make room, so they live here instead. */}
					<div className="flex shrink-0 gap-2 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
						<a
							href={site.npm}
							target="_blank"
							rel="noreferrer"
							className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-surface text-[13px] text-foreground transition-[background-color,scale] duration-200 active:scale-[0.97]"
						>
							<SimpleIcon path={siNpm.path} className="size-4 text-[#cb3837]" />
							npm
						</a>
						<a
							href={site.repo}
							target="_blank"
							rel="noreferrer"
							className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-surface text-[13px] text-foreground transition-[background-color,scale] duration-200 active:scale-[0.97]"
						>
							<GitHubIcon className="size-4" />
							GitHub
						</a>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
