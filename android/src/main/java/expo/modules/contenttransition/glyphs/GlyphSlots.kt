package expo.modules.contenttransition.glyphs

import expo.modules.contenttransition.enums.SlotRole
import expo.modules.contenttransition.records.GlyphSlot

internal object GlyphSlots {
  fun compute(
    units: List<String>,
    decimalSeparator: Char,
    leftAnchored: Boolean
  ): List<GlyphSlot> {
    if (units.isEmpty()) {
      return emptyList()
    }

    val firstDigit = units.indexOfFirst { it.isDigitUnit() }
    if (firstDigit < 0) {
      return units.indices.map { index ->
        GlyphSlot(SlotRole.Core, if (leftAnchored) index else index - units.size)
      }
    }

    val lastDigit = units.indexOfLast { it.isDigitUnit() }

    var anchor = lastDigit + 1
    for (index in lastDigit downTo firstDigit) {
      if (units[index].length == 1 && units[index][0] == decimalSeparator) {
        anchor = index
        break
      }
    }

    return units.indices.map { index ->
      when {
        index < firstDigit -> GlyphSlot(SlotRole.Prefix, index)
        index > lastDigit -> GlyphSlot(SlotRole.Suffix, units.size - 1 - index)
        else -> GlyphSlot(SlotRole.Core, index - anchor)
      }
    }
  }

  fun splitUnits(text: String): List<String> {
    val units = ArrayList<String>(text.length)
    var index = 0
    while (index < text.length) {
      val length = Character.charCount(text.codePointAt(index))
      units.add(text.substring(index, index + length))
      index += length
    }

    return units
  }

  fun numericValue(text: String, decimalSeparator: Char): Double? {
    val builder = StringBuilder()
    var seenDigit = false
    var seenSeparator = false
    for (char in text) {
      when {
        char.isDigit() -> {
          builder.append(char)
          seenDigit = true
        }

        char == decimalSeparator && seenDigit && !seenSeparator -> {
          builder.append('.')
          seenSeparator = true
        }

        (char == '-' || char == '−') && builder.isEmpty() -> builder.append('-')
      }
    }

    if (!seenDigit) {
      return null
    }

    return builder.toString().toDoubleOrNull()
  }

  private fun String.isDigitUnit(): Boolean = length == 1 && this[0].isDigit()
}
