package expo.modules.contenttransition.views

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp
import com.facebook.react.common.assets.ReactFontManager
import expo.modules.contenttransition.animation.TransitionSprings
import expo.modules.contenttransition.enums.NumericTextAlignmentProp
import expo.modules.contenttransition.enums.NumericTextDirectionProp
import expo.modules.contenttransition.records.TransitionShape
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.AutoSizingComposable
import expo.modules.kotlin.views.ComposableScope
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import expo.modules.kotlin.views.OptimizedComposeProps
import expo.modules.ui.TextFontStyle
import expo.modules.ui.TextFontWeight
import expo.modules.ui.composeOrNull
import expo.modules.ui.resolveFontFamily

@OptimizedComposeProps
data class NumericTextProps(
  val value: MutableState<String?> = mutableStateOf(null),
  val color: MutableState<Color?> = mutableStateOf(null),
  val fontSize: MutableState<Float?> = mutableStateOf(null),
  val fontWeight: MutableState<TextFontWeight?> = mutableStateOf(null),
  val fontStyle: MutableState<TextFontStyle?> = mutableStateOf(null),
  val fontFamily: MutableState<String?> = mutableStateOf(null),
  val letterSpacing: MutableState<Float?> = mutableStateOf(null),
  val monospacedDigits: MutableState<Boolean?> = mutableStateOf(null),
  val alignment: MutableState<NumericTextAlignmentProp?> = mutableStateOf(null),
  val direction: MutableState<NumericTextDirectionProp?> = mutableStateOf(null),
  val decimalSeparator: MutableState<String?> = mutableStateOf(null),
  val duration: MutableState<Float?> = mutableStateOf(null),
  val bounce: MutableState<Float?> = mutableStateOf(null),
  val blur: MutableState<Boolean?> = mutableStateOf(null),
  val blurIntensity: MutableState<Float?> = mutableStateOf(null),
  val maxBlurRadius: MutableState<Float?> = mutableStateOf(null),
  val enterScale: MutableState<Float?> = mutableStateOf(null),
  val travel: MutableState<Float?> = mutableStateOf(null),
  val clip: MutableState<Boolean?> = mutableStateOf(null),
  val animated: MutableState<Boolean?> = mutableStateOf(null)
) : ComposeProps

@SuppressLint("ViewConstructor")
class NumericTextView(context: Context, appContext: AppContext) :
  ExpoComposeView<NumericTextProps>(context, appContext, withHostingView = true) {
  override val props = NumericTextProps()

  @Composable
  override fun ComposableScope.Content() {
    AutoSizingComposable(shadowNodeProxy) {
      NumericTextContent(props)
    }
  }
}

@Composable
private fun NumericTextContent(props: NumericTextProps) {
  val context = LocalContext.current

  val fontFamilyName = props.fontFamily.value
  val fontKey = fontFamilyName?.let { name ->
    ReactFontManager.getInstance().getTypeface(name, Typeface.NORMAL, context.assets)
  }

  val fontFamily = remember(fontFamilyName, fontKey) {
    resolveFontFamily(fontFamilyName, context)
  }

  val style = TextStyle(
    fontSize = props.fontSize.value?.sp ?: TextUnit.Unspecified,
    fontWeight = props.fontWeight.value?.toComposeFontWeight(),
    fontStyle = props.fontStyle.value?.toComposeFontStyle(),
    fontFamily = fontFamily,
    letterSpacing = props.letterSpacing.value?.sp ?: TextUnit.Unspecified,
    fontFeatureSettings = if (props.monospacedDigits.value == true) TABULAR_FIGURES else null
  )

  NumericText(
    text = props.value.value ?: "",
    style = style,
    color = props.color.value.composeOrNull ?: LocalContentColor.current,
    alignment = (props.alignment.value ?: NumericTextAlignmentProp.START).toAlignment(),
    direction = (props.direction.value ?: NumericTextDirectionProp.AUTO).toDirection(),
    decimalSeparator = props.decimalSeparator.value?.firstOrNull() ?: '.',
    blurEnabled = props.blur.value ?: true,
    shape = TransitionShape(
      blurIntensity = (props.blurIntensity.value ?: TransitionShape.DEFAULT_BLUR_INTENSITY)
        .coerceIn(0f, MAX_BLUR_INTENSITY),
      maxBlurRadius = props.maxBlurRadius.value?.coerceAtLeast(0f) ?: Float.MAX_VALUE,
      enterScale = (props.enterScale.value ?: TransitionShape.DEFAULT_ENTER_SCALE)
        .coerceIn(0f, MAX_ENTER_SCALE),
      travelRatio = (props.travel.value ?: TransitionShape.DEFAULT_TRAVEL_RATIO)
        .coerceIn(0f, MAX_TRAVEL_RATIO)
    ),
    clipEnabled = props.clip.value ?: true,
    animationsEnabled = props.animated.value ?: true,
    duration = props.duration.value ?: TransitionSprings.REFERENCE_DURATION,
    bounce = (props.bounce.value ?: TransitionSprings.DEFAULT_BOUNCE).coerceIn(0f, MAX_BOUNCE)
  )
}

private const val TABULAR_FIGURES = "tnum"
private const val MAX_BLUR_INTENSITY = 8f
private const val MAX_ENTER_SCALE = 2f
private const val MAX_TRAVEL_RATIO = 3f
private const val MAX_BOUNCE = 0.95f
