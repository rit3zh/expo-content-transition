package expo.modules.contenttransition.views

import androidx.compose.foundation.layout.Spacer
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.key
import androidx.compose.runtime.remember
import androidx.compose.runtime.snapshotFlow
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.takeOrElse
import androidx.compose.ui.layout.IntrinsicMeasurable
import androidx.compose.ui.layout.IntrinsicMeasureScope
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.layout.Measurable
import androidx.compose.ui.layout.MeasurePolicy
import androidx.compose.ui.layout.MeasureResult
import androidx.compose.ui.layout.MeasureScope
import androidx.compose.ui.layout.ParentDataModifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Density
import expo.modules.contenttransition.animation.TransitionSprings
import expo.modules.contenttransition.enums.NumericTextAlignment
import expo.modules.contenttransition.enums.TransitionDirection
import expo.modules.contenttransition.glyphs.GlyphState
import expo.modules.contenttransition.glyphs.GlyphTransitionEngine
import expo.modules.contenttransition.glyphs.GlyphTypesetter
import expo.modules.contenttransition.records.NumericTextSpec
import expo.modules.contenttransition.records.TransitionShape
import kotlinx.coroutines.flow.collectLatest
import kotlin.math.ceil

private const val MAX_FRAME_SECONDS = 1f / 15f

@Composable
internal fun NumericText(
  text: String,
  modifier: Modifier = Modifier,
  style: TextStyle = TextStyle.Default,
  color: Color = Color.Unspecified,
  alignment: NumericTextAlignment = NumericTextAlignment.Start,
  direction: TransitionDirection = TransitionDirection.Automatic,
  decimalSeparator: Char = '.',
  blurEnabled: Boolean = true,
  shape: TransitionShape = TransitionShape(),
  clipEnabled: Boolean = true,
  animationsEnabled: Boolean = true,
  duration: Float = TransitionSprings.REFERENCE_DURATION,
  bounce: Float = TransitionSprings.DEFAULT_BOUNCE
) {
  val density = LocalDensity.current
  val layoutDirection = LocalLayoutDirection.current
  val measurer = rememberTextMeasurer()

  val typesetter = remember(measurer, style, density, layoutDirection) {
    GlyphTypesetter(measurer, style, density, layoutDirection)
  }

  val engine = remember { GlyphTransitionEngine() }
  val spec = NumericTextSpec(
    text = text,
    alignment = alignment,
    direction = direction,
    decimalSeparator = decimalSeparator,
    blurEnabled = blurEnabled,
    shape = shape,
    clipEnabled = clipEnabled,
    animationsEnabled = animationsEnabled,
    duration = duration,
    bounce = bounce
  )

  remember(spec, typesetter) {
    engine.apply(spec, typesetter, density.density)
  }

  LaunchedEffect(engine) {
    snapshotFlow { engine.wakeSignal }.collectLatest {
      var previousFrame = 0L
      while (engine.isRunning) {
        withFrameNanos { now ->
          val deltaTime = if (previousFrame == 0L) {
            0f
          } else {
            (now - previousFrame) / 1_000_000_000f
          }

          previousFrame = now
          if (deltaTime > 0f) {
            engine.tick(deltaTime.coerceAtMost(MAX_FRAME_SECONDS))
          }
        }
      }
    }
  }

  val resolvedColor = color.takeOrElse { style.color.takeOrElse { Color.Black } }
  val measurePolicy = remember(engine) { NumericTextMeasurePolicy(engine) }

  Layout(
    modifier = modifier,
    measurePolicy = measurePolicy,
    content = {
      for (glyph in engine.glyphs) {
        key(glyph.id) {
          Glyph(
            state = glyph,
            engine = engine,
            color = resolvedColor,
            blurEnabled = spec.blurActive,
            clipEnabled = clipEnabled
          )
        }
      }
    }
  )
}

@Composable
private fun Glyph(
  state: GlyphState,
  engine: GlyphTransitionEngine,
  color: Color,
  blurEnabled: Boolean,
  clipEnabled: Boolean
) {
  Spacer(
    modifier = Modifier
      .then(GlyphParentData(state))
      .then(
        if (clipEnabled) {
          Modifier.maskedGlyph(state, engine, color, blurEnabled)
        } else {
          Modifier.freeGlyph(state, engine, color, blurEnabled)
        }
      )
  )
}

