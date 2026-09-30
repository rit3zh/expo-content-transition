"use client";

import { useEffect, useState } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";
import expoIcon from "@/assets/expo-icon/expo-dev-icon.png";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * The Expo chevron in liquid metal, sized to the text around it (1em), so it
 * can stand in for the word in a headline.
 */
export function ExpoMark({ className }: { className?: string }) {
	const reduceMotion = useReducedMotion();
	// The shader draws its first frame a moment after mounting; fade in then, never pop.
	const [ready, setReady] = useState(false);
	useEffect(() => {
		const frame = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<span
			aria-hidden
			className={cn(
				"inline-block size-[0.92em] align-[-0.06em] transition-opacity duration-700 ease-out",
				ready ? "opacity-100" : "opacity-0",
				className,
			)}
		>
			<LiquidMetal
				image={expoIcon.src}
				// Transparent behind, so only the chevron shows; any colour here draws a box.
				colorBack="#00000000"
				// A cool, faintly blue silver reads richer than plain white chrome.
				colorTint="#dbe4ff"
				repetition={2}
				softness={0.1}
				shiftRed={0.35}
				shiftBlue={0.45}
				distortion={0.07}
				contour={0.4}
				angle={70}
				speed={reduceMotion ? 0 : 1}
				scale={0.9}
				fit="contain"
				// Crisp edges at headline size, on any screen.
				minPixelRatio={2}
				style={{ width: "100%", height: "100%" }}
			/>
		</span>
	);
}
