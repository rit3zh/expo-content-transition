import CoreGraphics

struct GlyphPlacement {
  let unit: String
  let slot: GlyphSlot
  let x: CGFloat
  let advance: CGFloat
}

struct TypesetLine {
  let placements: [GlyphPlacement]
  let width: CGFloat
  let height: CGFloat
}

struct GlyphImage {
  let image: CGImage
  let scale: CGFloat
}
