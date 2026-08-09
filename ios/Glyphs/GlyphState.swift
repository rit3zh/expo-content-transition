import CoreGraphics
import Foundation

final class GlyphState {
  let id: Int64
  let unit: String

  var slot: GlyphSlot?
  var invalid = false
  var disappearing = false
  var delay: CGFloat = 0

  var x: SpringValue
  var offset: SpringValue
  var scale: SpringValue
  var opacity: SpringValue
  var blur: SpringValue

  var advance: CGFloat = 0
  var lineHeight: CGFloat = 0
  var travel: CGFloat = 0

  var bleed: CGFloat = 0

  private var enterScale: CGFloat = TransitionShape.Defaults.enterScale
  private var appearBlur: CGFloat = 0
  private var disappearBlur: CGFloat = 0

  init(id: Int64, unit: String, springs: TransitionSprings) {
    self.id = id
    self.unit = unit
    self.x = SpringValue(spring: springs.position, initial: 0, epsilon: 0.02)
    self.offset = SpringValue(spring: springs.offset, initial: 0, epsilon: 0.002)
    self.scale = SpringValue(spring: springs.glyphScale, initial: 1, epsilon: 0.002)
    self.opacity = SpringValue(spring: springs.opacity, initial: 1, epsilon: 0.002)
    self.blur = SpringValue(spring: springs.blur, initial: 0, epsilon: 0.02)
  }

  func adoptSprings(_ springs: TransitionSprings) {
    x.spring = springs.position
    offset.spring = springs.offset
    scale.spring = springs.glyphScale
    opacity.spring = springs.opacity
    blur.spring = springs.blur
  }

  func updateMetrics(placement: GlyphPlacement, line: TypesetLine, shape: TransitionShape) {
    advance = placement.advance
    lineHeight = line.height
    travel = line.height * shape.travelRatio
    enterScale = shape.enterScale

    let heightPoints = max(line.height, 2)
    appearBlur = min(log(heightPoints) / log(3) * shape.blurIntensity, shape.maxBlurRadius)
    disappearBlur = min(log(heightPoints) * shape.blurIntensity, shape.maxBlurRadius)

    bleed = max(ceil(max(appearBlur, disappearBlur) * 2), line.height * 0.25)
  }

  func beginAppear(countsDown: Bool, blurEnabled: Bool) {
    let from: CGFloat = countsDown ? -1 : 1
    offset.reset(from: from, to: 0)
    scale.reset(from: enterScale, to: 1)
    opacity.reset(from: 0, to: 1)
    blur.reset(from: blurEnabled ? appearBlur : 0, to: 0)
    disappearing = false
  }

  func returnToVisible() {
    offset.retarget(0)
    scale.retarget(1)
    opacity.retarget(1)
    blur.retarget(0)
    disappearing = false
  }

  func beginDisappear(countsDown: Bool, blurEnabled: Bool) {
    let to: CGFloat = countsDown ? 1 : -1
    offset.retarget(to)
    scale.retarget(enterScale)
    opacity.retarget(0)
    blur.retarget(blurEnabled ? disappearBlur : 0)
    disappearing = true
  }

  func snapToVisible() {
    offset.snap(to: 0)
    scale.snap(to: 1)
    opacity.snap(to: 1)
    blur.snap(to: 0)
    disappearing = false
    delay = 0
  }

  func clearBlur() {
    blur.snap(to: 0)
  }

  var isAnimating: Bool {
    delay > 0 || !x.isSettled || !offset.isSettled || !scale.isSettled
      || !opacity.isSettled || !blur.isSettled
  }

  var isVisible: Bool {
    opacity.value >= 0.01 || opacity.target >= 0.01
  }

  func tick(_ deltaTime: CGFloat) -> Bool {
    var running = false
    if x.tick(deltaTime) { running = true }
    if offset.tick(deltaTime) { running = true }
    if scale.tick(deltaTime) { running = true }
    if opacity.tick(deltaTime) { running = true }
    if blur.tick(deltaTime) { running = true }
    return running
  }
}
