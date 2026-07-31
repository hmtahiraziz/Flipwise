import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {libraryFabShadow, libraryTokens} from '../../config/libraryTokens';
import {colors} from '../../config/theme';

type FabProps = {
  label: string;
  onPress: () => void;
  icon?: string;
  bottomOffset?: number;
  className?: string;
  variant?: 'pill' | 'icon' | 'green' | 'dark';
};

export function Fab({
  label,
  onPress,
  icon = 'add',
  bottomOffset = 24,
  className,
  variant = 'pill',
}: FabProps) {
  const insets = useSafeAreaInsets();

  if (variant === 'icon' || variant === 'green' || variant === 'dark') {
    const bgColor =
      variant === 'dark'
        ? libraryTokens.fabDark
        : variant === 'green'
          ? libraryTokens.primaryContainer
          : colors.primaryContainer;
    const iconColor =
      variant === 'dark'
        ? colors.white
        : variant === 'green'
          ? libraryTokens.primary
          : colors.onPrimaryContainer;

    return (
      <View
        className={`absolute right-6 items-end ${className ?? ''}`}
        style={{bottom: Math.max(insets.bottom, 12) + bottomOffset}}>
        <Pressable
          className="rounded-full items-center justify-center active:scale-90"
          style={{
            width: libraryTokens.fabSize,
            height: libraryTokens.fabSize,
            backgroundColor: bgColor,
            ...libraryFabShadow,
          }}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}>
          <MaterialIcons name={icon} size={30} color={iconColor} />
        </Pressable>
      </View>
    );
  }

  return (
    <View
      className={`absolute right-5 items-end ${className ?? ''}`}
      style={{bottom: Math.max(insets.bottom, 12) + bottomOffset}}>
      <Pressable
        className="flex-row items-center bg-primary-container border border-primary border-b-2 rounded-full px-5 py-3.5 shadow-elevated active:opacity-90"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <MaterialIcons name={icon} size={20} color={colors.onPrimaryContainer} />
        <Text className="text-body-md text-on-primary-container font-semibold ml-2">{label}</Text>
      </Pressable>
    </View>
  );
}

type FabSpacerProps = {
  extra?: number;
};

export function FabSpacer({extra = 72}: FabSpacerProps) {
  const insets = useSafeAreaInsets();
  return <View style={{height: Math.max(insets.bottom, 12) + extra}} />;
}

export function FabContainer({children}: {children: ReactNode}) {
  return <View className="absolute inset-0 pointer-events-box-none">{children}</View>;
}
