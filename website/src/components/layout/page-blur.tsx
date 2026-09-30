"use client";

import { useEffect, useState } from "react";
import GradualBlur from "@/components/GradualBlur";
import { cn } from "@/lib/utils";

// Large screens with a mouse or trackpad. Stacked backdrop blurs are cheap
// there and drag badly on phones, so phones never render them.
const DESKTOP = "(min-width: 64rem) and (pointer: fine)";

/**
 * A soft blur along the bottom edge of the window, so the page dissolves
 * into it rather than being cut off. It fades out near the end of the page,
 * so the footer is never read through it.
 */
export function BottomBlur() {
	const [atEnd, setAtEnd] = useState(false);

	useEffect(() => {
		if (!matchMedia(DESKTOP).matches) return;
		const update = () => {
			const { scrollHeight } = document.documentElement;
			setAtEnd(window.innerHeight + window.scrollY >= scrollHeight - 240);
		};
		update();
		window.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);
		return () => {
			window.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};
	}, []);

	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden h-28 transition-opacity duration-500 ease-out lg:pointer-fine:block",
				atEnd && "opacity-0",
			)}
		>
			<GradualBlur position="bottom" height="7rem" strength={2} divCount={6} curve="bezier" exponential />
		</div>
	);
}

/**
 * What sits behind a header: on desktop a blur that trails off below it, so
 * content slides under rather than hitting an edge; on phones one plain
 * blur, which is far cheaper to draw.
 */
export function HeaderBlur() {
	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
			<div className="absolute inset-0 bg-background/90 backdrop-blur-md lg:pointer-fine:hidden" />
			<div className="absolute inset-x-0 top-0 hidden h-24 lg:pointer-fine:block">
				{/* A wash of the page colour for legible nav text, fading as the blur does. */}
				<div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,color-mix(in_oklab,var(--background)_70%,transparent)_45%,transparent)]" />
				<GradualBlur position="top" height="6rem" strength={1.5} divCount={5} curve="ease-out" zIndex={0} />
			</div>
		</div>
	);
}
