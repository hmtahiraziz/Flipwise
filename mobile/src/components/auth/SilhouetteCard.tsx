import type {ReactNode} from 'react';
import {View} from 'react-native';
import {useAuthLayout} from './authLayout';
import {AUTH_LAYOUT, authTheme} from './authTheme';

type SilhouetteCardProps = {
  children: ReactNode;
};

export function SilhouetteCard({children}: SilhouetteCardProps) {
  const layout = useAuthLayout();
  const padding = layout.isCompactHeight ? 20 : 32;

  return (
    <View style={{marginBottom: 32, position: 'relative'}}>
      <View
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          right: -4,
          bottom: -4,
          borderRadius: AUTH_LAYOUT.cardRadius,
          backgroundColor: authTheme.silhouette,
          zIndex: 0,
        }}
      />
      <View
        style={{
          borderRadius: AUTH_LAYOUT.cardRadius,
          borderWidth: 1,
          borderColor: authTheme.border,
          backgroundColor: authTheme.background,
          padding,
          zIndex: 1,
        }}>
        {children}
      </View>
    </View>
  );
}
