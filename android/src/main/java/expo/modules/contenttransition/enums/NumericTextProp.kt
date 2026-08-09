package expo.modules.contenttransition.enums

import expo.modules.kotlin.types.Enumerable

enum class NumericTextAlignmentProp(val value: String) : Enumerable {
  START("start"),
  CENTER("center"),
  END("end");

  internal fun toAlignment(): NumericTextAlignment = when (this) {
    START -> NumericTextAlignment.Start
    CENTER -> NumericTextAlignment.Center
    END -> NumericTextAlignment.End
  }
}

enum class NumericTextDirectionProp(val value: String) : Enumerable {
  AUTO("auto"),
  UP("up"),
  DOWN("down");

  internal fun toDirection(): TransitionDirection = when (this) {
    AUTO -> TransitionDirection.Automatic
    UP -> TransitionDirection.Up
    DOWN -> TransitionDirection.Down
  }
}
