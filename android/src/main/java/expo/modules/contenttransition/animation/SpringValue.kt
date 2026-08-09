package expo.modules.contenttransition.animation

import androidx.compose.runtime.mutableFloatStateOf
import kotlin.math.abs

internal class SpringValue(
  var spring: Spring,
  initial: Float,
  private val epsilon: Float
) {
  private val state = mutableFloatStateOf(initial)

  var target: Float = initial
    private set

  var velocity: Float = 0f
    private set

  val value: Float
    get() = state.floatValue

  fun snapTo(newValue: Float) {
    state.floatValue = newValue
    target = newValue
    velocity = 0f
  }

  fun retarget(newTarget: Float) {
    target = newTarget
  }

  fun reset(from: Float, to: Float) {
    state.floatValue = from
    target = to
    velocity = 0f
  }

  val isSettled: Boolean
    get() = abs(state.floatValue - target) < epsilon && abs(velocity) < epsilon * 8f

  fun tick(deltaTime: Float): Boolean {
    if (isSettled) {
      settle()
      return false
    }

    spring.advance(this, deltaTime)
    if (isSettled) {
      settle()
      return false
    }

    return true
  }

  internal fun write(newValue: Float, newVelocity: Float) {
    state.floatValue = newValue
    velocity = newVelocity
  }

  private fun settle() {
    if (state.floatValue != target) {
      state.floatValue = target
    }

    velocity = 0f
  }
}
