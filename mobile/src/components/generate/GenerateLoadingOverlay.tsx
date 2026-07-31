import {useEffect, useState} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {BlurSurface} from '../ui/BlurSurface';
import {Skeleton} from '../ui/Skeleton';

const STATUS_MESSAGES = [
  'Analyzing concepts and crafting questions…',
  'Building question–answer pairs…',
  'Polishing card wording…',
  'Almost ready…',
];

type GenerateLoadingOverlayProps = {
  onCancel: () => void;
  bottomPad: number;
};

function ShimmerCard({opacity}: {opacity: number}) {
  return (
    <View
      style={{
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        backgroundColor: libraryTokens.surface,
        gap: 16,
        opacity,
      }}>
      <Skeleton width="66%" height={20} rounded="lg" />
      <View style={{gap: 8}}>
        <Skeleton width="100%" height={16} rounded="md" />
        <Skeleton width="83%" height={16} rounded="md" />
      </View>
    </View>
  );
}

export function GenerateLoadingOverlay({
  onCancel,
  bottomPad,
}: GenerateLoadingOverlayProps) {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(15);
  const [statusIndex, setStatusIndex] = useState(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, {duration: 3000, easing: Easing.linear}),
      -1,
      false,
    );
  }, [spin]);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(current => {
        if (current >= 98) return current;
        return Math.min(98, current + Math.random() * 8);
      });
    }, 1000);

    const statusTimer = setInterval(() => {
      setStatusIndex(i => (i + 1) % STATUS_MESSAGES.length);
    }, 3200);

    return () => {
      clearInterval(progressTimer);
      clearInterval(statusTimer);
    };
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${spin.value}deg`}],
  }));

  const estimatedSeconds = Math.max(4, Math.round((100 - progress) / 7));

  return (
    <View
      className="absolute inset-0 z-50"
      style={{backgroundColor: libraryTokens.background}}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: libraryTokens.containerPadding,
          paddingTop: insets.top + 72,
          paddingBottom: bottomPad + 140,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="items-center" style={{marginBottom: 40}}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              backgroundColor: libraryTokens.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
            <Animated.View style={spinStyle}>
              <MaterialIcons name="sync" size={32} color="#161E00" />
            </Animated.View>
          </View>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 24,
              lineHeight: 32,
              color: libraryTokens.ink,
              textAlign: 'center',
            }}>
            Generating your deck…
          </Text>
          <View
            style={{
              width: '100%',
              maxWidth: 320,
              height: 8,
              borderRadius: 999,
              backgroundColor: 'rgba(225, 226, 230, 0.5)',
              marginTop: 24,
              overflow: 'hidden',
            }}>
            <View
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: libraryTokens.primaryContainer,
                borderRadius: 999,
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: libraryTokens.muted,
              marginTop: 16,
              textAlign: 'center',
            }}>
            {STATUS_MESSAGES[statusIndex]}
          </Text>
        </View>

        <View style={{gap: 16}}>
          <ShimmerCard opacity={1} />
          <ShimmerCard opacity={0.6} />
        </View>
      </ScrollView>

      <BlurSurface
        fallbackOpacity={0.95}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: bottomPad,
          borderTopWidth: 1,
          borderTopColor: libraryTokens.border,
          paddingHorizontal: libraryTokens.containerPadding,
          paddingTop: 16,
          paddingBottom: 16,
          gap: 12,
        }}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel generation"
          className="active:opacity-80"
          style={{
            width: '100%',
            paddingVertical: 16,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            alignItems: 'center',
            backgroundColor: libraryTokens.surface,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              color: libraryTokens.ink,
            }}>
            Cancel
          </Text>
        </Pressable>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: libraryTokens.muted,
            textAlign: 'center',
          }}>
          Estimated time: ~{estimatedSeconds}s remaining
        </Text>
      </BlurSurface>
    </View>
  );
}
