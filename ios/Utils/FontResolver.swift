import UIKit

enum FontResolver {
  static func resolve(
    family: String?,
    size: CGFloat,
    weight: UIFont.Weight,
    italic: Bool,
    monospacedDigits: Bool
  ) -> UIFont {
    var font: UIFont

    if let family, !family.isEmpty, let custom = named(family, size: size) {
      font = custom
      var traits: UIFontDescriptor.SymbolicTraits = []
      if weight.rawValue >= UIFont.Weight.semibold.rawValue {
        traits.insert(.traitBold)
      }

      if italic {
        traits.insert(.traitItalic)
      }

      if !traits.isEmpty,
         let descriptor = font.fontDescriptor.withSymbolicTraits(
          font.fontDescriptor.symbolicTraits.union(traits)
         ) {
        font = UIFont(descriptor: descriptor, size: size)
      }
    } else {
      font = UIFont.systemFont(ofSize: size, weight: weight)
      if italic,
         let descriptor = font.fontDescriptor.withSymbolicTraits(
          font.fontDescriptor.symbolicTraits.union(.traitItalic)
         ) {
        font = UIFont(descriptor: descriptor, size: size)
      }
    }

    if monospacedDigits {
      font = withMonospacedDigits(font, size: size)
    }

    return font
  }

  private static func named(_ family: String, size: CGFloat) -> UIFont? {
    if let exact = UIFont(name: family, size: size) {
      return exact
    }

    if let firstFace = UIFont.fontNames(forFamilyName: family).first {
      return UIFont(name: firstFace, size: size)
    }

    return nil
  }

  private static func withMonospacedDigits(_ font: UIFont, size: CGFloat) -> UIFont {
    let settings: [[UIFontDescriptor.FeatureKey: Int]] = [[
      .type: kNumberSpacingType,
      .selector: kMonospacedNumbersSelector
    ]]
    let descriptor = font.fontDescriptor.addingAttributes([.featureSettings: settings])
    return UIFont(descriptor: descriptor, size: size)
  }

  static func weight(from value: String?) -> UIFont.Weight {
    switch value {
    case "100": return .ultraLight
    case "200": return .thin
    case "300": return .light
    case "400", "normal", .none: return .regular
    case "500": return .medium
    case "600": return .semibold
    case "700", "bold": return .bold
    case "800": return .heavy
    case "900": return .black
    default: return .regular
    }
  }
}
