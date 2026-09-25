import { GlyphBlur, GlyphTransitionEngine, type ContentSize, type GlyphState } from '../glyphs';
import type { GlyphTypesetter } from '../glyphs/GlyphTypesetter';
import { createNumericTextSpec, specsEqual, type NumericTextSpec } from '../records';

const MAX_FRAME_SECONDS = 1 / 15;
const FEATHER_STEPS = 6;
const NO_VALUE = 'none';

interface GlyphNode {
  window: HTMLSpanElement;
  content: HTMLSpanElement;
  geometry: string;
  featherMask: string;
  mask: string;
  windowTransform: string;
  opacity: string;
  contentTransform: string;
  filter: string;
}

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

const featherMask = (top: number, bottom: number, feather: number): string => {
  const stops: string[] = [];
  for (let step = 0; step <= FEATHER_STEPS; step++) {
    const t = step / FEATHER_STEPS;
    stops.push(`rgba(0,0,0,${smoothstep(t).toFixed(3)}) ${(top - feather * (1 - t)).toFixed(2)}px`);
  }

  for (let step = 0; step <= FEATHER_STEPS; step++) {
    const t = step / FEATHER_STEPS;
    stops.push(
      `rgba(0,0,0,${smoothstep(1 - t).toFixed(3)}) ${(bottom + feather * t).toFixed(2)}px`
    );
  }

  return `linear-gradient(to bottom, ${stops.join(', ')})`;
};

const setMask = (element: HTMLElement, value: string): void => {
  element.style.setProperty('mask-image', value);
  element.style.setProperty('-webkit-mask-image', value);
};

const createGlyphNode = (unit: string): GlyphNode => {
  const window = document.createElement('span');
  Object.assign(window.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'block',
    margin: '0',
    padding: '0',
  } satisfies Partial<CSSStyleDeclaration>);
  window.style.setProperty('mask-repeat', 'no-repeat');
  window.style.setProperty('-webkit-mask-repeat', 'no-repeat');
  window.style.setProperty('mask-size', '100% 100%');
  window.style.setProperty('-webkit-mask-size', '100% 100%');

  const content = document.createElement('span');
  Object.assign(content.style, {
    position: 'absolute',
    display: 'block',
    margin: '0',
    padding: '0',
    whiteSpace: 'pre',
    transformOrigin: '50% 50%',
  } satisfies Partial<CSSStyleDeclaration>);
  content.textContent = unit;
  window.appendChild(content);

  return {
    window,
    content,
    geometry: '',
    featherMask: NO_VALUE,
    mask: NO_VALUE,
    windowTransform: '',
    opacity: '',
    contentTransform: '',
    filter: '',
  };
};

class NumericTextLabel {
  onContentSizeChange: ((size: ContentSize) => void) | null = null;

  private readonly engine = new GlyphTransitionEngine();
  private readonly root: HTMLDivElement;
  private readonly nodes = new Map<number, GlyphNode>();
  private readonly resizeObserver: ResizeObserver | null = null;

  private bounds: ContentSize;
  private frame = 0;
  private lastTimestamp = 0;
  private reportedSize: ContentSize | null = null;

  private spec: NumericTextSpec = createNumericTextSpec();
  private typesetter: GlyphTypesetter | null = null;
  private color: string | null = null;

  constructor(private readonly host: HTMLElement) {
    this.root = document.createElement('div');
    this.root.setAttribute('aria-hidden', 'true');
    Object.assign(this.root.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      right: '0',
      bottom: '0',
      overflow: 'visible',
      pointerEvents: 'none',
      userSelect: 'none',
      direction: 'ltr',
    } satisfies Partial<CSSStyleDeclaration>);
    host.appendChild(this.root);

