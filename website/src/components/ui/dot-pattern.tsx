import { useId, type SVGProps } from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps extends SVGProps<SVGSVGElement> {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	cx?: number;
	cy?: number;
	cr?: number;
	className?: string;
}

/** A static field of dots filling its (positioned) parent. */
export function DotPattern({ width = 24, height = 24, x = 0, y = 0, cx = 1, cy = 0.5, cr = 0.5, className, ...props }: DotPatternProps) {
	const id = useId();

	return (
		<svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full fill-foreground/30 dark:fill-foreground/25", className)} {...props}>
			<defs>
				<pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse" x={x} y={y}>
					<circle cx={cx} cy={cy} r={cr} />
				</pattern>
			</defs>
			<rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
		</svg>
	);
}
