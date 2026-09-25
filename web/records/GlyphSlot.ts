import type { SlotRole } from '../enums';

interface GlyphSlot {
  readonly role: SlotRole;
  readonly index: number;
}

interface TextUnit {
  readonly text: string;
  readonly utf16Offset: number;
}

const slotKey = (slot: GlyphSlot): string => `${slot.role}:${slot.index}`;

const isDigitUnit = (unit: string): boolean => unit.length === 1 && unit >= '0' && unit <= '9';

export { slotKey, isDigitUnit };
export type { GlyphSlot, TextUnit };