    this.bounds = { width: host.clientWidth, height: host.clientHeight };
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.bounds = { width: this.host.clientWidth, height: this.host.clientHeight };
        this.render();
      });
      this.resizeObserver.observe(host);
    }
  }

  update(spec: NumericTextSpec, typesetter: GlyphTypesetter, color: string | null): void {
    const colorChanged = color !== this.color;
    const typesetterChanged = typesetter !== this.typesetter;
    if (!colorChanged && !typesetterChanged && specsEqual(spec, this.spec)) return;

    if (colorChanged) {
      this.color = color;
      this.root.style.color = color ?? '';
    }

    if (typesetterChanged) {
      Object.assign(this.root.style, typesetter.fontStyle);
    }

    this.typesetter = typesetter;
    this.spec = spec;

    this.engine.apply(spec, typesetter);
    this.syncNodes();
    this.render();
    this.reportContentSize();
    this.start();
  }

  destroy(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.nodes.clear();
    this.root.remove();
    this.onContentSizeChange = null;
  }

  private syncNodes(): void {
    const live = new Set<number>();
    for (const glyph of this.engine.glyphs) {
      live.add(glyph.id);
      if (!this.nodes.has(glyph.id)) {
        const node = createGlyphNode(glyph.unit);
        this.root.appendChild(node.window);
        this.nodes.set(glyph.id, node);
      }
    }

    for (const [id, node] of this.nodes) {
      if (live.has(id)) continue;
      node.window.remove();
      this.nodes.delete(id);
    }
  }

  private render(): void {
    const { glyphs, contentSize, clipEnabled, blurActive } = this.engine;
    if (glyphs.length === 0) return;

    const anchorBase = this.engine.anchorBase(this.bounds.width);
    const anchorY = Math.max((this.bounds.height - contentSize.height) / 2, 0);

    for (const glyph of glyphs) {
      const node = this.nodes.get(glyph.id);
      if (node) this.renderGlyph(node, glyph, anchorBase, anchorY, clipEnabled, blurActive);
    }
  }

  private renderGlyph(
    node: GlyphNode,
    glyph: GlyphState,
    anchorBase: number,
    anchorY: number,
    clipEnabled: boolean,
    blurActive: boolean
  ): void {
    const { window, content } = node;

    const geometry = `${glyph.viewportWidth}:${glyph.viewportHeight}:${glyph.padX}:${glyph.padY}:${glyph.advance}:${glyph.lineHeight}`;
    if (node.geometry !== geometry) {
      node.geometry = geometry;
      window.style.width = `${glyph.viewportWidth}px`;
      window.style.height = `${glyph.viewportHeight}px`;
      content.style.left = `${glyph.padX}px`;
      content.style.top = `${glyph.padY}px`;
      content.style.width = `${glyph.advance}px`;
      content.style.height = `${glyph.lineHeight}px`;
      content.style.lineHeight = `${glyph.lineHeight}px`;
      node.featherMask = featherMask(glyph.padY, glyph.padY + glyph.lineHeight, glyph.feather);
      node.mask = '';
    }

    const windowTransform = `translate(${(anchorBase + glyph.x.value - glyph.padX).toFixed(3)}px, ${(anchorY - glyph.padY).toFixed(3)}px)`;
    if (node.windowTransform !== windowTransform) {
      node.windowTransform = windowTransform;
      window.style.transform = windowTransform;
    }

    const opacity = glyph.presence >= 1 ? '' : glyph.presence.toFixed(4);
    if (node.opacity !== opacity) {
      node.opacity = opacity;
      window.style.opacity = opacity;
    }

    const displaced = glyph.isDisplaced;
    const mask = clipEnabled && displaced ? node.featherMask : NO_VALUE;
    if (node.mask !== mask) {
      node.mask = mask;
      setMask(window, mask);
    }

    const contentTransform = displaced
      ? `translate3d(0, ${(glyph.offset.value * glyph.travel).toFixed(3)}px, 0) scale(${glyph.scale.value.toFixed(4)})`
      : NO_VALUE;
    if (node.contentTransform !== contentTransform) {
      node.contentTransform = contentTransform;
      content.style.transform = contentTransform;
    }

    const filter = blurActive ? GlyphBlur.filter(glyph.blur.value) : GlyphBlur.NO_FILTER;
    if (node.filter !== filter) {
      node.filter = filter;
      content.style.filter = filter;
    }
  }

  private reportContentSize(): void {
    const { width, height } = this.engine.contentSize;
    const rounded = { width: Math.round(width), height: Math.round(height) };
    if (
      this.reportedSize &&
      this.reportedSize.width === rounded.width &&
      this.reportedSize.height === rounded.height
    ) {
      return;
    }

    this.reportedSize = rounded;
    this.onContentSizeChange?.(rounded);
  }

  private start(): void {
    if (this.frame !== 0 || typeof requestAnimationFrame === 'undefined') return;
    this.lastTimestamp = 0;
    this.frame = requestAnimationFrame(this.step);
  }

  private stop(): void {
    if (this.frame !== 0) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private readonly step = (timestamp: number): void => {
    this.frame = 0;
    const previous = this.lastTimestamp;
    this.lastTimestamp = timestamp;

    const deltaTime =
      previous === 0 ? 0 : Math.min((timestamp - previous) / 1000, MAX_FRAME_SECONDS);
    if (deltaTime <= 0) {
      this.frame = requestAnimationFrame(this.step);
      return;
    }

    const running = this.engine.tick(deltaTime);
    this.syncNodes();
    this.render();

    if (running) this.frame = requestAnimationFrame(this.step);
  };
}

export { NumericTextLabel };
