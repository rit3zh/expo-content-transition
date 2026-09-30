"use client";

import { useEffect, useState } from "react";
import { NumericText } from "@/components/numeric-text/numeric-text";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ExpoMark } from "./expo-mark";

const WORDS = ["number", "price", "timer", "counter", "score"];

/**
 * The headline, written by the library: its first line swaps the kind of
 * text it's made for, and only the letters that change roll. The line is
 * full width and centred by the engine, so glyphs glide as it changes length.
 */
export function HeroTitle() {
	const [index, setIndex] = useState(0);
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		if (reduceMotion) return;
		const timer = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2200);
		return () => clearInterval(timer);
	}, [reduceMotion]);

	return (
		<h1 className="w-full text-[42px] leading-[1.04] font-semibold tracking-[-0.035em] text-foreground sm:text-6xl lg:text-[72px]">
			<span className="sr-only">Smooth number transitions for Expo.</span>
			<span aria-hidden>
				<NumericText
					value={`Smooth ${WORDS[index]}`}
					alignment="center"
					direction="up"
					duration={560}
					bounce={0.3}
					style={{ display: "block", width: "100%" }}
					role="presentation"
					aria-label={undefined}
				/>
				<span className="block">
					transitions for <ExpoMark />
				</span>
			</span>
		</h1>
	);
}
