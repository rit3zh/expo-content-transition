https://github.com/user-attachments/assets/ecc58493-07f3-4ac1-8bb8-e36d237cbd5c
Uploading content-transition-demo.mp4…



# expo-content-transition

Native content transitions for React Native + Expo.

## Features

- One component — `NumericText` — that rolls, scales, blurs, and staggers its glyphs, natively
- Digits align around the decimal separator, so `123.45 → 123.46` only animates the final character
- Non-numeric content aligns from the left, so shared prefixes stay put
- Every dial you'd want: roll distance, entry scale, bounce, per-glyph blur, stagger, direction
- `monospacedDigits` keeps digit columns from shifting as neighbours change
- Value changes cross the bridge; measuring, diffing, and animating all happen natively

## Installation

```bash
bun install expo-content-transition
```

This module includes native iOS and Android code, so you need to prebuild and run on a device or simulator — Expo Go is not supported.

```bash
bunx expo prebuild
bunx expo run:ios
bunx expo run:android
```

> If you've already prebuilt your project, just re-run `expo run:ios` / `expo run:android` after installing.

## Usage

```tsx
import { NumericText } from 'expo-content-transition';
```

## Quick Start

```tsx
import { NumericText } from 'expo-content-transition';
import { Pressable, Text, View } from 'react-native';

export default function Counter() {
  const [value, setValue] = React.useState(0);

  return (
    <View>
      <NumericText value={value} color="#fff" fontSize={72} monospacedDigits />
      <Pressable onPress={() => setValue((v) => v + 1)}>
        <Text>Increment</Text>
      </Pressable>
    </View>
  );
}
```

## API

### `<NumericText>`

| Prop                | Type             | Default    | Description                                                                                     |
| ------------------- | ---------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `value`             | `string \| number` | —        | The text to display. Only this crosses the bridge when it changes — the rest happens natively  |
| `color`             | `string`         | platform   | Any React Native colour; defaults to the platform's primary label colour                        |
| `fontSize`          | `number`         | —          | Font size in scale-independent pixels                                                           |
| `fontWeight`        | `FontWeight`     | `"normal"` | `normal`, `bold`, or `100`–`900`                                                                |
| `fontStyle`         | `FontStyle`      | `"normal"` | `normal` or `italic`                                                                            |
| `fontFamily`        | `string`         | —          | Resolved like a `<Text>` — `expo-font` families, bundled fonts, or platform built-ins           |
| `letterSpacing`     | `number`         | —          | Extra spacing between characters, in points                                                     |
| `monospacedDigits`  | `boolean`        | `false`    | Uniform-width digits, so unchanged columns never shift                                          |
| `alignment`         | `Alignment`      | `"start"`  | `start`, `center`, or `end`; also settable via `style.textAlign`                                |
| `decimalSeparator`  | `string`         | `"."`      | The character separating whole and fractional parts; characters align around it                 |
| `style`             | `TextStyle`      | —          | Text props apply to the glyphs; everything else styles the view                                 |

#### Transition props

| Prop              | Type             | Default   | Description                                                                         |
| ----------------- | ---------------- | --------- | ----------------------------------------------------------------------------------- |
| `direction`       | `Direction`      | `"auto"`  | `auto` rolls up as the value grows and down as it shrinks; force `up`/`down` otherwise |
| `duration`        | `number`         | `420`     | Nominal transition duration in milliseconds; scales every internal spring           |
| `bounce`          | `number`         | `0.46`    | Roll overshoot, `0`–`0.95`; only the roll bounces                                    |
| `enterScale`      | `number`         | `0.4`     | Entry size of an arriving glyph; `1` leaves a pure roll                              |
| `travel`          | `number`         | `0.333`   | Roll distance as a fraction of the line height; `0` removes vertical movement        |
| `blur`            | `boolean`        | `true`    | Blurs each glyph in proportion to how far through its transition it is              |
| `blurIntensity`   | `number`         | `1`       | Scales the blur, `0`–`8`; `0` is equivalent to `blur={false}`                        |
| `maxBlurRadius`   | `number`         | unbounded | Ceiling on the blur radius, in dp — lets intensity be pushed without turning to soup |
| `clip`            | `boolean`        | `true`    | Clips each glyph to its own line box so rolling glyphs don't overlap neighbours      |
| `animated`        | `boolean`        | `true`    | Set to `false` to apply values instantly; the first value never animates either way  |

`blur` requires Android 12 (API 31); it's silently ignored on lower Android versions and works everywhere on iOS.

## Full Example

A stopwatch that updates ten times a second — transitions blend instead of queueing up behind one another:

```tsx
import { NumericText } from 'expo-content-transition';
import { Pressable, Text, View } from 'react-native';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Stopwatch() {
  const [running, setRunning] = React.useState(false);
  const [ticks, setTicks] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTicks((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [running]);

  const formatted = `${pad(Math.floor(ticks / 600))}:${pad(Math.floor(ticks / 10) % 60)}.${ticks % 10}`;

  return (
    <View>
      <NumericText value={formatted} color="#f2f4f8" fontSize={48} fontWeight="500" monospacedDigits />
      <Pressable onPress={() => setRunning((r) => !r)}>
        <Text>{running ? 'Stop' : 'Start'}</Text>
      </Pressable>
    </View>
  );
}
```

## Requirements

- Expo SDK with a [development build](https://docs.expo.dev/develop/development-builds/introduction/) or bare workflow (Expo Go is **not** supported)
- iOS and Android — fully native on both
- Web falls back to a plain `<Text>`, without transitions

## License

MIT © 2026 [Ritesh](https://github.com/rit3zh)
