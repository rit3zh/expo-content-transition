import { Feather, Ionicons } from '@expo/vector-icons';
import { NumericText } from 'expo-content-transition';
import { useFonts } from 'expo-font';
import * as React from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  BitcoinIcon,
  CardanoIcon,
  EthereumIcon,
  LitecoinIcon,
  SolanaIcon,
  TetherIcon,
} from './TokenIcons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const isIOS = Platform.OS === 'ios';
const FONT = {
  regular: 'SFRounded-Regular',
  medium: 'SFRounded-Medium',
  bold: 'SFRounded-Bold',
};

const COLOR = {
  ink: '#0C0D0F',
  white: '#FFFFFF',
  dim: '#9C9CA4',
  faint: '#74757D',
  chrome: '#1B1C20',
  stroke: '#292A2F',
  mint: '#4ADE80',
  rose: '#F2555A',
  sub: '#94979F',
  hairline: '#F1F2F4',
};

const WALLETS = [
  { id: 'personal', name: 'Personal', total: 63000 },
  { id: 'private', name: 'Private', total: 128400 },
  { id: 'savings', name: 'Savings', total: 24680 },
  { id: 'trading', name: 'Trading', total: 9420 },
  { id: 'cold', name: 'Cold Storage', total: 310750 },
];

const BASE_TOTAL = WALLETS[0].total;
const XMR_RATE = 299.4;

const TOKENS = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    amount: 0.412,
    decimals: 3,
    value: 26180,
    Icon: BitcoinIcon,
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    amount: 4.85,
    decimals: 3,
    value: 14520,
    Icon: EthereumIcon,
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    amount: 62.4,
    decimals: 2,
    value: 9180,
    Icon: SolanaIcon,
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    amount: 6240,
    decimals: 0,
    value: 6240,
    Icon: TetherIcon,
  },
  {
    id: 'ada',
    name: 'Cardano',
    symbol: 'ADA',
    amount: 8120,
    decimals: 0,
    value: 4060,
    Icon: CardanoIcon,
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    symbol: 'LTC',
    amount: 28.5,
    decimals: 2,
    value: 2820,
    Icon: LitecoinIcon,
  },
];

