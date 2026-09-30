import type { Root } from "fumadocs-core/page-tree";
import { Brand } from "@/components/layout/brand";
import { HeaderActions } from "@/components/layout/header-actions";
import { HeaderBlur } from "@/components/layout/page-blur";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinks } from "@/components/layout/nav-links";
import { site } from "@/lib/site";
import { SearchTrigger } from "@/components/search/search-trigger";
import { SidebarTree } from "./sidebar/sidebar-tree";

/** Spans the whole page; no hairline, the blur alone lifts it off the content. */
export function DocsHeader({ tree }: { tree: Root }) {
	return (
		<header className="sticky top-0 z-30 isolate">
			<HeaderBlur />
			<div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
				<div className="flex min-w-0 items-center gap-4">
					<div className="flex items-center gap-1">
						<MobileNav>
							<SidebarTree tree={tree} />
						</MobileNav>
						<Brand />
						<a
							href={site.npm}
							target="_blank"
							rel="noreferrer"
							className="ml-2 hidden rounded-full bg-surface px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline"
						>
							v{site.version}
						</a>
					</div>
					<NavLinks className="hidden md:block" />
				</div>
				<div className="flex items-center gap-1.5">
					<SearchTrigger />
					<HeaderActions />
				</div>
			</div>
		</header>
	);
}
