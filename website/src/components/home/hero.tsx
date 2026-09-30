import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide";
import { FlowButton } from "@/components/flow-button";
import { InstallCommand } from "@/components/shared/install-command";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Icon } from "@/components/ui/icon";
import { HeroTitle } from "./hero-title";

// Each piece of the hero blurs in a beat after the one before it.
const step = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
	return (
		<div className="relative overflow-hidden">
			{/* Full width behind the hero, fading out from the centre. */}
			<DotPattern
				width={20}
				height={20}
				cx={1}
				cy={1}
				cr={1}
				className="[mask-image:radial-gradient(ellipse_60%_55%_at_50%_45%,white,transparent)]"
			/>
			<section className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 pb-20 sm:px-10 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-32">
				<div className="flex w-full flex-col items-center text-center">
					<div className="blur-in w-full" style={step(0)}>
						<HeroTitle />
					</div>
					<p
						style={step(1)}
						className="blur-in mt-5 max-w-[28rem] text-[16px] leading-relaxed text-pretty text-muted-foreground sm:text-[17px]"
					>
						A NumericText for Expo. When the value changes, only the characters that differ move, each on its own spring.
					</p>

					<div className="mt-10 flex flex-row flex-wrap items-center justify-center gap-3">
						<Link
							href="/docs"
							style={step(2)}
							className="blur-in flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-medium text-background shadow-[0_1px_2px_oklch(0_0_0/0.1),0_4px_12px_-4px_oklch(0_0_0/0.2)] outline-offset-4 transition-[scale,background-color] duration-150 ease-out hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.97]"
						>
							Get started
							<Icon icon={ArrowRight} hover={MoveRight} className="size-4" />
						</Link>
						<div className="blur-in" style={step(3)}>
							<FlowButton href="/docs/playground" size="xl">
								Open the playground
							</FlowButton>
						</div>
					</div>

					<div className="blur-in mt-6 w-full max-w-[26rem]" style={step(4)}>
						<InstallCommand className="w-full" />
					</div>
				</div>
			</section>
		</div>
	);
}
