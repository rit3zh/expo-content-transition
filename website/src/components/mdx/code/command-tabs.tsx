"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, useVelocity } from "motion/react";
import { CopyButton } from "@/components/shared/copy-button";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* One command, written for several tools. Switching tabs never swaps the
   whole line: words both versions share (`expo install expo-content-transition`)
   keep their identity and glide to their new column, while the words that
   differ (`npx` → `pnpm dlx`) blur out and in. The indicator behind the tabs
   blurs in proportion to its speed, like a motion-blurred photo of it. */

// The same colors Shiki's github themes give bash, so this block sits among
// the highlighted ones without looking different.
const COLOR = {
	command: "light-dark(#953800, #FFA657)",
	arg: "light-dark(#0A3069, #A5D6FF)",
	flag: "light-dark(#0550AE, #79C0FF)",
};

type Word = { key: string; text: string; color: string };

function words(command: string): Word[] {
	const seen = new Map<string, number>();
	return command
		.trim()
		.split(/\s+/)
		.map((text, i) => {
			// Repeated words (`yarn dlx yarn …`) need distinct identities.
			const n = seen.get(text) ?? 0;
			seen.set(text, n + 1);
			return {
				key: `${text}#${n}`,
				text,
				color: i === 0 ? COLOR.command : text.startsWith("-") ? COLOR.flag : COLOR.arg,
			};
		});
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function CommandTabs({
	commands,
	groupId,
	label = "Package manager",
}: {
	/** Tab label → command, in tab order. */
	commands: Record<string, string>;
	/** Tabs with the same id stay in sync and are remembered between visits. */
	groupId?: string;
	/** What the tabs choose between, for screen readers. */
	label?: string;
}) {
	const id = useId();
	const reduceMotion = useReducedMotion();
	const labels = Object.keys(commands);
	const [shared, setShared] = usePersistedTab(groupId, labels[0]);
	const [local, setLocal] = useState(labels[0]);
	const stored = groupId ? shared : local;
	const active = labels.includes(stored) ? stored : labels[0];
	const select = (label: string) => (groupId ? setShared(label) : setLocal(label));

	const line = useMemo(() => words(commands[active]), [commands, active]);

	// The indicator is placed by hand rather than with a shared layout, so its
	// velocity is known and can drive the blur.
	const list = useRef<HTMLDivElement>(null);
	const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
	const x = useMotionValue(0);
	const width = useMotionValue(0);
	const velocity = useVelocity(x);
	const blur = useTransform(velocity, (v) => `blur(${Math.min(Math.abs(v) / 450, 5)}px)`);
	const stretch = useTransform(velocity, (v) => 1 - Math.min(Math.abs(v) / 12000, 0.12));
	const [placed, setPlaced] = useState(false);
	// The first placement, and the one right after hydration picks up a
	// remembered tab, jump; only choices made on the page slide.
	const settled = useRef(false);

	useLayoutEffect(() => {
		const tab = tabs.current[active];
		if (!tab) return;
		if (!settled.current || reduceMotion) {
			x.jump(tab.offsetLeft);
			width.jump(tab.offsetWidth);
		} else {
			animate(x, tab.offsetLeft, spring.snappy);
			animate(width, tab.offsetWidth, spring.snappy);
		}
		setPlaced(true);
	}, [active, reduceMotion, x, width]);

	useEffect(() => {
		const frame = requestAnimationFrame(() => (settled.current = true));
		// Fonts loading or the column resizing move the tabs; follow without sliding.
		const observer = new ResizeObserver(() => {
			const tab = list.current?.querySelector<HTMLElement>('[aria-selected="true"]');
			if (!tab) return;
			x.jump(tab.offsetLeft);
			width.jump(tab.offsetWidth);
		});
		if (list.current) observer.observe(list.current);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [x, width]);

	const onKeyDown = (e: React.KeyboardEvent) => {
		const i = labels.indexOf(active);
		const last = labels.length - 1;
		const next = {
			ArrowRight: i === last ? 0 : i + 1,
			ArrowLeft: i === 0 ? last : i - 1,
			Home: 0,
			End: last,
		}[e.key];
		if (next === undefined) return;
		e.preventDefault();
		select(labels[next]);
		tabs.current[labels[next]]?.focus();
	};

	return (
		<div data-code-tabs="" className="my-6 overflow-hidden rounded-xl bg-code">
			<div className="flex h-11 items-center gap-2 pt-1 pr-1.5 pl-2">
				<div
					ref={list}
					role="tablist"
					aria-label={label}
					onKeyDown={onKeyDown}
					className="no-scrollbar relative flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
				>
					<motion.span
						aria-hidden
						className={cn(
							"absolute top-0 left-0 h-7 rounded-md bg-background shadow-[0_1px_2px_oklch(0_0_0/0.06)] dark:bg-accent",
							!placed && "opacity-0",
						)}
						style={{ x, width, filter: blur, scaleY: stretch }}
					/>
					{labels.map((label) => {
						const selected = label === active;
						return (
							<button
								key={label}
								ref={(el) => {
									tabs.current[label] = el;
								}}
								type="button"
								role="tab"
								id={`${id}-tab-${label}`}
								aria-selected={selected}
								aria-controls={`${id}-panel`}
								tabIndex={selected ? 0 : -1}
								onClick={() => select(label)}
								className={cn(
									"relative z-10 flex h-7 shrink-0 touch-manipulation items-center rounded-md px-2.5 font-mono text-xs outline-offset-2 select-none",
									"transition-[color,scale] duration-150 ease-out active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-solid motion-reduce:transition-[color]",
									selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
								)}
							>
								{label}
							</button>
						);
					})}
				</div>
				<CopyButton value={commands[active]} label="Copy command" />
			</div>

			<div
				role="tabpanel"
				id={`${id}-panel`}
				aria-labelledby={`${id}-tab-${active}`}
				className="no-scrollbar overflow-x-auto py-4 font-mono text-[13px] leading-[1.7]"
			>
				<span className="sr-only">{commands[active]}</span>
				<div aria-hidden className="relative flex w-max gap-[1ch] px-4 whitespace-pre">
					<AnimatePresence mode="popLayout" initial={false}>
						{line.map((word) => (
							<motion.span
								key={word.key}
								layout="position"
								style={{ color: word.color }}
								initial={{ opacity: 0, filter: "blur(4px)", y: reduceMotion ? 0 : 4 }}
								animate={{
									opacity: 1,
									filter: "blur(0px)",
									y: 0,
									color: word.color,
									transition: { duration: 0.1, ease: EASE_OUT },
								}}
								exit={{
									opacity: 0,
									filter: "blur(4px)",
									y: reduceMotion ? 0 : -4,
									transition: { duration: 0.06, ease: EASE_OUT },
								}}
								transition={reduceMotion ? { duration: 0 } : { layout: spring.snappy }}
							>
								{word.text}
							</motion.span>
						))}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
