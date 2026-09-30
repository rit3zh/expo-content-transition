import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide";
import { ExampleStage } from "@/components/examples/example-stage";
import { exampleAnchor } from "@/components/mdx/blocks/example-grid";
import { Icon } from "@/components/ui/icon";
import { EXAMPLES, type ExampleId } from "@/lib/examples";
import { reveal } from "@/lib/reveal";
import { SectionHeading } from "./section-heading";

const FEATURED: ExampleId[] = ["currency", "stock", "countdown", "likes", "status", "progress"];

export function ExamplesShowcase() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28">
			<div className="flex flex-wrap items-end justify-between gap-6">
				<SectionHeading eyebrow="Examples" title="For the numbers in your app.">
					Balances, prices, timers, counts and labels. Each one is a few lines, and every one below is running now.
				</SectionHeading>
				<Link {...reveal(3)} href="/docs/examples" className="flex items-center gap-1.5 text-[14px] font-medium text-foreground">
					All examples
					<Icon icon={ArrowRight} hover={MoveRight} className="size-3.5" />
				</Link>
			</div>
			<div className="mt-12 grid gap-x-5 gap-y-10 sm:mt-14 md:grid-cols-2 lg:grid-cols-3">
				{FEATURED.map((id, index) => (
					<div key={id} {...reveal(index % 3)} className="flex min-w-0 flex-col gap-3">
						<ExampleStage id={id} className="my-0 [&>div]:min-h-[290px]" />
						<Link href={`/docs/examples#${exampleAnchor(id)}`} className="group/tile flex flex-col gap-0.5 px-1">
							<span className="flex items-center gap-1.5 text-[14px] font-medium text-foreground">
								{EXAMPLES[id].title}
								<Icon icon={ArrowRight} hover={MoveRight} className="size-3.5 text-muted-foreground" />
							</span>
							<span className="text-[13px] leading-relaxed text-muted-foreground">{EXAMPLES[id].description}</span>
						</Link>
					</div>
				))}
			</div>
		</section>
	);
}
