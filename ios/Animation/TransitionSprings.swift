import CoreGraphics

struct TransitionSprings: Equatable {
  static let referenceDuration: Double = 0.42
  static let defaultBounce: Double = 0.46

  let scale: CGFloat
  let bounce: CGFloat

  let position: Spring
  let glyphScale: Spring
  let offset: Spring
  let opacity: Spring
  let blur: Spring

  init(duration: Double, bounce: Double) {
    let scale = CGFloat(min(max(duration / Self.referenceDuration, 0.1), 10))
    let bounce = CGFloat(min(max(bounce, 0), 0.95))
    self.scale = scale
    self.bounce = bounce
    self.position = Spring(response: 0.5 * scale, dampingRatio: 1)
    self.glyphScale = Spring(response: 0.3 * scale, dampingRatio: 1)
    self.offset = Spring(response: 0.4 * scale, dampingRatio: max(1 - bounce, 0.05))
    self.opacity = Spring(response: 0.42 * scale, dampingRatio: 1)
    self.blur = Spring(response: 0.42 * scale, dampingRatio: 0.8)
  }

  var staggerWindow: CGFloat { 0.2 * scale }

  static func == (lhs: TransitionSprings, rhs: TransitionSprings) -> Bool {
    lhs.scale == rhs.scale && lhs.bounce == rhs.bounce
  }
}
