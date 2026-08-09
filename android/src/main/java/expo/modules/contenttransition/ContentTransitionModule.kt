package expo.modules.contenttransition

import expo.modules.contenttransition.views.NumericTextView
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ContentTransitionModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ContentTransition")

    View(NumericTextView::class)
  }
}
