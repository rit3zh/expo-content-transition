import type { ReactNode } from "react";
import { Circle, CircleAlert, Info, Lightbulb, TriangleAlert } from "lucide";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const TYPES = {
	info: { icon: Info, label: "Note", tone: "text-muted-foreground" },
	tip: { icon: Lightbulb, label: "Tip", tone: "text-muted-foreground" },
	warn: { icon: TriangleAlert, label: "Warning", tone: "text-amber-600 dark:text-amber-400" },
	error: { icon: CircleAlert, label: "Important", tone: "text-destructive" },
} as const;

/** A quiet aside. Only warnings and errors earn a colour. */
export function Callout({
	type = "info",
	title,
	children,
}: {
	type?: keyof typeof TYPES;
	title?: ReactNode;
	children: ReactNode;
}) {
	const { icon, label, tone } = TYPES[type];
	return (
		<aside className="my-6 flex gap-3 rounded-xl bg-surface px-4 py-3.5 text-[14px] leading-relaxed">
			{/* Each icon grows out of a plain circle as the note scrolls in. */}
			<Icon icon={icon} reveal={Circle} spring="bouncy" className={cn("mt-[3px] size-4 shrink-0", tone)} />
			<div className="min-w-0 flex-1 [&>p]:my-0 [&>p+p]:mt-2">
				<p className="mb-0.5! font-medium text-foreground">{title ?? label}</p>
				<div className="text-muted-foreground [&_p]:my-0 [&_p+p]:mt-2">{children}</div>
			</div>
		</aside>
	);
}
