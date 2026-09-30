import Link from "next/link";
import { getBreadcrumbItems } from "fumadocs-core/breadcrumb";
import type { Root } from "fumadocs-core/page-tree";
import { ChevronRight } from "lucide";
import { Icon } from "@/components/ui/icon";

/** Section and page, taken from the sidebar's own structure. */
export function DocsBreadcrumb({ url, tree, section }: { url: string; tree: Root; section?: string }) {
	const items = getBreadcrumbItems(url, tree, { includePage: false, includeSeparator: true });
	const trail = items.length > 0 ? items : section ? [{ name: section }] : [];
	if (trail.length === 0) return null;

	return (
		<nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground">
			{trail.map((item, index) => (
				<span key={index} className="flex min-w-0 items-center gap-1">
					{index > 0 && <Icon icon={ChevronRight} className="size-3 shrink-0 opacity-50" />}
					{item.url ? (
						<Link href={item.url} className="truncate transition-colors duration-150 hover:text-foreground">
							{item.name}
						</Link>
					) : (
						<span className="truncate">{item.name}</span>
					)}
				</span>
			))}
		</nav>
	);
}
