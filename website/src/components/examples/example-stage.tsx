"use client";

import type { ReactNode } from "react";
import type { ExampleId } from "@/lib/examples";
import { DEMOS } from "./demos";
import { Stage } from "./stage";

// Examples that only answer input have nothing to pause.
const INTERACTIVE_ONLY = new Set<ExampleId>(["input"]);

export function ExampleStage({
	id,
	caption,
	className,
}: {
	id: ExampleId;
	caption?: ReactNode;
	className?: string;
}) {
	const Demo = DEMOS[id];
	return (
		<Stage caption={caption} pausable={!INTERACTIVE_ONLY.has(id)} className={className}>
			<Demo />
		</Stage>
	);
}
