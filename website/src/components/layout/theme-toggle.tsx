"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide";
import { Icon } from "@/components/ui/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Theme = "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Runs in <head> before first paint, so a saved theme never flashes the other one. */
export const themeScript = `try{const t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}`;

function subscribe(onChange: () => void) {
	const media = matchMedia(DARK_QUERY);
	const observer = new MutationObserver(onChange);
	media.addEventListener("change", onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
	return () => {
		media.removeEventListener("change", onChange);
		observer.disconnect();
	};
}

function getTheme(): Theme {
	const stored = document.documentElement.dataset.theme;
	if (stored === "light" || stored === "dark") return stored;
	return matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
	// Without this every colour transition on the page fires at once and the
	// switch smears instead of snapping.
	const pause = document.createElement("style");
	pause.textContent = "*,*::before,*::after{transition:none!important}";
	document.head.appendChild(pause);
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem("theme", theme);
	} catch {}
	void document.body.offsetHeight;
	requestAnimationFrame(() => pause.remove());
}

/** The new theme grows out of the button as a circle. */
function setTheme(theme: Theme, x: number, y: number) {
	if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
		applyTheme(theme);
		return;
	}
	const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
	document.startViewTransition(() => applyTheme(theme)).ready.then(() => {
		document.documentElement.animate(
			{ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
			{ duration: 400, easing: "cubic-bezier(0.23, 1, 0.32, 1)", pseudoElement: "::view-transition-new(root)" },
		);
	});
}

/** The theme on screen: the saved choice, or the system's. Null until hydrated. */
export function useSiteTheme() {
	return useSyncExternalStore(subscribe, getTheme, () => null);
}

export function ThemeToggle() {
	const theme = useSiteTheme();
	const next = theme === "dark" ? "light" : "dark";

	return (
		<Tooltip>
			<TooltipTrigger
				aria-label={`Switch to ${next} theme`}
				onClick={(event) => {
					const rect = event.currentTarget.getBoundingClientRect();
					setTheme(next, rect.x + rect.width / 2, rect.y + rect.height / 2);
				}}
				className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-[scale,color] duration-200 ease-out outline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid active:scale-[0.94]"
			>
				{/* The server can't know the theme, so the icon mounts once it's known, then morphs. */}
				{theme && <Icon icon={theme === "dark" ? Moon : Sun} className="size-4" />}
			</TooltipTrigger>
			<TooltipContent side="bottom">{next === "dark" ? "Dark theme" : "Light theme"}</TooltipContent>
		</Tooltip>
	);
}
