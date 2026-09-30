// NumericText's props, grouped as the package groups its interfaces
// (src/interfaces). Descriptions follow the JSDoc there; backticks become code.

export interface PropRow {
	name: string;
	type: string;
	default?: string;
	required?: boolean;
	description: string;
	/** A platform footnote, shown under the description. */
	platform?: string;
}

const CONTENT: PropRow[] = [
	{
		name: "value",
		type: "string | number",
		required: true,
		description:
			"The text to display. Only this crosses the bridge when the value changes: measuring, diffing and animating all happen natively. Numbers are shown with `String(value)`; format them yourself for grouping, currency or fixed decimals.",
	},
	{
		name: "alignment",
		type: "'start' | 'center' | 'end'",
		default: "'start'",
		description: "Horizontal alignment of the line inside the component's bounds. Also settable through `style.textAlign`.",
	},
	{
		name: "decimalSeparator",
		type: "string",
		default: "'.'",
		description:
			"The character separating the whole and fractional parts. Characters are aligned around it, so `123.45 → 123.46` only animates the final digit. Only its first character is used.",
	},
	{
		name: "style",
		type: "StyleProp<TextStyle>",
		description:
			"Text and layout styles. `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `letterSpacing`, `color`, `fontVariant` and `textAlign` are applied to the glyphs; everything else styles the view. An explicit prop wins over the same value set through `style`.",
	},
];

const TYPOGRAPHY: PropRow[] = [
	{ name: "fontSize", type: "number", description: "Font size in scale-independent pixels." },
	{
		name: "fontWeight",
		type: "'normal' | 'bold' | '100' … '900'",
		default: "'normal'",
		description: "The weight to draw with. Numeric weights need a family that has them.",
	},
	{ name: "fontStyle", type: "'normal' | 'italic'", default: "'normal'", description: "Upright or italic." },
	{
		name: "fontFamily",
		type: "string",
		description:
			"A font family name, resolved the same way a `<Text>` resolves one: families loaded with `expo-font`, bundled through `react-native.config.js`, or a platform built-in.",
		platform:
			"Android: `default`, `sansSerif`, `serif`, `monospace`, `cursive`. iOS: registered families and PostScript names.",
	},
	{ name: "letterSpacing", type: "number", description: "Extra spacing between characters, in points." },
	{
		name: "color",
		type: "string",
		description: "Any React Native colour value. Defaults to the platform's primary label colour.",
	},
	{
		name: "monospacedDigits",
		type: "boolean",
		default: "false",
		description:
			"Renders digits at a uniform width, so unchanged digits don't shift sideways when a neighbour changes. Equivalent to `style={{ fontVariant: ['tabular-nums'] }}`.",
	},
];

const TRANSITION: PropRow[] = [
	{
		name: "direction",
		type: "'auto' | 'up' | 'down'",
		default: "'auto'",
		description:
			"Which way glyphs travel. `auto` compares the old and new numeric values and rolls up when the number grows, down when it shrinks. Force a direction for content that doesn't read as a number.",
	},
	{
		name: "duration",
		type: "number",
		default: "420",
		description:
			"Nominal transition duration in milliseconds. Scales every internal spring, so the character of the motion is preserved.",
	},
	{
		name: "bounce",
		type: "number",
		default: "0.46",
		description:
			"How far the vertical roll overshoots before settling, from `0` to `0.95`. `0` arrives dead straight. Only the roll bounces.",
	},
	{
		name: "enterScale",
		type: "number",
		default: "0.4",
		description: "Size a glyph starts at when arriving, and shrinks to when leaving. `1` disables the scale entirely.",
	},
	{
		name: "travel",
		type: "number",
		default: "0.333",
		description:
			"How far a glyph rolls, as a fraction of the line height. `0` removes the vertical movement and leaves a scale and fade.",
	},
	{
		name: "blur",
		type: "boolean",
		default: "true",
		description: "Blurs each glyph in proportion to how far through its own transition it is.",
		platform: "Android: requires Android 12 (API 31); ignored below that.",
	},
	{
		name: "blurIntensity",
		type: "number",
		default: "1",
		description:
			"Scales the blur, clamped to `0`–`8`. The radii come from the line height, and a leaving glyph blurs harder than an arriving one. `0` is the same as `blur={false}`.",
	},
	{
		name: "maxBlurRadius",
		type: "number",
		default: "unbounded",
		description:
			"Ceiling on the blur radius, in density-independent pixels. Lets `blurIntensity` be pushed for small text without large text turning to soup.",
	},
	{
		name: "clip",
		type: "boolean",
		default: "true",
		description:
			"Clips each glyph to the measured line box, so a rolling glyph never overlaps what sits above or below. The clip is applied after the blur.",
		platform: "Android and web: the edge is feathered rather than cut.",
	},
	{
		name: "animated",
		type: "boolean",
		default: "true",
		description:
			"Set to `false` to apply values instantly. The first value is never animated either way, so a freshly mounted component shows its content immediately.",
		platform: "Web: also treated as `false` while `prefers-reduced-motion` is on.",
	},
];

export const PROP_TABLES = { content: CONTENT, typography: TYPOGRAPHY, transition: TRANSITION } as const;

export type PropTableName = keyof typeof PROP_TABLES;
