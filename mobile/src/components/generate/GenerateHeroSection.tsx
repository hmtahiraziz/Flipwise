import {useEffect} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type GenerateHeroSectionProps = {
  compact?: boolean;
  title?: string;
  subtitle?: string;
  deckTitle?: string;
  onPressDeck?: () => void;
};

export function GenerateHeroSection({
  compact,
  title = 'Create cards with AI',
  subtitle = 'Choose a source, customize depth, and generate high-yield flashcards in seconds.',
  deckTitle,
  onPressDeck,
}: GenerateHeroSectionProps) {
  const glow = useSharedValue(0.85);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 1600, easing: Easing.inOut(Easing.ease)}),
        withTiming(0.8, {duration: 1600, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.35,
  }));

  return (
    <View className="items-center" style={{paddingTop: compact ? 12 : 16, paddingBottom: 4}}>
      <View style={{marginBottom: 12}}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: brandColors.paleLime,
            borderWidth: 1,
            borderColor: 'rgba(199,245,43,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 48,
                height: 48,
                borderRadius: 999,
                backgroundColor: brandColors.lime,
              },
              glowStyle,
            ]}
          />
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              backgroundColor: brandColors.lime,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name="auto-awesome" size={22} color={brandColors.charcoal} />
          </View>
        </View>
      </View>

      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 22,
          lineHeight: 28,
          letterSpacing: -0.3,
          color: libraryTokens.ink,
          textAlign: 'center',
        }}>
        {title}
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 13,
          lineHeight: 18,
          color: '#70757D',
          textAlign: 'center',
          maxWidth: 300,
          marginTop: 4,
        }}>
        {subtitle}
      </Text>

      {deckTitle ? (
        <Pressable
          onPress={onPressDeck}
          accessibilityRole="button"
          className="active:opacity-90 flex-row items-center"
          style={{
            marginTop: 14,
            backgroundColor: brandColors.surface,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 7,
            gap: 6,
          }}>
          <Text style={{fontFamily: fonts.body, fontSize: 12, color: '#70757D'}}>
            Saving to
          </Text>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 12,
              color: brandColors.olive,
            }}>
            {deckTitle}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={14} color="#70757D" />
        </Pressable>
      ) : null}
    </View>
  );
}
