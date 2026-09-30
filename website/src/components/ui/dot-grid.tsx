"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const SPACING = 16;
const DOT = 1.5;
// Dots within this radius feel the cursor; falloff is quadratic to the edge.
const FIELD = 88;
// Far enough to read as a push, small enough that neighbours never overlap.
const PUSH = 7;
const GROW = 1.3;
// Slightly underdamped (ratio about 0.7), so dots spring back with a hint of
// give instead of sliding home.
const STIFFNESS = 170;
const DAMPING = 18;
// A click ring crosses a 480px stage in about 0.9s.
const RING_SPEED = 620;
const RING_WIDTH = 22;
const RING_PUSH = 9;
const REST = 0.01;

type Ring = { x: number; y: number; born: number };

/**
 * The dotted background of a stage. Dots swell and move away from the
 * pointer, and a click sends a ring outward. It listens on its parent, so the
 * demo sitting on top never blocks it; the parent must be positioned.
 */
export function DotGrid({ className }: { className?: string }) {
	const reduce = useReducedMotion();
	const wrapRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const wrap = wrapRef.current;
		const canvas = canvasRef.current;
		const target = wrap?.parentElement;
		const ctx = canvas?.getContext("2d");
		if (!wrap || !canvas || !target || !ctx) return;

		let width = 0;
		let height = 0;
		let count = 0;
		// Flat typed arrays keep the per-frame loop allocation free.
		let baseX = new Float32Array(0);
		let baseY = new Float32Array(0);
		let offX = new Float32Array(0);
		let offY = new Float32Array(0);
		let velX = new Float32Array(0);
		let velY = new Float32Array(0);
		let size = new Float32Array(0);
		let velSize = new Float32Array(0);

		let pointer: { x: number; y: number } | null = null;
		let rings: Ring[] = [];
		let frameId = 0;
		let last = 0;
		let visible = true;
		let dim = "";
		let lit = "";

		const readColors = () => {
			// Computed colors resolve light-dark(), which a raw custom property doesn't.
			dim = getComputedStyle(canvas).color;
			lit = getComputedStyle(wrap).color;
		};

		const layout = () => {
			const dpr = window.devicePixelRatio || 1;
			width = wrap.clientWidth;
			height = wrap.clientHeight;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			const cols = Math.floor(width / SPACING);
			const rows = Math.floor(height / SPACING);
			// Centre the lattice so the margins match on every side.
			const startX = (width - (cols - 1) * SPACING) / 2;
			const startY = (height - (rows - 1) * SPACING) / 2;
			count = cols * rows;
			baseX = new Float32Array(count);
			baseY = new Float32Array(count);
			offX = new Float32Array(count);
			offY = new Float32Array(count);
			velX = new Float32Array(count);
			velY = new Float32Array(count);
			size = new Float32Array(count);
			velSize = new Float32Array(count);
			for (let r = 0, i = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++, i++) {
					baseX[i] = startX + c * SPACING;
					baseY[i] = startY + r * SPACING;
				}
			}
		};

		const draw = () => {
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = dim;
			ctx.beginPath();
			for (let i = 0; i < count; i++) {
				const x = baseX[i] + offX[i];
				const y = baseY[i] + offY[i];
				const r = DOT * (1 + (reduce ? 0 : GROW) * size[i]);
				ctx.moveTo(x + r, y);
				ctx.arc(x, y, r, 0, Math.PI * 2);
			}
			ctx.fill();
			// Only the few energised dots get a second, brighter pass.
			ctx.fillStyle = lit;
			for (let i = 0; i < count; i++) {
				const s = size[i];
				if (s < 0.02) continue;
				const x = baseX[i] + offX[i];
				const y = baseY[i] + offY[i];
				const r = DOT * (1 + (reduce ? 0 : GROW) * s);
				ctx.globalAlpha = Math.min(1, s) * 0.55;
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.globalAlpha = 1;
		};

		const step = (now: number) => {
			// Clamped so a dropped frame or a background tab can't explode the spring.
			const dt = Math.min((now - last) / 1000, 1 / 30);
			last = now;
			const t = now / 1000;
			rings = rings.filter((ring) => (t - ring.born) * RING_SPEED < Math.hypot(width, height) + RING_WIDTH);

			let moving = rings.length > 0;
			for (let i = 0; i < count; i++) {
				let targetX = 0;
				let targetY = 0;
				let targetSize = 0;
				if (pointer) {
					const dx = baseX[i] - pointer.x;
					const dy = baseY[i] - pointer.y;
					const d = Math.hypot(dx, dy);
					if (d < FIELD) {
						const f = (1 - d / FIELD) ** 2;
						targetSize = f;
						if (!reduce && d > 0.001) {
							targetX = (dx / d) * PUSH * f;
							targetY = (dy / d) * PUSH * f;
						}
					}
				}
				for (const ring of rings) {
					const dx = baseX[i] - ring.x;
					const dy = baseY[i] - ring.y;
					const d = Math.hypot(dx, dy);
					const radius = (t - ring.born) * RING_SPEED;
					const band = Math.exp(-(((d - radius) / RING_WIDTH) ** 2));
					// The ring weakens as it spreads, like a real shockwave.
					const fade = Math.max(0, 1 - radius / Math.hypot(width, height));
					const f = band * fade;
					if (f < 0.01 || d < 0.001) continue;
					targetX += (dx / d) * RING_PUSH * f;
					targetY += (dy / d) * RING_PUSH * f;
					targetSize = Math.max(targetSize, f);
				}

				velX[i] += (STIFFNESS * (targetX - offX[i]) - DAMPING * velX[i]) * dt;
				velY[i] += (STIFFNESS * (targetY - offY[i]) - DAMPING * velY[i]) * dt;
				velSize[i] += (STIFFNESS * (targetSize - size[i]) - DAMPING * velSize[i]) * dt;
				offX[i] += velX[i] * dt;
				offY[i] += velY[i] * dt;
				size[i] = Math.max(0, size[i] + velSize[i] * dt);

				// Settled means at its target, not at home: a resting cursor costs nothing.
				if (
					Math.abs(targetX - offX[i]) > REST ||
					Math.abs(targetY - offY[i]) > REST ||
					Math.abs(targetSize - size[i]) > REST ||
					Math.abs(velX[i]) > REST ||
					Math.abs(velY[i]) > REST ||
					Math.abs(velSize[i]) > REST
				) {
					moving = true;
				}
			}
			draw();
			frameId = moving && visible ? requestAnimationFrame(step) : 0;
		};

		// Sleeps when everything settles; any input wakes it.
		const wake = () => {
			if (frameId || !visible) return;
			last = performance.now();
			frameId = requestAnimationFrame(step);
		};

		const local = (e: PointerEvent) => {
			const box = canvas.getBoundingClientRect();
			return { x: e.clientX - box.left, y: e.clientY - box.top };
		};

		const onMove = (e: PointerEvent) => {
			if (e.pointerType === "touch") return;
			pointer = local(e);
			wake();
		};
		const onLeave = () => {
			pointer = null;
			wake();
		};
		const onDown = (e: PointerEvent) => {
			if (reduce || e.button !== 0) return;
			// Three rings at once is already a lot; older ones make way.
			rings = [...rings.slice(-2), { ...local(e), born: performance.now() / 1000 }];
			wake();
		};

		readColors();
		layout();
		draw();

		const resize = new ResizeObserver(() => {
			layout();
			draw();
		});
		resize.observe(wrap);

		const repaint = () =>
			requestAnimationFrame(() => {
				readColors();
				if (!frameId) draw();
			});
		const theme = new MutationObserver(repaint);
		theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
		const scheme = window.matchMedia("(prefers-color-scheme: dark)");
		scheme.addEventListener("change", repaint);

		// Offscreen, the loop pauses entirely.
		const seen = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible) wake();
			else if (frameId) {
				cancelAnimationFrame(frameId);
				frameId = 0;
			}
		});
		seen.observe(wrap);

		target.addEventListener("pointermove", onMove);
		target.addEventListener("pointerleave", onLeave);
		target.addEventListener("pointerdown", onDown);

		return () => {
			cancelAnimationFrame(frameId);
			resize.disconnect();
			theme.disconnect();
			seen.disconnect();
			scheme.removeEventListener("change", repaint);
			target.removeEventListener("pointermove", onMove);
			target.removeEventListener("pointerleave", onLeave);
			target.removeEventListener("pointerdown", onDown);
		};
	}, [reduce]);

	return (
		<div ref={wrapRef} aria-hidden className={cn("pointer-events-none absolute inset-0 text-foreground", className)}>
			<canvas ref={canvasRef} className="absolute inset-0 size-full text-[var(--stage-dot)]" />
		</div>
	);
}
