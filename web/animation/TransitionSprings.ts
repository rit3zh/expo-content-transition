import { Spring } from './Spring';

const BLUR_RESPONSE = 0.4;
const BLUR_DAMPING = 0.91;
const EXIT_BLUR_SPEEDUP = 1.35;

class TransitionSprings {
  static readonly REFERENCE_DURATION = 0.42;
  static readonly DEFAULT_BOUNCE = 0.46;

  readonly scale: number;
  readonly bounce: number;

  readonly position: Spring;
  readonly glyphScale: Spring;
  readonly offset: Spring;
  readonly opacity: Spring;
  readonly blurIn: Spring;
  readonly blurOut: Spring;

  constructor(duration: number, bounce: number) {
    const scale = Math.min(Math.max(duration / TransitionSprings.REFERENCE_DURATION, 0.1), 10);
    this.scale = scale;
    this.bounce = Math.min(Math.max(bounce, 0), 0.95);
    this.position = new Spring(0.34 * scale, 1);
    this.glyphScale = new Spring(0.34 * scale, 1);
    this.offset = new Spring(0.4 * scale, Math.min(Math.max(1 - this.bounce, 0.05), 1));
    this.opacity = new Spring(0.28 * scale, 1);
    this.blurIn = new Spring(BLUR_RESPONSE * scale, BLUR_DAMPING);
    this.blurOut = new Spring((BLUR_RESPONSE / EXIT_BLUR_SPEEDUP) * scale, BLUR_DAMPING);
  }

  get staggerWindow(): number {
    return 0.2 * this.scale;
  }

  equals(other: TransitionSprings): boolean {
    return this.scale === other.scale && this.bounce === other.bounce;
  }
}

export { TransitionSprings };
