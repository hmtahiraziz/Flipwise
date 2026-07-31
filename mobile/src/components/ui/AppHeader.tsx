import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../config/theme';
import {BlurSurface} from './BlurSurface';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  left?: ReactNode;
  right?: ReactNode;
  bordered?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  onBack,
  backLabel,
  left,
  right,
  bordered = true,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurSurface
      style={{
        paddingTop: insets.top,
        borderBottomWidth: bordered ? 1 : 0,
        borderBottomColor: colors.border,
      }}>
      <View className="flex-row items-center justify-between px-5 py-3 min-h-[64px]">
        <View className="flex-row items-center flex-1 mr-3">
          {left ??
            (onBack ? (
              <Pressable
                className="flex-row items-center mr-2 py-1 pr-2 active:opacity-70"
                onPress={onBack}
                hitSlop={8}>
                <MaterialIcons name="arrow-back" size={22} color={colors.text} />
                {backLabel ? (
                  <Text className="text-body-md text-text ml-1">{backLabel}</Text>
                ) : null}
              </Pressable>
            ) : (
              <View className="w-8" />
            ))}
        </View>

        <View className="flex-[2] items-center px-2">
          {title ? (
            <Text
              className="text-headline-md font-display text-text text-center tracking-tight"
              numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text className="text-caption text-muted text-center mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View className="flex-1 items-end">{right ?? <View className="w-8" />}</View>
      </View>
    </BlurSurface>
  );
}
