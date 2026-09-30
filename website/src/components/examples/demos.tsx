"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Heart, Minus, Plus, RotateCcw } from "lucide";
import { NumericText } from "@/components/numeric-text/numeric-text";
import { Icon } from "@/components/ui/icon";
import type { ExampleId } from "@/lib/examples";
import { cn } from "@/lib/utils";
import { useTicker } from "./stage";

// The live halves of lib/examples.ts: the same components, drawn by the
// package's web engine. Anything that plays itself stops once you take over.

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));

export function RoundButton({
	label,
	onClick,
	children,
	className,
}: {
	label: string;
	onClick: () => void;
	children: ReactNode;
	className?: string;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className={cn(
				"grid size-11 shrink-0 touch-manipulation place-items-center rounded-full bg-background text-foreground shadow-raised outline-offset-2 transition-[scale,background-color] duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.94]",
				className,
			)}
		>
			{children}
		</button>
	);
}

function Counter() {
	const [count, setCount] = useState(128);
	useTicker(() => setCount((n) => n + (Math.random() < 0.7 ? randomInt(1, 12) : -randomInt(1, 9))), 1700, {
		untilInteraction: true,
	});

	return (
		<div className="flex items-center gap-6 sm:gap-8">
			<RoundButton label="Decrement" onClick={() => setCount((n) => n - 1)}>
				<Icon icon={Minus} className="size-4" />
			</RoundButton>
			<NumericText value={count} fontSize={64} fontWeight="600" monospacedDigits className="tracking-tight" />
			<RoundButton label="Increment" onClick={() => setCount((n) => n + 1)}>
				<Icon icon={Plus} className="size-4" />
			</RoundButton>
		</div>
	);
}

export const CURRENCIES = [
	{ code: "USD", locale: "en-US", rate: 1 },
	{ code: "EUR", locale: "de-DE", rate: 0.92 },
	{ code: "GBP", locale: "en-GB", rate: 0.79 },
	{ code: "JPY", locale: "ja-JP", rate: 149 },
] as const;

export const formatMoney = (usd: number, { code, locale, rate }: (typeof CURRENCIES)[number]) =>
	new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(usd * rate);

function Balance() {
	const [balance, setBalance] = useState(2480.5);
	const [index, setIndex] = useState(0);
	const currency = CURRENCIES[index];
	const deposit = () => setBalance((b) => b + Math.round(random(20, 500) * 100) / 100);
	const withdraw = () => setBalance((b) => Math.max(0, b - Math.round(random(20, 200) * 100) / 100));

	useTicker(
		() => {
			const roll = Math.random();
			if (roll < 0.25) setIndex((i) => (i + 1) % CURRENCIES.length);
			else if (roll < 0.7) deposit();
			else withdraw();
		},
		2000,
		{ untilInteraction: true },
	);

	return (
		<div className="flex flex-col items-center gap-5">
			<button
				type="button"
				onClick={() => setIndex((i) => (i + 1) % CURRENCIES.length)}
				aria-label="Switch currency"
				className="flex h-7 items-center rounded-full bg-background px-3 text-muted-foreground shadow-raised outline-offset-2 transition-[scale] duration-150 focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.96]"
			>
				<NumericText value={currency.code} fontSize={12} fontWeight="500" letterSpacing={0.6} direction="up" />
			</button>
			<NumericText
				value={formatMoney(balance, currency)}
				decimalSeparator={currency.locale === "de-DE" ? "," : "."}
				fontSize={52}
				fontWeight="700"
				monospacedDigits
				className="tracking-tight"
			/>
			<div className="flex gap-3">
				<RoundButton label="Withdraw" onClick={withdraw}>
					<Icon icon={ArrowDownLeft} className="size-4" />
				</RoundButton>
				<RoundButton label="Deposit" onClick={deposit}>
					<Icon icon={ArrowUpRight} className="size-4" />
				</RoundButton>
			</div>
		</div>
	);
}

const COUNTDOWN_START = 90;

function Countdown() {
	const [seconds, setSeconds] = useState(COUNTDOWN_START);
	useTicker(() => setSeconds((s) => (s > 0 ? s - 1 : COUNTDOWN_START)), 1000);
	const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

	return (
		<div className="flex flex-col items-center gap-4">
			<NumericText value={label} direction="down" fontSize={80} fontWeight="700" monospacedDigits className="tracking-tight" />
			<button
				type="button"
				onClick={() => setSeconds(COUNTDOWN_START)}
				className="flex h-8 items-center gap-1.5 rounded-full bg-background px-3 text-[13px] text-muted-foreground shadow-raised transition-[scale,color] duration-150 hover:text-foreground active:scale-[0.96]"
			>
				<Icon icon={RotateCcw} className="size-3.5" />
				Restart
			</button>
		</div>
	);
}

const clockTime = () =>
	new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function useClock() {
	// Static on the server; the real time rolls in with the first tick.
	const [time, setTime] = useState("00:00:00");
	useTicker(() => setTime(clockTime()), 1000);
	return time;
}

