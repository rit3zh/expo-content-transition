import CoreGraphics
import Foundation

struct Spring {
  private let omega: CGFloat
  private let zeta: CGFloat

  init(response: CGFloat, dampingRatio: CGFloat) {
    self.omega = 2 * .pi / max(response, 1e-4)
    self.zeta = min(max(dampingRatio, 1e-4), 10)
  }

  func advance(_ value: inout SpringValue, deltaTime: CGFloat) {
    let x0 = value.value - value.target
    let v0 = value.velocity

    let x: CGFloat
    let v: CGFloat

    if zeta < 1 {
      let wd = omega * sqrt(1 - zeta * zeta)
      let decay = exp(-zeta * omega * deltaTime)
      let c1 = x0
      let c2 = (v0 + zeta * omega * x0) / wd
      let cosine = cos(wd * deltaTime)
      let sine = sin(wd * deltaTime)
      x = decay * (c1 * cosine + c2 * sine)
      v = decay * ((c2 * wd - zeta * omega * c1) * cosine - (c1 * wd + zeta * omega * c2) * sine)
    } else if zeta == 1 {
      let decay = exp(-omega * deltaTime)
      let c1 = x0
      let c2 = v0 + omega * x0
      x = (c1 + c2 * deltaTime) * decay
      v = (c2 - omega * (c1 + c2 * deltaTime)) * decay
    } else {
      let s = sqrt(zeta * zeta - 1)
      let r1 = -omega * (zeta - s)
      let r2 = -omega * (zeta + s)
      let c2 = (v0 - r1 * x0) / (r2 - r1)
      let c1 = x0 - c2
      let e1 = exp(r1 * deltaTime)
      let e2 = exp(r2 * deltaTime)
      x = c1 * e1 + c2 * e2
      v = c1 * r1 * e1 + c2 * r2 * e2
    }

    value.write(value: value.target + x, velocity: v)
  }
}
