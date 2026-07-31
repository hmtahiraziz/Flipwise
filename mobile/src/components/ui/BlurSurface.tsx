import type {ReactNode} from 'react';
import {Platform, StyleSheet, View, type ViewProps} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {colors} from '../../config/theme';

type BlurSurfaceProps = ViewProps & {
  children: ReactNode;
  intensity?: number;
  fallbackOpacity?: number;
};

export function BlurSurface({
  children,
  intensity = 40,
  fallbackOpacity = 0.92,
  style,
  ...props
}: BlurSurfaceProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        blurType="light"
        blurAmount={intensity}
        reducedTransparencyFallbackColor={colors.background}
        style={[styles.blur, style]}
        {...props}>
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {backgroundColor: `rgba(255, 255, 255, ${fallbackOpacity})`},
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
  fallback: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
