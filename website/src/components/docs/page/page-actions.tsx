"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { ArrowUpRight, Check, ChevronDown, ChevronUp, Copy, MoveUpRight } from "lucide";
import { siMarkdown } from "simple-icons";
import { ChatGPTIcon, ClaudeIcon, DeepSeekIcon, GitHubIcon, PerplexityIcon, SimpleIcon } from "@/components/icons";
import { AnimatedLabel } from "@/components/ui/animated-label";
import { HoverGroup } from "@/components/ui/hover-group";
import { Icon } from "@/components/ui/icon";
import { useCopy } from "@/hooks/use-copy";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SEGMENT =
	"flex h-8 items-center bg-surface text-[13px] text-muted-foreground outline-offset-2 transition-[color,background-color] duration-200 ease-out hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid data-popup-open:bg-accent data-popup-open:text-foreground";

const noop = () => () => {};

// Opening settles on a spring with no bounce; closing is quicker, so the menu never lingers.
const OPEN: Transition = { type: "spring", duration: 0.34, bounce: 0 };
const CLOSE: Transition = { duration: 0.16, ease: [0.4, 0, 1, 1] };

/** A chat with an assistant that has been pointed at the page's Markdown. */
function assistants(markdown: string) {
	const prompt = encodeURIComponent(`Read ${markdown}, I want to ask questions about it.`);
	return [
		{ label: "Open in ChatGPT", href: `https://chatgpt.com/?hints=search&q=${prompt}`, icon: <ChatGPTIcon className="size-4 text-foreground" /> },
		{ label: "Open in Claude", href: `https://claude.ai/new?q=${prompt}`, icon: <ClaudeIcon className="size-4" /> },
		{ label: "Open in Perplexity", href: `https://www.perplexity.ai/search/new?q=${prompt}`, icon: <PerplexityIcon className="size-4" /> },
		{ label: "Open in DeepSeek", href: `https://chat.deepseek.com/?q=${prompt}`, icon: <DeepSeekIcon className="size-4" /> },
	];
}

function MenuLink({ href, icon, children }: { href: string; icon: ReactNode; children: string }) {
	return (
		<Menu.Item
			render={<a href={href} target="_blank" rel="noreferrer" />}
			className="group/item flex h-9 cursor-default items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-foreground outline-none select-none"
		>
			<span className="grid size-5 place-items-center text-muted-foreground">{icon}</span>
			<span className="flex-1">{children}</span>
			{/* Always there; hovering the row only morphs it into the longer arrow. */}
			<Icon icon={ArrowUpRight} hover={MoveUpRight} className="size-3.5 text-muted-foreground/70" />
		</Menu.Item>
	);
}

function Label({ children }: { children: ReactNode }) {
	return <p className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium text-muted-foreground/70">{children}</p>;
}

/**
 * Copy the page as Markdown, or take it elsewhere: its raw Markdown, a chat
 * with an assistant that has read it, or its source on GitHub.
 */
export function PageActions({
	markdown,
	markdownPath,
	githubUrl,
}: {
	markdown: string;
	/** Site-relative path of the page's Markdown twin. */
	markdownPath: string;
	githubUrl: string;
}) {
	const { copied, copy } = useCopy();
	const [open, setOpen] = useState(false);
	// Links resolve against wherever the site is served, so previews work too.
	// The server can't know the origin; the menu only opens after hydration.
	const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
	const absolute = `${origin}${markdownPath}`;

	return (
		<div className="flex shrink-0 items-center gap-px">
			<motion.button
				type="button"
				onClick={() => void copy(markdown)}
				whileTap={{ scale: 0.97 }}
				transition={spring.snappy}
				className={cn(SEGMENT, "gap-1.5 rounded-l-full pr-3 pl-3")}
			>
				<Icon icon={copied ? Check : Copy} className="size-3.5" />
				<AnimatedLabel value={copied ? "Copied" : "Copy page"} />
			</motion.button>
			<Menu.Root open={open} onOpenChange={setOpen}>
				<Menu.Trigger aria-label="More ways to read this page" className={cn(SEGMENT, "rounded-r-full pr-2.5 pl-2")}>
					<Icon icon={open ? ChevronUp : ChevronDown} className="size-3.5" />
				</Menu.Trigger>
				{/* Motion owns mounting, so closing can play out before the menu leaves. */}
				<AnimatePresence>
					{open && (
						<Menu.Portal keepMounted>
							<Menu.Positioner align="end" side="bottom" sideOffset={8} className="z-50 outline-none">
								<Menu.Popup
									render={
										<motion.div
											initial={{ opacity: 0, scale: 0.94, y: -6, filter: "blur(8px)" }}
											// The blur is dropped once it has settled: a filter left on the menu
												// would make it repaint on every frame the highlight moves.
												animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: OPEN, transitionEnd: { filter: "none" } }}
											exit={{ opacity: 0, scale: 0.97, y: -4, filter: "blur(6px)", transition: CLOSE }}
										/>
									}
									style={{ transformOrigin: "var(--transform-origin)" }}
									className="w-60 rounded-2xl bg-popover p-1.5 text-popover-foreground shadow-[0_0_0_1px_var(--border),0_12px_32px_-8px_oklch(0_0_0/0.18)] outline-none will-change-[transform,opacity] dark:shadow-[0_0_0_1px_var(--border),0_12px_32px_-8px_oklch(0_0_0/0.6)]"
								>
									{/* The pointer and the keyboard share one highlight that glides between rows. */}
									<HoverGroup item='[role="menuitem"]' pill="rounded-lg bg-accent" nearest>
										<MenuLink href={markdownPath} icon={<SimpleIcon path={siMarkdown.path} className="size-4 text-foreground" />}>
											View as Markdown
										</MenuLink>
										<Label>Ask about this page</Label>
										{assistants(absolute).map((item) => (
											<MenuLink key={item.label} href={item.href} icon={item.icon}>
												{item.label}
											</MenuLink>
										))}
										<Label>Source</Label>
										<MenuLink href={githubUrl} icon={<GitHubIcon className="size-4 text-foreground" />}>
											View on GitHub
										</MenuLink>
									</HoverGroup>
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					)}
				</AnimatePresence>
			</Menu.Root>
		</div>
	);
}
