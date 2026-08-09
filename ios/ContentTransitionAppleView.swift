import ExpoModulesCore

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class ContentTransitionAppleView: ExpoView {
  let label = UILabel()
  let onTap = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    backgroundColor = UIColor(red: 0.67, green: 0.73, blue: 0.80, alpha: 1.0)
    label.text = "ContentTransitionApple - native view\nTap the view to emit a view event"
    label.textAlignment = .center
    label.numberOfLines = 0
    label.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(label)
  }

  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    onTap()
  }
}
