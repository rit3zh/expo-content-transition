import Accelerate
import UIKit

final class GlyphImageCache {
  static let shared = GlyphImageCache()

  private let cache = NSCache<NSString, CacheEntry>()
  private let pixelBudget: CGFloat = 4

  private init() {
    cache.countLimit = 512
  }

  static func quantize(_ radius: CGFloat) -> Int {
    guard radius > 0.5 else { return 0 }
    if radius < 4 {
      return Int(radius.rounded())
    }

    if radius < 12 {
      return Int((radius / 2).rounded()) * 2
    }

    return Int((radius / 4).rounded()) * 4
  }

  func image(
    unit: String,
    attributes: [NSAttributedString.Key: Any],
    color: UIColor,
    size: CGSize,
    blurRadius: Int,
    deviceScale: CGFloat
  ) -> GlyphImage? {
    guard size.width > 0, size.height > 0 else { return nil }

    let renderScale = renderScale(for: blurRadius, deviceScale: deviceScale)
    let font = attributes[.font] as? UIFont
    let key = [
      unit,
      font?.fontName ?? "-",
      String(format: "%.2f", font?.pointSize ?? 0),
      String(format: "%.2f", (attributes[.kern] as? CGFloat) ?? 0),
      color.resolvedKey,
      String(format: "%.1fx%.1f", size.width, size.height),
      String(blurRadius),
      String(format: "%.2f", renderScale)
    ].joined(separator: "|") as NSString

    if let cached = cache.object(forKey: key) {
      return cached.value
    }

    guard let rendered = render(
      unit: unit,
      attributes: attributes,
      color: color,
      size: size,
      blurRadius: blurRadius,
      renderScale: renderScale
    ) else {
      return nil
    }

    cache.setObject(CacheEntry(value: rendered), forKey: key)
    return rendered
  }

  private func renderScale(for blurRadius: Int, deviceScale: CGFloat) -> CGFloat {
    guard blurRadius > 0 else { return deviceScale }
    return min(max(pixelBudget / CGFloat(blurRadius), 0.12), deviceScale)
  }

  private func render(
    unit: String,
    attributes: [NSAttributedString.Key: Any],
    color: UIColor,
    size: CGSize,
    blurRadius: Int,
    renderScale: CGFloat
  ) -> GlyphImage? {
    var drawAttributes = attributes
    drawAttributes[.foregroundColor] = color

    let string = NSAttributedString(string: unit, attributes: drawAttributes)
    let textSize = string.size()

    let format = UIGraphicsImageRendererFormat.default()
    format.scale = renderScale
    format.opaque = false

    let image = UIGraphicsImageRenderer(size: size, format: format).image { _ in
      string.draw(
        at: CGPoint(
          x: (size.width - textSize.width) / 2,
          y: (size.height - textSize.height) / 2
        )
      )
    }

    guard let sharp = image.cgImage else { return nil }
    guard blurRadius > 0 else { return GlyphImage(image: sharp, scale: renderScale) }

    let radiusInPixels = CGFloat(blurRadius) * renderScale
    let blurred = Self.blur(sharp, radiusInPixels: radiusInPixels) ?? sharp
    return GlyphImage(image: blurred, scale: renderScale)
  }

  private static func blur(_ image: CGImage, radiusInPixels: CGFloat) -> CGImage? {
    guard radiusInPixels > 0 else { return image }
    guard let format = vImage_CGImageFormat(
      bitsPerComponent: 8,
      bitsPerPixel: 32,
      colorSpace: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGBitmapInfo(
        rawValue: CGImageAlphaInfo.premultipliedFirst.rawValue
          | CGBitmapInfo.byteOrder32Little.rawValue
      )
    ) else {
      return image
    }

    var kernel = UInt32(floor(radiusInPixels * 3 * CGFloat(2 * Double.pi).squareRoot() / 4 + 0.5))
    if kernel % 2 == 0 { kernel += 1 }
    guard kernel > 1 else { return image }

    do {
      var source = try vImage_Buffer(cgImage: image, format: format)
      defer { source.free() }
      var destination = try vImage_Buffer(
        width: Int(source.width),
        height: Int(source.height),
        bitsPerPixel: 32
      )
      defer { destination.free() }

      var background: [UInt8] = [0, 0, 0, 0]
      let flags = vImage_Flags(kvImageBackgroundColorFill)

      vImageBoxConvolve_ARGB8888(
        &source, &destination, nil, 0, 0, kernel, kernel, &background, flags
      )
      vImageBoxConvolve_ARGB8888(
        &destination, &source, nil, 0, 0, kernel, kernel, &background, flags
      )
      vImageBoxConvolve_ARGB8888(
        &source, &destination, nil, 0, 0, kernel, kernel, &background, flags
      )

      return try destination.createCGImage(format: format)
    } catch {
      return image
    }
  }

  private final class CacheEntry {
    let value: GlyphImage
    init(value: GlyphImage) { self.value = value }
  }
}

private extension UIColor {
  var resolvedKey: String {
    var red: CGFloat = 0
    var green: CGFloat = 0
    var blue: CGFloat = 0
    var alpha: CGFloat = 0
    guard getRed(&red, green: &green, blue: &blue, alpha: &alpha) else {
      return description
    }

    return String(format: "%.3f,%.3f,%.3f,%.3f", red, green, blue, alpha)
  }
}
