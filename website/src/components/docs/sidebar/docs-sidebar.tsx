import type { Root } from "fumadocs-core/page-tree";
import { SidebarTree } from "./sidebar-tree";

/**
 * A quiet column under the header: no rule, its own scroll, soft fades at
 * each end. The list starts below the header's trailing blur, not inside it.
 */
export function DocsSidebar({ tree }: { tree: Root }) {
	return (
		<aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 lg:flex">
			<nav
				aria-label="Documentation"
				data-sidebar-scroll
				className="no-scrollbar relative min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-3 pt-12 pb-16 [mask-image:linear-gradient(to_bottom,transparent,black_24px,black_calc(100%-48px),transparent)]"
			>
				<SidebarTree tree={tree} />
			</nav>
		</aside>
	);
}
