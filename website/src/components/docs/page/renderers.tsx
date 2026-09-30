import type { ReactNode } from "react";
import { ArrowUpRight, MoveUpRight } from "lucide";
import { siAndroid, siApple, siHtml5 } from "simple-icons";
import { SimpleIcon } from "@/components/icons";
import { Icon } from "@/components/ui/icon";

// One family for all three marks, solid and the same size, each in its own colour.
const LOGO = "size-3.5";

// What draws the glyphs on each platform, linked to its official documentation.
const RENDERERS: { name: string; platform: string; href: string; logo: ReactNode }[] = [
	{
		name: "Core Animation",
		platform: "iOS",
		href: "https://developer.apple.com/documentation/quartzcore",
		// Apple's mark is black, so it follows the text colour to stay visible in dark mode.
		logo: <SimpleIcon path={siApple.path} className={`${LOGO} text-foreground`} />,
	},
	{
		name: "Jetpack Compose",
		platform: "Android",
		href: "https://developer.android.com/compose",
		logo: <SimpleIcon path={siAndroid.path} className={LOGO} style={{ color: `#${siAndroid.hex}` }} />,
	},
	{
		name: "DOM",
		platform: "Web",
		href: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API",
		logo: <SimpleIcon path={siHtml5.path} className={LOGO} style={{ color: `#${siHtml5.hex}` }} />,
	},
];

/** What renders the transitions on each platform, one quiet chip each. */
export function Renderers() {
	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<span className="text-[12.5px] text-muted-foreground/70">Rendered natively with</span>
			<div className="flex flex-wrap items-center gap-1.5">
				{RENDERERS.map((renderer) => (
					<a
						key={renderer.name}
						href={renderer.href}
						target="_blank"
						rel="noreferrer"
						title={`${renderer.name} documentation (${renderer.platform})`}
						className="group/chip flex h-8 items-center gap-2 rounded-full bg-surface pr-2.5 pl-2 text-[12.5px] outline-offset-2 transition-[background-color,scale] duration-200 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.97]"
					>
						<span className="grid size-5 place-items-center">{renderer.logo}</span>
						<span className="font-medium text-foreground">{renderer.name}</span>
						<Icon
							icon={ArrowUpRight}
							hover={MoveUpRight}
							className="size-3 text-muted-foreground opacity-50 transition-opacity duration-200 group-hover/chip:opacity-100"
						/>
					</a>
				))}
			</div>
		</div>
	);
}
