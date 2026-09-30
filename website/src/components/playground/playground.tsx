"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Dices, Pause, Play, RotateCcw, RotateCw, Shuffle } from "lucide";
import { NumericText } from "@/components/numeric-text/numeric-text";
import { DotGrid } from "@/components/ui/dot-grid";
import { Icon } from "@/components/ui/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ControlGroup, Segmented, SegmentedRow, SliderRow, SwitchRow } from "./controls";
import { PlaygroundCode } from "./playground-code";
import { INITIAL, type Settings } from "./settings";

const random = (min: number, max: number) => Math.random() * (max - min) + min;

/** Kinds of content to try, each with a way to make its next value from the last. */
const PRESETS = {
	number: {
		label: "Number",
		initial: "1,284",
		next: (previous: string) => {
			const current = Number(previous.replace(/[^\d.-]/g, "")) || 1284;
			const step = Math.random() < 0.5 ? Math.round(random(1, 9)) : Math.round(random(20, 900));
			const next = Math.max(0, current + (Math.random() < 0.6 ? step : -step));
			return next.toLocaleString("en-US");
		},
	},
	price: {
		label: "Price",
		initial: "$2,480.50",
		next: (previous: string) => {
			const current = Number(previous.replace(/[^\d.]/g, "")) || 2480.5;
			const next = Math.max(1, current + random(-160, 240));
			return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(next);
		},
	},
	timer: {
		label: "Timer",
		initial: "04:59",
		next: (previous: string) => {
			const [m, s] = previous.split(":").map(Number);
			const total = (Number.isFinite(m) && Number.isFinite(s) ? m * 60 + s : 300) - 1;
			const wrapped = total < 0 ? 299 : total;
			return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
		},
	},
	word: {
		label: "Word",
		initial: "Simple",
		next: (previous: string) => {
			const words = ["Simple", "Calm", "Fluid", "Native", "Crisp", "Quiet"];
			return words[(words.indexOf(previous) + 1) % words.length];
		},
	},
} as const;

type Preset = keyof typeof PRESETS;

const PRESET_OPTIONS = (Object.keys(PRESETS) as Preset[]).map((value) => ({ value, label: PRESETS[value].label }));

const NARROW = "(max-width: 639px)";
const subscribeNarrow = (onChange: () => void) => {
	const media = matchMedia(NARROW);
	media.addEventListener("change", onChange);
	return () => media.removeEventListener("change", onChange);
};

const ICON_BUTTON =
	"grid size-9 place-items-center rounded-full bg-background text-muted-foreground shadow-raised outline-offset-2 transition-[color,scale] duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.94]";

/**
 * Every prop, live. The preview is the package's own web renderer; the code
 * beside it is exactly what to paste to get the same motion on a phone.
 */
