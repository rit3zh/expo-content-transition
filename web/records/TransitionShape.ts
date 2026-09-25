interface TransitionShape {
  blurIntensity: number;
  maxBlurRadius: number;
  enterScale: number;
  travelRatio: number;
}

const TRANSITION_SHAPE_DEFAULTS = {
  blurIntensity: 1,
  maxBlurRadius: Number.POSITIVE_INFINITY,
  enterScale: 0.4,
  travelRatio: 1 / 3,
} as const satisfies TransitionShape;

export { TRANSITION_SHAPE_DEFAULTS };
export type { TransitionShape };
