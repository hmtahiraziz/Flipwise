import {useEffect} from 'react';
import {View, type ViewProps} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type SkeletonProps = ViewProps & {
  width?: number | `${number}%`;
  height?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
};

const roundedMap = {
  sm: 'rounded-md',
  md: 'rounded-button',
  lg: 'rounded-card',
  full: 'rounded-full',
} as const;

export function Skeleton({
  width = '100%',
  height = 16,
  rounded = 'md',
  className,
  style,
  ...props
}: SkeletonProps) {
  const shimmer = useSharedValue(0.35);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(0.75, {duration: 900, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  return (
    <View
      className={`overflow-hidden bg-surface-muted ${roundedMap[rounded]} ${className ?? ''}`}
      style={[{width, height}, style]}
      {...props}>
      <Animated.View
        className="absolute inset-0 bg-outline-variant"
        style={animatedStyle}
      />
    </View>
  );
}

type SkeletonCardProps = {
  lines?: number;
  showBadge?: boolean;
};

export function SkeletonCard({lines = 2, showBadge = true}: SkeletonCardProps) {
  return (
    <View className="bg-card rounded-card border border-border p-5 mb-3">
      {showBadge ? <Skeleton width={88} height={24} rounded="full" className="mb-3" /> : null}
      <Skeleton width="70%" height={20} rounded="md" className="mb-3" />
      {Array.from({length: lines}).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '55%' : '100%'}
          height={14}
          rounded="sm"
          className={index < lines - 1 ? 'mb-2' : undefined}
        />
      ))}
    </View>
  );
}

export function SkeletonDeckList({count = 3}: {count?: number}) {
  return (
    <View>
      <Skeleton width="55%" height={36} rounded="md" className="mb-2" />
      <Skeleton width="70%" height={16} rounded="sm" className="mb-4" />
      <View className="flex-row gap-3 mb-8">
        <Skeleton width={120} height={36} rounded="full" />
        <Skeleton width={140} height={36} rounded="full" />
      </View>
      <Skeleton width="100%" height={220} rounded="lg" className="mb-8" />
      {Array.from({length: count}).map((_, index) => (
        <View
          key={index}
          className="rounded-2xl p-5 mb-3 flex-row gap-4"
          style={{
            backgroundColor: libraryTokens.surface,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            borderRadius: libraryTokens.cardRadius,
          }}>
          <View className="flex-1 gap-3">
            <View className="flex-row justify-between">
              <Skeleton width={40} height={40} rounded="md" />
              <Skeleton width={72} height={24} rounded="full" />
            </View>
            <Skeleton width="60%" height={20} rounded="md" />
            <Skeleton width="85%" height={14} rounded="sm" />
            <Skeleton width="100%" height={6} rounded="full" />
          </View>
          <Skeleton width={24} height={24} rounded="sm" />
        </View>
      ))}
    </View>
  );
}
