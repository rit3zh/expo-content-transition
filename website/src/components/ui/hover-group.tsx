"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Where `element` sits inside `container`, from layout offsets rather than
 * screen rects: unaffected by scrolling, and by a popup still scaling in.
 */
function measure(element: HTMLElement, container: HTMLElement): Box {
	let x = 0;
	let y = 0;
	let node: HTMLElement | null = element;
	while (node && node !== container) {
		x += node.offsetLeft;
		y += node.offsetTop;
		const parent = node.offsetParent as HTMLElement | null;
		// Walked past the container: it isn't positioned, so fall back to rects.
		if (parent && !container.contains(parent) && parent !== container) {
			const a = element.getBoundingClientRect();
			const b = container.getBoundingClientRect();
			return { x: a.left - b.left, y: a.top - b.top + container.scrollTop, width: a.width, height: a.height };
		}
		node = parent;
	}
	return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

interface Spot {
	box: Box;
	visible: boolean;
	/** Arriving from hidden: appear in place instead of sliding in from the last spot. */
	instant: boolean;
}

const same = (a: Box, b: Box) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

/** Moves to `box`, or shows it, keeping the last spot while hidden. */
function place(previous: Spot | null, box: Box): Spot {
	if (previous?.visible && same(previous.box, box)) return previous;
	return { box, visible: true, instant: !previous?.visible };
}

const hide = (previous: Spot | null) => (previous?.visible ? { ...previous, visible: false } : previous);

/** A pill that moves itself; nothing else re-renders while it glides. */
function Pill({ spot, className }: { spot: Spot | null; className?: string }) {
	if (!spot) return null;
	const { box, visible, instant } = spot;
	return (
		<motion.span
			aria-hidden
			className={cn("pointer-events-none absolute top-0 left-0 z-[-1] will-change-transform", className)}
			initial={{ x: box.x, y: box.y, width: box.width, height: box.height, opacity: 0 }}
			animate={{ x: box.x, y: box.y, width: box.width, height: box.height, opacity: visible ? 1 : 0 }}
			transition={{
				default: instant ? { duration: 0 } : spring.glide,
				opacity: { duration: visible ? 0.2 : 0.28, ease: "easeOut" },
			}}
		/>
	);
}

/**
 * One highlight shared by every item inside: it follows the pointer (and
 * keyboard focus) from item to item, and an optional second pill marks the
 * current item and slides when that changes.
 */
export function HoverGroup({
	children,
	className,
	item = "a, button",
	pill,
	active,
	activeKey,
	activePill,
	nearest = false,
}: {
	children: ReactNode;
	className?: string;
	/** Which descendants the highlight lands on. */
	item?: string;
	pill?: string;
	/** Selector for the current item, re-found whenever `activeKey` changes. */
	active?: string;
	activeKey?: unknown;
	activePill?: string;
	/**
	 * Between items (over a heading, say), head for the item nearest the
	 * pointer instead of waiting, so the highlight keeps gliding.
	 */
	nearest?: boolean;
}) {
	const container = useRef<HTMLDivElement>(null);
	const [hover, setHover] = useState<Spot | null>(null);
	const [current, setCurrent] = useState<Spot | null>(null);

	const land = (target: EventTarget | null) => {
		const root = container.current;
		const element = (target as HTMLElement | null)?.closest<HTMLElement>(item);
		if (!root || !element || !root.contains(element)) return;
		const box = measure(element, root);
		setHover((previous) => place(previous, box));
	};

	const landNearest = (clientY: number) => {
		const root = container.current;
		if (!root) return;
		let best: HTMLElement | null = null;
		let distance = Infinity;
		for (const element of root.querySelectorAll<HTMLElement>(item)) {
			const rect = element.getBoundingClientRect();
			const d = Math.abs(clientY - (rect.top + rect.height / 2));
			if (d < distance) {
				distance = d;
				best = element;
			}
		}
		if (best) land(best);
	};

	useLayoutEffect(() => {
		const root = container.current;
		if (!root || !active) return;
		const update = () => {
			const element = root.querySelector<HTMLElement>(active);
			setCurrent((previous) => (element ? place(previous, measure(element, root)) : hide(previous)));
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(root);
		return () => observer.disconnect();
	}, [active, activeKey]);

	return (
		<div
			ref={container}
			className={cn("relative isolate", className)}
			onPointerOver={(event) => event.pointerType !== "touch" && land(event.target)}
			onPointerMove={
				nearest
					? (event) => {
							if (event.pointerType === "touch") return;
							if (!(event.target as HTMLElement).closest(item)) landNearest(event.clientY);
						}
					: undefined
			}
			onPointerLeave={() => setHover(hide)}
			onFocus={(event) => (event.target as HTMLElement).matches(":focus-visible") && land(event.target)}
			onBlur={(event) => !container.current?.contains(event.relatedTarget as Node) && setHover(hide)}
		>
			<Pill spot={hover} className={pill} />
			{active && <Pill spot={current} className={activePill} />}
			{children}
		</div>
	);
}
