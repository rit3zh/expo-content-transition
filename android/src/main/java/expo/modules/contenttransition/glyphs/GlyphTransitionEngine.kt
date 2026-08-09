package expo.modules.contenttransition.glyphs

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.setValue
import expo.modules.contenttransition.animation.TransitionSprings
import expo.modules.contenttransition.enums.NumericTextAlignment
import expo.modules.contenttransition.enums.TransitionDirection
import expo.modules.contenttransition.records.GlyphSlot
import expo.modules.contenttransition.records.NumericTextSpec
import expo.modules.contenttransition.records.TransitionShape
import expo.modules.contenttransition.records.TypesetLine
import kotlin.math.max
import kotlin.math.roundToInt

internal class GlyphTransitionEngine {
  val glyphs = mutableStateListOf<GlyphState>()

  var wakeSignal by mutableIntStateOf(0)
    private set

  var layoutRevision by mutableIntStateOf(0)
    private set

  var anchorX by mutableFloatStateOf(0f)
  var anchorY by mutableFloatStateOf(0f)

  var contentWidth: Float = 0f
    private set
  var contentHeight: Float = 0f
    private set

  var isRunning: Boolean = false
    private set

  var alignment: NumericTextAlignment = NumericTextAlignment.Start
    private set

  var blurActive: Boolean = true
    private set

  var clipEnabled: Boolean = true
    private set

  private var springs = TransitionSprings(1f)
  private var currentText: String = ""
  private var hasContent: Boolean = false
  private var countsDown: Boolean = false
  private var nextId: Long = 0L
  private var lastTypesetter: GlyphTypesetter? = null

  fun apply(spec: NumericTextSpec, typesetter: GlyphTypesetter, density: Float) {
    val typographyChanged = lastTypesetter != null && lastTypesetter !== typesetter
    lastTypesetter = typesetter

    val durationScale = (spec.duration / TransitionSprings.REFERENCE_DURATION).coerceIn(0.1f, 10f)
    if (durationScale != springs.scale || spec.bounce != springs.bounce) {
      springs = TransitionSprings(durationScale, spec.bounce)
      glyphs.forEach { it.adoptSprings(springs) }
    }

    alignment = spec.alignment
    blurActive = spec.blurActive
    clipEnabled = spec.clipEnabled

    val leftAnchored = !spec.text.any { it.isDigit() } && !currentText.any { it.isDigit() }
    val line = typesetter.typeset(spec.text, spec.decimalSeparator, leftAnchored)

    countsDown = resolveDirection(spec)

    val shape = spec.effectiveShape
    val animate = spec.animationsEnabled && hasContent && !typographyChanged
    if (animate) {
      reconcile(line, density, shape)
    } else {
      rebuild(line, density, shape)
    }

    if (!spec.blurActive) {
      glyphs.forEach { it.clearBlur() }
    }

    contentWidth = line.width
    contentHeight = line.height
    currentText = spec.text
    hasContent = true
    layoutRevision++
    wakeSignal++
    isRunning = true
  }

  fun tick(deltaTime: Float): Boolean {
    var running = false
    var index = 0
    var populationChanged = false

    while (index < glyphs.size) {
      val state = glyphs[index]
      if (state.delay > 0f) {
        state.delay -= deltaTime
        running = true
        index++
        continue
      }

      if (state.tick(deltaTime)) {
        running = true
      }

      if (state.invalid && !state.isVisible) {
        glyphs.removeAt(index)
        populationChanged = true
        continue
      }

      index++
    }

    if (populationChanged) {
      layoutRevision++
    }

    isRunning = running
    return running
  }

  fun resolveWidth(constraintMin: Int, constraintMax: Int): Int =
    contentWidth.roundToInt().coerceIn(constraintMin, max(constraintMin, constraintMax))

  fun resolveHeight(constraintMin: Int, constraintMax: Int): Int =
    contentHeight.roundToInt().coerceIn(constraintMin, max(constraintMin, constraintMax))

