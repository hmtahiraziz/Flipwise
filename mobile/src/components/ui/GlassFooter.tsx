import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../config/theme';
import {BlurSurface} from './BlurSurface';

type GlassFooterProps = {
  children: ReactNode;
  bordered?: boolean;
  padded?: boolean;
};

export function GlassFooter({children, bordered = true, padded = true}: GlassFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurSurface
      style={{
        borderTopWidth: bordered ? 1 : 0,
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 12),
      }}>
      <View className={padded ? 'px-5 pt-3' : undefined}>{children}</View>
    </BlurSurface>
  );
}

type GlassFooterSpacerProps = {
  extra?: number;
};

export function GlassFooterSpacer({extra = 88}: GlassFooterSpacerProps) {
  const insets = useSafeAreaInsets();
  return <View style={{height: Math.max(insets.bottom, 12) + extra}} />;
}
