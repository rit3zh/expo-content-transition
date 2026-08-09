const NUMERIC_TEXT_ALIGNMENTS = ['start', 'center', 'end'] as const;

const NUMERIC_TEXT_DIRECTIONS = ['auto', 'up', 'down'] as const;

const NUMERIC_TEXT_FONT_STYLES = ['normal', 'italic'] as const;

const NUMERIC_TEXT_FONT_WEIGHTS = [
  'normal',
  'bold',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
] as const;

const TEXT_STYLE_KEYS = [
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'fontVariant',
  'textAlign',
] as const;

const TABULAR_NUMS = 'tabular-nums';

const MILLISECONDS_PER_SECOND = 1000;

export {
  NUMERIC_TEXT_ALIGNMENTS,
  NUMERIC_TEXT_DIRECTIONS,
  NUMERIC_TEXT_FONT_STYLES,
  NUMERIC_TEXT_FONT_WEIGHTS,
  TEXT_STYLE_KEYS,
  TABULAR_NUMS,
  MILLISECONDS_PER_SECOND,
};
