"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { useDocsSearch } from "fumadocs-core/search/client";
import { staticClient } from "fumadocs-core/search/client/orama-static";
import { CornerDownLeft, FileText, Hash, MoveRight, Search, TextAlignStart, TextSearch } from "lucide";
import { Icon } from "@/components/ui/icon";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { Highlight } from "./highlight";
import { OPEN_SEARCH, type SearchSuggestion } from "./search-events";

// One client for the whole session: the index downloads once, on first use.
const client = staticClient({ from: "/api/search" });

interface Row {
	id: string;
	url: string;
	kind: "page" | "heading" | "text";
	content: string;
	meta?: string;
}

const ICONS = { page: FileText, heading: Hash, text: TextAlignStart } as const;

export function SearchDialog({ suggestions }: { suggestions: SearchSuggestion[] }) {
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const router = useRouter();
	const id = useId();
	const list = useRef<HTMLDivElement>(null);
	const { search, setSearch, query } = useDocsSearch({ client, delayMs: 60 });

	// ⌘K / Ctrl K anywhere toggles it; other parts of the site can ask too.
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey) || event.defaultPrevented) return;
			event.preventDefault();
			setOpen((value) => !value);
		};
		const onAsk = () => setOpen(true);
		document.addEventListener("keydown", onKeyDown);
		window.addEventListener(OPEN_SEARCH, onAsk);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			window.removeEventListener(OPEN_SEARCH, onAsk);
		};
	}, []);

	const typed = search.trim().length > 0;
	const results = Array.isArray(query.data) ? query.data : [];
	const rows: Row[] = typed
		? results.map((result) => ({
				id: result.id,
				url: result.url,
				kind: result.type,
				content: result.content,
				// The root ("Documentation") is on every result, so it says nothing.
				meta: result.type === "page" ? result.breadcrumbs?.slice(1).join(" / ") : undefined,
			}))
		: suggestions.map((suggestion) => ({
				id: suggestion.url,
				url: suggestion.url,
				kind: "page",
				content: suggestion.title,
				meta: suggestion.section,
			}));
	const current = Math.min(active, Math.max(rows.length - 1, 0));

	// The highlighted row stays in view as the arrows walk the list.
	useEffect(() => {
		list.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
	}, [current]);

	const close = () => setOpen(false);
	const go = (url: string) => {
		close();
		router.push(url);
	};

	return (
		<Dialog.Root
			open={open}
			onOpenChange={setOpen}
			onOpenChangeComplete={(isOpen) => {
				if (isOpen) return;
				setSearch("");
				setActive(0);
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/15 transition-opacity duration-200 ease-out-quart data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/55" />
				<Dialog.Popup
					aria-label="Search documentation"
					className="fixed top-[min(14vh,120px)] left-1/2 z-50 flex max-h-[min(560px,72dvh)] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl bg-popover shadow-float outline-none transition-[opacity,translate,scale] duration-200 ease-out-quart data-ending-style:-translate-y-1.5 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:duration-120 data-starting-style:-translate-y-2 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
				>
					<Dialog.Title className="sr-only">Search documentation</Dialog.Title>
					<div className="flex h-14 shrink-0 items-center gap-3 px-4">
						<Icon icon={typed ? TextSearch : Search} className="size-4 shrink-0 text-muted-foreground" />
						<input
							role="combobox"
							aria-expanded="true"
							aria-controls={`${id}-list`}
							aria-activedescendant={rows.length ? `${id}-${current}` : undefined}
							aria-autocomplete="list"
							value={search}
							onChange={(event) => {
								setSearch(event.target.value);
								setActive(0);
							}}
							onKeyDown={(event) => {
								if (event.key === "ArrowDown" || event.key === "ArrowUp") {
									event.preventDefault();
									const step = event.key === "ArrowDown" ? 1 : -1;
									if (rows.length) setActive((current + step + rows.length) % rows.length);
								} else if (event.key === "Enter" && rows[current]) {
									event.preventDefault();
									go(rows[current].url);
								}
							}}
							placeholder="Search props, guides, examples"
							spellCheck={false}
							autoComplete="off"
							// 16px on phones: iOS zooms into any smaller input it focuses.
							className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-[15px]"
						/>
						<Kbd className="hidden h-6 rounded-full bg-surface px-2 text-[11px] sm:inline-flex">
							Esc
						</Kbd>
					</div>

					<div ref={list} className="min-h-0 shrink overflow-y-auto overscroll-contain p-2 [scrollbar-width:thin]">
						{!typed && (
							<p className="px-3 pt-1 pb-2 text-xs font-medium text-muted-foreground">Start here</p>
						)}
						<div id={`${id}-list`} role="listbox" aria-label="Results">
							{rows.map((row, index) => {
								const nested = typed && row.kind !== "page";
								return (
									<Link
										key={`${row.id}-${index}`}
										id={`${id}-${index}`}
										role="option"
										aria-selected={index === current}
										data-index={index}
										href={row.url}
										tabIndex={-1}
										onClick={(event) => {
											// Modified clicks open a new tab and leave search open.
											if (!(event.metaKey || event.ctrlKey || event.shiftKey)) close();
										}}
										// Only real pointer movement picks a row, so scrolling under
										// a still cursor doesn't.
										onPointerMove={() => index !== current && setActive(index)}
										className={cn(
											"group/row flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none transition-[background-color] duration-100",
											nested && "ml-4",
											index === current && "bg-surface",
										)}
									>
										<Icon icon={index === current ? MoveRight : ICONS[row.kind]} className="size-4 shrink-0 text-muted-foreground" />
										<span className="min-w-0 flex-1">
											<span
												className={cn(
													"block truncate text-[14px]",
													row.kind === "text" ? "text-muted-foreground" : "font-medium text-foreground",
												)}
											>
												<Highlight text={row.content} />
											</span>
											{row.meta && <span className="block truncate text-[12px] text-muted-foreground">{row.meta}</span>}
										</span>
										<Icon
											icon={CornerDownLeft}
											className={cn(
												"size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-100",
												index === current && "opacity-100",
											)}
										/>
									</Link>
								);
							})}
						</div>
						{typed && !query.isLoading && rows.length === 0 && (
							<p className="px-3 py-12 text-center text-sm text-muted-foreground">
								Nothing matches &ldquo;{search.trim()}&rdquo;
							</p>
						)}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
