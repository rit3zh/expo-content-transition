import QuartzCore
import UIKit

@MainActor
final class NumericTextLabel: UIView {
  var onContentSizeChange: ((CGSize) -> Void)?

  private let engine = GlyphTransitionEngine()
  private var glyphLayers: [Int64: GlyphLayerPair] = [:]
  private var displayLink: CADisplayLink?
  private var lastTimestamp: CFTimeInterval = 0
  private var reportedSize: CGSize = .zero
  private var settled = true

  private var spec = NumericTextSpec()
  private var typesetter = GlyphTypesetter(font: .systemFont(ofSize: 17), letterSpacing: 0)
  private var textColor: UIColor = .label

  private let maxFrameSeconds: CGFloat = 1.0 / 15.0

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
    isUserInteractionEnabled = false
    clipsToBounds = false
    layer.masksToBounds = false
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  deinit {
    displayLink?.invalidate()
  }

  func update(
    spec newSpec: NumericTextSpec,
    typesetter newTypesetter: GlyphTypesetter,
    color: UIColor
  ) {
    let colorChanged = !textColor.isEqual(color)
    guard newSpec != spec || newTypesetter != typesetter || colorChanged else { return }

    textColor = color
    typesetter = newTypesetter
    spec = newSpec

    settled = false
    engine.apply(spec: newSpec, typesetter: newTypesetter)
    if colorChanged {
      glyphLayers.values.forEach { $0.invalidateContents() }
    }

    syncLayers()
    render()
    reportContentSize()
    start()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    render()
  }

  override var intrinsicContentSize: CGSize {
    engine.contentSize
  }

  override func sizeThatFits(_ size: CGSize) -> CGSize {
    engine.contentSize
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil {
      stop()
    } else if !settled {
      start()
    }
  }

  private func syncLayers() {
    var live = Set<Int64>()
    for glyph in engine.glyphs {
      live.insert(glyph.id)
      if glyphLayers[glyph.id] == nil {
        let pair = GlyphLayerPair()
        layer.addSublayer(pair.window)
        glyphLayers[glyph.id] = pair
      }
    }

    for (id, pair) in glyphLayers where !live.contains(id) {
      pair.window.removeFromSuperlayer()
      glyphLayers.removeValue(forKey: id)
    }
  }

  private func render() {
    guard !engine.glyphs.isEmpty else { return }

    let deviceScale = window?.screen.scale ?? UIScreen.main.scale
    let contentSize = engine.contentSize
    let anchorBase = engine.anchorBase(layoutWidth: bounds.width)
    let anchorY = max((bounds.height - contentSize.height) / 2, 0)
    let attributes = typesetter.attributes
    let clip = engine.clipEnabled

    CATransaction.begin()
    CATransaction.setDisableActions(true)

    for glyph in engine.glyphs {
      guard let pair = glyphLayers[glyph.id] else { continue }

      let bleed = glyph.bleed
      let windowSize = CGSize(width: glyph.advance + bleed * 2, height: glyph.lineHeight)
      let canvas = CGSize(width: windowSize.width, height: glyph.lineHeight + bleed * 2)

      if pair.windowSize != windowSize {
        pair.windowSize = windowSize
        pair.window.bounds = CGRect(origin: .zero, size: windowSize)
        pair.content.bounds = CGRect(origin: .zero, size: canvas)
        pair.content.position = CGPoint(x: windowSize.width / 2, y: windowSize.height / 2)
      }

      if pair.clipEnabled != clip {
        pair.clipEnabled = clip
        pair.window.masksToBounds = clip
      }

      pair.window.position = CGPoint(
        x: anchorBase + glyph.x.value + glyph.advance / 2,
        y: anchorY + glyph.lineHeight / 2
      )
      pair.content.opacity = Float(glyph.opacity.value)
      pair.content.transform = CATransform3DConcat(
        CATransform3DMakeScale(glyph.scale.value, glyph.scale.value, 1),
        CATransform3DMakeTranslation(0, glyph.offset.value * glyph.travel, 0)
      )

      let radius = GlyphImageCache.quantize(glyph.blur.value)
      if pair.cachedBlurRadius != radius || pair.cachedCanvas != canvas {
        pair.cachedBlurRadius = radius
        pair.cachedCanvas = canvas
        if let rendered = GlyphImageCache.shared.image(
          unit: glyph.unit,
          attributes: attributes,
          color: textColor,
          size: canvas,
          blurRadius: radius,
          deviceScale: deviceScale
        ) {
          pair.content.contentsScale = rendered.scale
          pair.content.contents = rendered.image
        }
      }
    }

    CATransaction.commit()
  }

  private func reportContentSize() {
    let contentSize = engine.contentSize
    let rounded = CGSize(
      width: contentSize.width.rounded(),
      height: contentSize.height.rounded()
    )
    guard rounded != reportedSize else { return }
    reportedSize = rounded
    invalidateIntrinsicContentSize()
    onContentSizeChange?(rounded)
  }

  private func start() {
    guard displayLink == nil else { return }
    lastTimestamp = 0
    let link = CADisplayLink(
      target: DisplayLinkProxy(label: self),
      selector: #selector(DisplayLinkProxy.step(_:))
    )
    link.add(to: .main, forMode: .common)
    displayLink = link
  }

  private func stop() {
    displayLink?.invalidate()
    displayLink = nil
  }

  fileprivate func step(timestamp: CFTimeInterval) {
    defer { lastTimestamp = timestamp }
    guard lastTimestamp != 0 else { return }

    let deltaTime = min(CGFloat(timestamp - lastTimestamp), maxFrameSeconds)
    guard deltaTime > 0 else { return }

    let running = engine.tick(deltaTime)
    syncLayers()
    render()
    reportContentSize()

    if !running {
      settled = true
      stop()
    }
  }
}

private final class GlyphLayerPair {
  let window = CALayer()
  let content = CALayer()

  var cachedBlurRadius = -1
  var cachedCanvas: CGSize = .zero
  var windowSize: CGSize = .zero
  var clipEnabled: Bool?

  init() {
    window.actions = ["position": NSNull(), "bounds": NSNull(), "masksToBounds": NSNull()]
    content.actions = [
      "position": NSNull(),
      "bounds": NSNull(),
      "transform": NSNull(),
      "opacity": NSNull(),
      "contents": NSNull(),
      "contentsScale": NSNull()
    ]
    window.addSublayer(content)
  }

  func invalidateContents() {
    cachedBlurRadius = -1
  }
}

private final class DisplayLinkProxy {
  weak var label: NumericTextLabel?

  init(label: NumericTextLabel) {
    self.label = label
  }

  @objc func step(_ link: CADisplayLink) {
    MainActor.assumeIsolated {
      label?.step(timestamp: link.timestamp)
    }
  }
}
