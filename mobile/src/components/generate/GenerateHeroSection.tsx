import {useEffect} from 'react';
import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type GenerateHeroSectionProps = {
  compact?: boolean;
  title?: string;
  subtitle?: string;
};

export function GenerateHeroSection({
  compact,
  title = 'Transform your notes',
  subtitle = 'Create high-quality study cards instantly with powerful AI analysis.',
}: GenerateHeroSectionProps) {
  const glow = useSharedValue(0.85);
  const scale = useSharedValue(1);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
        withTiming(0.75, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
        withTiming(1, {duration: 1500, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
  }, [glow, scale]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.4,
    transform: [{scale: scale.value}],
  }));

  const iconSize = compact ? 56 : 64;

  return (
    <View
      className="items-center"
      style={{
        paddingTop: compact ? 24 : 32,
        paddingBottom: compact ? 20 : 32,
      }}>
      <View style={{marginBottom: compact ? 16 : 24}}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -6,
              left: -6,
              right: -6,
              bottom: -6,
              borderRadius: 999,
              backgroundColor: libraryTokens.primaryContainer,
            },
            glowStyle,
          ]}
        />
        <View
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: 24,
            backgroundColor: libraryTokens.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialIcons name="auto-awesome" size={compact ? 28 : 32} color="#161E00" />
        </View>
      </View>

      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: compact ? 22 : 24,
          lineHeight: compact ? 28 : 32,
          letterSpacing: -0.24,
          color: libraryTokens.ink,
          textAlign: 'center',
          marginBottom: 8,
        }}>
        {title}
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 14,
          lineHeight: 20,
          color: libraryTokens.muted,
          textAlign: 'center',
          maxWidth: 280,
          paddingHorizontal: 8,
        }}>
        {subtitle}
      </Text>
    </View>
  );
}
