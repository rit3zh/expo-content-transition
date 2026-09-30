"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "docs:tab-group";

function read(key: string | undefined) {
	if (!key) return null;
	try {
		return localStorage.getItem(`tab:${key}`);
	} catch {
		return null;
	}
}

/**
 * A tab choice shared by every group with the same id, remembered between
 * visits: pick bun once and every install snippet follows.
 */
export function usePersistedTab(group: string | undefined, fallback: string) {
	const stored = useSyncExternalStore(
		(onChange) => {
			window.addEventListener(EVENT, onChange);
			window.addEventListener("storage", onChange);
			return () => {
				window.removeEventListener(EVENT, onChange);
				window.removeEventListener("storage", onChange);
			};
		},
		() => read(group),
		() => null,
	);

	const set = useCallback(
		(value: string) => {
			if (!group) return;
			try {
				localStorage.setItem(`tab:${group}`, value);
			} catch {}
			window.dispatchEvent(new Event(EVENT));
		},
		[group],
	);

	return [stored ?? fallback, set] as const;
}
