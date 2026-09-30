"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import {
	AnchorProvider,
	ScrollProvider,
	TOCItem,
	useActiveAnchors,
	type TOCItemType,
} from "fumadocs-core/toc";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, type MotionValue } from "motion/react";
import { AlignLeft, ArrowUp, ChevronsUp, CircleDot, MessageCircleWarning, PenLine, SquarePen, TextAlignStart } from "lucide";
import { NumericText } from "@/components/numeric-text/numeric-text";
import { HoverGroup } from "@/components/ui/hover-group";
import { Icon, type IconNode } from "@/components/ui/icon";
import { blurIn, spring } from "@/lib/motion";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const INDENT: Record<number, string> = { 2: "pl-2.5", 3: "pl-5.5", 4: "pl-8.5" };

// Short, so a quick scroll never queues up a backlog of rolling digits.
const PERCENT_DURATION = 320;

/**
 * How far down the page you are: a percentage whose changing digits roll,
 * drawn by the library itself, beside a small ring that fills.
 */
function ReadingProgress() {
	const { scrollYProgress } = useScroll();
	const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
	const [percent, setPercent] = useState(0);
	// Whole percents only, so the text re-renders once per step, not every frame.
	useMotionValueEvent(scrollYProgress, "change", (value) => {
		const next = Math.round(Math.min(1, Math.max(0, value)) * 100);
		setPercent((current) => (current === next ? current : next));
	});

	return (
		<span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">
			<NumericText value={`${percent}%`} duration={PERCENT_DURATION} monospacedDigits aria-label={`${percent}% read`} />
			<ProgressRing progress={progress} />
		</span>
	);
}

function ProgressRing({ progress }: { progress: MotionValue<number> }) {
	return (
		<svg viewBox="0 0 16 16" className="size-3.5 -rotate-90" aria-hidden>
			<circle cx="8" cy="8" r="6" fill="none" strokeWidth="2" className="stroke-surface dark:stroke-accent" />
			<motion.circle
				cx="8"
				cy="8"
				r="6"
				fill="none"
				strokeWidth="2"
				strokeLinecap="round"
				className="stroke-foreground/70"
				style={{ pathLength: progress }}
			/>
		</svg>
	);
}

/**
 * A soft block behind whichever headings are in view. It glides to the next
 * section and stretches over several at once, with no rule down the side.
 */
function ActiveBlock({ list }: { list: RefObject<HTMLUListElement | null> }) {
	const active = useActiveAnchors();
	const [block, setBlock] = useState<{ top: number; height: number; instant: boolean } | null>(null);

	useLayoutEffect(() => {
		const element = list.current;
		if (!element) return;
		const measure = () => {
			const rows = active
				.map((id) => element.querySelector<HTMLElement>(`a[href="#${CSS.escape(id)}"]`))
				.filter((row): row is HTMLElement => row !== null);
			if (rows.length === 0) return setBlock(null);
			// Rects relative to the list: scroll and the rows' entrance don't skew them.
			const origin = element.getBoundingClientRect().top;
			const top = Math.min(...rows.map((row) => row.getBoundingClientRect().top)) - origin;
			const bottom = Math.max(...rows.map((row) => row.getBoundingClientRect().bottom)) - origin;
			setBlock((previous) => ({ top, height: bottom - top, instant: previous === null }));
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [active, list]);

	return (
		<motion.span
			aria-hidden
			className="pointer-events-none absolute inset-x-0 top-0 z-[-1] rounded-lg bg-surface will-change-transform dark:bg-surface"
			initial={false}
			animate={block ? { y: block.top, height: block.height, opacity: 1 } : { opacity: 0 }}
			transition={{ default: block?.instant ? { duration: 0 } : spring.glide, opacity: { duration: 0.2 } }}
		/>
	);
}

function FooterLink({ href, icon, hover, children, external }: { href: string; icon: IconNode; hover: IconNode; children: string; external?: boolean }) {
	return (
		<a
			href={href}
			{...(external ? { target: "_blank", rel: "noreferrer" } : {})}
			className="flex w-fit items-center gap-2 text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
		>
			<Icon icon={icon} hover={hover} className="size-3.5" />
			{children}
		</a>
	);
}

/** Follows the headings in view, shows how far you've read, and gets you back up. */
export function DocsToc({ items, editUrl }: { items: TOCItemType[]; editUrl?: string }) {
	const container = useRef<HTMLDivElement>(null);
	const list = useRef<HTMLUListElement>(null);
	const { scrollY } = useScroll();
	const [scrolled, setScrolled] = useState(false);
	useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 480));

	if (items.length === 0) return null;

	return (
		<AnchorProvider toc={items}>
			<div data-morph-host className="mb-4 flex items-center justify-between gap-2">
				<p className="flex items-center gap-2 text-[13px] font-medium text-foreground">
					<Icon icon={TextAlignStart} hover={AlignLeft} className="size-3.5" />
					On this page
				</p>
				<ReadingProgress />
			</div>
			<div
				ref={container}
				className="no-scrollbar relative max-h-[calc(100dvh-20rem)] overflow-y-auto overscroll-contain [mask-image:linear-gradient(to_bottom,black_calc(100%-24px),transparent)]"
			>
				<ScrollProvider containerRef={container}>
					<HoverGroup item="a" pill="rounded-lg bg-surface/60">
					<ul ref={list} className="relative flex flex-col">
						<ActiveBlock list={list} />
						{items.map((item, index) => (
							<motion.li
								key={item.url}
								initial={{ opacity: 0, x: -4, filter: "blur(2px)" }}
								animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
								transition={{ ...spring.smooth, delay: Math.min(index, 12) * 0.025 }}
							>
								<TOCItem
									href={item.url}
									className={cn(
										"block rounded-lg py-1.5 pr-2.5 text-[13px] leading-snug text-muted-foreground/75 transition-colors duration-200 ease-out hover:text-foreground",
										"data-[active=true]:text-foreground",
										INDENT[item.depth] ?? "pl-2.5",
									)}
								>
									{item.title}
								</TOCItem>
							</motion.li>
						))}
					</ul>
					</HoverGroup>
				</ScrollProvider>
			</div>

			<div className="mt-7 flex flex-col gap-2.5">
				{editUrl && (
					<FooterLink href={editUrl} icon={SquarePen} hover={PenLine} external>
						Edit this page
					</FooterLink>
				)}
				<FooterLink href={`${site.repo}/issues/new`} icon={MessageCircleWarning} hover={CircleDot} external>
					Report an issue
				</FooterLink>
				<AnimatePresence initial={false}>
					{scrolled && (
						<motion.button
							type="button"
							{...blurIn}
							transition={spring.smooth}
							whileTap={{ scale: 0.96 }}
							onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
							className="flex w-fit items-center gap-2 text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
						>
							<Icon icon={ArrowUp} hover={ChevronsUp} className="size-3.5" />
							Back to top
						</motion.button>
					)}
				</AnimatePresence>
			</div>
		</AnchorProvider>
	);
}
