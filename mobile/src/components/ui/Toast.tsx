import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ToastLib, {type ToastConfig} from 'react-native-toast-message';
import {brandColors, elevation, fonts} from '../../config/theme';

type ToastKind = 'success' | 'error' | 'info';

const KIND: Record<
  ToastKind,
  {icon: string; accent: string; iconBg: string}
> = {
  success: {
    icon: 'check-circle',
    accent: brandColors.olive,
    iconBg: brandColors.paleLime,
  },
  error: {
    icon: 'error-outline',
    accent: brandColors.dangerIcon,
    iconBg: brandColors.dangerBg,
  },
  info: {
    icon: 'info-outline',
    accent: brandColors.olive,
    iconBg: brandColors.paleLime,
  },
};

function CardweaveToast({
  type,
  text1,
  text2,
  onPress,
}: {
  type: ToastKind;
  text1?: string;
  text2?: string;
  onPress?: () => void;
}) {
  const meta = KIND[type];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="alert"
      style={styles.wrap}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, {backgroundColor: meta.iconBg}]}>
          <MaterialIcons
            name={meta.icon as 'check-circle'}
            size={20}
            color={meta.accent}
          />
        </View>
        <View style={styles.copy}>
          {text1 ? (
            <Text style={styles.title} numberOfLines={2}>
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text style={styles.message} numberOfLines={3}>
              {text2}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => ToastLib.hide()}
          hitSlop={10}
          accessibilityLabel="Dismiss"
          style={styles.dismiss}>
          <MaterialIcons name="close" size={18} color={brandColors.muted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const toastConfig: ToastConfig = {
  success: ({text1, text2, onPress}) => (
    <CardweaveToast type="success" text1={text1} text2={text2} onPress={onPress} />
  ),
  error: ({text1, text2, onPress}) => (
    <CardweaveToast type="error" text1={text1} text2={text2} onPress={onPress} />
  ),
  info: ({text1, text2, onPress}) => (
    <CardweaveToast type="info" text1={text1} text2={text2} onPress={onPress} />
  ),
};

function ToastHost() {
  const insets = useSafeAreaInsets();
  const topOffset = Math.max(insets.top, Platform.OS === 'android' ? 12 : 0) + 8;

  return <ToastLib config={toastConfig} topOffset={topOffset} visibilityTime={3400} />;
}

export function AppToast() {
  return <ToastHost />;
}

export const toast = {
  success(title: string, message?: string) {
    ToastLib.show({type: 'success', text1: title, text2: message});
  },
  error(title: string, message?: string) {
    ToastLib.show({type: 'error', text1: title, text2: message, visibilityTime: 4200});
  },
  info(title: string, message?: string) {
    ToastLib.show({type: 'info', text1: title, text2: message});
  },
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brandColors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 56,
    ...elevation.tier2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 18,
    color: brandColors.charcoal,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: brandColors.muted,
    marginTop: 2,
  },
  dismiss: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
