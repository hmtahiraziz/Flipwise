import type {ReactNode} from 'react';
import {useState} from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {useAuthLayout} from './authLayout';
import {authTheme} from './authTheme';

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
  leftIcon?: string;
  labelRight?: ReactNode;
  compactBottom?: boolean;
};

export function AuthField({
  label,
  error,
  leftIcon,
  labelRight,
  compactBottom,
  secureTextEntry,
  ...props
}: AuthFieldProps) {
  const layout = useAuthLayout();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  const borderColor = error
    ? authTheme.error
    : focused
      ? authTheme.primaryContainer
      : authTheme.border;
  const borderWidth = focused && !error ? 2 : 1;
  const leftPadding = leftIcon ? 44 : 16;

  return (
    <View style={{marginBottom: compactBottom ? 0 : layout.fieldGap}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
          paddingHorizontal: 2,
          minHeight: 18,
        }}>
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 11,
            lineHeight: 16,
            letterSpacing: 0.8,
            color: authTheme.onSurfaceVariant,
            textTransform: 'uppercase',
          }}>
          {label}
        </Text>
        {labelRight}
      </View>
      <View style={{position: 'relative'}}>
        {leftIcon ? (
          <View
            style={{
              position: 'absolute',
              left: 14,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              zIndex: 1,
            }}>
            <MaterialIcons name={leftIcon} size={20} color={authTheme.muted} />
          </View>
        ) : null}
        <TextInput
          {...props}
          secureTextEntry={hidden}
          placeholderTextColor={authTheme.muted}
          onFocus={e => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            height: layout.inputHeight,
            borderRadius: layout.inputRadius,
            borderWidth,
            borderColor,
            backgroundColor: authTheme.surfaceContainerLow,
            paddingLeft: leftPadding,
            paddingRight: secureTextEntry ? 48 : 16,
            fontFamily: fonts.body,
            fontSize: layout.bodySize,
            lineHeight: Math.round(layout.bodySize * 1.5),
            color: authTheme.onSurface,
          }}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden(current => !current)}
            hitSlop={8}
            style={{
              position: 'absolute',
              right: 14,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}>
            <MaterialIcons
              name={hidden ? 'visibility' : 'visibility-off'}
              size={22}
              color={authTheme.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: authTheme.error,
            marginTop: 6,
            marginLeft: 2,
          }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
