"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide";
import { NumericText } from "@/components/numeric-text/numeric-text";
import { Stage, useTicker } from "@/components/examples/stage";
import { Icon } from "@/components/ui/icon";
import { reveal } from "@/lib/reveal";
import { SectionHeading } from "./section-heading";

function Cycle({ values, interval = 1600, render }: { values: string[]; interval?: number; render: (value: string, previous: string) => ReactNode }) {
	const [index, setIndex] = useState(0);
	useTicker(() => setIndex((i) => (i + 1) % values.length), interval);
	return <>{render(values[index], values[(index + values.length - 1) % values.length])}</>;
}

const toNumber = (value: string) => Number(value.replace(/[^\d.]/g, ""));

const RULES = [
	{
		title: "Only what changed moves",
		body: "Old and new text are compared glyph by glyph. 123.45 to 123.46 rolls one digit; the rest hold perfectly still.",
		demo: (
			<Cycle
				values={["123.45", "123.46", "123.96", "124.06"]}
				render={(value) => <NumericText value={value} fontSize={44} fontWeight="600" monospacedDigits className="tracking-tight" />}
			/>
		),
	},
	{
		title: "Aligned at the decimal",
		body: "Digits keep their place around the separator, with prefixes and suffixes held apart, so $9.99 to $10.49 grows a digit instead of shuffling.",
		demo: (
			<Cycle
				values={["$9.99", "$10.49", "$104.90", "$10.49"]}
				render={(value) => <NumericText value={value} fontSize={44} fontWeight="600" monospacedDigits className="tracking-tight" />}
			/>
		),
	},
	{
		title: "Direction from the value",
		body: "Bigger numbers roll up and smaller ones roll down, worked out from the values themselves. Force it for clocks and countdowns.",
		demo: (
			<Cycle
				values={["418", "532", "207", "989", "640"]}
				render={(value, previous) => {
					const up = toNumber(value) >= toNumber(previous);
					return (
						<span className="flex items-center gap-3">
							<NumericText value={value} fontSize={44} fontWeight="600" monospacedDigits className="tracking-tight" />
							<span className="grid size-7 place-items-center rounded-full bg-background text-muted-foreground shadow-raised">
								<Icon icon={up ? ArrowUp : ArrowDown} className="size-3.5" />
							</span>
						</span>
					);
				}}
			/>
		),
	},
];

export function HowItWorks() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28">
			<SectionHeading eyebrow="How it works" title="A diff, not a crossfade.">
				Most animated text fades the old value out and the new one in. NumericText lines the two up and moves each glyph
				on its own spring, in the spirit of SwiftUI&apos;s numericText transition.
			</SectionHeading>
			<div className="mt-12 grid gap-8 sm:mt-14 md:grid-cols-3 md:gap-5">
				{RULES.map((rule, index) => (
					<div key={rule.title} {...reveal(index)} className="flex flex-col gap-4">
						<Stage compact pausable={false} resettable={false} className="my-0">
							{rule.demo}
						</Stage>
						<div className="px-1">
							<h3 className="text-[15px] font-semibold tracking-tight text-foreground">{rule.title}</h3>
							<p className="mt-1.5 text-[14px] leading-relaxed text-pretty text-muted-foreground">{rule.body}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
