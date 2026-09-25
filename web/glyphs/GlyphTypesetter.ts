import type { TypesetLine } from '../records';
import { computeSlots, splitUnits } from './GlyphSlots';

interface GlyphTypography {
  fontFamily?: string | null;
  fontSize: number;
  fontWeight?: string | null;
  fontStyle?: string | null;
  letterSpacing: number;
  monospacedDigits: boolean;
}

interface GlyphFontStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  letterSpacing: string;
  fontVariantNumeric: string;
}

const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const GENERIC_FAMILIES: Record<string, string> = {
  default: SYSTEM_FONT_STACK,
  system: SYSTEM_FONT_STACK,
  'system-ui': 'system-ui',
  sansSerif: 'sans-serif',
  'sans-serif': 'sans-serif',
  serif: 'serif',
  monospace: 'monospace',
  cursive: 'cursive',
  fantasy: 'fantasy',
};

const FINGERPRINT_PROBE = '0123456789 Hxg';

const resolveFamily = (family: string | null | undefined): string => {
  if (!family) return SYSTEM_FONT_STACK;
  if (GENERIC_FAMILIES[family]) return GENERIC_FAMILIES[family];
  if (family.includes(',') || /^["'].*["']$/.test(family)) return family;
  return `"${family.replace(/"/g, '\\"')}"`;
};

let measureElement: HTMLSpanElement | null = null;

const acquireMeasureElement = (): HTMLSpanElement | null => {
  if (typeof document === 'undefined' || !document.body) return null;
  if (measureElement?.isConnected) return measureElement;

  const element = document.createElement('span');
  element.setAttribute('aria-hidden', 'true');
  Object.assign(element.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    margin: '0',
    padding: '0',
    border: '0',
    width: 'max-content',
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'pre',
    lineHeight: 'normal',
    direction: 'ltr',
    fontKerning: 'normal',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(element);
  measureElement = element;
  return element;
};

class GlyphTypesetter {
  readonly fontStyle: GlyphFontStyle;
  private readonly styleKey: string;
  private fingerprint: string | null = null;

  constructor(typography: GlyphTypography) {
    this.fontStyle = {
      fontFamily: resolveFamily(typography.fontFamily),
      fontSize: `${typography.fontSize}px`,
      fontWeight: typography.fontWeight ?? 'normal',
      fontStyle: typography.fontStyle ?? 'normal',
      letterSpacing: `${typography.letterSpacing}px`,
      fontVariantNumeric: typography.monospacedDigits ? 'tabular-nums' : 'normal',
    };
    this.styleKey = Object.values(this.fontStyle).join('|');
  }

  get key(): string {
    if (this.fingerprint === null) {
      const element = this.prepare();
      if (!element) return this.styleKey;

      element.textContent = FINGERPRINT_PROBE;
      const { width, height } = element.getBoundingClientRect();
      this.fingerprint = `${width.toFixed(3)}x${height.toFixed(3)}`;
    }

    return `${this.styleKey}|${this.fingerprint}`;
  }

  equals(other: GlyphTypesetter): boolean {
    return this === other || this.key === other.key;
  }

  typeset(text: string, decimalSeparator: string, leftAnchored: boolean): TypesetLine {
    const units = splitUnits(text);
    const element = this.prepare();
    if (!element) return { placements: [], width: 0, height: 0 };

    if (units.length === 0) {
      element.textContent = '0';
      return { placements: [], width: 0, height: element.getBoundingClientRect().height };
    }

    element.textContent = text;
    const bounds = element.getBoundingClientRect();
    const node = element.firstChild as Text;
    const range = document.createRange();
    const slots = computeSlots(units, decimalSeparator, leftAnchored);

    let cursor = 0;
    const placements = units.map((unit, index) => {
      range.setStart(node, unit.utf16Offset);
      range.setEnd(node, unit.utf16Offset + unit.text.length);
      const box = range.getBoundingClientRect();
      const measured = box.width > 0 || box.height > 0;
      const x = measured ? box.left - bounds.left : cursor;
      const advance = measured ? box.width : 0;
      cursor = x + advance;
      return { unit: unit.text, slot: slots[index], x, advance };
    });

    return { placements, width: bounds.width, height: bounds.height };
  }

  private prepare(): HTMLSpanElement | null {
    const element = acquireMeasureElement();
    if (element) Object.assign(element.style, this.fontStyle);
    return element;
  }
}

export { GlyphTypesetter };
export type { GlyphTypography, GlyphFontStyle };
