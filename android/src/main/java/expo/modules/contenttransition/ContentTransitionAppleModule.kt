package expo.modules.contenttransition

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView
import expo.modules.kotlin.records.recordFromMap
import expo.modules.ui.ModifierRegistry

class ContentTransitionAppleModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ContentTransitionApple")

    View(ContentTransitionAppleView::class) {
      // Defines an event that the view can send to JavaScript.
      Events("onTap")
    }

    ExpoUIView<ContentTransitionAppleComposeViewProps>("ContentTransitionAppleComposeView") {
      Content { props ->
        ContentTransitionAppleComposeViewContent(props)
      }
    }

    OnCreate {
      ModifierRegistry.register("contentTransitionAppleComposeModifier") { params, _, _, _ ->
        recordFromMap<ContentTransitionAppleComposeModifierParams>(params).toModifier()
      }
    }
  }
}
