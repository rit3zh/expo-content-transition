package expo.modules.contenttransition.glyphs

import android.os.Build
import androidx.compose.ui.graphics.BlurEffect
import androidx.compose.ui.graphics.RenderEffect
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.text.TextLayoutResult
import expo.modules.contenttransition.animation.SpringValue
import expo.modules.contenttransition.animation.TransitionSprings
import expo.modules.contenttransition.records.GlyphPlacement
import expo.modules.contenttransition.records.GlyphSlot
import expo.modules.contenttransition.records.TransitionShape
import expo.modules.contenttransition.records.TypesetLine
import kotlin.math.ceil
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.roundToInt

internal class GlyphState(
  val id: Long,
  val unit: String,
  springs: TransitionSprings
) {
  var slot: GlyphSlot? = null
  var invalid: Boolean = false
  var disappearing: Boolean = false
  var delay: Float = 0f
  val x = SpringValue(springs.position, 0f, epsilon = 0.05f)
  val offset = SpringValue(springs.offset, 0f, epsilon = 0.002f)
  val scale = SpringValue(springs.glyphScale, 1f, epsilon = 0.002f)
  val alpha = SpringValue(springs.opacity, 1f, epsilon = 0.002f)
  val blur = SpringValue(springs.blur, 0f, epsilon = 0.05f)

  var layout: TextLayoutResult? = null
    private set

  var viewportWidth: Int = 1
    private set
  var viewportHeight: Int = 1
    private set

  var drawX: Float = 0f
    private set
  var drawY: Float = 0f
    private set

  var bleed: Float = 0f
    private set

  var lineHeight: Float = 0f
    private set
  var travel: Float = 0f
    private set

  private var enterScale: Float = TransitionShape.DEFAULT_ENTER_SCALE
  private var appearBlur: Float = 0f
  private var disappearBlur: Float = 0f

  private var cachedBlurRadius: Int = -1
  private var cachedBlurEffect: RenderEffect? = null

  fun adoptSprings(springs: TransitionSprings) {
    x.spring = springs.position
    offset.spring = springs.offset
    scale.spring = springs.glyphScale
    alpha.spring = springs.opacity
    blur.spring = springs.blur
  }

  fun updateMetrics(
    placement: GlyphPlacement,
    line: TypesetLine,
    density: Float,
    transition: TransitionShape
  ) {
    layout = placement.layout
    lineHeight = line.height
    travel = line.height * transition.travelRatio
    enterScale = transition.enterScale

    val heightDp = max(line.height / density, 2f)
    val ceiling = transition.maxBlurRadius * density
    appearBlur = (ln(heightDp) / LOG_3 * density * transition.blurIntensity).coerceAtMost(ceiling)
    disappearBlur = (ln(heightDp) * density * transition.blurIntensity).coerceAtMost(ceiling)

    bleed = ceil(max(appearBlur, disappearBlur) * BLUR_BLEED_FACTOR)
      .coerceAtLeast(line.height * 0.25f)

    viewportWidth = ceil(placement.advance + bleed * 2f).toInt().coerceAtLeast(1)
    viewportHeight = ceil(line.height + bleed * 2f).toInt().coerceAtLeast(1)
    drawX = bleed
    drawY = bleed + (line.baseline - placement.layout.firstBaseline)
  }

  fun beginAppear(countsDown: Boolean, blurEnabled: Boolean) {
    val from = if (countsDown) -1f else 1f
    offset.reset(from, 0f)
    scale.reset(enterScale, 1f)
    alpha.reset(0f, 1f)
    blur.reset(if (blurEnabled) appearBlur else 0f, 0f)
    disappearing = false
  }

  fun returnToVisible() {
    offset.retarget(0f)
    scale.retarget(1f)
    alpha.retarget(1f)
    blur.retarget(0f)
    disappearing = false
  }

  fun beginDisappear(countsDown: Boolean, blurEnabled: Boolean) {
    val to = if (countsDown) 1f else -1f
    offset.retarget(to)
    scale.retarget(enterScale)
    alpha.retarget(0f)
    blur.retarget(if (blurEnabled) disappearBlur else 0f)
    disappearing = true
  }

  fun snapToVisible() {
    offset.snapTo(0f)
    scale.snapTo(1f)
    alpha.snapTo(1f)
    blur.snapTo(0f)
    disappearing = false
    delay = 0f
  }

  fun clearBlur() {
    blur.snapTo(0f)
  }

  val isAnimating: Boolean
    get() = delay > 0f ||
      !x.isSettled ||
      !offset.isSettled ||
      !scale.isSettled ||
      !alpha.isSettled ||
      !blur.isSettled

  val isVisible: Boolean
    get() = alpha.value >= VISIBILITY_THRESHOLD || alpha.target >= VISIBILITY_THRESHOLD

  fun tick(deltaTime: Float): Boolean {
    var running = false
    if (x.tick(deltaTime)) running = true
    if (offset.tick(deltaTime)) running = true
    if (scale.tick(deltaTime)) running = true
    if (alpha.tick(deltaTime)) running = true
    if (blur.tick(deltaTime)) running = true
    return running
  }

  fun blurEffect(enabled: Boolean): RenderEffect? {
    if (!enabled || Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return null
    }

    val radius = blur.value.roundToInt()
    if (radius <= 0) {
      return null
    }

    if (radius != cachedBlurRadius) {
      cachedBlurRadius = radius
      cachedBlurEffect = BlurEffect(radius.toFloat(), radius.toFloat(), TileMode.Decal)
    }

    return cachedBlurEffect
  }

  private companion object {
    const val BLUR_BLEED_FACTOR = 1.5f
    const val VISIBILITY_THRESHOLD = 0.01f
    val LOG_3 = ln(3f)
  }
}
