import type { ReactNode } from "react";
import { Code, CodeXml } from "lucide";
import { ExampleStage } from "@/components/examples/example-stage";
import { Icon } from "@/components/ui/icon";
import { EXAMPLES, type ExampleId } from "@/lib/examples";
import { HighlightedCode } from "../code/highlighted-code";

/** The file an example's code would live in, from the component it exports. */
export const exampleFile = (code: string) => `${/export function (\w+)/.exec(code)?.[1] ?? "App"}.tsx`;

/**
 * A live example and the React Native code that produces it. Both come from
 * lib/examples.ts and components/examples/demos.tsx, side by side.
 */
export function Example({ id, caption, code = true }: { id: ExampleId; caption?: ReactNode; code?: boolean }) {
	const entry = EXAMPLES[id];
	return (
		<div className="my-8">
			<ExampleStage id={id} caption={caption} className="my-0" />
			{code && (
				<section aria-label={`${entry.title} code`} className="mt-6">
					<p data-morph-host className="mb-3 flex items-center gap-2 text-[13px] font-medium text-foreground">
						<Icon icon={Code} hover={CodeXml} className="size-3.5 text-muted-foreground" />
						Usage
					</p>
					<div className="[&>figure]:my-0">
						<HighlightedCode code={entry.code} title={exampleFile(entry.code)} />
					</div>
				</section>
			)}
		</div>
	);
}
