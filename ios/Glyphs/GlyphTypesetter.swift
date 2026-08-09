import CoreText
import UIKit

struct GlyphTypesetter: Equatable {
  let font: UIFont
  let letterSpacing: CGFloat

  var attributes: [NSAttributedString.Key: Any] {
    var attributes: [NSAttributedString.Key: Any] = [.font: font]
    if letterSpacing != 0 {
      attributes[.kern] = letterSpacing
    }

    return attributes
  }

  func typeset(
    _ text: String,
    decimalSeparator: Character,
    leftAnchored: Bool
  ) -> TypesetLine {
    let units = GlyphSlots.splitUnits(text)
    let line = CTLineCreateWithAttributedString(
      NSAttributedString(string: text, attributes: attributes)
    )

    var ascent: CGFloat = 0
    var descent: CGFloat = 0
    var leading: CGFloat = 0
    let width = CGFloat(CTLineGetTypographicBounds(line, &ascent, &descent, &leading))
    let height = ascent + descent

    guard !units.isEmpty else {
      return TypesetLine(placements: [], width: 0, height: height)
    }

    let slots = GlyphSlots.compute(
      units: units,
      decimalSeparator: decimalSeparator,
      leftAnchored: leftAnchored
    )
    let boxes = measureBoxes(line: line, units: units)

    var placements: [GlyphPlacement] = []
    placements.reserveCapacity(units.count)
    var cursor: CGFloat = 0

    for (index, unit) in units.enumerated() {
      let box = boxes[index] ?? (x: cursor, advance: 0)
      placements.append(
        GlyphPlacement(unit: unit.text, slot: slots[index], x: box.x, advance: box.advance)
      )
      cursor = box.x + box.advance
    }

    return TypesetLine(placements: placements, width: width, height: height)
  }

  private func measureBoxes(
    line: CTLine,
    units: [TextUnit]
  ) -> [(x: CGFloat, advance: CGFloat)?] {
    var boxes = [(x: CGFloat, advance: CGFloat)?](repeating: nil, count: units.count)
    var unitForOffset: [Int: Int] = [:]
    for (index, unit) in units.enumerated() {
      unitForOffset[unit.utf16Offset] = index
    }

    guard let runs = CTLineGetGlyphRuns(line) as? [CTRun] else { return boxes }

    for run in runs {
      let count = CTRunGetGlyphCount(run)
      guard count > 0 else { continue }
      let range = CFRangeMake(0, count)

      var positions = [CGPoint](repeating: .zero, count: count)
      var advances = [CGSize](repeating: .zero, count: count)
      var indices = [CFIndex](repeating: 0, count: count)
      CTRunGetPositions(run, range, &positions)
      CTRunGetAdvances(run, range, &advances)
      CTRunGetStringIndices(run, range, &indices)

      for glyph in 0..<count {
        guard let unitIndex = unitForOffset[indices[glyph]] else { continue }
        let x = positions[glyph].x
        let advance = advances[glyph].width
        if let existing = boxes[unitIndex] {
          let left = min(existing.x, x)
          boxes[unitIndex] = (left, max(existing.x + existing.advance, x + advance) - left)
        } else {
          boxes[unitIndex] = (x, advance)
        }
      }
    }

    return boxes
  }

  static func == (lhs: GlyphTypesetter, rhs: GlyphTypesetter) -> Bool {
    lhs.font == rhs.font && lhs.letterSpacing == rhs.letterSpacing
  }
}
