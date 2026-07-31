import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../config/theme';
import {reviewTokens} from '../../config/reviewTokens';
import {BlurSurface} from './BlurSurface';

type PrimaryScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  centerTitle?: boolean;
  titleTone?: 'primary' | 'default';
  solid?: boolean;
  /** Use review session surface tint (#F8F9FD) when solid. */
  reviewStyle?: boolean;
};

export function PrimaryScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  centerTitle = false,
  titleTone = 'primary',
  solid = false,
  reviewStyle = false,
}: PrimaryScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const titleColor = titleTone === 'primary' ? 'text-primary' : 'text-on-surface';

  const titleBlock = (
    <View className={centerTitle ? 'items-center' : ''}>
      <Text
        className={`text-heading font-display-md tracking-tight ${titleColor}`}
        numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-caption text-muted mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  const headerContent = (
    <View className="flex-row items-center justify-between px-5 min-h-[64px]">
      {centerTitle ? (
        <>
          <View className="w-10 shrink-0">{onBack ? backButton(onBack) : null}</View>
          <View className="flex-1 items-center px-2 min-w-0">{titleBlock}</View>
          <View
            className="shrink-0 items-end"
            style={reviewStyle ? {minWidth: 40} : undefined}>
            {right}
          </View>
        </>
      ) : (
        <>
          <View className="flex-row items-center gap-3 flex-1 mr-3 min-w-0">
            {onBack ? <View className="shrink-0">{backButton(onBack)}</View> : null}
            <View className="flex-1 min-w-0">{titleBlock}</View>
          </View>
          <View
            className="shrink-0 items-end"
            style={reviewStyle ? {minWidth: 40} : undefined}>
            {right}
          </View>
        </>
      )}
    </View>
  );

  if (solid) {
    return (
      <View
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: reviewStyle ? reviewTokens.surfaceVariant : colors.surfaceVariant,
          backgroundColor: reviewStyle ? reviewTokens.surface : colors.surface,
        }}>
        {headerContent}
      </View>
    );
  }

  return (
    <BlurSurface
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
      {headerContent}
    </BlurSurface>
  );
}

function backButton(onBack: () => void) {
  return (
    <Pressable
      className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container"
      onPress={onBack}
      hitSlop={8}
      accessibilityLabel="Go back"
      accessibilityRole="button">
      <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
    </Pressable>
  );
}
