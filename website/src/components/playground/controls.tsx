"use client";

import { useId, type ReactNode } from "react";
import { Slider } from "@base-ui/react/slider";
import { Switch } from "@base-ui/react/switch";
import { motion } from "motion/react";
import { NumericText } from "@/components/numeric-text/numeric-text";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** A labelled group of rows, like a section of an inspector. */
export function ControlGroup({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
	return (
		<section className="flex flex-col gap-1">
			<div className="flex h-8 items-center justify-between px-1">
				<h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
				{action}
			</div>
			<div className="flex flex-col rounded-2xl bg-surface p-1.5">{children}</div>
		</section>
	);
}

function Row({ label, hint, children, disabled }: { label: ReactNode; hint?: string; children: ReactNode; disabled?: boolean }) {
	return (
		<div
			className={cn(
				"flex min-h-11 items-center justify-between gap-4 rounded-xl px-3 py-1.5 transition-opacity duration-200",
				disabled && "pointer-events-none opacity-40",
			)}
			title={hint}
		>
			{label}
			{children}
		</div>
	);
}

const PropName = ({ children }: { children: string }) => (
	<span className="shrink-0 font-mono text-[12.5px] text-foreground/85">{children}</span>
);

/** A slider whose readout rolls, drawn by the component it configures. */
export function SliderRow({
	label,
	value,
	onChange,
	min,
	max,
	step,
	format = (v) => String(v),
	disabled,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step: number;
	format?: (value: number) => string;
	disabled?: boolean;
}) {
	return (
		<Row label={<PropName>{label}</PropName>} disabled={disabled}>
			<div className="flex w-[min(62%,15rem)] items-center gap-3">
				<Slider.Root
					value={value}
					onValueChange={(next) => onChange(next as number)}
					min={min}
					max={max}
					step={step}
					disabled={disabled}
					className="flex-1"
				>
					<Slider.Control className="flex h-6 touch-none items-center">
						<Slider.Track className="relative h-1 w-full rounded-full bg-foreground/10">
							<Slider.Indicator className="rounded-full bg-foreground/80" />
							<Slider.Thumb
								aria-label={label}
								className="size-4 rounded-full bg-background shadow-[0_0_0_1px_oklch(0_0_0/0.08),0_1px_3px_oklch(0_0_0/0.2)] outline-offset-2 transition-[scale] duration-150 focus-visible:outline-2 focus-visible:outline-solid data-dragging:scale-110 dark:bg-foreground"
							/>
						</Slider.Track>
					</Slider.Control>
				</Slider.Root>
				<span className="w-12 text-right text-foreground">
					<NumericText value={format(value)} fontSize={12.5} monospacedDigits duration={260} className="font-mono" />
				</span>
			</div>
		</Row>
	);
}

export function SwitchRow({
	label,
	checked,
	onChange,
	disabled,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}) {
	const id = useId();
	return (
		<Row label={<label htmlFor={id}><PropName>{label}</PropName></label>} disabled={disabled}>
			<Switch.Root
				id={id}
				checked={checked}
				onCheckedChange={onChange}
				disabled={disabled}
				className="relative flex h-[22px] w-[38px] shrink-0 items-center rounded-full bg-foreground/15 p-[3px] outline-offset-2 transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-solid data-checked:bg-foreground"
			>
				<Switch.Thumb className="size-4 rounded-full bg-background shadow-[0_1px_2px_oklch(0_0_0/0.2)] transition-transform duration-200 ease-out-quart data-checked:translate-x-4" />
			</Switch.Root>
		</Row>
	);
}

/** Options on a track, with one pill that glides to the chosen one. */
export function Segmented<T extends string>({
	options,
	value,
	onChange,
	label,
	className,
	mono = true,
}: {
	options: readonly { value: T; label: string }[];
	value: T;
	onChange: (value: T) => void;
	label: string;
	className?: string;
	mono?: boolean;
}) {
	const id = useId();
	const reduceMotion = useReducedMotion();
	return (
		<div role="radiogroup" aria-label={label} className={cn("flex shrink-0 items-center rounded-full bg-foreground/[0.06] p-0.5", className)}>
			{options.map((option) => {
				const selected = option.value === value;
				return (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={selected}
						onClick={() => onChange(option.value)}
						className={cn(
							"relative h-7 touch-manipulation rounded-full px-2.5 text-xs outline-offset-1 transition-[color,scale] duration-150 select-none focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.96]",
							mono && "font-mono",
							selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
						)}
					>
						{selected && (
							<motion.span
								layoutId={`${id}-pill`}
								transition={reduceMotion ? { duration: 0 } : spring.snappy}
								className="absolute inset-0 rounded-full bg-background shadow-[0_1px_2px_oklch(0_0_0/0.08)] dark:bg-accent"
							/>
						)}
						<span className="relative">{option.label}</span>
					</button>
				);
			})}
		</div>
	);
}

export function SegmentedRow<T extends string>(props: Parameters<typeof Segmented<T>>[0]) {
	return (
		<Row label={<PropName>{props.label}</PropName>}>
			<Segmented {...props} />
		</Row>
	);
}
