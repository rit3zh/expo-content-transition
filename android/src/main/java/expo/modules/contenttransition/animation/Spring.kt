package expo.modules.contenttransition.animation

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.sin
import kotlin.math.sqrt

internal class Spring(response: Float, dampingRatio: Float) {
  private val omega: Float = (2.0 * PI / response.coerceAtLeast(1e-4f)).toFloat()
  private val zeta: Float = dampingRatio.coerceIn(1e-4f, 10f)

  fun advance(value: SpringValue, deltaTime: Float) {
    val x0 = value.value - value.target
    val v0 = value.velocity

    val x: Float
    val v: Float
    when {
      zeta < 1f -> {
        val wd = omega * sqrt(1f - zeta * zeta)
        val decay = exp(-zeta * omega * deltaTime)
        val c1 = x0
        val c2 = (v0 + zeta * omega * x0) / wd
        val cosine = cos(wd * deltaTime)
        val sine = sin(wd * deltaTime)
        x = decay * (c1 * cosine + c2 * sine)
        v = decay * ((c2 * wd - zeta * omega * c1) * cosine - (c1 * wd + zeta * omega * c2) * sine)
      }

      zeta == 1f -> {
        val decay = exp(-omega * deltaTime)
        val c1 = x0
        val c2 = v0 + omega * x0
        x = (c1 + c2 * deltaTime) * decay
        v = (c2 - omega * (c1 + c2 * deltaTime)) * decay
      }

      else -> {
        val s = sqrt(zeta * zeta - 1f)
        val r1 = -omega * (zeta - s)
        val r2 = -omega * (zeta + s)
        val c2 = (v0 - r1 * x0) / (r2 - r1)
        val c1 = x0 - c2
        val e1 = exp(r1 * deltaTime)
        val e2 = exp(r2 * deltaTime)
        x = c1 * e1 + c2 * e2
        v = c1 * r1 * e1 + c2 * r2 * e2
      }
    }

    value.write(value.target + x, v)
  }
}
