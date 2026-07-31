import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {BlurSurface} from '../ui/BlurSurface';

type GenerateReviewHeaderProps = {
  onBack: () => void;
  title?: string;
  right?: ReactNode;
};

/** Glass app bar — matches review cards HTML mockup (#F5F6F3 blur). */
export function GenerateReviewHeader({
  onBack,
  title = 'Review cards',
  right,
}: GenerateReviewHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurSurface
      fallbackOpacity={0.88}
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: libraryTokens.border,
        backgroundColor: 'rgba(245, 246, 243, 0.8)',
      }}>
      <View
        className="flex-row items-center justify-between"
        style={{
          minHeight: 64,
          paddingHorizontal: libraryTokens.containerPadding,
        }}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="active:scale-95"
          style={{
            width: 40,
            height: 40,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>

        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 18,
            lineHeight: 24,
            fontWeight: '600',
            color: colors.onSurface,
            textAlign: 'center',
            flex: 1,
          }}
          numberOfLines={1}>
          {title}
        </Text>

        <View style={{width: 40, alignItems: 'flex-end'}}>{right}</View>
      </View>
    </BlurSurface>
  );
}