// The roll and scale are drawn inside the layer so the feather mask stays pinned to the line box,
// letting one offscreen pass carry the mask, the blur and the fade together.
private fun Modifier.maskedGlyph(
  state: GlyphState,
  engine: GlyphTransitionEngine,
  color: Color,
  blurEnabled: Boolean
): Modifier = graphicsLayer {
  translationX = engine.anchorX + state.x.value - state.padX
  translationY = engine.anchorY - state.padY
  alpha = state.presence
  compositingStrategy = if (state.isDisplaced) {
    CompositingStrategy.Offscreen
  } else {
    CompositingStrategy.Auto
  }
  renderEffect = state.blurEffect(blurEnabled, state.scale.value)
}.drawBehind {
  val layout = state.layout ?: return@drawBehind
  if (!state.isDisplaced) {
    drawText(layout, color = color, topLeft = Offset(state.drawX, state.drawY))
    return@drawBehind
  }

  val currentScale = state.scale.value
  withTransform({
    translate(top = state.offset.value * state.travel)
    scale(currentScale, currentScale, pivot = center)
  }) {
    drawText(layout, color = color, topLeft = Offset(state.drawX, state.drawY))
  }
  state.featherMask?.let { drawRect(brush = it, blendMode = BlendMode.DstIn) }
}

private fun Modifier.freeGlyph(
  state: GlyphState,
  engine: GlyphTransitionEngine,
  color: Color,
  blurEnabled: Boolean
): Modifier = graphicsLayer {
  val currentScale = state.scale.value
  translationX = engine.anchorX + state.x.value - state.padX
  translationY = engine.anchorY - state.padY + state.offset.value * state.travel
  scaleX = currentScale
  scaleY = currentScale
  alpha = state.presence
  renderEffect = state.blurEffect(blurEnabled)
}.drawBehind {
  val layout = state.layout ?: return@drawBehind
  drawText(layout, color = color, topLeft = Offset(state.drawX, state.drawY))
}

private class NumericTextMeasurePolicy(private val engine: GlyphTransitionEngine) : MeasurePolicy {
  override fun MeasureScope.measure(
    measurables: List<Measurable>,
    constraints: Constraints
  ): MeasureResult {
    engine.layoutRevision

    val layoutWidth = engine.resolveWidth(constraints.minWidth, constraints.maxWidth)
    val layoutHeight = engine.resolveHeight(constraints.minHeight, constraints.maxHeight)

    engine.anchorX = engine.anchorFor(layoutWidth)
    engine.anchorY = (layoutHeight - engine.contentHeight) / 2f

    val placeables = measurables.map { measurable ->
      val glyph = measurable.parentData as? GlyphState
      if (glyph == null) {
        measurable.measure(Constraints())
      } else {
        measurable.measure(Constraints.fixed(glyph.viewportWidth, glyph.viewportHeight))
      }
    }

    return layout(layoutWidth, layoutHeight) {
      placeables.forEach { it.place(0, 0) }
    }
  }

  override fun IntrinsicMeasureScope.minIntrinsicWidth(
    measurables: List<IntrinsicMeasurable>,
    height: Int
  ): Int = ceil(engine.contentWidth).toInt().coerceAtLeast(0)

  override fun IntrinsicMeasureScope.maxIntrinsicWidth(
    measurables: List<IntrinsicMeasurable>,
    height: Int
  ): Int = ceil(engine.contentWidth).toInt().coerceAtLeast(0)

  override fun IntrinsicMeasureScope.minIntrinsicHeight(
    measurables: List<IntrinsicMeasurable>,
    width: Int
  ): Int = ceil(engine.contentHeight).toInt().coerceAtLeast(0)

  override fun IntrinsicMeasureScope.maxIntrinsicHeight(
    measurables: List<IntrinsicMeasurable>,
    width: Int
  ): Int = ceil(engine.contentHeight).toInt().coerceAtLeast(0)
}

private class GlyphParentData(private val state: GlyphState) : ParentDataModifier {
  override fun Density.modifyParentData(parentData: Any?): Any = state

  override fun equals(other: Any?): Boolean =
    other is GlyphParentData && other.state === state

  override fun hashCode(): Int = System.identityHashCode(state)
}
