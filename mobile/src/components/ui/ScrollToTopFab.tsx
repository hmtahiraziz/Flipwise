import {useEffect} from 'react';
import {Pressable} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {libraryFabShadow, libraryTokens} from '../../config/libraryTokens';
import {colors} from '../../config/theme';

type ScrollToTopFabProps = {
  visible: boolean;
  onPress: () => void;
  bottom?: number;
  right?: number;
};

const FAB_SIZE = 48;
const SHOW_THRESHOLD = 160;

/** Minimum scroll offset before the FAB should appear. */
export const SCROLL_TO_TOP_THRESHOLD = SHOW_THRESHOLD;

/** Circular scroll-to-top button — fades in when scrolling down (Samsung Members style). */
export function ScrollToTopFab({
  visible,
  onPress,
  bottom = 24,
  right = libraryTokens.containerPadding,
}: ScrollToTopFabProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {duration: 220});
  }, [progress, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {scale: 0.88 + progress.value * 0.12},
      {translateY: (1 - progress.value) * 16},
    ],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        {
          position: 'absolute',
          right,
          bottom,
          zIndex: 30,
        },
        animatedStyle,
      ]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Scroll to top"
        className="active:scale-90"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: FAB_SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: libraryTokens.surface,
          borderWidth: 1,
          borderColor: libraryTokens.border,
          ...libraryFabShadow,
        }}>
        <MaterialIcons name="keyboard-arrow-up" size={28} color={colors.onSurface} />
      </Pressable>
    </Animated.View>
  );
}
