import type { Transition } from "motion/react";

// One set of springs for every micro-interaction, so the site moves with one feel.
export const spring = {
	/** Crisp and responsive: presses, pills, indicators. */
	snappy: { type: "spring", stiffness: 400, damping: 28, mass: 0.8 },
	/** Elegant default: sizes and positions that settle. */
	smooth: { type: "spring", stiffness: 220, damping: 24, mass: 1 },
	/** Follows the pointer: a soft glide that settles without overshooting or wobbling. */
	glide: { type: "spring", stiffness: 340, damping: 38, mass: 0.9 },
	/** A touch of play, for things that arrive. */
	bouncy: { type: "spring", stiffness: 300, damping: 18, mass: 1 },
} satisfies Record<string, Transition>;

/** How things arrive and leave: a small scale and a soft blur, never a pop. */
export const blurIn = {
	initial: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
	animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
	exit: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
} as const;
