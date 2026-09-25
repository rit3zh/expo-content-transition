import { Feather } from '@expo/vector-icons';
import { NumericText } from 'expo-content-transition';
import { useFonts } from 'expo-font';
import * as React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';

const FONT = {
  regular: 'SFRounded-Regular',
  medium: 'SFRounded-Medium',
  bold: 'SFRounded-Bold',
};

const WORDS = ['Hello', 'Bonjour', 'Hola', 'Ciao', 'Hallo', 'Olá'];
const STATUSES = ['Sending', 'Flower', 'Pops'];
const PLANS = [
  { name: 'Starter', price: 9 },
  { name: 'Pro', price: 29 },
  { name: 'Team', price: 99 },
];

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
      hitSlop={8}
      style={({ pressed }) => [styles.icon, pressed && { opacity: 0.5 }]}>
      <Feather name={name} size={18} color="#111" />
    </Pressable>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rowBody}>{children}</View>
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    [FONT.regular]: require('./assets/sf-rounded-regular.otf'),
    [FONT.medium]: require('./assets/sf-rounded-medium.otf'),
    [FONT.bold]: require('./assets/sf-rounded-bold.otf'),
  });

  const [count, setCount] = React.useState(0);
  const [word, setWord] = React.useState(0);
  const [plan, setPlan] = React.useState(0);
  const [status, setStatus] = React.useState(0);

  if (!loaded) return <View style={styles.screen} />;

  const current = PLANS[plan]!;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <Row label="Counter">
        <IconButton name="minus" onPress={() => setCount((c) => c - 1)} />
        <NumericText
          value={count}
          fontSize={56}
          fontFamily={FONT.bold}
          color="#111"
          clip={false}
          monospacedDigits
          blur={true}
          // blurIntensity={0}
          alignment="center"
          style={styles.flex}
          enterScale={0.2}
        />
        <IconButton name="plus" onPress={() => setCount((c) => c + 1)} />
      </Row>

      <Row label="Words">
        <NumericText
          value={STATUSES[status]!}
          fontSize={32}
          fontFamily={FONT.bold}

          color="#111"
          blur
          enterScale={0.19}
          style={styles.flex}
        />
        <IconButton name="rotate-cw" onPress={() => setStatus((s) => (s + 1) % STATUSES.length)} />
      </Row>

      <Row label="Plan">
        <IconButton
          name="chevron-left"
          onPress={() => setPlan((p) => (p + PLANS.length - 1) % PLANS.length)}
        />
        <View style={[styles.flex, styles.center]}>
          <NumericText
            value={`$${current.price}`}
            fontSize={40}
            fontFamily={FONT.bold}
            color="#111"
            monospacedDigits
            alignment="center"
          />
          <NumericText
            value={current.name}
            fontSize={15}
            fontFamily={FONT.medium}
            color="#8E8E93"
            alignment="center"
          />
        </View>
        <IconButton name="chevron-right" onPress={() => setPlan((p) => (p + 1) % PLANS.length)} />
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 44,
  },
  row: { gap: 10 },
  rowBody: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  label: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  center: { alignItems: 'center' },
});
