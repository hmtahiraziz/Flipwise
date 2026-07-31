import type {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {BlurSurface} from '../ui/BlurSurface';

type LibraryTopBarProps = {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
};

export function LibraryTopBar({title, left, right}: LibraryTopBarProps) {
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
        className="flex-row items-center justify-between min-h-[64px]"
        style={{paddingHorizontal: libraryTokens.containerPadding}}>
        <View className="w-10 items-start">{left}</View>
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            lineHeight: 32,
            letterSpacing: -0.24,
            color: libraryTokens.ink,
          }}>
          {title}
        </Text>
        <View className="w-10 items-end">{right}</View>
      </View>
    </BlurSurface>
  );
}

export {LibraryProfileButton, LibrarySettingsButton, LibraryBackButton} from './LibraryHeader';
