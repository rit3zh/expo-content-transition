"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
	const media = matchMedia(QUERY);
	media.addEventListener("change", onChange);
	return () => media.removeEventListener("change", onChange);
}

/** False on the server and first client render, so hydration always matches. */
export function useReducedMotion() {
	return useSyncExternalStore(
		subscribe,
		() => matchMedia(QUERY).matches,
		() => false,
	);
}
