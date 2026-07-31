import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useState} from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {useAuthLayout} from './authLayout';
import {authTheme} from './authTheme';

type AuthPrimaryButtonProps = {
  label: string;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function AuthPrimaryButton({
  label,
  icon = 'arrow-forward',
  loading = false,
  disabled = false,
  onPress,
}: AuthPrimaryButtonProps) {
  const [pressed, setPressed] = useState(false);
  const layout = useAuthLayout();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{width: '100%', opacity: disabled ? 0.5 : 1, marginTop: 4}}>
      <View
        style={{
          height: layout.buttonHeight,
          borderRadius: layout.inputRadius,
          backgroundColor: authTheme.primaryContainer,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transform: [{scale: pressed ? 0.98 : 1}],
        }}>
        {loading ? (
          <ActivityIndicator size="small" color={authTheme.onSurface} />
        ) : (
          <>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: layout.bodySize,
                lineHeight: Math.round(layout.bodySize * 1.5),
                color: authTheme.onSurface,
              }}>
              {label}
            </Text>
            <MaterialIcons name={icon} size={22} color={authTheme.onSurface} />
          </>
        )}
      </View>
    </Pressable>
  );
}
