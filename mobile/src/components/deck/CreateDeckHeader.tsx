import type {ReactNode} from 'react';
import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {createDeckTokens} from '../../config/createDeckTokens';
import {libraryTokens} from '../../config/libraryTokens';
import {fonts} from '../../config/theme';
import {BlurSurface} from '../ui/BlurSurface';

type CreateDeckHeaderProps = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
};

/** Centered-title app bar — matches New Deck HTML mock. */
export function CreateDeckHeader({title, onBack, right}: CreateDeckHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurSurface
      fallbackOpacity={0.8}
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: libraryTokens.border,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      }}>
      <View
        className="flex-row items-center"
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
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialIcons name="arrow-back" size={24} color={createDeckTokens.ink} />
        </Pressable>

        <Text
          style={{
            flex: 1,
            fontFamily: fonts.display,
            fontSize: 18,
            lineHeight: 24,
            fontWeight: '700',
            color: createDeckTokens.ink,
            textAlign: 'center',
          }}
          numberOfLines={1}>
          {title}
        </Text>

        <View
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {right}
        </View>
      </View>
    </BlurSurface>
  );
}
