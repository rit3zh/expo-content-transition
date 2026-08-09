import Foundation

struct GlyphSlot: Hashable {
  let role: SlotRole
  let index: Int
}

struct TextUnit {
  let text: String
  let utf16Offset: Int

  var isDigit: Bool {
    text.count == 1 && text.first?.isNumber == true && text.first?.isASCII == true
  }
}
