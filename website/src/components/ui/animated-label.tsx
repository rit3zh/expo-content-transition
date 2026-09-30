"use client";

import { useEffect, useRef, useState } from "react";
import { NumericText } from "@/components/numeric-text/numeric-text";
import { cn } from "@/lib/utils";

/**
 * A label that changes the way the library changes text: only the
 * characters that differ roll through, and the box around them glides to
 * its new width instead of snapping, so whatever sits beside it moves too.
 */
export function AnimatedLabel({
	value,
	lead,
	className,
}: {
	value: string;
	/** Space before the text, kept only while there is text, so an empty label takes no room. */
	lead?: string;
	className?: string;
}) {
	const inner = useRef<HTMLSpanElement>(null);
	const [width, setWidth] = useState<number>();

	useEffect(() => {
		const element = inner.current;
		if (!element) return;
		const observer = new ResizeObserver(([entry]) => setWidth(entry.borderBoxSize[0].inlineSize));
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		// A CSS transition rather than a spring: it starts from the measured
		// width every time, where the spring snapped on its very first run.
		<span
			className={cn(
				"relative inline-flex transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
				className,
			)}
			style={width === undefined ? undefined : { width }}
		>
			<span ref={inner} className={cn("inline-flex w-max shrink-0 whitespace-nowrap", value && lead)}>
				<NumericText value={value} duration={460} direction="up" aria-live="polite" role="status" />
			</span>
		</span>
	);
}
