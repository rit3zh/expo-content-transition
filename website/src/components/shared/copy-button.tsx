"use client";

import { Check, Copy } from "lucide";
import { sileo } from "sileo";
import { useEffect } from "react";
import { motion } from "motion/react";
import { AnimatedLabel } from "@/components/ui/animated-label";
import { Icon, prewarmMorphs } from "@/components/ui/icon";
import { useCopy } from "@/hooks/use-copy";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Once per page, however many copy buttons there are.
let warmed = false;

/**
 * Copies `value`, or the text of the element `getValue` returns. The icon
 * morphs into a check while "Copied" rolls out beside it, and the button
 * springs to its new width rather than jumping. With `toast`, the button
 * keeps its size: only the icon morphs, and a toast says what was copied.
 */
export function CopyButton({
	value,
	getValue,
	label = "Copy",
	toast,
	className,
}: {
	value?: string;
	getValue?: () => string;
	label?: string;
	/** Confirm in a toast with this title instead of a label beside the icon. */
	toast?: string;
	className?: string;
}) {
	const { copied, copy } = useCopy();

	// So the very first copy morphs as smoothly as every one after it.
	useEffect(() => {
		if (warmed) return;
		warmed = true;
		prewarmMorphs([
			[Copy, Check],
			[Check, Copy],
		]);
	}, []);

	return (
		<motion.button
			type="button"
			aria-label={copied ? "Copied" : label}
			onClick={async () => {
				const text = value ?? getValue?.() ?? "";
				if (!(await copy(text)) || !toast) return;
				sileo.success({ title: toast, description: text, duration: 2400 });
			}}
			whileTap={{ scale: 0.95 }}
			transition={spring.snappy}
			className={cn(
				"relative inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md px-[9px] text-xs text-muted-foreground transition-[color,background-color] duration-200 ease-out outline-offset-2 hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid",
				copied && "text-foreground",
				className,
			)}
		>
			<Icon icon={copied ? Check : Copy} className="size-3.5" />
			{!toast && <AnimatedLabel value={copied ? "Copied" : ""} lead="pl-1.5" />}
		</motion.button>
	);
}
