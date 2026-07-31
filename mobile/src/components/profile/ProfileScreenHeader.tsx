import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {BlurSurface} from '../ui/BlurSurface';

type ProfileScreenHeaderProps = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
};

/** Settings / profile app bar — title left in primary, optional avatar right. */
export function ProfileScreenHeader({title, onBack, right}: ProfileScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurSurface
      fallbackOpacity={0.98}
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: libraryTokens.border,
        backgroundColor: 'rgba(245, 246, 243, 0.96)',
      }}>
      <View
        className="flex-row items-center justify-between"
        style={{
          minHeight: 64,
          paddingHorizontal: libraryTokens.containerPadding,
        }}>
        <View className="flex-row items-center flex-1 min-w-0">
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="active:opacity-70"
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -8,
            }}>
            <MaterialIcons name="arrow-back" size={24} color={libraryTokens.primary} />
          </Pressable>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 24,
              lineHeight: 32,
              letterSpacing: -0.24,
              fontWeight: '700',
              color: libraryTokens.primary,
              marginLeft: 4,
            }}
            numberOfLines={1}>
            {title}
          </Text>
        </View>

        {right ? (
          <View className="shrink-0 items-center justify-center" style={{width: 40, marginLeft: 12}}>
            {right}
          </View>
        ) : null}
      </View>
    </BlurSurface>
  );
}
