import {useEffect} from 'react';
import {Text, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../../config/theme';

type ProgressBarProps = {
  percent: number;
  label?: string;
  showLabel?: boolean;
  animate?: boolean;
};

export function ProgressBar({
  percent,
  label = 'Mastery',
  showLabel = true,
  animate = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const width = useSharedValue(animate ? 0 : clamped);

  useEffect(() => {
    if (animate) {
      width.value = withDelay(
        100,
        withTiming(clamped, {duration: 1000, easing: Easing.out(Easing.cubic)}),
      );
    } else {
      width.value = clamped;
    }
  }, [animate, clamped, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className="gap-2">
      {showLabel ? (
        <View className="flex-row items-center justify-between">
          <Text className="text-label font-body-semibold text-on-surface-variant uppercase">
            {label}
          </Text>
          <Text className="text-label font-body-semibold text-primary uppercase">
            {clamped}%
          </Text>
        </View>
      ) : null}
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{backgroundColor: colors.silhouette}}>
        <Animated.View
          className="h-full rounded-full"
          style={[{backgroundColor: colors.primaryContainer}, fillStyle]}
        />
      </View>
    </View>
  );
}
