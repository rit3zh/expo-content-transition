"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HoverGroup } from "@/components/ui/hover-group";
import { headerLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * The header's main links. One pill glides between them on hover and
 * stretches to each link's width; the section you're in reads brighter.
 */
export function NavLinks({ className }: { className?: string }) {
	const pathname = usePathname();
	// The longest link that prefixes the path wins, so /docs/gradients/mesh
	// marks Gradients rather than Docs.
	const current = headerLinks
		.filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
		.sort((a, b) => b.href.length - a.href.length)[0]?.href;

	return (
		<nav aria-label="Main" className={className}>
			<HoverGroup className="flex items-center" pill="rounded-full bg-surface">
				{headerLinks.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						aria-current={link.href === current ? "page" : undefined}
						className={cn(
							"rounded-full px-3 py-1.5 text-[13px] outline-offset-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-solid",
							link.href === current ? "text-foreground" : "text-muted-foreground hover:text-foreground",
						)}
					>
						{link.label}
					</Link>
				))}
			</HoverGroup>
		</nav>
	);
}
