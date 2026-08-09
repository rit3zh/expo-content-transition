import ExpoModulesCore
import UIKit

public final class NumericTextView: ExpoView {
  private let label = NumericTextLabel()

  var value: String = ""
  var alignment: String?
  var decimalSeparator: String?

  var color: UIColor?
  var fontSize: Double?
  var fontWeight: String?
  var fontStyle: String?
  var fontFamily: String?
  var letterSpacing: Double?
  var monospacedDigits: Bool?

  var direction: String?
  var duration: Double?
  var bounce: Double?
  var enterScale: Double?
  var travel: Double?
  var blur: Bool?
  var blurIntensity: Double?
  var maxBlurRadius: Double?
  var clip: Bool?
  var animated: Bool?

  private var cachedTypographyKey: TypographyKey?
  private var cachedTypesetter: GlyphTypesetter?

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = false
    addSubview(label)
    label.onContentSizeChange = { [weak self] size in
      self?.setViewSize(size)
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    label.frame = bounds
  }

  func applyProps() {
    let spec = NumericTextSpec(
      text: value,
      alignment: NumericTextAlignment(propValue: alignment),
      direction: TransitionDirection(rawValue: direction ?? "") ?? .auto,
      decimalSeparator: decimalSeparator?.first ?? ".",
      blurEnabled: blur ?? true,
      shape: TransitionShape(
        blurIntensity: CGFloat(min(max(blurIntensity ?? 1, 0), 8)),
        maxBlurRadius: maxBlurRadius.map { CGFloat(max($0, 0)) } ?? .greatestFiniteMagnitude,
        enterScale: CGFloat(min(max(enterScale ?? 0.4, 0), 2)),
        travelRatio: CGFloat(min(max(travel ?? 1.0 / 3.0, 0), 3))
      ),
      clipEnabled: clip ?? true,
      animationsEnabled: animated ?? true,
      duration: duration ?? TransitionSprings.referenceDuration,
      bounce: bounce ?? TransitionSprings.defaultBounce
    )

    label.update(spec: spec, typesetter: typesetter, color: color ?? .label)
  }

  private var typesetter: GlyphTypesetter {
    let key = TypographyKey(
      family: fontFamily,
      size: fontSize ?? Defaults.fontSize,
      weight: fontWeight,
      style: fontStyle,
      monospacedDigits: monospacedDigits ?? false,
      letterSpacing: letterSpacing ?? 0
    )

    if key == cachedTypographyKey, let cachedTypesetter {
      return cachedTypesetter
    }

    let font = FontResolver.resolve(
      family: key.family,
      size: CGFloat(key.size),
      weight: FontResolver.weight(from: key.weight),
      italic: key.style == "italic",
      monospacedDigits: key.monospacedDigits
    )
    let typesetter = GlyphTypesetter(font: font, letterSpacing: CGFloat(key.letterSpacing))

    cachedTypographyKey = key
    cachedTypesetter = typesetter
    return typesetter
  }

  private struct TypographyKey: Equatable {
    let family: String?
    let size: Double
    let weight: String?
    let style: String?
    let monospacedDigits: Bool
    let letterSpacing: Double
  }

  private enum Defaults {
    static let fontSize: Double = 17
  }
}
