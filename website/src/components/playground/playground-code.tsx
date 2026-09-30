"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NumericText } from "@/components/numeric-text/numeric-text";
import { CopyButton } from "@/components/shared/copy-button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { attributes, toCode, type Attribute, type Settings } from "./settings";

// The same token colours as the site's other code: Shiki's github themes.
const COLOR = {
	keyword: "light-dark(#CF222E, #FF7B72)",
	string: "light-dark(#0A3069, #A5D6FF)",
	number: "light-dark(#0550AE, #79C0FF)",
	component: "light-dark(#116329, #7EE787)",
	attribute: "light-dark(#0550AE, #79C0FF)",
	punct: "light-dark(#1F2328, #E6EDF3)",
	plain: "light-dark(#1F2328, #E6EDF3)",
};

const LINE = 22;

const Tok = ({ color, children }: { color: string; children: ReactNode }) => <span style={{ color }}>{children}</span>;

/** A prop's value; numbers and strings roll when a control changes them. */
function Value({ attribute }: { attribute: Attribute }) {
	const { value } = attribute;
	if (value === true) return null;
	if (typeof value === "string") {
		return (
			<>
				<Tok color={COLOR.punct}>=</Tok>
				<Tok color={COLOR.string}>
					&quot;
					<NumericText value={value} duration={300} />
					&quot;
				</Tok>
			</>
		);
	}
	return (
		<>
			<Tok color={COLOR.punct}>={"{"}</Tok>
			<Tok color={COLOR.number}>
				<NumericText value={String(value)} duration={300} monospacedDigits />
			</Tok>
			<Tok color={COLOR.punct}>{"}"}</Tok>
		</>
	);
}

/** The JSX the current settings add up to: only what differs from the defaults. */
export function PlaygroundCode({ settings }: { settings: Settings }) {
	const reduceMotion = useReducedMotion();
	const list = attributes(settings);

	return (
		<div className="overflow-hidden rounded-2xl bg-code">
			<div className="flex h-11 items-center justify-between gap-2 pt-1 pr-1.5 pl-4">
				<span className="font-mono text-xs text-muted-foreground">Preview.tsx</span>
				<CopyButton value={toCode(settings)} label="Copy code" />
			</div>
			<div className="no-scrollbar overflow-x-auto pb-4">
				<pre className="sr-only">{toCode(settings)}</pre>
				<div aria-hidden className="w-max min-w-full px-4 font-mono text-[13px] whitespace-pre" style={{ lineHeight: `${LINE}px` }}>
					<div>
						<Tok color={COLOR.keyword}>import</Tok> <Tok color={COLOR.punct}>{"{ "}</Tok>
						<Tok color={COLOR.plain}>NumericText</Tok>
						<Tok color={COLOR.punct}>{" }"}</Tok> <Tok color={COLOR.keyword}>from</Tok>{" "}
						<Tok color={COLOR.string}>&apos;expo-content-transition&apos;</Tok>
						<Tok color={COLOR.punct}>;</Tok>
					</div>
					<div style={{ height: LINE }} />
					<div>
						<Tok color={COLOR.punct}>&lt;</Tok>
						<Tok color={COLOR.component}>NumericText</Tok>
					</div>
					<div>
						{"  "}
						<Tok color={COLOR.attribute}>value</Tok>
						<Tok color={COLOR.punct}>={"{"}</Tok>
						<Tok color={COLOR.plain}>value</Tok>
						<Tok color={COLOR.punct}>{"}"}</Tok>
					</div>
					{/* Props arrive and leave as their controls move off and back onto the defaults. */}
					<AnimatePresence initial={false}>
						{list.map((attribute) => (
							<motion.div
								key={attribute.name}
								initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, filter: "blur(4px)" }}
								animate={{ opacity: 1, height: LINE, filter: "blur(0px)" }}
								exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, filter: "blur(4px)" }}
								transition={{ type: "spring", duration: 0.35, bounce: 0 }}
								className="overflow-hidden"
							>
								{"  "}
								<Tok color={COLOR.attribute}>{attribute.name}</Tok>
								<Value attribute={attribute} />
							</motion.div>
						))}
					</AnimatePresence>
					<div>
						<Tok color={COLOR.punct}>/&gt;</Tok>
					</div>
				</div>
			</div>
		</div>
	);
}
