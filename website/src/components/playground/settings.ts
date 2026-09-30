// The playground's knobs, the package's defaults, and the JSX they add up to.

export interface Settings {
	direction: "auto" | "up" | "down";
	duration: number;
	bounce: number;
	enterScale: number;
	travel: number;
	blur: boolean;
	blurIntensity: number;
	clip: boolean;
	animated: boolean;
	alignment: "start" | "center" | "end";
	fontSize: number;
	fontWeight: string;
	monospacedDigits: boolean;
}

/** What NumericText does when a prop is left out. `fontSize` has no default, so it's always written. */
export const DEFAULTS: Omit<Settings, "fontSize"> = {
	direction: "auto",
	duration: 420,
	bounce: 0.46,
	enterScale: 0.4,
	travel: 0.333,
	blur: true,
	blurIntensity: 1,
	clip: true,
	animated: true,
	alignment: "start",
	fontWeight: "normal",
	monospacedDigits: false,
};

/** Where the playground starts: the defaults, set in a heavier, centred face. */
export const INITIAL: Settings = { ...DEFAULTS, alignment: "center", fontSize: 72, fontWeight: "600", monospacedDigits: true };

/** Written in the order a reader would look for them: type, then motion. */
const ORDER: (keyof Settings)[] = [
	"fontSize",
	"fontWeight",
	"monospacedDigits",
	"alignment",
	"direction",
	"duration",
	"bounce",
	"enterScale",
	"travel",
	"blur",
	"blurIntensity",
	"clip",
	"animated",
];

export type Attribute = { name: keyof Settings; value: string | number | boolean };

export function attributes(settings: Settings): Attribute[] {
	return ORDER.flatMap((name) => {
		const value = settings[name];
		if (name !== "fontSize" && DEFAULTS[name as keyof typeof DEFAULTS] === value) return [];
		// Intensity means nothing once blur is off.
		if (name === "blurIntensity" && !settings.blur) return [];
		return [{ name, value }];
	});
}

export const formatAttribute = ({ name, value }: Attribute) =>
	value === true ? name : typeof value === "string" ? `${name}="${value}"` : `${name}={${value}}`;

export function toCode(settings: Settings): string {
	const lines = [{ name: "value", value: "{value}" }, ...attributes(settings)].map((attribute) =>
		attribute.name === "value" ? "  value={value}" : `  ${formatAttribute(attribute as Attribute)}`,
	);
	return `import { NumericText } from 'expo-content-transition';\n\n<NumericText\n${lines.join("\n")}\n/>`;
}
