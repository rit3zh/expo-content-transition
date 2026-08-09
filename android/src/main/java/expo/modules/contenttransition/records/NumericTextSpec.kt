package expo.modules.contenttransition.records

import expo.modules.contenttransition.animation.TransitionSprings
import expo.modules.contenttransition.enums.NumericTextAlignment
import expo.modules.contenttransition.enums.TransitionDirection

internal data class NumericTextSpec(
  val text: String,
  val alignment: NumericTextAlignment,
  val direction: TransitionDirection,
  val decimalSeparator: Char,
  val blurEnabled: Boolean,
  val shape: TransitionShape,
  val clipEnabled: Boolean,
  val animationsEnabled: Boolean,
  val duration: Float,
  val bounce: Float
) {
  val blurActive: Boolean get() = blurEnabled && shape.blurIntensity > 0f

  val effectiveShape: TransitionShape
    get() = if (blurActive) shape else shape.copy(blurIntensity = 0f)

  companion object {
    const val REFERENCE_DURATION = TransitionSprings.REFERENCE_DURATION
  }
}
