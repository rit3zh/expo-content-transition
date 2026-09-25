import { TransitionSprings } from '../animation/TransitionSprings';
import { NumericTextAlignment, TransitionDirection } from '../enums';
import { TRANSITION_SHAPE_DEFAULTS, type TransitionShape } from './TransitionShape';

interface NumericTextSpec {
  text: string;
  alignment: NumericTextAlignment;
  direction: TransitionDirection;
  decimalSeparator: string;
  blurEnabled: boolean;
  shape: TransitionShape;
  clipEnabled: boolean;
  animationsEnabled: boolean;
  duration: number;
  bounce: number;
}

const createNumericTextSpec = (): NumericTextSpec => ({
  text: '',
  alignment: NumericTextAlignment.Leading,
  direction: TransitionDirection.Auto,
  decimalSeparator: '.',
  blurEnabled: true,
  shape: { ...TRANSITION_SHAPE_DEFAULTS },
  clipEnabled: true,
  animationsEnabled: true,
  duration: TransitionSprings.REFERENCE_DURATION,
  bounce: TransitionSprings.DEFAULT_BOUNCE,
});

const isBlurActive = (spec: NumericTextSpec): boolean =>
  spec.blurEnabled && spec.shape.blurIntensity > 0;

const effectiveShape = (spec: NumericTextSpec): TransitionShape =>
  isBlurActive(spec) ? spec.shape : { ...spec.shape, blurIntensity: 0 };

const specsEqual = (lhs: NumericTextSpec, rhs: NumericTextSpec): boolean =>
  lhs.text === rhs.text &&
  lhs.alignment === rhs.alignment &&
  lhs.direction === rhs.direction &&
  lhs.decimalSeparator === rhs.decimalSeparator &&
  lhs.blurEnabled === rhs.blurEnabled &&
  lhs.clipEnabled === rhs.clipEnabled &&
  lhs.animationsEnabled === rhs.animationsEnabled &&
  lhs.duration === rhs.duration &&
  lhs.bounce === rhs.bounce &&
  lhs.shape.blurIntensity === rhs.shape.blurIntensity &&
  lhs.shape.maxBlurRadius === rhs.shape.maxBlurRadius &&
  lhs.shape.enterScale === rhs.shape.enterScale &&
  lhs.shape.travelRatio === rhs.shape.travelRatio;

export { createNumericTextSpec, isBlurActive, effectiveShape, specsEqual };
export type { NumericTextSpec };
