import * as React from 'react';
import { View } from 'react-native';

import type { INativeNumericTextProps } from '../../src/interfaces';
import { TransitionSprings } from '../animation/TransitionSprings';
import { alignmentFromProp, directionFromProp } from '../enums';
import { GlyphTypesetter, type ContentSize } from '../glyphs';
import { useFontRevision, usePrefersReducedMotion } from '../hooks';
import { TRANSITION_SHAPE_DEFAULTS, type NumericTextSpec } from '../records';
import { NumericTextLabel } from './NumericTextLabel';

const DEFAULT_FONT_SIZE = 17;
const MAX_BLUR_INTENSITY = 8;
const MAX_ENTER_SCALE = 2;
const MAX_TRAVEL_RATIO = 3;
const MAX_BOUNCE = 0.95;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

const NumericTextView = ({
  value,
  alignment,
  decimalSeparator,
  direction,
  duration,
  bounce,
  enterScale,
  travel,
  blur,
  blurIntensity,
  maxBlurRadius,
  clip,
  animated,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  fontStyle,
  letterSpacing,
  monospacedDigits,
  style,
}: INativeNumericTextProps): React.JSX.Element => {
  const hostRef = React.useRef<View>(null);
  const labelRef = React.useRef<NumericTextLabel | null>(null);
  const [contentSize, setContentSize] = React.useState<ContentSize | null>(null);

  const fontRevision = useFontRevision();
  const reducedMotion = usePrefersReducedMotion();

  const typesetter = React.useMemo(
    () =>
      new GlyphTypesetter({
        fontFamily,
        fontSize: fontSize ?? DEFAULT_FONT_SIZE,
        fontWeight,
        fontStyle,
        letterSpacing: letterSpacing ?? 0,
        monospacedDigits: monospacedDigits ?? false,
      }),
    [fontFamily, fontSize, fontWeight, fontStyle, letterSpacing, monospacedDigits, fontRevision]
  );

  const spec: NumericTextSpec = {
    text: value,
    alignment: alignmentFromProp(alignment),
    direction: directionFromProp(direction),
    decimalSeparator: (decimalSeparator && Array.from(decimalSeparator)[0]) || '.',
    blurEnabled: blur ?? true,
    shape: {
      blurIntensity: clamp(
        blurIntensity ?? TRANSITION_SHAPE_DEFAULTS.blurIntensity,
        0,
        MAX_BLUR_INTENSITY
      ),
      maxBlurRadius:
        maxBlurRadius == null
          ? TRANSITION_SHAPE_DEFAULTS.maxBlurRadius
          : Math.max(maxBlurRadius, 0),
      enterScale: clamp(enterScale ?? TRANSITION_SHAPE_DEFAULTS.enterScale, 0, MAX_ENTER_SCALE),
      travelRatio: clamp(travel ?? TRANSITION_SHAPE_DEFAULTS.travelRatio, 0, MAX_TRAVEL_RATIO),
    },
    clipEnabled: clip ?? true,
    animationsEnabled: (animated ?? true) && !reducedMotion,
    duration: duration ?? TransitionSprings.REFERENCE_DURATION,
    bounce: clamp(bounce ?? TransitionSprings.DEFAULT_BOUNCE, 0, MAX_BOUNCE),
  };

  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current as unknown as HTMLElement | null;
    if (!host) return;

    const label = new NumericTextLabel(host);
    label.onContentSizeChange = setContentSize;
    labelRef.current = label;

    return () => {
      label.destroy();
      labelRef.current = null;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    labelRef.current?.update(spec, typesetter, color ?? null);
  });

  return (
    <View
      ref={hostRef}
      role="img"
      aria-label={value}
      style={[contentSize && { width: contentSize.width, height: contentSize.height }, style]}
    />
  );
};

export { NumericTextView };
