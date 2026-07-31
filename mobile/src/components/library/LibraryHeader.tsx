import type {ReactNode} from 'react';
import {Pressable, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {libraryTokens} from '../../config/libraryTokens';

export function LibraryProfileButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel="Profile"
      accessibilityRole="button"
      className="rounded-full active:opacity-80"
      style={{
        width: 40,
        height: 40,
        borderWidth: 2,
        borderColor: libraryTokens.primaryContainer,
        padding: 2,
      }}>
      <View className="w-full h-full rounded-full overflow-hidden">{children}</View>
    </Pressable>
  );
}

export function LibrarySettingsButton({onPress}: {onPress: () => void}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel="Settings"
      accessibilityRole="button"
      className="items-center justify-center rounded-full active:opacity-70"
      style={{
        width: libraryTokens.minTapTarget,
        height: libraryTokens.minTapTarget,
      }}>
      <MaterialIcons name="settings" size={24} color={libraryTokens.ink} />
    </Pressable>
  );
}

export function LibraryBackButton({
  onPress,
  iconColor = libraryTokens.primary,
}: {
  onPress: () => void;
  iconColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel="Go back"
      accessibilityRole="button"
      className="items-center justify-center rounded-full active:opacity-70"
      style={{
        width: libraryTokens.minTapTarget,
        height: libraryTokens.minTapTarget,
      }}>
      <MaterialIcons name="arrow-back" size={24} color={iconColor} />
    </Pressable>
  );
}
