import type { ReactNode } from "react";
import { Globe } from "lucide";
import { AndroidIcon, AppleIcon } from "@/components/icons";
import { Icon } from "@/components/ui/icon";
import { reveal } from "@/lib/reveal";
import { SectionHeading } from "./section-heading";

const PLATFORMS: { name: string; engine: string; icon: ReactNode; points: string[] }[] = [
	{
		name: "iOS",
		engine: "Core Animation",
		icon: <AppleIcon className="size-4" />,
		points: ["Each glyph is its own layer, driven by the display link", "System fonts, custom families and PostScript names", "iOS 16.4 and later"],
	},
	{
		name: "Android",
		engine: "Jetpack Compose",
		icon: <AndroidIcon className="size-4 text-[#3ddc84]" />,
		points: ["Glyphs drawn and transformed in a single composable", "Feathered clipping at the line edges", "Blur on Android 12 (API 31) and later"],
	},
	{
		name: "Web",
		engine: "DOM",
		icon: <Icon icon={Globe} className="size-4" />,
		points: ["One element per glyph, moved with CSS transforms", "Follows prefers-reduced-motion by itself", "Through react-native-web, no extra setup"],
	},
];

export function Platforms() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
			<SectionHeading eyebrow="Platforms" title="Native where it runs.">
				The same diff and the same springs, ported to each platform&apos;s own renderer. Only the new string crosses the
				bridge; on iOS and Android the motion never touches the JavaScript thread.
			</SectionHeading>
			<div className="mt-12 grid overflow-hidden rounded-2xl bg-border shadow-[inset_0_0_0_1px_var(--border)] [gap:1px] sm:mt-14 md:grid-cols-3">
				{PLATFORMS.map((platform, index) => (
					<div key={platform.name} {...reveal(index)} className="flex flex-col gap-5 bg-background p-6 sm:p-7">
						<div className="flex items-center justify-between">
							<span className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground">
								<span className="grid size-8 place-items-center rounded-lg bg-surface text-foreground">{platform.icon}</span>
								{platform.name}
							</span>
							<span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[11px] text-muted-foreground">{platform.engine}</span>
						</div>
						<ul className="flex flex-col gap-2.5">
							{platform.points.map((point) => (
								<li key={point} className="flex gap-2.5 text-[14px] leading-snug text-muted-foreground">
									<span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground/50" />
									{point}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
}
