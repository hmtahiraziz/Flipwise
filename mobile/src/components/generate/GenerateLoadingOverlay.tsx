import {useEffect, useState} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
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

const STAGES = [
  {
    title: 'Reading your source',
    detail: 'Extracting the concepts worth studying…',
  },
  {
    title: 'Building active-recall prompts',
    detail: 'Writing clear fronts that force retrieval…',
  },
  {
    title: 'Polishing answers',
    detail: 'Keeping backs atomic, accurate, and concise…',
  },
  {
    title: 'Quality check',
    detail: 'Removing duplicates and weak cards…',
  },
] as const;

type GenerateLoadingOverlayProps = {
  onCancel: () => void;
  bottomPad: number;
};

function ShimmerCard({opacity, delay}: {opacity: number; delay: number}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420)}
      style={{
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        backgroundColor: libraryTokens.surface,
        gap: 14,
        opacity,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Skeleton width={72} height={18} rounded="lg" />
        <Skeleton width={56} height={18} rounded="lg" />
      </View>
      <Skeleton width="78%" height={18} rounded="lg" />
      <View style={{gap: 8}}>
        <Skeleton width="100%" height={14} rounded="md" />
        <Skeleton width="88%" height={14} rounded="md" />
      </View>
    </Animated.View>
  );
}

export function GenerateLoadingOverlay({
  onCancel,
  bottomPad,
}: GenerateLoadingOverlayProps) {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(12);
  const [stageIndex, setStageIndex] = useState(0);
  const spin = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, {duration: 2400, easing: Easing.linear}),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withTiming(1.08, {duration: 1100, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [pulse, spin]);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(current => {
        if (current >= 96) return current;
        const bump = current < 40 ? 7 : current < 75 ? 4 : 1.5;
        return Math.min(96, current + bump + Math.random() * 2);
      });
    }, 900);

    const stageTimer = setInterval(() => {
      setStageIndex(i => Math.min(STAGES.length - 1, i + 1));
    }, 2800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stageTimer);
    };
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${spin.value}deg`}],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: pulse.value}],
  }));

  const stage = STAGES[stageIndex] ?? STAGES[0];
  const estimatedSeconds = Math.max(5, Math.round((100 - progress) / 6));

  return (
    <View
      className="absolute inset-0 z-50"
      style={{backgroundColor: libraryTokens.background}}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: libraryTokens.containerPadding,
          paddingTop: insets.top + 56,
          paddingBottom: bottomPad + 150,
        }}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeIn.duration(320)}
          style={{alignItems: 'center', marginBottom: 32}}>
          <Animated.View
            style={[
              pulseStyle,
              {
                width: 72,
                height: 72,
                borderRadius: 999,
                backgroundColor: libraryTokens.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              },
            ]}>
            <Animated.View style={spinStyle}>
              <MaterialIcons
                name="auto-awesome"
                size={30}
                color={libraryTokens.onPrimaryContainer}
              />
            </Animated.View>
          </Animated.View>

          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 26,
              lineHeight: 32,
              letterSpacing: -0.4,
              color: libraryTokens.ink,
              textAlign: 'center',
            }}>
            Crafting your cards
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              lineHeight: 20,
              color: libraryTokens.muted,
              textAlign: 'center',
              marginTop: 8,
              maxWidth: 320,
            }}>
            Building active-recall flashcards with Play Store–level clarity.
          </Text>

          <View
            style={{
              width: '100%',
              maxWidth: 340,
              height: 8,
              borderRadius: 999,
              backgroundColor: libraryTokens.surfaceContainerLow,
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

          <View
            style={{
              width: '100%',
              maxWidth: 340,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                color: libraryTokens.ink,
              }}>
              {Math.round(progress)}%
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: libraryTokens.muted,
              }}>
              ~{estimatedSeconds}s left
            </Text>
          </View>
        </Animated.View>

        <View
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: libraryTokens.borderSubtle,
            backgroundColor: libraryTokens.surface,
            padding: 16,
            gap: 12,
            marginBottom: 20,
          }}>
          {STAGES.map((item, index) => {
            const active = index === stageIndex;
            const done = index < stageIndex;
            return (
              <View
                key={item.title}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                  opacity: index > stageIndex ? 0.45 : 1,
                }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done || active
                      ? libraryTokens.primaryContainer
                      : libraryTokens.surfaceContainerLow,
                    marginTop: 1,
                  }}>
                  <MaterialIcons
                    name={done ? 'check' : active ? 'bolt' : 'radio-button-unchecked'}
                    size={14}
                    color={
                      done || active
                        ? libraryTokens.onPrimaryContainer
                        : libraryTokens.muted
                    }
                  />
                </View>
                <View style={{flex: 1, gap: 2}}>
                  <Text
                    style={{
                      fontFamily: active ? fonts.bodyBold : fonts.bodySemiBold,
                      fontSize: 14,
                      color: libraryTokens.ink,
                    }}>
                    {item.title}
                  </Text>
                  {active ? (
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 12,
                        lineHeight: 17,
                        color: libraryTokens.muted,
                      }}>
                      {stage.detail}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{gap: 12}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: libraryTokens.muted,
              marginBottom: 2,
            }}>
            Preview assembling
          </Text>
          <ShimmerCard opacity={1} delay={80} />
          <ShimmerCard opacity={0.72} delay={160} />
          <ShimmerCard opacity={0.42} delay={240} />
        </View>
      </ScrollView>

      <BlurSurface
        fallbackOpacity={0.96}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: bottomPad,
          borderTopWidth: 1,
          borderTopColor: libraryTokens.border,
          paddingHorizontal: libraryTokens.containerPadding,
          paddingTop: 14,
          paddingBottom: 14,
          gap: 10,
        }}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel generation"
          className="active:opacity-80"
          style={{
            width: '100%',
            paddingVertical: 15,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            alignItems: 'center',
            backgroundColor: libraryTokens.surface,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 15,
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
          You can cancel anytime — nothing is saved until you review.
        </Text>
      </BlurSurface>
    </View>
  );
}
