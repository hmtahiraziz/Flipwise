import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useEffect} from 'react';
import {Dimensions, StatusBar, Text, View} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Circle, Defs, Pattern, Rect} from 'react-native-svg';
import {APP_TAGLINE} from '../../config/brand';
import {fonts} from '../../config/theme';

/** Calm Intelligence tokens — Splash Screen (Stitch). */
const splash = {
  background: '#FFFFFF',
  onSurface: '#191C1F',
  muted: '#6B7280',
  primaryContainer: '#C6F135',
  onPrimaryContainer: '#556B00',
  onSurfaceVariant: '#444934',
  surfaceContainer: '#ECEEF2',
  border: '#E5E7EB',
  silhouette: '#F7F8F5',
  dotGrid: '#1E2124',
} as const;

const LOGO_SIZE = 96;
const ICON_BOX_SIZE = 56;
const CARD_RADIUS = 20;
const ICON_RADIUS = 12;
const LOADER_WIDTH = 192;
const LOADER_HEIGHT = 6;
const LOADER_BAR_WIDTH = LOADER_WIDTH * 0.42;

const floatEasing = Easing.inOut(Easing.ease);
const loaderEasing = Easing.bezier(0.4, 0, 0.2, 1);

export function CardweaveSplash() {
  return (
    <View
      style={{flex: 1, overflow: 'hidden', backgroundColor: splash.background}}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading Cardweave">
      <StatusBar
        barStyle="dark-content"
        backgroundColor={splash.background}
        translucent={false}
      />

      <DotGridBackground />

      <Animated.View
        entering={FadeIn.duration(420).easing(Easing.out(Easing.cubic))}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}>
        <View style={{alignItems: 'center'}}>
          <SplashLogoMark />

          <View style={{alignItems: 'center', marginTop: 24}}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 32,
                lineHeight: 40,
                letterSpacing: -0.64,
                color: splash.onSurface,
                textAlign: 'center',
              }}>
              Cardweave
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                lineHeight: 24,
                color: splash.muted,
                maxWidth: 280,
                textAlign: 'center',
                marginTop: 8,
              }}>
              {APP_TAGLINE}
            </Text>
          </View>

          <SplashLoadingBar />
        </View>
      </Animated.View>
    </View>
  );
}

function SplashLogoMark() {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, {duration: 2000, easing: floatEasing}),
        withTiming(0, {duration: 2000, easing: floatEasing}),
      ),
      -1,
      false,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, {duration: 2000, easing: floatEasing}),
        withTiming(1, {duration: 2000, easing: floatEasing}),
      ),
      -1,
      false,
    );
  }, [floatY, scale]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{translateY: floatY.value}, {scale: scale.value}],
  }));

  return (
    <Animated.View
      style={[{width: LOGO_SIZE, height: LOGO_SIZE, marginBottom: 16}, floatStyle]}>
      <View
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          borderRadius: CARD_RADIUS,
          backgroundColor: splash.silhouette,
        }}
      />
      <View
        style={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          borderRadius: CARD_RADIUS,
          backgroundColor: splash.background,
          borderWidth: 1,
          borderColor: splash.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: ICON_BOX_SIZE,
            height: ICON_BOX_SIZE,
            borderRadius: ICON_RADIUS,
            backgroundColor: splash.primaryContainer,
            borderWidth: 1,
            borderColor: splash.onSurfaceVariant,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{rotate: '3deg'}],
          }}>
          <MaterialIcons
            name="auto-awesome"
            size={36}
            color={splash.onPrimaryContainer}
          />
        </View>
      </View>
    </Animated.View>
  );
}

function SplashLoadingBar() {
  const translateX = useSharedValue(-LOADER_BAR_WIDTH);

  useEffect(() => {
    // Indeterminate sweep: bar exits left, crosses track, exits right, loops.
    translateX.value = withRepeat(
      withTiming(LOADER_WIDTH, {
        duration: 1400,
        easing: loaderEasing,
      }),
      -1,
      false,
    );
  }, [translateX]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <View
      style={{
        marginTop: 32,
        width: LOADER_WIDTH,
        height: LOADER_HEIGHT,
        borderRadius: LOADER_HEIGHT / 2,
        backgroundColor: splash.surfaceContainer,
        overflow: 'hidden',
      }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: LOADER_BAR_WIDTH,
            height: LOADER_HEIGHT,
            borderRadius: LOADER_HEIGHT / 2,
            backgroundColor: splash.primaryContainer,
          },
          barStyle,
        ]}
      />
    </View>
  );
}

function DotGridBackground() {
  const {width, height} = Dimensions.get('window');

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 0.03,
        zIndex: -1,
      }}>
      <Svg width={width} height={height}>
        <Defs>
          <Pattern
            id="splashDotGrid"
            width={24}
            height={24}
            patternUnits="userSpaceOnUse">
            <Circle cx={1} cy={1} r={1} fill={splash.dotGrid} />
          </Pattern>
        </Defs>
        <Rect width={width} height={height} fill="url(#splashDotGrid)" />
      </Svg>
    </View>
  );
}
