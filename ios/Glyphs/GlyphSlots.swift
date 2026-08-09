import Foundation

enum GlyphSlots {
  static func splitUnits(_ text: String) -> [TextUnit] {
    var units: [TextUnit] = []
    units.reserveCapacity(text.count)
    var offset = 0
    for character in text {
      units.append(TextUnit(text: String(character), utf16Offset: offset))
      offset += String(character).utf16.count
    }

    return units
  }

  static func compute(
    units: [TextUnit],
    decimalSeparator: Character,
    leftAnchored: Bool
  ) -> [GlyphSlot] {
    guard !units.isEmpty else { return [] }

    guard let firstDigit = units.firstIndex(where: { $0.isDigit }) else {
      return units.indices.map { index in
        GlyphSlot(role: .core, index: leftAnchored ? index : index - units.count)
      }
    }

    let lastDigit = units.lastIndex(where: { $0.isDigit }) ?? firstDigit

    var anchor = lastDigit + 1
    for index in stride(from: lastDigit, through: firstDigit, by: -1)
    where units[index].text == String(decimalSeparator) {
      anchor = index
      break
    }

    return units.indices.map { index in
      if index < firstDigit {
        return GlyphSlot(role: .prefix, index: index)
      }

      if index > lastDigit {
        return GlyphSlot(role: .suffix, index: units.count - 1 - index)
      }

      return GlyphSlot(role: .core, index: index - anchor)
    }
  }

  static func numericValue(_ text: String, decimalSeparator: Character) -> Double? {
    var builder = ""
    var seenDigit = false
    var seenSeparator = false

    for character in text {
      if character.isNumber, character.isASCII {
        builder.append(character)
        seenDigit = true
      } else if character == decimalSeparator, seenDigit, !seenSeparator {
        builder.append(".")
        seenSeparator = true
      } else if character == "-" || character == "\u{2212}", builder.isEmpty {
        builder.append("-")
      }
    }

    guard seenDigit else { return nil }
    return Double(builder)
  }
}
