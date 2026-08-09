package expo.modules.contenttransition.animation

internal class TransitionSprings(val scale: Float, val bounce: Float = DEFAULT_BOUNCE) {
  val position = Spring(response = 0.5f * scale, dampingRatio = 1f)
  val glyphScale = Spring(response = 0.3f * scale, dampingRatio = 1f)
  val offset = Spring(response = 0.4f * scale, dampingRatio = (1f - bounce).coerceIn(0.05f, 1f))
  val opacity = Spring(response = 0.42f * scale, dampingRatio = 1f)
  val blur = Spring(response = 0.42f * scale, dampingRatio = 0.8f)

  val staggerWindow = 0.2f * scale

  companion object {
    const val REFERENCE_DURATION = 0.42f
    const val DEFAULT_BOUNCE = 0.46f
  }
}
