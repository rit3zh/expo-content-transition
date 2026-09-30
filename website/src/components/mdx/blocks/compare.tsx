"use client";

import { useState } from "react";
import { NumericText, type NumericTextProps } from "@/components/numeric-text/numeric-text";
import { Stage, useTicker } from "@/components/examples/stage";
import { cn } from "@/lib/utils";

type Value = string | number | boolean;

const SEQUENCES = {
	/** Three-digit numbers, up and down, sometimes one digit and sometimes all three. */
	numbers: (previous: string) => {
		const current = Number(previous);
		const step = Math.random() < 0.5 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 400) + 20;
		const next = Math.random() < 0.55 ? current + step : current - step;
		return String(next < 100 || next > 999 ? 100 + Math.floor(Math.random() * 900) : next);
	},
	prices: (previous: string) => {
		const next = Number(previous.slice(1)) + (Math.random() - 0.4) * 30;
		return `$${Math.min(Math.max(next, 10), 999).toFixed(2)}`;
	},
} as const;

const START = { numbers: "128", prices: "$42.80" } as const;

const COLUMNS: Record<number, string> = { 2: "grid-cols-2", 4: "grid-cols-2 sm:grid-cols-4" };

const format = (value: Value) => (typeof value === "string" ? `"${value}"` : `{${value}}`);

/**
 * One changing value shown several times, each with a different setting of
 * one prop, so the difference is the only thing that differs.
 */
export function Compare({
	prop,
	values,
	extra,
	sequence = "numbers",
	interval = 1800,
	fontSize = 48,
	caption,
}: {
	prop: keyof NumericTextProps;
	values: Value[];
	/** Props every cell shares, to exaggerate what's being compared. */
	extra?: Partial<NumericTextProps>;
	sequence?: keyof typeof SEQUENCES;
	interval?: number;
	fontSize?: number;
	caption?: string;
}) {
	return (
		<Stage caption={caption} resettable={false}>
			<Cells prop={prop} values={values} extra={extra} sequence={sequence} interval={interval} fontSize={fontSize} />
		</Stage>
	);
}

function Cells({
	prop,
	values,
	extra,
	sequence,
	interval,
	fontSize,
}: {
	prop: keyof NumericTextProps;
	values: Value[];
	extra?: Partial<NumericTextProps>;
	sequence: keyof typeof SEQUENCES;
	interval: number;
	fontSize: number;
}) {
	const [value, setValue] = useState<string>(START[sequence]);
	useTicker(() => setValue(SEQUENCES[sequence]), interval);

	return (
		<div className={cn("grid w-full gap-x-4 gap-y-8", COLUMNS[values.length] ?? "grid-cols-1 sm:grid-cols-3")}>
			{values.map((setting) => (
				<div key={String(setting)} className="flex flex-col items-center gap-4">
					{/* Room above and below, so an unclipped roll has somewhere to go. */}
					<div
						className={cn(
							"flex h-24 w-full items-center justify-center",
							// Alignment only shows against the box it's aligned in.
							prop === "alignment" && "rounded-xl border border-dashed border-foreground/15 px-4",
						)}
					>
						<NumericText
							value={value}
							fontSize={fontSize}
							fontWeight="600"
							monospacedDigits
							className="tracking-tight"
							{...extra}
							{...{ [prop]: setting }}
						/>
					</div>
					<code className="rounded-md bg-background px-2 py-0.5 font-mono text-[12px] text-muted-foreground shadow-raised">
						{prop}={format(setting)}
					</code>
				</div>
			))}
		</div>
	);
}
