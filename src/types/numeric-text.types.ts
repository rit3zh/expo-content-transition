import type {
  COMPONENT_NAMES,
  NATIVE_VIEW_NAMES,
  NUMERIC_TEXT_ALIGNMENTS,
  NUMERIC_TEXT_DIRECTIONS,
  NUMERIC_TEXT_FONT_STYLES,
  NUMERIC_TEXT_FONT_WEIGHTS,
  TEXT_STYLE_KEYS,
} from '../constants';

type TNumericTextAlignment = (typeof NUMERIC_TEXT_ALIGNMENTS)[number];
type TNumericTextDirection = (typeof NUMERIC_TEXT_DIRECTIONS)[number];
type TNumericTextFontStyle = (typeof NUMERIC_TEXT_FONT_STYLES)[number];
type TNumericTextFontWeight = (typeof NUMERIC_TEXT_FONT_WEIGHTS)[number];
type TTextStyleKey = (typeof TEXT_STYLE_KEYS)[number];
type TNativeViewName = (typeof NATIVE_VIEW_NAMES)[keyof typeof NATIVE_VIEW_NAMES];
type TComponentName = (typeof COMPONENT_NAMES)[keyof typeof COMPONENT_NAMES];

export type {
  TNumericTextAlignment,
  TNumericTextDirection,
  TNumericTextFontStyle,
  TNumericTextFontWeight,
  TTextStyleKey,
  TNativeViewName,
  TComponentName,
};
