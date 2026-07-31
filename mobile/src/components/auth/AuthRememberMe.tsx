import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {useAuthLayout} from './authLayout';
import {authTheme} from './authTheme';

type AuthRememberMeProps = {
  checked: boolean;
  onToggle: () => void;
};

export function AuthRememberMe({checked, onToggle}: AuthRememberMeProps) {
  const layout = useAuthLayout();

  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 2,
        marginBottom: layout.fieldGap,
      }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: authTheme.border,
          backgroundColor: checked ? authTheme.primaryContainer : authTheme.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked ? (
          <MaterialIcons name="check" size={14} color={authTheme.onSurface} />
        ) : null}
      </View>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: layout.bodySize - 1,
          lineHeight: Math.round((layout.bodySize - 1) * 1.4),
          color: authTheme.muted,
        }}>
        Remember Me
      </Text>
    </Pressable>
  );
}
