import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { TNumericTextAlignment } from '../types';
import type { INumericTextTransitionProps } from './numeric-text-transition.interface';
import type { INumericTextTypographyProps } from './numeric-text-typography.interface';

interface INumericText extends INumericTextTypographyProps, INumericTextTransitionProps {
  /**
   * The text to display. Only this crosses the bridge when the value changes — measuring, diffing
   * and animating all happen natively.
   */
  value: string | number;
  /**
   * Horizontal alignment of the line inside the component's bounds. Also settable through
   * `style.textAlign`.
   *
   * @default 'start'
   */
  alignment?: TNumericTextAlignment;
  /**
   * The character separating the whole and fractional parts. Characters are aligned around it, so
   * `123.45 → 123.46` only animates the final digit.
   *
   * @default '.'
   */
  decimalSeparator?: string;
  /**
   * Accepts text style properties as well as layout ones. `fontFamily`, `fontSize`, `fontWeight`,
   * `fontStyle`, `letterSpacing`, `color`, `fontVariant` and `textAlign` are read off and applied
   * to the glyphs; everything else styles the view. An explicit prop wins over the same value set
   * through `style`.
   */
  style?: StyleProp<TextStyle>;
}

interface INativeNumericTextProps extends INumericTextTypographyProps {
  value: string;
  alignment: TNumericTextAlignment | null;
  decimalSeparator: string | null;
  direction: INumericText['direction'] | null;
  duration: number | null;
  bounce: number | null;
  enterScale: number | null;
  travel: number | null;
  blur: boolean | null;
  blurIntensity: number | null;
  maxBlurRadius: number | null;
  clip: boolean | null;
  animated: boolean | null;
  style?: ViewStyle;
}

export type { INumericText, INativeNumericTextProps };