  fun anchorFor(layoutWidth: Int): Float = when (alignment) {
    NumericTextAlignment.Start -> 0f
    NumericTextAlignment.Center -> layoutWidth / 2f
    NumericTextAlignment.End -> layoutWidth.toFloat()
  }

  private fun rebuild(line: TypesetLine, density: Float, shape: TransitionShape) {
    glyphs.clear()
    for (placement in line.placements) {
      val state = GlyphState(nextId++, placement.unit, springs)
      state.slot = placement.slot
      state.updateMetrics(placement, line, density, shape)
      state.x.snapTo(anchoredX(placement.x, line.width))
      state.snapToVisible()
      glyphs.add(state)
    }
  }

  private fun reconcile(line: TypesetLine, density: Float, shape: TransitionShape) {
    val buckets = HashMap<MatchKey, ArrayList<GlyphState>>(glyphs.size)
    val occupiedSlots = HashMap<GlyphSlot, GlyphState>()
    for (state in glyphs) {
      val slot = state.slot ?: continue
      buckets.getOrPut(MatchKey(slot, state.unit)) { ArrayList(2) }.add(state)
      occupiedSlots.putIfAbsent(slot, state)
      state.invalid = true
    }

    val arrived = ArrayList<GlyphState>()
    val slotTargets = HashMap<GlyphSlot, Float>(line.placements.size)
    for (placement in line.placements) {
      slotTargets[placement.slot] = anchoredX(placement.x, line.width)
    }

    for (placement in line.placements) {
      val bucket = buckets[MatchKey(placement.slot, placement.unit)]
      var reused: GlyphState? = null
      if (bucket != null && bucket.isNotEmpty()) {
        var index = bucket.indexOfFirst { !it.disappearing }
        if (index < 0) {
          index = 0
        }

        reused = bucket.removeAt(index)
      }

      val targetX = anchoredX(placement.x, line.width)
      if (reused != null) {
        reused.invalid = false
        reused.updateMetrics(placement, line, density, shape)
        reused.x.retarget(targetX)
        reused.returnToVisible()
      } else {
        val state = GlyphState(nextId++, placement.unit, springs)
        state.slot = placement.slot
        state.updateMetrics(placement, line, density, shape)
        val predecessor = occupiedSlots[placement.slot]
        if (predecessor != null) {
          state.x.reset(predecessor.x.value, targetX)
        } else {
          state.x.snapTo(targetX)
        }

        state.beginAppear(countsDown, blurActive)
        glyphs.add(state)
        arrived.add(state)
      }
    }

    val leaving = glyphs.filter { it.invalid }.sortedBy { it.x.value }
    for (state in leaving) {
      val target = state.slot?.let { slotTargets[it] } ?: continue
      state.x.retarget(target)
    }

    stagger(arrived, leaving)
  }

  private fun stagger(arrived: List<GlyphState>, leaving: List<GlyphState>) {
    val step = max(arrived.size, leaving.size).let { count ->
      if (count == 0) 0f else springs.staggerWindow / count
    }

    arrived.forEachIndexed { index, state -> state.delay = index * step }
    leaving.forEachIndexed { index, state ->
      if (!state.isAnimating) {
        state.delay = index * step
      }

      state.beginDisappear(countsDown, blurActive)
    }
  }

  private fun resolveDirection(spec: NumericTextSpec): Boolean = when (spec.direction) {
    TransitionDirection.Up -> false
    TransitionDirection.Down -> true
    TransitionDirection.Automatic -> {
      val previous = GlyphSlots.numericValue(currentText, spec.decimalSeparator)
      val next = GlyphSlots.numericValue(spec.text, spec.decimalSeparator)
      if (previous != null && next != null && next != previous) next < previous else countsDown
    }
  }

  private fun anchoredX(x: Float, lineWidth: Float): Float = when (alignment) {
    NumericTextAlignment.Start -> x
    NumericTextAlignment.Center -> x - lineWidth / 2f
    NumericTextAlignment.End -> x - lineWidth
  }

  private data class MatchKey(val slot: GlyphSlot, val unit: String)
}
