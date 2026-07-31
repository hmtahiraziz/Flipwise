import type {ReactNode} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {authTheme} from './authTheme';
import {useAuthLayout} from './authLayout';

type AuthScreenShellProps = {
  children: ReactNode;
};

export function AuthScreenShell({children}: AuthScreenShellProps) {
  const layout = useAuthLayout();
  const insets = useSafeAreaInsets();

  const topPadding =
    Math.max(insets.top, 8) + (layout.isVeryCompactHeight ? 4 : layout.isCompactHeight ? 8 : 12);
  const bottomPadding = Math.max(insets.bottom, layout.isCompactHeight ? 16 : 20);

  return (
    <View style={{flex: 1, backgroundColor: authTheme.background}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={layout.isCompactHeight}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
            paddingHorizontal: layout.containerPadding,
            alignItems: 'center',
            justifyContent:
              layout.isCompactHeight || layout.isLandscape ? 'flex-start' : 'center',
          }}>
          <View style={{width: '100%', maxWidth: layout.contentMaxWidth}}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
