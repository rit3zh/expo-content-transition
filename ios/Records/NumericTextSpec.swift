import Foundation

struct NumericTextSpec: Equatable {
  var text: String = ""
  var alignment: NumericTextAlignment = .leading
  var direction: TransitionDirection = .auto
  var decimalSeparator: Character = "."
  var blurEnabled: Bool = true
  var shape = TransitionShape()
  var clipEnabled: Bool = true
  var animationsEnabled: Bool = true
  var duration: Double = TransitionSprings.referenceDuration
  var bounce: Double = TransitionSprings.defaultBounce

  var blurActive: Bool { blurEnabled && shape.blurIntensity > 0 }

  var effectiveShape: TransitionShape {
    guard blurActive else {
      var shape = shape
      shape.blurIntensity = 0
      return shape
    }

    return shape
  }
}