const formatAmount = (value: number, decimals: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export default function App() {
  const [loaded] = useFonts({
    [FONT.regular]: require('./assets/sf-rounded-regular.otf'),
    [FONT.medium]: require('./assets/sf-rounded-medium.otf'),
    [FONT.bold]: require('./assets/sf-rounded-bold.otf'),
  });

  const [drift, setDrift] = React.useState(1);
  const [walletIndex, setWalletIndex] = React.useState(0);
  const rotation = useSharedValue(0);

  const cycleWallet = React.useCallback(() => {
    setWalletIndex((index) => (index + 1) % WALLETS.length);
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const refresh = React.useCallback(() => {
    rotation.value = withTiming(rotation.value + 360, {
      duration: 780,
      easing: Easing.out(Easing.cubic),
    });
    setDrift(0.93 + Math.random() * 0.15);
  }, [rotation]);

  if (!loaded) {
    return <View style={styles.screen} />;
  }

  const wallet = WALLETS[walletIndex];
  const ratio = (wallet.total / BASE_TOTAL) * drift;
  const balance = Math.round(wallet.total * drift);
  const monero = ((wallet.total * drift) / XMR_RATE).toFixed(2);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={styles.card}>
        <CardGradient />

        <View style={styles.cardHeader}>
          <Image
            source={{
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTicB9ZRIoQEQu5XDVo3idMPYL4nMK5qTLoBgmdsLgPaeVR3sp0YlG4Av0&s=10',
            }}
            style={styles.avatar}
          />
          <Bounce style={styles.walletPicker} onPress={cycleWallet}>
            <NumericText
              value={wallet.name}
              fontFamily={FONT.medium}
              fontSize={15}
              color={COLOR.white}
              direction="auto"
              blurIntensity={5.1}
            />
            <Feather name="chevron-down" size={15} color={COLOR.dim} />
          </Bounce>
          <Bounce style={styles.bell}>
            <Ionicons name="notifications-outline" size={19} color={COLOR.white} />
            <View style={styles.bellDot} />
          </Bounce>
        </View>

        <View style={styles.balanceBlock}>
          <NumericText
            value={`$${balance.toLocaleString('en-US')}`}
            fontFamily={FONT.bold}
            fontSize={58}
            color={COLOR.white}
            letterSpacing={-1.5}
            alignment="center"
            monospacedDigits
            blurIntensity={isIOS ? 3.1 : 5.3}
          />

          <View style={styles.subRow}>
            <NumericText
              value={monero}
              fontFamily={FONT.medium}
              fontSize={15}
              color={COLOR.dim}
              monospacedDigits
              blurIntensity={1.1}
            />
            <Text style={styles.ticker}>XMR</Text>

            <Bounce style={styles.refresh} onPress={refresh}>
              <Animated.View style={spinStyle}>
                <Feather name="refresh-cw" size={13} color={COLOR.dim} />
              </Animated.View>
            </Bounce>
          </View>
        </View>

        <View style={styles.actions}>
          <Bounce style={styles.pill}>
            <Feather name="arrow-down-left" size={15} color={COLOR.white} />
            <Text style={styles.pillLabel}>Receive</Text>
          </Bounce>

          <Bounce style={styles.plus}>
            <Feather name="plus" size={24} color={COLOR.white} />
          </Bounce>

          <Bounce style={styles.pill}>
            <Feather name="arrow-up-right" size={15} color={COLOR.white} />
            <Text style={styles.pillLabel}>Send</Text>
          </Bounce>
        </View>

        <View style={styles.syncPill}>
          <View style={styles.syncDot} />
          <Text style={styles.syncLabel}>Synchronized</Text>
        </View>
      </View>

      <ScrollView
        style={styles.portfolio}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.portfolioContent}>
        <View style={styles.portfolioHeader}>
          <Text style={styles.portfolioTitle}>Portfolio</Text>
          <Bounce style={styles.viewAll}>
            <Text style={styles.viewAllLabel}>View all</Text>
            <Feather name="chevron-down" size={15} color={COLOR.sub} />
          </Bounce>
        </View>

        {TOKENS.map((token, index) => (
          <Animated.View key={token.id} entering={FadeInDown.delay(60 * index).duration(420)}>
            <TokenRow token={token} ratio={ratio} first={index === 0} />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

function Bounce({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={8}
      onPressIn={() => {
        scale.value = withSpring(0.93, { damping: 12, stiffness: 150, mass: 0.5 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 150, mass: 0.5 });
      }}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}

function CardGradient() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="card" x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#3D3E44" />
          <Stop offset="0.42" stopColor="#1B1C1F" />
          <Stop offset="1" stopColor="#08080A" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#card)" />
    </Svg>
  );
}

function TokenRow({
  token,
  ratio,
  first,
}: {
  token: (typeof TOKENS)[number];
  ratio: number;
  first: boolean;
}) {
  const { Icon } = token;
  const value = Math.round(token.value * ratio).toLocaleString('en-US');
  const holding = `${formatAmount(token.amount * ratio, token.decimals)} ${token.symbol}`;

  return (
    <Bounce style={[styles.token, !first && styles.tokenDivider]}>
      <View style={styles.tokenIcon}>
        <Icon size={34} />
      </View>

      <View style={styles.tokenText}>
        <Text style={styles.tokenName}>{token.name}</Text>
        <Text style={styles.tokenHolding}>{holding}</Text>
      </View>

      <NumericText
        value={`$${value}`}
        fontFamily={FONT.bold}
        fontSize={16}
        color={COLOR.ink}
        alignment="end"
        monospacedDigits
        blurIntensity={1.1}
      />
    </Bounce>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLOR.white },

  card: {
    paddingTop: 60,
    paddingBottom: 28,
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
    overflow: 'hidden',
    backgroundColor: COLOR.ink,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLOR.chrome },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.chrome,
    borderWidth: 1,
    borderColor: COLOR.stroke,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLOR.rose,
    borderWidth: 1.5,
    borderColor: COLOR.chrome,
  },
  walletPicker: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  walletName: { fontFamily: FONT.medium, fontSize: 15, color: COLOR.white },

  balanceBlock: { alignItems: 'center', marginTop: 38 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  ticker: { fontFamily: FONT.medium, fontSize: 15, color: COLOR.dim },
  refresh: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.chrome,
    borderWidth: 1,
    borderColor: COLOR.stroke,
    marginLeft: 4,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 38,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 23,
    backgroundColor: COLOR.chrome,
    borderWidth: 1,
    borderColor: COLOR.stroke,
  },
  pillLabel: { fontFamily: FONT.medium, fontSize: 14, color: COLOR.white },
  plus: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.chrome,
    borderWidth: 1,
    borderColor: COLOR.stroke,
  },

  syncPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 30,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLOR.chrome,
    borderWidth: 1,
    borderColor: COLOR.stroke,
  },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLOR.mint },
  syncLabel: { fontFamily: FONT.medium, fontSize: 13, color: COLOR.white },

  portfolio: { flex: 1 },
  portfolioContent: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 44 },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  portfolioTitle: { fontFamily: FONT.bold, fontSize: 21, color: COLOR.ink },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewAllLabel: { fontFamily: FONT.medium, fontSize: 14, color: COLOR.sub },

  token: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15 },
  tokenDivider: { borderTopWidth: 1, borderTopColor: COLOR.hairline },
  tokenIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  tokenText: { flex: 1 },
  tokenName: { fontFamily: FONT.bold, fontSize: 16, color: COLOR.ink },
  tokenHolding: { fontFamily: FONT.regular, fontSize: 13, color: COLOR.sub, marginTop: 2 },
});
