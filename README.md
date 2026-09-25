# expo-content-transition

Native content transitions for React Native + Expo.

### Preview

**iOS + Android**

https://github.com/user-attachments/assets/ecc58493-07f3-4ac1-8bb8-e36d237cbd5c

**Web**

https://github.com/user-attachments/assets/3682828b-e799-49a8-931a-fc7ba2092056

## Features

* Native transitions on **iOS and Android**
* DOM-based transitions on **Web**
* Per-glyph rolling, scaling, blur, and stagger
* Smart character alignment around decimal separators
* Monospaced digit support
* Configurable direction, duration, bounce, travel, scale, and blur
* Reduced-motion support on Web

## Installation

```bash
bun install expo-content-transition
```

Native platforms require a development build. Expo Go is not supported.

```bash
bunx expo prebuild
bunx expo run:ios
bunx expo run:android
```

For Web:

```bash
npx expo install react-native-web react-dom
```

## Usage

```tsx
import { NumericText } from 'expo-content-transition';

<NumericText
  value={123.45}
  fontSize={48}
  fontWeight="500"
  monospacedDigits
/>
```

## API

### `NumericText`

| Prop               | Type               | Default    |
| ------------------ | ------------------ | ---------- |
| `value`            | `string \| number` | —          |
| `color`            | `string`           | platform   |
| `fontSize`         | `number`           | —          |
| `fontWeight`       | `FontWeight`       | `"normal"` |
| `fontStyle`        | `FontStyle`        | `"normal"` |
| `fontFamily`       | `string`           | —          |
| `letterSpacing`    | `number`           | —          |
| `monospacedDigits` | `boolean`          | `false`    |
| `alignment`        | `Alignment`        | `"start"`  |
| `decimalSeparator` | `string`           | `"."`      |
| `style`            | `TextStyle`        | —          |

### Transition

| Prop            | Type        | Default  |
| --------------- | ----------- | -------- |
| `direction`     | `Direction` | `"auto"` |
| `duration`      | `number`    | `420`    |
| `bounce`        | `number`    | `0.46`   |
| `enterScale`    | `number`    | `0.4`    |
| `travel`        | `number`    | `0.333`  |
| `blur`          | `boolean`   | `true`   |
| `blurIntensity` | `number`    | `1`      |
| `maxBlurRadius` | `number`    | —        |
| `clip`          | `boolean`   | `true`   |
| `animated`      | `boolean`   | `true`   |

Blur requires Android 12 (API 31) or later. It is ignored on older Android versions.

## Requirements

* Expo SDK
* iOS
* Android
* Web
* Development build for native platforms
* `react-native-web` and `react-dom` for Web

Expo Go is not supported.

## License

MIT © 2026 [Ritesh](https://github.com/rit3zh)
