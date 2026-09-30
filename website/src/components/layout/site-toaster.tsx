"use client";

import { Toaster } from "sileo";
import { useSiteTheme } from "./theme-toggle";

/**
 * sileo's toasts, following the site's own theme switch rather than only
 * the system setting. sileo inverts against the page on purpose, so a dark
 * page gets a light toast and the other way round.
 */
export function SiteToaster() {
	const theme = useSiteTheme();
	return <Toaster position="bottom-center" offset={{ bottom: 24 }} theme={theme ?? "system"} />;
}
