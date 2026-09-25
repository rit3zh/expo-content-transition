import { Feather } from '@expo/vector-icons';
import { NumericText } from 'expo-content-transition';
import { useFonts } from 'expo-font';
import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const FONT = {
  medium: 'SFRounded-Medium',
  bold: 'SFRounded-Bold',
};

const WORDS = ['Simple', 'Calm', 'Fluid'];

const CURRENCIES = [
  { code: 'USD', locale: 'en-US', rate: 1 },
  { code: 'EUR', locale: 'de-DE', rate: 0.92 },
  { code: 'GBP', locale: 'en-GB', rate: 0.79 },
  { code: 'JPY', locale: 'ja-JP', rate: 149 },
];

const formatMoney = (usd: number, c: (typeof CURRENCIES)[number]) =>
  new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.code }).format(usd * c.rate);

function IconButton({
  name,
  onPress,
}: {
  name: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => [
        styles.icon,
        hovered && styles.iconHover,
        pressed && { transform: [{ scale: 0.94 }] },
      ]}>
      <Feather name={name} size={18} color="#111" />
    </Pressable>
  );
}

export default function App() {
  const [loaded] = useFonts({
    [FONT.medium]: require('./assets/sf-rounded-medium.otf'),
    [FONT.bold]: require('./assets/sf-rounded-bold.otf'),
  });

  const [count, setCount] = React.useState(128);
  const [word, setWord] = React.useState(0);
  const [balance, setBalance] = React.useState(2480.5);
  const [currency, setCurrency] = React.useState(0);
  const current = CURRENCIES[currency]!;

  if (!loaded) return <View style={styles.screen} />;

  return (
    <View style={styles.screen}>
      <View style={styles.stack}>
        <Pressable onPress={() => setCurrency((c) => (c + 1) % CURRENCIES.length)}>
          <View style={styles.chip}>
            <NumericText
              value={current.code}
              fontSize={12}
              fontFamily={FONT.medium}
              color="#6E6E73"
              letterSpacing={0.6}
              direction="up"
            />
          </View>
        </Pressable>
        <NumericText
          value={formatMoney(balance, current)}
          fontSize={56}
          fontFamily={FONT.bold}
          color="#111"
          monospacedDigits
          alignment="center"
        />
        <View style={styles.controls}>
          <IconButton
            name="arrow-down-left"
            onPress={() =>
              setBalance((b) => Math.max(0, b - Math.round(Math.random() * 20000) / 100))
            }
          />
          <IconButton
            name="arrow-up-right"
            onPress={() => setBalance((b) => b + Math.round(Math.random() * 50000) / 100)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stack: { alignItems: 'center', gap: 20, width: '100%', maxWidth: 360 },
  controls: { flexDirection: 'row', gap: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHover: { backgroundColor: '#F2F2F7' },
  divider: { width: 32, height: 1, backgroundColor: '#E5E5EA', marginVertical: 20 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  caption: {
    marginTop: 48,
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#A1A1AA',
    letterSpacing: 0.4,
  },
});
