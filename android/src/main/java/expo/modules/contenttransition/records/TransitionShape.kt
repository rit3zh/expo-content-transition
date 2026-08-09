package expo.modules.contenttransition.records

internal data class TransitionShape(
  val blurIntensity: Float = DEFAULT_BLUR_INTENSITY,

  val maxBlurRadius: Float = Float.MAX_VALUE,
  val enterScale: Float = DEFAULT_ENTER_SCALE,
  val travelRatio: Float = DEFAULT_TRAVEL_RATIO
) {
  companion object {
    const val DEFAULT_BLUR_INTENSITY = 1f
    const val DEFAULT_ENTER_SCALE = 0.4f
    const val DEFAULT_TRAVEL_RATIO = 1f / 3f
  }
}
