"use client";

import { useEffect } from "react";

/**
 * Marks every `[data-reveal]` element on the page as revealed the first time
 * it scrolls into view, which plays its entrance (see `[data-reveal]` in
 * styles/base.css). Give siblings `--i` to stagger them. Mounted once in the
 * root layout. Renders nothing.
 */
export function RevealOnScroll() {
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					entry.target.setAttribute("data-revealed", "");
					observer.unobserve(entry.target);
				}
			},
			{ rootMargin: "0px 0px -8% 0px" },
		);
		const scan = () => {
			for (const element of document.querySelectorAll("[data-reveal]:not([data-revealed])")) {
				observer.observe(element);
			}
		};
		scan();
		// Client navigations bring in new sections: pick them up once per frame.
		let frame = 0;
		const mutations = new MutationObserver(() => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				scan();
			});
		});
		mutations.observe(document.body, { childList: true, subtree: true });
		return () => {
			observer.disconnect();
			mutations.disconnect();
			cancelAnimationFrame(frame);
		};
	}, []);

	return null;
}
