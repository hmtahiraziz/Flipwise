import type {ReactNode} from 'react';
import {View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {keyboardScrollProps} from '../ui/KeyboardSafeView';
import {AuthAppBar} from './AuthAppBar';
import {authTheme} from './authTheme';
import {useAuthLayout} from './authLayout';

type AuthScreenShellProps = {
  children: ReactNode;
  onBack?: () => void;
};

export function AuthScreenShell({children, onBack}: AuthScreenShellProps) {
  const layout = useAuthLayout();
  const insets = useSafeAreaInsets();

  const topPadding = onBack
    ? layout.isVeryCompactHeight
      ? 8
      : layout.isCompactHeight
        ? 12
        : 16
    : Math.max(insets.top, 8) +
      (layout.isVeryCompactHeight ? 4 : layout.isCompactHeight ? 8 : 12);

  const bottomPadding = Math.max(insets.bottom, layout.isCompactHeight ? 16 : 20);
  const pinContentToTop = layout.isCompactHeight || layout.isLandscape;

  return (
    <View style={{flex: 1, backgroundColor: authTheme.background}}>
      {onBack ? <AuthAppBar onBack={onBack} /> : null}
      <KeyboardAwareScrollView
        style={{flex: 1}}
        bottomOffset={24}
        {...keyboardScrollProps}
        showsVerticalScrollIndicator={false}
        bounces={layout.isCompactHeight}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingHorizontal: layout.containerPadding,
          alignItems: 'center',
          justifyContent: pinContentToTop ? 'flex-start' : 'center',
        }}>
        <View style={{width: '100%', maxWidth: layout.contentMaxWidth}}>{children}</View>
      </KeyboardAwareScrollView>
    </View>
  );
}
