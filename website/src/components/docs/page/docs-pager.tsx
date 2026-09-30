import Link from "next/link";
import type { Item } from "fumadocs-core/page-tree";
import { ArrowLeft, ArrowRight, MoveLeft, MoveRight } from "lucide";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const ROUND =
	"grid size-8 place-items-center rounded-full bg-surface text-muted-foreground outline-offset-2 transition-[color,background-color,scale] duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.96]";

/** Previous and next as two small round buttons, beside the title. */
export function PagerButtons({ previous, next }: { previous?: Item; next?: Item }) {
	return (
		<div className="flex items-center gap-1.5">
			{previous ? (
				<Link href={previous.url} title={previous.name as string} aria-label={`Previous: ${previous.name}`} className={ROUND}>
					<Icon icon={ArrowLeft} hover={MoveLeft} className="size-4" />
				</Link>
			) : (
				<span aria-hidden className={cn(ROUND, "pointer-events-none opacity-40")}>
					<Icon icon={ArrowLeft} className="size-4" />
				</span>
			)}
			{next ? (
				<Link href={next.url} title={next.name as string} aria-label={`Next: ${next.name}`} className={ROUND}>
					<Icon icon={ArrowRight} hover={MoveRight} className="size-4" />
				</Link>
			) : (
				<span aria-hidden className={cn(ROUND, "pointer-events-none opacity-40")}>
					<Icon icon={ArrowRight} className="size-4" />
				</span>
			)}
		</div>
	);
}

function PagerLink({ item, direction }: { item: Item; direction: "previous" | "next" }) {
	const next = direction === "next";
	return (
		<Link
			href={item.url}
			className={cn(
				"group/pager flex max-w-[16rem] flex-col gap-1 rounded-md text-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-solid",
				next ? "ml-auto items-end text-right" : "items-start",
			)}
		>
			<span className="flex items-center gap-1.5 text-[13px] text-muted-foreground/70 transition-colors duration-200 group-hover/pager:text-muted-foreground">
				{!next && <Icon icon={ArrowLeft} hover={MoveLeft} className="size-3.5" />}
				{next ? "Next" : "Previous"}
				{next && <Icon icon={ArrowRight} hover={MoveRight} className="size-3.5" />}
			</span>
			<span className="truncate font-medium text-muted-foreground transition-colors duration-200 group-hover/pager:text-foreground">
				{item.name}
			</span>
		</Link>
	);
}

export function DocsPager({ previous, next }: { previous?: Item; next?: Item }) {
	if (!previous && !next) return null;
	return (
		<nav aria-label="Pagination" className="flex items-start justify-between gap-6">
			{previous && <PagerLink item={previous} direction="previous" />}
			{next && <PagerLink item={next} direction="next" />}
		</nav>
	);
}
