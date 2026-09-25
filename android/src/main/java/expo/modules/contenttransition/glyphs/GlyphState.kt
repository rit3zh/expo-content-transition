package expo.modules.contenttransition.glyphs

import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RenderEffect
import androidx.compose.ui.text.TextLayoutResult
import expo.modules.contenttransition.animation.Spring
import expo.modules.contenttransition.animation.SpringValue
import expo.modules.contenttransition.animation.TransitionSprings
import expo.modules.contenttransition.records.GlyphPlacement
import expo.modules.contenttransition.records.GlyphSlot
import expo.modules.contenttransition.records.TransitionShape
import expo.modules.contenttransition.records.TypesetLine
import kotlin.math.ceil

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
  val blur = SpringValue(springs.blurIn, 0f, epsilon = 0.05f)

  private val presenceState = mutableFloatStateOf(1f)
  var presence: Float
    get() = presenceState.floatValue
    set(value) {
      presenceState.floatValue = value
    }

  private val displacedState = derivedStateOf {
    offset.value != 0f || scale.value != 1f || blur.value > 0f
  }
  val isDisplaced: Boolean
    get() = displacedState.value

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

  var padX: Float = 0f
    private set
  var padY: Float = 0f
    private set

  var travel: Float = 0f
    private set

  var featherMask: Brush? = null
    private set

  private var enterScale: Float = TransitionShape.DEFAULT_ENTER_SCALE
  private var appearBlur: Float = 0f
  private var disappearBlur: Float = 0f
  private var blurIn: Spring = springs.blurIn
  private var blurOut: Spring = springs.blurOut

  fun adoptSprings(springs: TransitionSprings) {
    x.spring = springs.position
    offset.spring = springs.offset
    scale.spring = springs.glyphScale
    alpha.spring = springs.opacity
    blurIn = springs.blurIn
    blurOut = springs.blurOut
    blur.spring = if (disappearing) blurOut else blurIn
  }

  fun updateMetrics(
    placement: GlyphPlacement,
    line: TypesetLine,
    density: Float,
    transition: TransitionShape
  ) {
    layout = placement.layout
    travel = line.height * transition.travelRatio
    enterScale = transition.enterScale

    val ceiling = transition.maxBlurRadius * density
    appearBlur = (line.height * APPEAR_BLUR_RATIO * transition.blurIntensity).coerceAtMost(ceiling)
    disappearBlur = (line.height * DISAPPEAR_BLUR_RATIO * transition.blurIntensity).coerceAtMost(ceiling)

    val feather = ceil(line.height * FEATHER_RATIO)
    padX = ceil(line.height * OVERHANG_RATIO)
    padY = feather

    viewportWidth = ceil(placement.advance + padX * 2f).toInt().coerceAtLeast(1)
    viewportHeight = ceil(line.height + padY * 2f).toInt().coerceAtLeast(1)
    drawX = padX
    drawY = padY + (line.baseline - placement.layout.firstBaseline)
    featherMask = featherBrush(
      height = viewportHeight.toFloat(),
      top = padY,
      bottom = padY + line.height,
      feather = feather
    )
  }

  fun beginAppear(countsDown: Boolean, blurEnabled: Boolean) {
    val from = if (countsDown) -1f else 1f
    offset.reset(from, 0f)
    scale.reset(enterScale, 1f)
    alpha.reset(0f, 1f)
    blur.spring = blurIn
    blur.reset(if (blurEnabled) appearBlur else 0f, 0f)
    disappearing = false
  }

  fun returnToVisible() {
    offset.retarget(0f)
    scale.retarget(1f)
    alpha.retarget(1f)
    blur.spring = blurIn
    blur.retarget(0f)
    disappearing = false
  }

  fun beginDisappear(countsDown: Boolean, blurEnabled: Boolean) {
    val to = if (countsDown) 1f else -1f
    offset.retarget(to)
    scale.retarget(enterScale)
    alpha.retarget(0f)
    blur.spring = blurOut
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

  fun blurEffect(enabled: Boolean, visibleScale: Float = 1f): RenderEffect? =
    if (enabled) GlyphBlur.effect(blur.value * visibleScale) else null

  private companion object {
    const val APPEAR_BLUR_RATIO = 0.25f
    const val DISAPPEAR_BLUR_RATIO = 0.275f
    const val FEATHER_RATIO = 0.35f
    const val OVERHANG_RATIO = 0.15f
    const val FEATHER_STEPS = 6
    const val VISIBILITY_THRESHOLD = 0.01f

    fun featherBrush(height: Float, top: Float, bottom: Float, feather: Float): Brush {
      val stops = ArrayList<Pair<Float, Color>>((FEATHER_STEPS + 1) * 2)
      for (step in 0..FEATHER_STEPS) {
        val t = step / FEATHER_STEPS.toFloat()
        stops.add(((top - feather * (1f - t)) / height) to Color.Black.copy(alpha = smoothstep(t)))
      }
      for (step in 0..FEATHER_STEPS) {
        val t = step / FEATHER_STEPS.toFloat()
        stops.add(((bottom + feather * t) / height) to Color.Black.copy(alpha = smoothstep(1f - t)))
      }

      return Brush.verticalGradient(*stops.toTypedArray(), startY = 0f, endY = height)
    }

    fun smoothstep(t: Float): Float = t * t * (3f - 2f * t)
  }
}
