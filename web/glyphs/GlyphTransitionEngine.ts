import { TransitionSprings } from '../animation/TransitionSprings';
import { NumericTextAlignment, TransitionDirection } from '../enums';
import {
  effectiveShape,
  isBlurActive,
  slotKey,
  type NumericTextSpec,
  type TransitionShape,
  type TypesetLine,
} from '../records';
import { containsNumber, numericValue } from './GlyphSlots';
import { GlyphState } from './GlyphState';
import type { GlyphTypesetter } from './GlyphTypesetter';

interface ContentSize {
  width: number;
  height: number;
}

class GlyphTransitionEngine {
  glyphs: GlyphState[] = [];
  contentSize: ContentSize = { width: 0, height: 0 };
  alignment: NumericTextAlignment = NumericTextAlignment.Leading;
  blurActive = true;
  clipEnabled = true;

  private springs = new TransitionSprings(
    TransitionSprings.REFERENCE_DURATION,
    TransitionSprings.DEFAULT_BOUNCE
  );

  private currentText = '';
  private hasContent = false;
  private countsDown = false;
  private nextId = 0;
  private lastTypesetter: GlyphTypesetter | null = null;

  apply(spec: NumericTextSpec, typesetter: GlyphTypesetter): void {
    const typographyChanged =
      this.lastTypesetter !== null && !this.lastTypesetter.equals(typesetter);
    this.lastTypesetter = typesetter;

    const requested = new TransitionSprings(spec.duration, spec.bounce);
    if (!requested.equals(this.springs)) {
      this.springs = requested;
      this.glyphs.forEach((glyph) => glyph.adoptSprings(requested));
    }

    this.alignment = spec.alignment;
    this.blurActive = isBlurActive(spec);
    this.clipEnabled = spec.clipEnabled;

    const leftAnchored = !containsNumber(spec.text) && !containsNumber(this.currentText);
    const line = typesetter.typeset(spec.text, spec.decimalSeparator, leftAnchored);

    this.countsDown = this.resolveDirection(spec);

    const shape = effectiveShape(spec);
    const animate = spec.animationsEnabled && this.hasContent && !typographyChanged;
    if (animate) {
      this.reconcile(line, shape);
    } else {
      this.rebuild(line, shape);
    }

    if (!this.blurActive) {
      this.glyphs.forEach((glyph) => glyph.clearBlur());
    }

    this.composePresence();
    this.contentSize = { width: line.width, height: line.height };
    this.currentText = spec.text;
    this.hasContent = true;
  }

  tick(deltaTime: number): boolean {
    let running = false;
    let index = 0;

    while (index < this.glyphs.length) {
      const glyph = this.glyphs[index];
      if (glyph.delay > 0) {
        glyph.delay -= deltaTime;
        running = true;
        index++;
        continue;
      }

      if (glyph.tick(deltaTime)) running = true;
      if (glyph.invalid && !glyph.isVisible) {
        this.glyphs.splice(index, 1);
        continue;
      }

      index++;
    }

    this.composePresence();
    return running;
  }

  anchorBase(layoutWidth: number): number {
    switch (this.alignment) {
      case NumericTextAlignment.Center:
        return layoutWidth / 2;
      case NumericTextAlignment.Trailing:
        return layoutWidth;
      default:
        return 0;
    }
  }

  private rebuild(line: TypesetLine, shape: TransitionShape): void {
    this.glyphs = line.placements.map((placement) => {
      const glyph = new GlyphState(this.nextId++, placement.unit, this.springs);
      glyph.slot = placement.slot;
      glyph.updateMetrics(placement, line, shape);
      glyph.x.snapTo(this.anchoredX(placement.x, line.width));
      glyph.snapToVisible();
      return glyph;
    });
  }

