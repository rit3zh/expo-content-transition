import ExpoModulesCore

public class ContentTransitionAppleModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ContentTransitionApple")

    View(ContentTransitionAppleView.self) {
      Events("onTap")
    }
  }
}
