import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useAuthLayout} from './authLayout';
import {AUTH_LAYOUT, authTheme} from './authTheme';

type AuthFormCardProps = {
  children: ReactNode;
};

export function AuthFormCard({children}: AuthFormCardProps) {
  const layout = useAuthLayout();

  return (
    <View
      style={{
        borderRadius: AUTH_LAYOUT.cardRadius,
        borderWidth: 1,
        borderColor: authTheme.border,
        backgroundColor: authTheme.background,
        padding: layout.formPadding,
        marginBottom: 8,
      }}>
      {children}
    </View>
  );
}
