import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fonts} from '../../config/theme';
import {authTheme} from './authTheme';
import {useAuthLayout} from './authLayout';

type AuthAppBarProps = {
  onBack?: () => void;
  showBack?: boolean;
};

export function AuthAppBar({onBack, showBack = true}: AuthAppBarProps) {
  const insets = useSafeAreaInsets();
  const layout = useAuthLayout();

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: layout.containerPadding,
        height: insets.top + 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: authTheme.surfaceVariant,
        backgroundColor: authTheme.background,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        {showBack && onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={{padding: 2}}>
            <MaterialIcons name="arrow-back" size={24} color={authTheme.primary} />
          </Pressable>
        ) : null}
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            lineHeight: 32,
            letterSpacing: -0.24,
            color: authTheme.primary,
          }}>
          Flipwise
        </Text>
      </View>

      <MaterialIcons name="account-circle" size={28} color={authTheme.onSurfaceVariant} />
    </View>
  );
}
