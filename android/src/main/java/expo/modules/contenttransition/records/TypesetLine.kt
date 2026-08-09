package expo.modules.contenttransition.records

import androidx.compose.ui.text.TextLayoutResult

internal class GlyphPlacement(
  val unit: String,
  val slot: GlyphSlot,
  val x: Float,
  val advance: Float,
  val layout: TextLayoutResult
)

internal class TypesetLine(
  val text: String,
  val units: List<String>,
  val placements: List<GlyphPlacement>,
  val width: Float,
  val height: Float,
  val baseline: Float
)
