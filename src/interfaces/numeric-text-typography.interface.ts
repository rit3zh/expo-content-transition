import type { TNumericTextFontStyle, TNumericTextFontWeight } from '../types';

interface INumericTextTypographyProps {
  /** Font size in scale-independent pixels. */
  fontSize?: number;
  /** @default 'normal' */
  fontWeight?: TNumericTextFontWeight;
  /** @default 'normal' */
  fontStyle?: TNumericTextFontStyle;
  /**
   * A font family name, resolved the same way a `<Text>` resolves one — families loaded with
   * `expo-font`, bundled through `react-native.config.js`, or a platform built-in.
   *
   * @platform android `default`, `sansSerif`, `serif`, `monospace`, `cursive`.
   * @platform ios Registered families and PostScript names. Custom families expose their weights
   * as separate faces, so `fontWeight` can only add or drop the bold trait on one.
   */
  fontFamily?: string;
  /** Extra spacing between characters, in points. */
  letterSpacing?: number;
  /** Any React Native colour value. Defaults to the platform's primary label colour. */
  color?: string;
  /**
   * Renders digits at a uniform width. Stops unchanged digits from shifting sideways when a
   * neighbour changes, at the cost of the font's natural figure spacing. Equivalent to
   * `style={{ fontVariant: ['tabular-nums'] }}`.
   *
   * @default false
   */
  monospacedDigits?: boolean;
}

export type { INumericTextTypographyProps };
