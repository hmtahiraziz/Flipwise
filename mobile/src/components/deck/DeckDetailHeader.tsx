import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {BlurSurface} from '../ui/BlurSurface';
import {LibraryBackButton} from '../library/LibraryHeader';

type DeckDetailHeaderProps = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
  titleColor?: string;
  backIconColor?: string;
};

export function DeckDetailHeader({
  title,
  onBack,
  right,
  titleColor = libraryTokens.primary,
  backIconColor,
}: DeckDetailHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurSurface
      fallbackOpacity={0.96}
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: libraryTokens.border,
        backgroundColor: `${libraryTokens.surface}F2`,
      }}>
      <View
        className="flex-row items-center justify-between min-h-[64px]"
        style={{paddingHorizontal: libraryTokens.containerPadding}}>
        <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-3">
          <LibraryBackButton onPress={onBack} iconColor={backIconColor} />
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 18,
              lineHeight: 24,
              letterSpacing: -0.18,
              color: titleColor,
            }}
            numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right ? <View className="shrink-0 flex-row items-center gap-1">{right}</View> : null}
      </View>
    </BlurSurface>
  );
}

export function DeckHeaderIconButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="w-10 h-10 items-center justify-center rounded-full active:opacity-70">
      <MaterialIcons name={icon} size={22} color={libraryTokens.muted} />
    </Pressable>
  );
}
