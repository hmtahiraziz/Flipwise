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
  subtitle?: string;
  /** Use close icon instead of back arrow (modal-style editors). */
  closeIcon?: boolean;
  right?: ReactNode;
};

/** Glass app bar — Electric Repetition / Stitch. */
export function GenerateReviewHeader({
  onBack,
  title = 'Review cards',
  subtitle,
  closeIcon = false,
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
          gap: 8,
        }}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityLabel={closeIcon ? 'Close' : 'Go back'}
          accessibilityRole="button"
          className="active:scale-95"
          style={{
            width: 40,
            height: 40,
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <MaterialIcons
            name={closeIcon ? 'close' : 'arrow-back'}
            size={24}
            color={colors.onSurface}
          />
        </Pressable>

        <View style={{flex: 1, minWidth: 0}}>
          <Text
            style={{
              fontFamily: fonts.displaySemiBold,
              fontSize: 18,
              lineHeight: 24,
              color: colors.onSurface,
            }}
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: libraryTokens.primary,
                marginTop: 1,
              }}
              numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            flexShrink: 0,
            alignItems: 'flex-end',
            justifyContent: 'center',
            minWidth: 40,
          }}>
          {right}
        </View>
      </View>
    </BlurSurface>
  );
}
