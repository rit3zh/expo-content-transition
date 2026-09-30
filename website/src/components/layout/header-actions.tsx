"use client";

import { siNpm } from "simple-icons";
import { GitHubIcon, SimpleIcon } from "@/components/icons";
import { HoverGroup } from "@/components/ui/hover-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { site } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

const LINK =
	"relative grid size-9 place-items-center rounded-full text-muted-foreground outline-offset-2 transition-[scale,color] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.94]";

/** npm, GitHub and the theme switch, shared by every header. On phones only the switch stays; the menu drawer carries the links. */
export function HeaderActions() {
	return (
		// One pill glides between the three buttons instead of each lighting up.
		<HoverGroup className="flex shrink-0 items-center" pill="rounded-full bg-surface">
			<Tooltip>
				<TooltipTrigger
					render={
						<a
							href={site.npm}
							target="_blank"
							rel="noreferrer"
							aria-label={`${site.name} on npm`}
							className={`${LINK} hover:text-[#cb3837] max-sm:hidden`}
						/>
					}
				>
					<SimpleIcon path={siNpm.path} className="size-4" />
				</TooltipTrigger>
				<TooltipContent side="bottom">npm</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={
						<a
							href={site.repo}
							target="_blank"
							rel="noreferrer"
							aria-label={`${site.name} on GitHub`}
							className={`${LINK} hover:text-foreground max-sm:hidden`}
						/>
					}
				>
					<GitHubIcon className="size-4" />
				</TooltipTrigger>
				<TooltipContent side="bottom">GitHub</TooltipContent>
			</Tooltip>
			<ThemeToggle />
		</HoverGroup>
	);
}
