import {View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {onboarding} from './onboardingTheme';

type PageIndicatorProps = {
  count: number;
  activeIndex: number;
};

export function PageIndicator({count, activeIndex}: PageIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({length: count}).map((_, index) => (
        <IndicatorDot key={index} active={index === activeIndex} />
      ))}
    </View>
  );
}

function IndicatorDot({active}: {active: boolean}) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8, {damping: 18, stiffness: 180}),
    backgroundColor: active ? onboarding.dotActive : onboarding.surfaceContainer,
  }));

  return (
    <Animated.View
      className="h-2 rounded-full"
      style={animatedStyle}
    />
  );
}
