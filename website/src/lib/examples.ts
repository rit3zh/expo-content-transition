// The React Native code behind every live example. The preview beside it is
// the same component running on this page through the package's web engine
// (components/examples/demos.tsx), so keep the two in step when editing.

export interface ExampleEntry {
	title: string;
	description: string;
	code: string;
}

export const EXAMPLES = {
	counter: {
		title: "Counter",
		description: "A number you step up and down. Only the digits that change move.",
		code: `import { NumericText } from 'expo-content-transition';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function Counter() {
  const [count, setCount] = useState(128);

  return (
    <View style={styles.row}>
      <Pressable style={styles.button} onPress={() => setCount((n) => n - 1)}>
        <Text style={styles.icon}>−</Text>
      </Pressable>
      <NumericText value={count} fontSize={64} fontWeight="600" monospacedDigits />
      <Pressable style={styles.button} onPress={() => setCount((n) => n + 1)}>
        <Text style={styles.icon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  button: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  icon: { fontSize: 22 },
});`,
	},
	currency: {
		title: "Wallet balance",
		description: "Formatted money that converts between currencies. Symbols and separators animate like any other glyph.",
		code: `import { NumericText } from 'expo-content-transition';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

const CURRENCIES = [
  { code: 'USD', locale: 'en-US', rate: 1 },
  { code: 'EUR', locale: 'de-DE', rate: 0.92 },
  { code: 'GBP', locale: 'en-GB', rate: 0.79 },
  { code: 'JPY', locale: 'ja-JP', rate: 149 },
];

const format = (usd: number, { code, locale, rate }: (typeof CURRENCIES)[number]) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(usd * rate);

export function Balance() {
  const [balance, setBalance] = useState(2480.5);
  const [index, setIndex] = useState(0);
  const currency = CURRENCIES[index];

  return (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <Pressable onPress={() => setIndex((i) => (i + 1) % CURRENCIES.length)}>
        <NumericText value={currency.code} fontSize={12} color="#6E6E73" direction="up" />
      </Pressable>
      <NumericText
        value={format(balance, currency)}
        decimalSeparator={currency.locale === 'de-DE' ? ',' : '.'}
        fontSize={56}
        fontWeight="700"
        monospacedDigits
      />
      {/* Deposit and withdraw buttons call setBalance */}
    </View>
  );
}`,
	},
	countdown: {
		title: "Countdown",
		description: "A timer that should only ever tick one way, so the direction is forced.",
		code: `import { NumericText } from 'expo-content-transition';
import { useEffect, useState } from 'react';

const START = 90;

export function Countdown() {
  const [seconds, setSeconds] = useState(START);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : START)), 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const label = \`\${minutes}:\${String(seconds % 60).padStart(2, '0')}\`;

  return (
    <NumericText
      value={label}
      direction="down"
      fontSize={80}
      fontWeight="700"
      monospacedDigits
    />
  );
}`,
	},
	clock: {
		title: "Clock",
		description: "Wall-clock time, one tick a second. Midnight would read as a smaller number, so it always rolls up.",
		code: `import { NumericText } from 'expo-content-transition';
import { useEffect, useState } from 'react';

const now = () =>
  new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function Clock() {
  const [time, setTime] = useState(now);

  useEffect(() => {
    const timer = setInterval(() => setTime(now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return <NumericText value={time} direction="up" fontSize={56} fontWeight="500" monospacedDigits />;
}`,
	},
	stock: {
		title: "Stock ticker",
		description: "A live price with its daily change. The colour follows the direction the number moved.",
		code: `import { NumericText } from 'expo-content-transition';
import { View } from 'react-native';

export function Ticker({ price, open }: { price: number; open: number }) {
  const change = ((price - open) / open) * 100;
  const tint = change >= 0 ? '#30A46C' : '#E5484D';

  return (
    <View style={{ alignItems: 'flex-end' }}>
      <NumericText value={price.toFixed(2)} fontSize={48} fontWeight="600" monospacedDigits />
      <NumericText
        value={\`\${change >= 0 ? '+' : ''}\${change.toFixed(2)}%\`}
        color={tint}
        fontSize={17}
        fontWeight="500"
        monospacedDigits
      />
    </View>
  );
}`,
	},
	status: {
		title: "Status label",
		description: "Words work too. Without digits, glyphs line up from the start and swap in place.",
		code: `import { NumericText } from 'expo-content-transition';

const LABELS = { uploading: 'Uploading', processing: 'Processing', published: 'Published' };

export function Status({ state }: { state: keyof typeof LABELS }) {
  return (
    <NumericText
      value={LABELS[state]}
      direction="up"
      fontSize={28}
      fontWeight="600"
      bounce={0.2}
    />
  );
}`,
	},
	likes: {
		title: "Like count",
		description: "Compact notation from Intl. When 999 becomes 1K, the whole number changes shape and every glyph rolls.",
		code: `import { NumericText } from 'expo-content-transition';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Heart } from './icons';

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function LikeButton() {
  const [count, setCount] = useState(996);
  const [liked, setLiked] = useState(false);

  const toggle = () => {
    setLiked((value) => !value);
    setCount((value) => value + (liked ? -1 : 1));
  };

  return (
    <Pressable onPress={toggle} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Heart filled={liked} />
      <NumericText value={compact.format(count)} fontSize={20} fontWeight="600" monospacedDigits />
    </Pressable>
  );
}`,
	},
	progress: {
		title: "Download progress",
		description: "A percentage that climbs quickly. A shorter duration keeps up with frequent updates.",
		code: `import { NumericText } from 'expo-content-transition';
import { View } from 'react-native';

export function Progress({ percent }: { percent: number }) {
  return (
    <View style={{ gap: 12 }}>
      <NumericText
        value={\`\${Math.round(percent)}%\`}
        duration={260}
        fontSize={44}
        fontWeight="600"
        monospacedDigits
      />
      <View style={{ height: 6, borderRadius: 3, backgroundColor: '#E5E5EA' }}>
        <View style={{ width: \`\${percent}%\`, height: 6, borderRadius: 3, backgroundColor: '#111' }} />
      </View>
    </View>
  );
}`,
	},
	input: {
		title: "Type anything",
		description: "Every keystroke is a new value. Try a number, then change one digit.",
		code: `import { NumericText } from 'expo-content-transition';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

export function Echo() {
  const [text, setText] = useState('1,024.00');

  return (
    <View style={{ gap: 24, alignItems: 'center' }}>
      <NumericText value={text} fontSize={56} fontWeight="600" monospacedDigits />
      <TextInput value={text} onChangeText={setText} placeholder="Type here" />
    </View>
  );
}`,
	},
} satisfies Record<string, ExampleEntry>;

export type ExampleId = keyof typeof EXAMPLES;
