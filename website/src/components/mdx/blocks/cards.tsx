import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide";
import { Icon } from "@/components/ui/icon";

export function Cards({ children }: { children: ReactNode }) {
	return <div className="my-6 grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function Card({ href, title, children }: { href: string; title: string; children?: ReactNode }) {
	return (
		<Link
			href={href}
			className="group/card flex flex-col gap-1 rounded-xl bg-surface p-4 no-underline outline-offset-2 transition-[background-color] duration-200 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid"
		>
			<span className="flex items-center justify-between gap-2 text-[15px] font-medium text-foreground">
				{title}
				<Icon icon={ArrowRight} className="size-3.5 text-muted-foreground" />
			</span>
			{children && <span className="text-[13px] leading-relaxed text-muted-foreground">{children}</span>}
		</Link>
	);
}