function Clock() {
	const time = useClock();
	return <NumericText value={time} direction="up" fontSize={56} fontWeight="500" monospacedDigits className="tracking-tight" />;
}

const OPEN = 231.47;

export const UP = "light-dark(#218358, #3dd68c)";
export const DOWN = "light-dark(#ce2c31, #ff6369)";

function Stock() {
	const [price, setPrice] = useState(233.12);
	useTicker(() => setPrice((p) => Math.max(1, Math.round((p + random(-1.6, 1.7)) * 100) / 100)), 1600);
	const change = ((price - OPEN) / OPEN) * 100;
	const tint = change >= 0 ? UP : DOWN;

	return (
		<div className="flex w-full max-w-[20rem] items-end justify-between gap-6">
			<div className="flex flex-col gap-1">
				<span className="text-[15px] font-semibold text-foreground">AAPL</span>
				<span className="text-[13px] text-muted-foreground">Apple Inc.</span>
			</div>
			<div className="flex flex-col items-end">
				<NumericText value={price.toFixed(2)} fontSize={44} fontWeight="600" monospacedDigits className="tracking-tight" />
				<NumericText
					value={`${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
					color={tint}
					fontSize={17}
					fontWeight="500"
					monospacedDigits
				/>
			</div>
		</div>
	);
}

const STATUSES = [
	{ label: "Uploading", tone: "bg-amber-500" },
	{ label: "Processing", tone: "bg-sky-500" },
	{ label: "Published", tone: "bg-emerald-500" },
] as const;

function Status() {
	const [index, setIndex] = useState(0);
	const next = () => setIndex((i) => (i + 1) % STATUSES.length);
	useTicker(next, 1900, { untilInteraction: true });
	const status = STATUSES[index];

	return (
		<button
			type="button"
			onClick={next}
			className="flex h-14 items-center gap-3 rounded-full bg-background pr-6 pl-5 shadow-raised transition-[scale] duration-150 active:scale-[0.97]"
		>
			<span className={cn("size-2.5 rounded-full transition-colors duration-300", status.tone)} />
			<NumericText value={status.label} direction="up" fontSize={28} fontWeight="600" bounce={0.2} className="tracking-tight" />
		</button>
	);
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function Likes() {
	const [count, setCount] = useState(996);
	const [liked, setLiked] = useState(false);
	// Other people keep liking it until you join in.
	useTicker(() => setCount((n) => (n > 1480 ? 996 : n + randomInt(1, n > 1000 ? 90 : 2))), 1300, { untilInteraction: true });

	return (
		<button
			type="button"
			aria-pressed={liked}
			onClick={() => {
				setLiked((value) => !value);
				setCount((value) => value + (liked ? -1 : 1));
			}}
			className="flex h-14 items-center gap-2.5 rounded-full bg-background pr-6 pl-5 shadow-raised transition-[scale] duration-150 active:scale-[0.95]"
		>
			<span className={cn("transition-[color,scale] duration-300", liked ? "scale-110 text-[#e5484d] [&_svg]:fill-current" : "text-foreground")}>
				<Icon icon={Heart} className="size-5" />
			</span>
			<NumericText value={compact.format(count)} fontSize={22} fontWeight="600" monospacedDigits />
		</button>
	);
}

function Progress() {
	const [percent, setPercent] = useState(0);
	const [hold, setHold] = useState(0);
	useTicker(() => {
		if (percent >= 100) {
			if (hold >= 4) {
				setPercent(0);
				setHold(0);
			} else setHold((h) => h + 1);
			return;
		}
		setPercent((p) => Math.min(100, p + random(1, 9)));
	}, 380);

	return (
		<div className="flex w-full max-w-[18rem] flex-col gap-3">
			<div className="flex items-baseline justify-between">
				<span className="text-[13px] text-muted-foreground">{percent >= 100 ? "Downloaded" : "Downloading…"}</span>
				<NumericText value={`${Math.round(percent)}%`} duration={260} fontSize={44} fontWeight="600" monospacedDigits className="tracking-tight" />
			</div>
			<div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
				<div className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
			</div>
		</div>
	);
}

function Echo() {
	const [text, setText] = useState("1,024.00");
	return (
		<div className="flex w-full flex-col items-center gap-7">
			<div className="flex min-h-[68px] items-center">
				<NumericText value={text} fontSize={56} fontWeight="600" monospacedDigits className="tracking-tight" />
			</div>
			<input
				value={text}
				onChange={(event) => setText(event.target.value.slice(0, 18))}
				placeholder="Type here"
				aria-label="Text to display"
				spellCheck={false}
				className="h-11 w-full max-w-[16rem] rounded-full bg-background px-5 text-center font-mono text-base text-foreground shadow-raised outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid sm:text-[14px]"
			/>
		</div>
	);
}

export const DEMOS: Record<ExampleId, ComponentType> = {
	counter: Counter,
	currency: Balance,
	countdown: Countdown,
	clock: Clock,
	stock: Stock,
	status: Status,
	likes: Likes,
	progress: Progress,
	input: Echo,
};
