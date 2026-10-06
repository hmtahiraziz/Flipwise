import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';

type ReviewSessionHeaderProps = {
  title: string;
  subtitle?: string;
  modeLabel?: string;
  onBack: () => void;
  right?: ReactNode;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  timerLabel?: string;
};

export function ReviewSessionHeader({
  title,
  subtitle,
  modeLabel,
  onBack,
  right,
  bookmarked,
  onToggleBookmark,
  timerLabel,
}: ReviewSessionHeaderProps) {
  const insets = useSafeAreaInsets();
  const useStitchActions =
    onToggleBookmark != null || timerLabel != null;

  return (
    <View style={{paddingTop: insets.top, backgroundColor: libraryTokens.background}}>
      <View
        className="flex-row items-center justify-between"
        style={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 12,
          gap: 8,
        }}>
        <View className="flex-row items-center flex-1" style={{gap: 12, paddingRight: 8}}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Exit study session"
            className="active:opacity-70"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name="close" size={22} color={brandColors.charcoal} />
          </Pressable>
          <View style={{flex: 1}}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 18,
                lineHeight: 22,
                letterSpacing: -0.2,
                color: brandColors.charcoal,
              }}>
              {title}
            </Text>
            {subtitle || modeLabel ? (
              <View className="flex-row items-center" style={{marginTop: 2, gap: 6}}>
                {subtitle ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fonts.bodyMedium,
                      fontSize: 12,
                      color: reviewTokens.muted,
                    }}>
                    {subtitle}
                  </Text>
                ) : null}
                {subtitle && modeLabel ? (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(112,117,125,0.5)',
                    }}
                  />
                ) : null}
                {modeLabel ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 12,
                      color: brandColors.olive,
                    }}>
                    {modeLabel}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {useStitchActions ? (
          <View className="flex-row items-center" style={{gap: 4}}>
            {onToggleBookmark ? (
              <Pressable
                onPress={onToggleBookmark}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark card'}
                className="active:opacity-80"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bookmarked ? brandColors.paleLime : 'transparent',
                }}>
                <MaterialIcons
                  name={bookmarked ? 'bookmark' : 'bookmark-border'}
                  size={18}
                  color={bookmarked ? brandColors.olive : brandColors.charcoal}
                />
              </Pressable>
            ) : null}
            {timerLabel ? (
              <View
                className="flex-row items-center"
                style={{
                  marginLeft: 4,
                  backgroundColor: reviewTokens.timerBg,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  gap: 4,
                }}>
                <MaterialIcons name="schedule" size={12} color={reviewTokens.muted} />
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 11,
                    color: brandColors.charcoal,
                    fontVariant: ['tabular-nums'],
                  }}>
                  {timerLabel}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="flex-row items-center" style={{gap: 2}}>
            {right}
          </View>
        )}
      </View>
    </View>
  );
}
