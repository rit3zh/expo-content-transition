"use client";

import type { ReactNode } from "react";
import { Popover } from "@base-ui/react/popover";
import { Info } from "lucide";
import { Icon } from "@/components/ui/icon";

/** An info button beside a prop's name; opens its description on click or tap. */
export function PropInfo({ name, children }: { name: string; children: ReactNode }) {
	return (
		<Popover.Root>
			<Popover.Trigger
				aria-label={`About ${name}`}
				className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 outline-offset-1 hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid data-popup-open:bg-accent data-popup-open:text-foreground"
			>
				<Icon icon={Info} className="size-3.5" />
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner side="top" sideOffset={6} className="isolate z-50">
					<Popover.Popup className="max-w-80 origin-(--transform-origin) rounded-lg bg-popover px-3 py-2 text-[13px] leading-relaxed text-muted-foreground shadow-float transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
						{children}
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
