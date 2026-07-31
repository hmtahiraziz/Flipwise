import {Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {useAuthLayout} from './authLayout';
import {authTheme} from './authTheme';

type AuthDividerProps = {
  compact?: boolean;
};

export function AuthDivider({compact}: AuthDividerProps) {
  const layout = useAuthLayout();
  const marginVertical = compact ? layout.dividerGap * 0.6 : layout.dividerGap;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical,
        gap: 12,
        width: '100%',
      }}>
      <View style={{flex: 1, height: 1, backgroundColor: authTheme.surfaceVariant}} />
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 11,
          lineHeight: 16,
          letterSpacing: 0.8,
          color: authTheme.muted,
          textTransform: 'uppercase',
        }}>
        OR
      </Text>
      <View style={{flex: 1, height: 1, backgroundColor: authTheme.surfaceVariant}} />
    </View>
  );
}
