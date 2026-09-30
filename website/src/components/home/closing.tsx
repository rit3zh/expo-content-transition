import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide";
import { Icon } from "@/components/ui/icon";
import { InstallCommand } from "@/components/shared/install-command";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reveal } from "@/lib/reveal";

export function Closing() {
	return (
		<section className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-32">
			<h2 {...reveal(0)} className="text-[36px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[52px]">
				Start with one line.
			</h2>
			<p {...reveal(1)} className="mt-4 max-w-md text-[16px] leading-relaxed text-pretty text-muted-foreground">
				Add the package, rebuild your development client, and put NumericText anywhere you’d put a Text.
			</p>
			<div {...reveal(2)} className="mt-9 w-full max-w-[26rem]">
				<InstallCommand className="w-full" />
			</div>
			<Link {...reveal(3)} href="/docs/installation" className={cn(buttonVariants(), "mt-5 h-11 rounded-full px-5 text-[14px]")}>
				Read the installation guide
				<Icon icon={ArrowRight} hover={MoveRight} data-icon="inline-end" />
			</Link>
		</section>
	);
}
