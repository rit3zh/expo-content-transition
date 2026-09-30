import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PenLine, SquarePen } from "lucide";
import { DocsBreadcrumb } from "@/components/docs/page/docs-breadcrumb";
import { DocsPager, PagerButtons } from "@/components/docs/page/docs-pager";
import { DocsToc } from "@/components/docs/page/docs-toc";
import { PageActions } from "@/components/docs/page/page-actions";
import { Renderers } from "@/components/docs/page/renderers";
import { getMDXComponents } from "@/components/mdx";
import { Icon } from "@/components/ui/icon";
import { markdownUrl, pageMarkdown } from "@/lib/markdown";
import { editUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { neighbours, source } from "@/lib/source";

export default async function DocsPage({ params }: PageProps<"/docs/[[...slug]]">) {
	const { slug } = await params;
	const page = source.getPage(slug);
	if (!page) notFound();

	const MDX = page.data.body;
	const markdown = await pageMarkdown(page);
	const { previous, next } = neighbours(page.url);
	const wide = page.data.full === true;
	const edit = editUrl(page.path);

	return (
		// Starts right where the sidebar ends; nothing centres the article.
		<main
			className={cn(
				"grid w-full flex-1 gap-16 px-4 pt-8 pb-20 sm:px-6 sm:pt-10 lg:pr-10 lg:pl-16 xl:pl-20",
				!wide && "xl:grid-cols-[minmax(0,1fr)_13rem]",
			)}
		>
			<article className={cn("w-full min-w-0", wide ? "max-w-[1080px]" : "max-w-[768px]")}>
				<header className="mb-10 flex flex-col">
					<DocsBreadcrumb url={page.url} tree={source.getPageTree()} section="Getting started" />
					<div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0">
							<h1 className="text-[30px] leading-tight font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-[34px]">
								{page.data.title}
							</h1>
							{page.data.description && (
								<p className="mt-2.5 max-w-[60ch] text-base leading-relaxed text-pretty text-muted-foreground">
									{page.data.description}
								</p>
							)}
						</div>
						<div className="flex shrink-0 items-center gap-1.5">
							<PageActions markdown={markdown} markdownPath={markdownUrl(page.url)} githubUrl={edit} />
							<PagerButtons previous={previous} next={next} />
						</div>
					</div>
				</header>

				<div className="text-[15px]">
					<MDX components={getMDXComponents()} />
				</div>

				<footer className="mt-20 flex flex-col gap-10">
					<Renderers />
					<a
						href={edit}
						target="_blank"
						rel="noreferrer"
						className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground xl:hidden"
					>
						<Icon icon={SquarePen} hover={PenLine} className="size-3.5" />
						Edit this page on GitHub
					</a>
					<DocsPager previous={previous} next={next} />
				</footer>
			</article>

			{!wide && (
				<aside className="hidden xl:block">
					<div className="sticky top-24">
						<DocsToc items={page.data.toc} editUrl={edit} />
					</div>
				</aside>
			)}
		</main>
	);
}

export function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata({ params }: PageProps<"/docs/[[...slug]]">): Promise<Metadata> {
	const { slug } = await params;
	const page = source.getPage(slug);
	if (!page) notFound();
	return {
		title: page.data.title,
		description: page.data.description,
		alternates: { canonical: page.url },
	};
}
