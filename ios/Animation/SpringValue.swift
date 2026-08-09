import CoreGraphics
import Foundation

struct SpringValue {
  var spring: Spring
  private(set) var value: CGFloat
  private(set) var target: CGFloat
  private(set) var velocity: CGFloat = 0
  private let epsilon: CGFloat

  init(spring: Spring, initial: CGFloat, epsilon: CGFloat) {
    self.spring = spring
    self.value = initial
    self.target = initial
    self.epsilon = epsilon
  }

  mutating func snap(to newValue: CGFloat) {
    value = newValue
    target = newValue
    velocity = 0
  }

  mutating func retarget(_ newTarget: CGFloat) {
    target = newTarget
  }

  mutating func reset(from: CGFloat, to: CGFloat) {
    value = from
    target = to
    velocity = 0
  }

  var isSettled: Bool {
    abs(value - target) < epsilon && abs(velocity) < epsilon * 8
  }

  mutating func tick(_ deltaTime: CGFloat) -> Bool {
    if isSettled {
      settle()
      return false
    }

    spring.advance(&self, deltaTime: deltaTime)
    if isSettled {
      settle()
      return false
    }

    return true
  }

  mutating func write(value newValue: CGFloat, velocity newVelocity: CGFloat) {
    value = newValue
    velocity = newVelocity
  }

  private mutating func settle() {
    value = target
    velocity = 0
  }
}
