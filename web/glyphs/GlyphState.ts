import type { Spring } from '../animation/Spring';
import { SpringValue } from '../animation/SpringValue';
import type { TransitionSprings } from '../animation/TransitionSprings';
import {
  TRANSITION_SHAPE_DEFAULTS,
  type GlyphPlacement,
  type GlyphSlot,
  type TransitionShape,
  type TypesetLine,
} from '../records';
import { GlyphBlur } from './GlyphBlur';

const APPEAR_BLUR_RATIO = 0.25;
const DISAPPEAR_BLUR_RATIO = 0.275;
const FEATHER_RATIO = 0.35;
const OVERHANG_RATIO = 0.15;
const BLUR_EXTENT_SIGMAS = 3;
const VISIBILITY_THRESHOLD = 0.01;

class GlyphState {
  readonly id: number;
  readonly unit: string;

  slot: GlyphSlot | null = null;
  invalid = false;
  disappearing = false;
  delay = 0;

  readonly x: SpringValue;
  readonly offset: SpringValue;
  readonly scale: SpringValue;
  readonly alpha: SpringValue;
  readonly blur: SpringValue;

  presence = 1;

  advance = 0;
  lineHeight = 0;
  travel = 0;
  padX = 0;
  padY = 0;
  feather = 0;
  viewportWidth = 1;
  viewportHeight = 1;

  private enterScale: number = TRANSITION_SHAPE_DEFAULTS.enterScale;
  private appearBlur = 0;
  private disappearBlur = 0;
  private blurIn: Spring;
  private blurOut: Spring;

  constructor(id: number, unit: string, springs: TransitionSprings) {
    this.id = id;
    this.unit = unit;
    this.x = new SpringValue(springs.position, 0, 0.02);
    this.offset = new SpringValue(springs.offset, 0, 0.002);
    this.scale = new SpringValue(springs.glyphScale, 1, 0.002);
    this.alpha = new SpringValue(springs.opacity, 1, 0.002);
    this.blur = new SpringValue(springs.blurIn, 0, 0.05);
    this.blurIn = springs.blurIn;
    this.blurOut = springs.blurOut;
  }

  adoptSprings(springs: TransitionSprings): void {
    this.x.spring = springs.position;
    this.offset.spring = springs.offset;
    this.scale.spring = springs.glyphScale;
    this.alpha.spring = springs.opacity;
    this.blurIn = springs.blurIn;
    this.blurOut = springs.blurOut;
    this.blur.spring = this.disappearing ? this.blurOut : this.blurIn;
  }

  updateMetrics(placement: GlyphPlacement, line: TypesetLine, shape: TransitionShape): void {
    this.advance = placement.advance;
    this.lineHeight = line.height;
    this.travel = line.height * shape.travelRatio;
    this.enterScale = shape.enterScale;

    this.appearBlur = Math.min(
      line.height * APPEAR_BLUR_RATIO * shape.blurIntensity,
      shape.maxBlurRadius
    );
    this.disappearBlur = Math.min(
      line.height * DISAPPEAR_BLUR_RATIO * shape.blurIntensity,
      shape.maxBlurRadius
    );

    const blurExtent = Math.ceil(
      GlyphBlur.sigma(Math.max(this.appearBlur, this.disappearBlur)) * BLUR_EXTENT_SIGMAS
    );

    this.feather = Math.ceil(line.height * FEATHER_RATIO);
    this.padX = Math.max(Math.ceil(line.height * OVERHANG_RATIO), blurExtent);
    this.padY = this.feather;

    this.viewportWidth = Math.max(Math.ceil(placement.advance + this.padX * 2), 1);
    this.viewportHeight = Math.max(Math.ceil(line.height + this.padY * 2), 1);
  }

  beginAppear(countsDown: boolean, blurEnabled: boolean): void {
    const from = countsDown ? -1 : 1;
    this.offset.reset(from, 0);
    this.scale.reset(this.enterScale, 1);
    this.alpha.reset(0, 1);
    this.blur.spring = this.blurIn;
    this.blur.reset(blurEnabled ? this.appearBlur : 0, 0);
    this.disappearing = false;
  }

  returnToVisible(): void {
    this.offset.retarget(0);
    this.scale.retarget(1);
    this.alpha.retarget(1);
    this.blur.spring = this.blurIn;
    this.blur.retarget(0);
    this.disappearing = false;
  }

  beginDisappear(countsDown: boolean, blurEnabled: boolean): void {
    const to = countsDown ? 1 : -1;
    this.offset.retarget(to);
    this.scale.retarget(this.enterScale);
    this.alpha.retarget(0);
    this.blur.spring = this.blurOut;
    this.blur.retarget(blurEnabled ? this.disappearBlur : 0);
    this.disappearing = true;
  }

  snapToVisible(): void {
    this.offset.snapTo(0);
    this.scale.snapTo(1);
    this.alpha.snapTo(1);
    this.blur.snapTo(0);
    this.disappearing = false;
    this.delay = 0;
  }

  clearBlur(): void {
    this.blur.snapTo(0);
  }

  get isDisplaced(): boolean {
    return this.offset.value !== 0 || this.scale.value !== 1 || this.blur.value > 0;
  }

  get isAnimating(): boolean {
    return (
      this.delay > 0 ||
      !this.x.isSettled ||
      !this.offset.isSettled ||
      !this.scale.isSettled ||
      !this.alpha.isSettled ||
      !this.blur.isSettled
    );
  }

  get isVisible(): boolean {
    return this.alpha.value >= VISIBILITY_THRESHOLD || this.alpha.target >= VISIBILITY_THRESHOLD;
  }

  tick(deltaTime: number): boolean {
    let running = false;
    if (this.x.tick(deltaTime)) running = true;
    if (this.offset.tick(deltaTime)) running = true;
    if (this.scale.tick(deltaTime)) running = true;
    if (this.alpha.tick(deltaTime)) running = true;
    if (this.blur.tick(deltaTime)) running = true;
    return running;
  }
}

export { GlyphState };
