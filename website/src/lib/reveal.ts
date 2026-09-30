import type { CSSProperties } from "react";

/**
 * Props that make an element blur into view the first time it's scrolled to,
 * `i` steps after its siblings. Needs <RevealOnScroll /> on the page.
 */
export function reveal(i = 0) {
	return { "data-reveal": "", style: { "--i": i } as CSSProperties };
}
