import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide";
import { Playground } from "@/components/playground/playground";
import { Icon } from "@/components/ui/icon";
import { reveal } from "@/lib/reveal";
import { SectionHeading } from "./section-heading";

export function PlaygroundSection() {
	return (
		<section className="border-y border-border bg-surface/40">
			<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<SectionHeading eyebrow="Playground" title="Every prop, live.">
						Drag a slider and the next change uses it. The code updates with you, down to the props you can leave out.
					</SectionHeading>
					<Link
						{...reveal(3)}
						href="/docs/playground"
						className="flex items-center gap-1.5 text-[14px] font-medium text-foreground"
					>
						Full screen
						<Icon icon={ArrowRight} hover={MoveRight} className="size-3.5" />
					</Link>
				</div>
				<div {...reveal(2)} className="mt-6 [&>div]:mb-0">
					<Playground />
				</div>
			</div>
		</section>
	);
}
