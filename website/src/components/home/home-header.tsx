import { Brand } from "@/components/layout/brand";
import { SidebarTree } from "@/components/docs/sidebar/sidebar-tree";
import { HeaderActions } from "@/components/layout/header-actions";
import { HeaderBlur } from "@/components/layout/page-blur";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinks } from "@/components/layout/nav-links";
import { SearchTrigger } from "@/components/search/search-trigger";
import { source } from "@/lib/source";

export function HomeHeader() {
	return (
		<header className="sticky top-0 z-30 isolate">
			<HeaderBlur />
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
				<div className="flex min-w-0 items-center gap-6">
					<div className="flex items-center gap-1">
						{/* On phones the docs are one tap away, in the same drawer the docs use. */}
						<MobileNav>
							<SidebarTree tree={source.getPageTree()} />
						</MobileNav>
						<Brand />
					</div>
					<NavLinks className="hidden md:block" />
				</div>
				<div className="flex items-center gap-1">
					<SearchTrigger className="sm:w-48" />
					<HeaderActions />
				</div>
			</div>
		</header>
	);
}
