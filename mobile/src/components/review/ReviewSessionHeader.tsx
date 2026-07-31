import type {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {BlurSurface} from '../ui/BlurSurface';
import {LibraryBackButton} from '../library/LibraryHeader';

/** Review session top bar — matches Library blur header styling. */
type ReviewSessionHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
};

export function ReviewSessionHeader({
  title,
  subtitle,
  onBack,
  right,
}: ReviewSessionHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurSurface
      fallbackOpacity={0.92}
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 0,
        backgroundColor: `${libraryTokens.background}D9`,
      }}>
      <View
        className="flex-row items-center min-h-[64px]"
        style={{paddingHorizontal: libraryTokens.containerPadding}}>
        <View className="shrink-0">
          <LibraryBackButton onPress={onBack} />
        </View>

        <View className="flex-1 min-w-0 mx-3">
          <Text
            style={{
              fontFamily: fonts.displayMedium,
              fontSize: 18,
              lineHeight: 24,
              letterSpacing: -0.18,
              color: libraryTokens.ink,
            }}
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 13,
                lineHeight: 18,
                color: libraryTokens.muted,
                marginTop: 2,
              }}
              numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View className="shrink-0 items-end" style={{width: 40}}>
          {right}
        </View>
      </View>
    </BlurSurface>
  );
}
