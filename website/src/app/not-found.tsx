import Link from "next/link";
import { ArrowLeft, MoveLeft } from "lucide";
import { Icon } from "@/components/ui/icon";
import { HomeHeader } from "@/components/home/home-header";
import { LostMark } from "@/components/shared/lost-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
	return (
		<>
			<HomeHeader />
			<main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:py-32">
				<LostMark />
				<h1 className="mt-4 text-2xl font-semibold tracking-tight">This page rolled away.</h1>
				<p className="mt-2 max-w-sm text-[15px] text-muted-foreground">
					It may have moved in the docs. Search with ⌘K, or start again from the introduction.
				</p>
				<Link href="/docs" className={cn(buttonVariants({ variant: "outline" }), "mt-8 h-10 rounded-full px-4")}>
					<Icon icon={ArrowLeft} hover={MoveLeft} data-icon="inline-start" />
					Back to the docs
				</Link>
			</main>
		</>
	);
}