  private reconcile(line: TypesetLine, shape: TransitionShape): void {
    const buckets = new Map<string, GlyphState[]>();
    const occupiedSlots = new Map<string, GlyphState>();
    for (const glyph of this.glyphs) {
      glyph.invalid = true;
      if (!glyph.slot) continue;

      const slot = slotKey(glyph.slot);
      const key = `${slot}|${glyph.unit}`;
      const bucket = buckets.get(key);
      if (bucket) bucket.push(glyph);
      else buckets.set(key, [glyph]);

      if (!occupiedSlots.has(slot)) occupiedSlots.set(slot, glyph);
    }

    const arrived: GlyphState[] = [];
    const slotTargets = new Map<string, number>();
    for (const placement of line.placements) {
      slotTargets.set(slotKey(placement.slot), this.anchoredX(placement.x, line.width));
    }

    for (const placement of line.placements) {
      const slot = slotKey(placement.slot);
      const bucket = buckets.get(`${slot}|${placement.unit}`);
      let reused: GlyphState | undefined;
      if (bucket && bucket.length > 0) {
        const index = bucket.findIndex((glyph) => !glyph.disappearing);
        reused = bucket.splice(index < 0 ? 0 : index, 1)[0];
      }

      const targetX = this.anchoredX(placement.x, line.width);
      if (reused) {
        reused.invalid = false;
        reused.updateMetrics(placement, line, shape);
        reused.x.retarget(targetX);
        reused.returnToVisible();
      } else {
        const glyph = new GlyphState(this.nextId++, placement.unit, this.springs);
        glyph.slot = placement.slot;
        glyph.updateMetrics(placement, line, shape);
        const predecessor = occupiedSlots.get(slot);
        if (predecessor) {
          glyph.x.reset(predecessor.x.value, targetX);
        } else {
          glyph.x.snapTo(targetX);
        }

        glyph.beginAppear(this.countsDown, this.blurActive);
        this.glyphs.push(glyph);
        arrived.push(glyph);
      }
    }

    const leaving = this.glyphs
      .filter((glyph) => glyph.invalid)
      .sort((lhs, rhs) => lhs.x.value - rhs.x.value);
    for (const glyph of leaving) {
      const target = glyph.slot ? slotTargets.get(slotKey(glyph.slot)) : undefined;
      if (target !== undefined) glyph.x.retarget(target);
    }

    this.stagger(arrived, leaving);
  }

  private stagger(arrived: GlyphState[], leaving: GlyphState[]): void {
    const count = Math.max(arrived.length, leaving.length);
    const step = count === 0 ? 0 : this.springs.staggerWindow / count;

    arrived.forEach((glyph, index) => {
      glyph.delay = index * step;
    });

    leaving.forEach((glyph, index) => {
      if (!glyph.isAnimating) glyph.delay = index * step;
      glyph.beginDisappear(this.countsDown, this.blurActive);
    });
  }

  private composePresence(): void {
    const totals = new Map<string, number>();
    for (const glyph of this.glyphs) {
      if (!glyph.slot) continue;
      const key = slotKey(glyph.slot);
      totals.set(key, (totals.get(key) ?? 0) + clampUnit(glyph.alpha.value));
    }

    for (const glyph of this.glyphs) {
      const own = clampUnit(glyph.alpha.value);
      const total = glyph.slot ? (totals.get(slotKey(glyph.slot)) ?? 0) : 0;
      glyph.presence = total > 1 ? own / total : own;
    }
  }

  private resolveDirection(spec: NumericTextSpec): boolean {
    switch (spec.direction) {
      case TransitionDirection.Up:
        return false;
      case TransitionDirection.Down:
        return true;
      default: {
        const previous = numericValue(this.currentText, spec.decimalSeparator);
        const next = numericValue(spec.text, spec.decimalSeparator);
        if (previous !== null && next !== null && previous !== next) return next < previous;
        return this.countsDown;
      }
    }
  }

  private anchoredX(x: number, lineWidth: number): number {
    switch (this.alignment) {
      case NumericTextAlignment.Center:
        return x - lineWidth / 2;
      case NumericTextAlignment.Trailing:
        return x - lineWidth;
      default:
        return x;
    }
  }
}

const clampUnit = (value: number): number => Math.min(Math.max(value, 0), 1);

export { GlyphTransitionEngine };
export type { ContentSize };
