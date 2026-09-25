import type { GlyphSlot } from './GlyphSlot';

interface GlyphPlacement {
  readonly unit: string;
  readonly slot: GlyphSlot;
  readonly x: number;
  readonly advance: number;
}

interface TypesetLine {
  readonly placements: GlyphPlacement[];
  readonly width: number;
  readonly height: number;
}

export type { GlyphPlacement, TypesetLine };
