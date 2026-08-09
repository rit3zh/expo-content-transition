import ExpoModulesCore

public class ContentTransitionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ContentTransition")

    View(NumericTextView.self) {
      Prop("value") { (view: NumericTextView, value: String?) in view.value = value ?? "" }
      Prop("alignment") { (view: NumericTextView, value: String?) in view.alignment = value }
      Prop("decimalSeparator") { (view: NumericTextView, value: String?) in
        view.decimalSeparator = value
      }

      Prop("color") { (view: NumericTextView, value: UIColor?) in view.color = value }
      Prop("fontSize") { (view: NumericTextView, value: Double?) in view.fontSize = value }
      Prop("fontWeight") { (view: NumericTextView, value: String?) in view.fontWeight = value }
      Prop("fontStyle") { (view: NumericTextView, value: String?) in view.fontStyle = value }
      Prop("fontFamily") { (view: NumericTextView, value: String?) in view.fontFamily = value }
      Prop("letterSpacing") { (view: NumericTextView, value: Double?) in
        view.letterSpacing = value
      }

      Prop("monospacedDigits") { (view: NumericTextView, value: Bool?) in
        view.monospacedDigits = value
      }

      Prop("direction") { (view: NumericTextView, value: String?) in view.direction = value }
      Prop("duration") { (view: NumericTextView, value: Double?) in view.duration = value }
      Prop("bounce") { (view: NumericTextView, value: Double?) in view.bounce = value }
      Prop("enterScale") { (view: NumericTextView, value: Double?) in view.enterScale = value }
      Prop("travel") { (view: NumericTextView, value: Double?) in view.travel = value }
      Prop("blur") { (view: NumericTextView, value: Bool?) in view.blur = value }
      Prop("blurIntensity") { (view: NumericTextView, value: Double?) in
        view.blurIntensity = value
      }

      Prop("maxBlurRadius") { (view: NumericTextView, value: Double?) in
        view.maxBlurRadius = value
      }

      Prop("clip") { (view: NumericTextView, value: Bool?) in view.clip = value }
      Prop("animated") { (view: NumericTextView, value: Bool?) in view.animated = value }

      OnViewDidUpdateProps { (view: NumericTextView) in
        view.applyProps()
      }
    }
  }
}
