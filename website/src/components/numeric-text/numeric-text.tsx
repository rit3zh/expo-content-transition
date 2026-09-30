"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { TransitionSprings } from "@/lib/numeric-text/engine/animation/TransitionSprings";
import { alignmentFromProp, directionFromProp } from "@/lib/numeric-text/engine/enums";
import { GlyphTypesetter, type ContentSize } from "@/lib/numeric-text/engine/glyphs";
import { TRANSITION_SHAPE_DEFAULTS, type NumericTextSpec } from "@/lib/numeric-text/engine/records";
import { NumericTextLabel } from "@/lib/numeric-text/engine/views/NumericTextLabel";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/*
 * The package's <NumericText>, for the DOM. It drives the very same
 * NumericTextLabel the package renders on web (synced from web/ at build
 * time), so every preview on this site moves exactly like the real thing.
 *
 * One difference, for the site's convenience: typography that isn't passed
 * is inherited from the surrounding text instead of defaulting to 17px
 * system type, so it can sit inside buttons and headings like any span.
 */

export type NumericTextProps = {
	value: string | number;
	/** Milliseconds, as in the package. */
	duration?: number;
	direction?: "auto" | "up" | "down";
	bounce?: number;
	enterScale?: number;
	travel?: number;
	blur?: boolean;
	blurIntensity?: number;
	maxBlurRadius?: number;
	clip?: boolean;
	animated?: boolean;
	alignment?: "start" | "center" | "end";
	decimalSeparator?: string;
	color?: string;
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: string;
	fontStyle?: "normal" | "italic";
	letterSpacing?: number;
	monospacedDigits?: boolean;
	className?: string;
	style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLSpanElement>, "color" | "style" | "className">;

const MAX_BLUR_INTENSITY = 8;
const MAX_ENTER_SCALE = 2;
const MAX_TRAVEL_RATIO = 3;
const MAX_BOUNCE = 0.95;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface Inherited {
	fontFamily: string;
	fontSize: number;
	fontWeight: string;
	fontStyle: string;
	letterSpacing: number;
}

function readInherited(element: HTMLElement): Inherited {
	const computed = getComputedStyle(element);
	return {
		fontFamily: computed.fontFamily,
		fontSize: parseFloat(computed.fontSize) || 17,
		fontWeight: computed.fontWeight,
		fontStyle: computed.fontStyle,
		letterSpacing: parseFloat(computed.letterSpacing) || 0,
	};
}

const sameInherited = (a: Inherited | null, b: Inherited) =>
	a !== null &&
	a.fontFamily === b.fontFamily &&
	a.fontSize === b.fontSize &&
	a.fontWeight === b.fontWeight &&
	a.fontStyle === b.fontStyle &&
	a.letterSpacing === b.letterSpacing;

/** Bumps whenever a web font finishes loading, so glyphs are measured again in the real face. */
function useFontRevision() {
	const [revision, setRevision] = useState(0);
	useEffect(() => {
		const fonts = document.fonts;
		if (!fonts) return;
		const bump = () => setRevision((current) => current + 1);
		fonts.addEventListener("loadingdone", bump);
		return () => fonts.removeEventListener("loadingdone", bump);
	}, []);
	return revision;
}

export function NumericText({
	value,
	duration,
	direction,
	bounce,
	enterScale,
	travel,
	blur,
	blurIntensity,
	maxBlurRadius,
	clip,
	animated,
	alignment,
	decimalSeparator,
	color,
	fontFamily,
	fontSize,
	fontWeight,
	fontStyle,
	letterSpacing,
	monospacedDigits,
	className,
	style,
	...props
}: NumericTextProps) {
	const text = typeof value === "number" ? String(value) : value;
	const host = useRef<HTMLSpanElement>(null);
	const label = useRef<NumericTextLabel | null>(null);
	const [size, setSize] = useState<ContentSize | null>(null);
	const [inherited, setInherited] = useState<Inherited | null>(null);
	const fontRevision = useFontRevision();
	const reducedMotion = useReducedMotion();

	const typesetter = useMemo(
		() =>
			new GlyphTypesetter({
				fontFamily: fontFamily ?? inherited?.fontFamily,
				fontSize: fontSize ?? inherited?.fontSize ?? 17,
				fontWeight: fontWeight ?? inherited?.fontWeight,
				fontStyle: fontStyle ?? inherited?.fontStyle,
				letterSpacing: letterSpacing ?? inherited?.letterSpacing ?? 0,
				monospacedDigits: monospacedDigits ?? false,
			}),
		// fontRevision: a new face means new measurements.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[fontFamily, fontSize, fontWeight, fontStyle, letterSpacing, monospacedDigits, inherited, fontRevision],
	);

	const spec: NumericTextSpec = {
		text,
		alignment: alignmentFromProp(alignment),
		direction: directionFromProp(direction),
		decimalSeparator: (decimalSeparator && Array.from(decimalSeparator)[0]) || ".",
		blurEnabled: blur ?? true,
		shape: {
			blurIntensity: clamp(blurIntensity ?? TRANSITION_SHAPE_DEFAULTS.blurIntensity, 0, MAX_BLUR_INTENSITY),
			maxBlurRadius: maxBlurRadius == null ? TRANSITION_SHAPE_DEFAULTS.maxBlurRadius : Math.max(maxBlurRadius, 0),
			enterScale: clamp(enterScale ?? TRANSITION_SHAPE_DEFAULTS.enterScale, 0, MAX_ENTER_SCALE),
			travelRatio: clamp(travel ?? TRANSITION_SHAPE_DEFAULTS.travelRatio, 0, MAX_TRAVEL_RATIO),
		},
		clipEnabled: clip ?? true,
		animationsEnabled: (animated ?? true) && !reducedMotion,
		duration: duration === undefined ? TransitionSprings.REFERENCE_DURATION : duration / 1000,
		bounce: clamp(bounce ?? TransitionSprings.DEFAULT_BOUNCE, 0, MAX_BOUNCE),
	};

	useLayoutEffect(() => {
		const element = host.current;
		if (!element) return;
		setInherited(readInherited(element));

		const instance = new NumericTextLabel(element);
		instance.onContentSizeChange = setSize;
		label.current = instance;

		// Responsive type changes size with the window; follow it.
		let frame = 0;
		const onResize = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const next = readInherited(element);
				setInherited((current) => (sameInherited(current, next) ? current : next));
			});
		};
		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
			cancelAnimationFrame(frame);
			instance.destroy();
			label.current = null;
		};
	}, []);

	useLayoutEffect(() => {
		// Wait for the surrounding typography, so the first frame is measured in the right face.
		if (!inherited) return;
		label.current?.update(spec, typesetter, color ?? null);
	});

	return (
		<span
			ref={host}
			role="img"
			aria-label={text}
			{...props}
			className={cn("relative inline-block whitespace-pre", className)}
			style={{ lineHeight: "normal", ...(size && { width: size.width, height: size.height }), ...style }}
		>
			{/* The plain text: what shows before JavaScript runs, and afterwards an
			    invisible copy that gives the box its baseline inside a line of text. */}
			<span
				aria-hidden
				style={{
					...(inherited ? typesetter.fontStyle : { fontVariantNumeric: monospacedDigits ? "tabular-nums" : undefined }),
					color,
					visibility: inherited ? "hidden" : undefined,
				}}
			>
				{text}
			</span>
		</span>
	);
}
