import { DocsHeader } from "@/components/docs/docs-header";
import { DocsSidebar } from "@/components/docs/sidebar/docs-sidebar";
import { source } from "@/lib/source";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
	const tree = source.getPageTree();
	return (
		<div className="flex min-h-dvh flex-col">
			<DocsHeader tree={tree} />
			{/* Sidebar and page share one row, so the page starts right where the list ends. */}
			<div className="mx-auto flex w-full max-w-[1600px] flex-1">
				<DocsSidebar tree={tree} />
				<div className="flex min-w-0 flex-1 flex-col">{children}</div>
			</div>
		</div>
	);
}
