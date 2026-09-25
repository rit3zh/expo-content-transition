import { SlotRole } from '../enums';
import { isDigitUnit, type GlyphSlot, type TextUnit } from '../records';

const NUMBER_PATTERN = /\p{N}/u;

let segmenter: Intl.Segmenter | null | undefined;
const graphemeSegmenter = (): Intl.Segmenter | null => {
  if (segmenter === undefined) {
    segmenter =
      typeof Intl !== 'undefined' && 'Segmenter' in Intl
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : null;
  }

  return segmenter;
};

const splitUnits = (text: string): TextUnit[] => {
  const units: TextUnit[] = [];
  const graphemes = graphemeSegmenter();
  if (graphemes) {
    for (const { segment, index } of graphemes.segment(text)) {
      units.push({ text: segment, utf16Offset: index });
    }

    return units;
  }

  let offset = 0;
  for (const codePoint of text) {
    units.push({ text: codePoint, utf16Offset: offset });
    offset += codePoint.length;
  }

  return units;
};

const containsNumber = (text: string): boolean => NUMBER_PATTERN.test(text);

const computeSlots = (
  units: TextUnit[],
  decimalSeparator: string,
  leftAnchored: boolean
): GlyphSlot[] => {
  if (units.length === 0) return [];

  const firstDigit = units.findIndex((unit) => isDigitUnit(unit.text));
  if (firstDigit < 0) {
    return units.map((_, index) => ({
      role: SlotRole.Core,
      index: leftAnchored ? index : index - units.length,
    }));
  }

  let lastDigit = firstDigit;
  for (let index = units.length - 1; index >= firstDigit; index--) {
    if (isDigitUnit(units[index].text)) {
      lastDigit = index;
      break;
    }
  }

  let anchor = lastDigit + 1;
  for (let index = lastDigit; index >= firstDigit; index--) {
    if (units[index].text === decimalSeparator) {
      anchor = index;
      break;
    }
  }

  return units.map((_, index) => {
    if (index < firstDigit) return { role: SlotRole.Prefix, index };
    if (index > lastDigit) return { role: SlotRole.Suffix, index: units.length - 1 - index };
    return { role: SlotRole.Core, index: index - anchor };
  });
};

const numericValue = (text: string, decimalSeparator: string): number | null => {
  let builder = '';
  let seenDigit = false;
  let seenSeparator = false;

  for (const character of text) {
    if (isDigitUnit(character)) {
      builder += character;
      seenDigit = true;
    } else if (character === decimalSeparator && seenDigit && !seenSeparator) {
      builder += '.';
      seenSeparator = true;
    } else if ((character === '-' || character === '−') && builder.length === 0) {
      builder += '-';
    }
  }

  if (!seenDigit) return null;

  const value = Number(builder);
  return Number.isNaN(value) ? null : value;
};

export { splitUnits, containsNumber, computeSlots, numericValue };