export function Playground() {
	const [settings, setSettings] = useState<Settings>(INITIAL);
	const [preset, setPreset] = useState<Preset>("price");
	const [value, setValue] = useState<string>(PRESETS.price.initial);
	const [playing, setPlaying] = useState(true);
	const [visible, setVisible] = useState(false);
	const stage = useRef<HTMLDivElement>(null);
	// Big type doesn't fit a phone; the preview scales it, the code keeps the real number.
	const narrow = useSyncExternalStore(subscribeNarrow, () => matchMedia(NARROW).matches, () => false);

	const set = <K extends keyof Settings>(key: K) => (next: Settings[K]) => setSettings((current) => ({ ...current, [key]: next }));

	useEffect(() => {
		const element = stage.current;
		if (!element) return;
		const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	// A beat longer than the transition, so each change settles before the next.
	const interval = Math.max(1100, settings.duration * 2 + 600);
	useEffect(() => {
		if (!playing || !visible) return;
		const timer = setInterval(() => setValue((current) => PRESETS[preset].next(current)), interval);
		return () => clearInterval(timer);
	}, [playing, visible, preset, interval]);

	const choosePreset = (next: Preset) => {
		setPreset(next);
		setValue(PRESETS[next].initial);
	};

	const previewSize = narrow ? Math.min(settings.fontSize, 44) : settings.fontSize;

	return (
		<div className="my-8 flex flex-col gap-6">
			<div ref={stage} className="relative overflow-hidden rounded-2xl bg-stage">
				<DotGrid />
				<div className="relative flex flex-wrap items-center justify-between gap-3 px-3 pt-3">
					<Segmented label="Content" options={PRESET_OPTIONS} value={preset} onChange={choosePreset} mono={false} className="bg-background/70 backdrop-blur-md" />
					<div className="flex items-center gap-1.5">
						<Tooltip>
							<TooltipTrigger aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)} className={ICON_BUTTON}>
								<Icon icon={playing ? Pause : Play} className="size-3.5" />
							</TooltipTrigger>
							<TooltipContent side="bottom">{playing ? "Pause" : "Play"}</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger aria-label="Next value" onClick={() => setValue((current) => PRESETS[preset].next(current))} className={ICON_BUTTON}>
								<Icon icon={Shuffle} hover={Dices} className="size-3.5" />
							</TooltipTrigger>
							<TooltipContent side="bottom">Next value</TooltipContent>
						</Tooltip>
					</div>
				</div>

				{/* Tall enough that an unclipped, far-travelling roll still has room. */}
				<div className="relative flex min-h-[260px] items-center px-6 py-10 sm:min-h-[300px] sm:px-10">
					<NumericText
						value={value}
						style={{ width: "100%" }}
						fontSize={previewSize}
						fontWeight={settings.fontWeight}
						monospacedDigits={settings.monospacedDigits}
						alignment={settings.alignment}
						direction={settings.direction}
						duration={settings.duration}
						bounce={settings.bounce}
						enterScale={settings.enterScale}
						travel={settings.travel}
						blur={settings.blur}
						blurIntensity={settings.blurIntensity}
						clip={settings.clip}
						animated={settings.animated}
						className="tracking-tight"
					/>
				</div>

				<div className="relative flex justify-center px-3 pb-4">
					<input
						value={value}
						onChange={(event) => {
							setValue(event.target.value.slice(0, 24));
							setPlaying(false);
						}}
						aria-label="Value"
						spellCheck={false}
						className="h-10 w-full max-w-[18rem] rounded-full bg-background px-5 text-center font-mono text-base text-foreground shadow-raised outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid sm:text-[13px]"
					/>
				</div>
			</div>

			<div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
				<div className="flex flex-col gap-5">
					<ControlGroup
						title="Transition"
						action={
							<button
								type="button"
								onClick={() => setSettings(INITIAL)}
								className="flex h-7 items-center gap-1.5 rounded-full px-2 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
							>
								<Icon icon={RotateCcw} hover={RotateCw} className="size-3" />
								Reset all
							</button>
						}
					>
						<SegmentedRow
							label="direction"
							options={[
								{ value: "auto", label: "auto" },
								{ value: "up", label: "up" },
								{ value: "down", label: "down" },
							]}
							value={settings.direction}
							onChange={set("direction")}
						/>
						<SliderRow label="duration" value={settings.duration} onChange={set("duration")} min={100} max={1500} step={10} />
						<SliderRow label="bounce" value={settings.bounce} onChange={set("bounce")} min={0} max={0.95} step={0.01} format={(v) => v.toFixed(2)} />
						<SliderRow label="enterScale" value={settings.enterScale} onChange={set("enterScale")} min={0} max={2} step={0.05} format={(v) => v.toFixed(2)} />
						<SliderRow label="travel" value={settings.travel} onChange={set("travel")} min={0} max={1.5} step={0.01} format={(v) => v.toFixed(2)} />
						<SwitchRow label="animated" checked={settings.animated} onChange={set("animated")} />
					</ControlGroup>

					<ControlGroup title="Blur and clipping">
						<SwitchRow label="blur" checked={settings.blur} onChange={set("blur")} />
						<SliderRow
							label="blurIntensity"
							value={settings.blurIntensity}
							onChange={set("blurIntensity")}
							min={0}
							max={8}
							step={0.1}
							format={(v) => v.toFixed(1)}
							disabled={!settings.blur}
						/>
						<SwitchRow label="clip" checked={settings.clip} onChange={set("clip")} />
					</ControlGroup>

					<ControlGroup title="Typography">
						<SliderRow label="fontSize" value={settings.fontSize} onChange={set("fontSize")} min={20} max={120} step={1} />
						<SegmentedRow
							label="fontWeight"
							options={[
								{ value: "400", label: "400" },
								{ value: "500", label: "500" },
								{ value: "600", label: "600" },
								{ value: "700", label: "700" },
							]}
							value={settings.fontWeight}
							onChange={set("fontWeight")}
						/>
						<SegmentedRow
							label="alignment"
							options={[
								{ value: "start", label: "start" },
								{ value: "center", label: "center" },
								{ value: "end", label: "end" },
							]}
							value={settings.alignment}
							onChange={set("alignment")}
						/>
						<SwitchRow label="monospacedDigits" checked={settings.monospacedDigits} onChange={set("monospacedDigits")} />
					</ControlGroup>
				</div>

				<div className="lg:sticky lg:top-24 lg:self-start">
					<PlaygroundCode settings={settings} />
					<p className={cn("mt-3 px-1 text-[13px] leading-relaxed text-muted-foreground")}>
						Only props that differ from the defaults are written. The preview runs the package&apos;s own web renderer, so
						this is the motion you get on the web; iOS and Android follow the same springs.
					</p>
				</div>
			</div>
		</div>
	);
}
