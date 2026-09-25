package expo.modules.contenttransition.animation

internal class TransitionSprings(val scale: Float, val bounce: Float = DEFAULT_BOUNCE) {
  val position = Spring(response = 0.34f * scale, dampingRatio = 1f)
  val glyphScale = Spring(response = 0.34f * scale, dampingRatio = 1f)
  val offset = Spring(response = 0.4f * scale, dampingRatio = (1f - bounce).coerceIn(0.05f, 1f))
  val opacity = Spring(response = 0.28f * scale, dampingRatio = 1f)
  val blurIn = Spring(response = BLUR_RESPONSE * scale, dampingRatio = BLUR_DAMPING)
  val blurOut = Spring(response = BLUR_RESPONSE / EXIT_BLUR_SPEEDUP * scale, dampingRatio = BLUR_DAMPING)

  val staggerWindow = 0.2f * scale

  companion object {
    const val REFERENCE_DURATION = 0.42f
    const val DEFAULT_BOUNCE = 0.46f

    private const val BLUR_RESPONSE = 0.4f
    private const val BLUR_DAMPING = 0.91f
    private const val EXIT_BLUR_SPEEDUP = 1.35f
  }
}
