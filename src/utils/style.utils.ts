import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { TABULAR_NUMS, TEXT_STYLE_KEYS } from '../constants';
import type { INumericText, INumericTextTypographyProps } from '../interfaces';
import type { TNumericTextAlignment, TNumericTextFontWeight } from '../types';
import type { IResolvedStyle } from '../interfaces/resolve-styles.interface';

const normalizeFontWeight = (
  weight: TextStyle['fontWeight']
): TNumericTextFontWeight | undefined => {
  if (weight === undefined || weight === null) return undefined;

  const asString = String(weight);
  if (asString === 'normal' || asString === 'bold') return asString;
  if (/^[1-9]00$/.test(asString)) return asString as TNumericTextFontWeight;

  return undefined;
};

const normalizeTextAlign = (align: TextStyle['textAlign']): TNumericTextAlignment | undefined => {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'end';
    case 'left':
      return 'start';
    default:
      return undefined;
  }
};

const resolveNumericTextStyle = (
  style: INumericText['style'],
  props: INumericTextTypographyProps & { alignment?: TNumericTextAlignment }
): IResolvedStyle => {
  const flattened = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const viewStyle: Record<string, unknown> = {};
  const fromStyle: TextStyle = {};

  for (const key of Object.keys(flattened) as (keyof TextStyle)[]) {
    if ((TEXT_STYLE_KEYS as readonly string[]).includes(key)) {
      (fromStyle as Record<string, unknown>)[key] = flattened[key];
    } else {
      viewStyle[key] = flattened[key];
    }
  }

  return {
    viewStyle: viewStyle as ViewStyle,
    alignment: props.alignment ?? normalizeTextAlign(fromStyle.textAlign),
    typography: {
      color: props.color ?? (fromStyle.color as string | undefined),
      fontFamily: props.fontFamily ?? fromStyle.fontFamily,
      fontSize: props.fontSize ?? fromStyle.fontSize,
      fontStyle: props.fontStyle ?? fromStyle.fontStyle,
      fontWeight: props.fontWeight ?? normalizeFontWeight(fromStyle.fontWeight),
      letterSpacing: props.letterSpacing ?? fromStyle.letterSpacing,
      monospacedDigits:
        props.monospacedDigits ?? fromStyle.fontVariant?.includes(TABULAR_NUMS) ?? undefined,
    },
  };
};

const typographyToTextStyle = (typography: INumericTextTypographyProps): TextStyle => ({
  color: typography.color,
  fontSize: typography.fontSize,
  fontStyle: typography.fontStyle,
  fontWeight: typography.fontWeight,
  fontFamily: typography.fontFamily,
  letterSpacing: typography.letterSpacing,
  fontVariant: typography.monospacedDigits ? [TABULAR_NUMS] : undefined,
});

export { resolveNumericTextStyle, typographyToTextStyle, normalizeFontWeight, normalizeTextAlign };
export type { IResolvedStyle };
