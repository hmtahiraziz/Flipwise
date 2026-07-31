import ToastLib, {
  BaseToast,
  ErrorToast,
  type ToastConfig,
} from 'react-native-toast-message';
import {colors, fonts} from '../../config/theme';

const toastConfig: ToastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.success,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 4,
        borderRadius: 12,
        height: 'auto',
        minHeight: 56,
        paddingVertical: 8,
      }}
      contentContainerStyle={{paddingHorizontal: 16}}
      text1Style={{
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.text,
      }}
      text2Style={{
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.muted,
      }}
      text2NumberOfLines={3}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: colors.danger,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 4,
        borderRadius: 12,
        height: 'auto',
        minHeight: 56,
        paddingVertical: 8,
      }}
      contentContainerStyle={{paddingHorizontal: 16}}
      text1Style={{
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.text,
      }}
      text2Style={{
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.muted,
      }}
      text2NumberOfLines={3}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.primary,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 4,
        borderRadius: 12,
        height: 'auto',
        minHeight: 56,
        paddingVertical: 8,
      }}
      contentContainerStyle={{paddingHorizontal: 16}}
      text1Style={{
        fontFamily: fonts.bodySemiBold,
        fontSize: 15,
        color: colors.text,
      }}
      text2Style={{
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.muted,
      }}
      text2NumberOfLines={3}
    />
  ),
};

export function AppToast() {
  return <ToastLib config={toastConfig} topOffset={56} />;
}

export const toast = {
  success(title: string, message?: string) {
    ToastLib.show({type: 'success', text1: title, text2: message});
  },
  error(title: string, message?: string) {
    ToastLib.show({type: 'error', text1: title, text2: message});
  },
  info(title: string, message?: string) {
    ToastLib.show({type: 'info', text1: title, text2: message});
  },
};
