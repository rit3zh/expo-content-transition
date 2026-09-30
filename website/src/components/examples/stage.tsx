"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, RotateCw } from "lucide";
import { Icon } from "@/components/ui/icon";
import { DotGrid } from "@/components/ui/dot-grid";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StageState {
	/** On screen and not paused: timers may run. */
	active: boolean;
	/** Someone has pressed or typed inside the stage; demos stop playing themselves. */
	interacted: boolean;
}

const StageContext = createContext<StageState>({ active: true, interacted: false });

export const useStage = () => useContext(StageContext);

/**
 * Calls `callback` every `interval` ms while the stage is on screen and
 * playing. With `untilInteraction`, it also stops once the reader takes over,
 * so a demo that plays itself never fights their clicks.
 */
export function useTicker(callback: () => void, interval: number, { untilInteraction = false } = {}) {
	const { active, interacted } = useStage();
	const latest = useRef(callback);
	useEffect(() => {
		latest.current = callback;
	});
	const running = active && !(untilInteraction && interacted);
	useEffect(() => {
		if (!running) return;
		const timer = setInterval(() => latest.current(), interval);
		return () => clearInterval(timer);
	}, [running, interval]);
}

const CONTROL =
	"grid size-8 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-md outline-offset-2 transition-[color,scale] duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.96]";

/**
 * The dotted stage every live example stands on. Timers only run while it's
 * on screen, so a long page of demos costs nothing off screen.
 */
export function Stage({
	children,
	caption,
	className,
	pausable = true,
	resettable = true,
	compact = false,
}: {
	children: ReactNode;
	caption?: ReactNode;
	className?: string;
	pausable?: boolean;
	resettable?: boolean;
	/** A shorter stage for cards. */
	compact?: boolean;
}) {
	const root = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [paused, setPaused] = useState(false);
	const [interacted, setInteracted] = useState(false);
	const [generation, setGeneration] = useState(0);

	useEffect(() => {
		const element = root.current;
		if (!element) return;
		const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const state = { active: visible && !paused, interacted };

	return (
		<figure className={cn("my-8 overflow-hidden rounded-2xl", className)}>
			<div
				ref={root}
				className={cn(
					"relative flex flex-col items-center justify-center bg-stage px-4 sm:px-8",
					compact ? "min-h-[180px] py-8" : "min-h-[260px] pt-14 pb-10",
				)}
				// Only the demo counts, not the stage's own controls.
				onPointerDown={(event) => !(event.target as HTMLElement).closest("[data-stage-control]") && setInteracted(true)}
				onKeyDown={(event) => !(event.target as HTMLElement).closest("[data-stage-control]") && setInteracted(true)}
			>

				<DotGrid />

				<div data-stage-control className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
					{pausable && (
						<Tooltip>
							<TooltipTrigger aria-label={paused ? "Play" : "Pause"} onClick={() => setPaused((value) => !value)} className={CONTROL}>
								<Icon icon={paused ? Play : Pause} className="size-3.5" />
							</TooltipTrigger>
							<TooltipContent side="bottom">{paused ? "Play" : "Pause"}</TooltipContent>
						</Tooltip>
					)}
					{resettable && (
						<Tooltip>
							<TooltipTrigger
								aria-label="Reset"
								onClick={() => {
									setGeneration((value) => value + 1);
									setInteracted(false);
									setPaused(false);
								}}
								className={CONTROL}
							>
								<Icon icon={RotateCcw} hover={RotateCw} className="size-3.5" />
							</TooltipTrigger>
							<TooltipContent side="bottom">Reset</TooltipContent>
						</Tooltip>
					)}
				</div>

				<StageContext.Provider value={state}>
					<div key={generation} className="relative flex w-full flex-col items-center">
						{children}
					</div>
				</StageContext.Provider>
			</div>
			{caption && <figcaption className="mt-3 text-center text-xs text-muted-foreground">{caption}</figcaption>}
		</figure>
	);
}
