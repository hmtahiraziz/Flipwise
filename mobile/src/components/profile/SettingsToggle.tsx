import {useEffect} from 'react';
import {Pressable} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type SettingsToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 20;
const THUMB_SIZE = 20;

/** Custom toggle — lime track + dark thumb when on (matches settings HTML mock). */
export function SettingsToggle({value, onValueChange, disabled}: SettingsToggleProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {duration: 200});
  }, [progress, value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{translateX: progress.value * 20}],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.muted, colors.ink],
    ),
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.surfaceContainer, libraryTokens.primaryContainer],
    ),
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled: !!disabled}}
      hitSlop={8}
      style={{opacity: disabled ? 0.5 : 1}}>
      <Animated.View
        style={[
          {
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            justifyContent: 'center',
          },
          trackStyle,
        ]}>
        <Animated.View
          style={[
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
