import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide";
import { ExampleStage } from "@/components/examples/example-stage";
import { Icon } from "@/components/ui/icon";
import { EXAMPLES, type ExampleId } from "@/lib/examples";

/** The heading id an example gets on the examples page. */
export const exampleAnchor = (id: ExampleId) => EXAMPLES[id].title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Live examples as tiles, each opening its full write-up with code. */
export function ExampleGrid({ ids = Object.keys(EXAMPLES) as ExampleId[] }: { ids?: ExampleId[] }) {
	return (
		<div className="@container my-8">
			<div className="grid gap-x-4 gap-y-8 @min-[640px]:grid-cols-2">
				{ids.map((id) => (
					<div key={id} className="flex min-w-0 flex-col gap-3">
						<ExampleStage id={id} className="my-0 [&>div]:min-h-[290px]" />
						<Link
							href={`/docs/examples#${exampleAnchor(id)}`}
							className="group/tile flex flex-col gap-0.5 rounded-md px-1 outline-offset-4 focus-visible:outline-2 focus-visible:outline-solid"
						>
							<span className="flex items-center gap-1.5 text-[14px] font-medium text-foreground">
								{EXAMPLES[id].title}
								<Icon icon={ArrowRight} hover={MoveRight} className="size-3.5 text-muted-foreground" />
							</span>
							<span className="text-[13px] leading-relaxed text-muted-foreground">{EXAMPLES[id].description}</span>
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}
