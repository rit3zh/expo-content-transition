"use client";

import { useEffect, useRef, useState } from "react";
import { MorphIcon, type IconNode, type MorphIconProps } from "morphicons/react";
import { createMorph } from "morphicons/dom";

export type { IconNode };

type IconProps = Omit<MorphIconProps, "icon" | "from" | "to" | "progress"> & {
	/** Lucide icon data (from `lucide`, not `lucide-react`). */
	icon: IconNode;
	/** Morphs into this while the nearest link or button is hovered or focused. */
	hover?: IconNode;
	/** Starts as this and morphs into `icon` the first time it scrolls into view. */
	reveal?: IconNode;
};

/**
 * Works out the morph between each pair ahead of time, while the browser is
 * idle. morphicons caches a pair's plan the first time it morphs, so without
 * this the first click on, say, a copy button stutters while it computes and
 * every later one is smooth. Runs off-screen on a stand-in path.
 */
export function prewarmMorphs(pairs: [IconNode, IconNode][]) {
	if (typeof window === "undefined") return;
	const run = () => {
		const path = { setAttribute() {} };
		for (const [from, to] of pairs) {
			const morph = createMorph(path, from, { reducedMotion: "never" });
			morph.morphTo(to);
			morph.destroy();
		}
	};
	if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 2000 });
	else setTimeout(run, 200);
}

// Pairs already planned, so each hover morph is worked out once per page.
const warmed = new WeakMap<IconNode, WeakSet<IconNode>>();

function prewarmHover(icon: IconNode, hover: IconNode) {
	const seen = warmed.get(icon) ?? new WeakSet<IconNode>();
	if (seen.has(hover)) return;
	seen.add(hover);
	warmed.set(icon, seen);
	prewarmMorphs([
		[icon, hover],
		[hover, icon],
	]);
}

const HOST = "a, button, [role='button'], [role='menuitem'], [data-morph-host]";

/**
 * Every icon on the site. State changes morph (pass a different `icon`),
 * and `hover` / `reveal` give static icons a little life of their own.
 */
export function Icon({ icon, hover, reveal, strokeWidth = 1.75, spring = "snappy", ...props }: IconProps) {
	const anchor = useRef<HTMLSpanElement>(null);
	const [hovered, setHovered] = useState(false);
	const [seen, setSeen] = useState(!reveal);

	// Plan the hover morph while idle, so the first hover is as smooth as the rest.
	useEffect(() => {
		if (hover) prewarmHover(icon, hover);
	}, [icon, hover]);

	useEffect(() => {
		const host = hover ? anchor.current?.closest<HTMLElement>(HOST) : null;
		if (!host) return;
		const on = () => setHovered(true);
		const off = () => setHovered(false);
		const focus = () => host.matches(":focus-visible") && on();
		host.addEventListener("pointerenter", on);
		host.addEventListener("pointerleave", off);
		host.addEventListener("focus", focus);
		host.addEventListener("blur", off);
		return () => {
			host.removeEventListener("pointerenter", on);
			host.removeEventListener("pointerleave", off);
			host.removeEventListener("focus", focus);
			host.removeEventListener("blur", off);
		};
	}, [hover]);

	useEffect(() => {
		const element = anchor.current?.parentElement;
		if (seen || !element) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				// A beat after arriving, so the morph is actually seen.
				setTimeout(() => setSeen(true), 180);
				observer.disconnect();
			},
			{ rootMargin: "0px 0px -15% 0px" },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [seen]);

	const shown = !seen && reveal ? reveal : hovered && hover ? hover : icon;

	return (
		// `contents` keeps the svg a direct layout child of whatever holds it.
		<span ref={anchor} className="contents">
			<MorphIcon icon={shown} strokeWidth={strokeWidth} spring={spring} {...props} />
		</span>
	);
}
