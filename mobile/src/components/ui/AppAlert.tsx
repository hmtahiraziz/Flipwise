import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {
  ActionSheetIOS,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {brandColors, elevation, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

export type AppAlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type AppAlertOptions = {
  cancelable?: boolean;
  onDismiss?: () => void;
};

type AlertRequest = {
  kind: 'alert';
  title: string;
  message?: string;
  buttons: AppAlertButton[];
  options?: AppAlertOptions;
};

type SheetRequest = {
  kind: 'sheet';
  title?: string;
  message?: string;
  options: string[];
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number | number[];
  onPress: (index: number) => void;
};

type DialogRequest = AlertRequest | SheetRequest;

type Listener = (request: DialogRequest | null) => void;

let listener: Listener | null = null;
let pending: DialogRequest | null = null;

function publish(request: DialogRequest | null) {
  pending = request;
  listener?.(request);
}

function normalizeButtons(buttons?: AppAlertButton[]): AppAlertButton[] {
  if (!buttons?.length) {
    return [{text: 'OK', style: 'default'}];
  }
  return buttons;
}

/** Themed replacement for React Native `Alert.alert`. */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: AppAlertOptions,
): void {
  publish({
    kind: 'alert',
    title,
    message,
    buttons: normalizeButtons(buttons),
    options,
  });
}

type ShowAppActionSheetParams = {
  title?: string;
  message?: string;
  options: string[];
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number | number[];
  onPress: (index: number) => void;
};

/**
 * iOS: native ActionSheet.
 * Android: themed bottom sheet matching Cardweave.
 */
export function showAppActionSheet(params: ShowAppActionSheetParams): void {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: params.title,
        message: params.message,
        options: params.options,
        cancelButtonIndex: params.cancelButtonIndex,
        destructiveButtonIndex: params.destructiveButtonIndex,
      },
      params.onPress,
    );
    return;
  }

  publish({
    kind: 'sheet',
    title: params.title,
    message: params.message,
    options: params.options,
    cancelButtonIndex: params.cancelButtonIndex,
    destructiveButtonIndex: params.destructiveButtonIndex,
    onPress: params.onPress,
  });
}

function isDestructiveIndex(
  index: number,
  destructive?: number | number[],
): boolean {
  if (destructive == null) return false;
  if (typeof destructive === 'number') return destructive === index;
  return destructive.includes(index);
}

function AlertDialog({
  request,
  onClose,
}: {
  request: AlertRequest;
  onClose: () => void;
}) {
  const cancelable = request.options?.cancelable !== false;
  const buttons = request.buttons;

  const dismiss = useCallback(() => {
    onClose();
    request.options?.onDismiss?.();
  }, [onClose, request.options]);

  const runButton = (button: AppAlertButton) => {
    onClose();
    // Defer so nested appAlert / sheets can open after this modal unmounts.
    const press = button.onPress;
    if (press) {
      setTimeout(press, 0);
    }
  };

  const cancelBtn = buttons.find(b => b.style === 'cancel');
  const others = buttons.filter(b => b.style !== 'cancel');
  // Put cancel last visually (iOS-like), primary/destructive first among actions.
  const ordered = [...others, ...(cancelBtn ? [cancelBtn] : [])];

  return (
    <Pressable
      style={styles.backdrop}
      onPress={cancelable ? dismiss : undefined}
      accessibilityRole="button"
      accessibilityLabel="Dismiss">
      <Pressable
        style={styles.alertCard}
        onPress={e => e.stopPropagation()}
        accessibilityRole="none">
        <Text style={styles.alertTitle}>{request.title}</Text>
        {request.message ? (
          <Text style={styles.alertMessage}>{request.message}</Text>
        ) : null}
        <View style={styles.alertActions}>
          {ordered.map((button, index) => {
            const isCancel = button.style === 'cancel';
            const isDestructive = button.style === 'destructive';
            const isPrimary = !isCancel && !isDestructive && index === 0;
            return (
              <Pressable
                key={`${button.text}-${index}`}
                onPress={() => runButton(button)}
                accessibilityRole="button"
                accessibilityLabel={button.text}
                style={[
                  styles.alertBtn,
                  isPrimary && styles.alertBtnPrimary,
                  isDestructive && styles.alertBtnDestructive,
                  isCancel && styles.alertBtnCancel,
                ]}>
                <Text
                  style={[
                    styles.alertBtnLabel,
                    isPrimary && styles.alertBtnLabelPrimary,
                    isDestructive && styles.alertBtnLabelDestructive,
                    isCancel && styles.alertBtnLabelCancel,
                  ]}>
                  {button.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Pressable>
  );
}

function SheetDialog({
  request,
  onClose,
}: {
  request: SheetRequest;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  const pick = (index: number) => {
    onClose();
    const press = request.onPress;
    setTimeout(() => press(index), 0);
  };

  const dismiss = () => {
    onClose();
    if (request.cancelButtonIndex != null) {
      request.onPress(request.cancelButtonIndex);
    }
  };

  return (
    <Pressable
      style={styles.sheetBackdrop}
      onPress={dismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss">
      <Pressable
        style={[styles.sheetCard, {paddingBottom: Math.max(insets.bottom, 12)}]}
        onPress={e => e.stopPropagation()}
        accessibilityRole="none">
        {request.title ? (
          <Text style={styles.sheetTitle}>{request.title}</Text>
        ) : null}
        {request.message ? (
          <Text style={styles.sheetMessage}>{request.message}</Text>
        ) : null}
        <View style={styles.sheetOptions}>
          {request.options.map((label, index) => {
            const isCancel = index === request.cancelButtonIndex;
            const isDestructive = isDestructiveIndex(
              index,
              request.destructiveButtonIndex,
            );
            return (
              <Pressable
                key={`${label}-${index}`}
                onPress={() => pick(index)}
                accessibilityRole="button"
                accessibilityLabel={label}
                style={[
                  styles.sheetOption,
                  isCancel && styles.sheetOptionCancel,
                ]}>
                <Text
                  style={[
                    styles.sheetOptionLabel,
                    isDestructive && styles.sheetOptionDestructive,
                    isCancel && styles.sheetOptionCancelLabel,
                  ]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Pressable>
  );
}

/** Mount once under providers (next to AppToast). */
export function AppAlertHost() {
  const [request, setRequest] = useState<DialogRequest | null>(pending);
  const openRef = useRef(request);

  useEffect(() => {
    listener = next => {
      openRef.current = next;
      setRequest(next);
    };
    if (pending) {
      setRequest(pending);
    }
    return () => {
      listener = null;
    };
  }, []);

  const onClose = useCallback(() => {
    publish(null);
  }, []);

  return (
    <Modal
      visible={request != null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!request) return;
        if (request.kind === 'alert') {
          if (request.options?.cancelable === false) return;
          onClose();
          request.options?.onDismiss?.();
          return;
        }
        onClose();
        if (request.cancelButtonIndex != null) {
          request.onPress(request.cancelButtonIndex);
        }
      }}>
      {request?.kind === 'alert' ? (
        <AlertDialog request={request} onClose={onClose} />
      ) : null}
      {request?.kind === 'sheet' ? (
        <SheetDialog request={request} onClose={onClose} />
      ) : null}
    </Modal>
  );
}

/** Promise helper for confirm-style alerts (e.g. AI consent). */
export function appConfirm(params: {
  title: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  destructive?: boolean;
}): Promise<boolean> {
  return new Promise(resolve => {
    appAlert(params.title, params.message, [
      {
        text: params.cancelLabel ?? 'Cancel',
        style: 'cancel',
        onPress: () => resolve(false),
      },
      {
        text: params.confirmLabel ?? 'OK',
        style: params.destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ], {
      cancelable: true,
      onDismiss: () => resolve(false),
    });
  });
}

export function AppAlertProvider({children}: {children: ReactNode}) {
  return (
    <>
      {children}
      <AppAlertHost />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 26, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 26, 0.45)',
    justifyContent: 'flex-end',
  },
  alertCard: {
    backgroundColor: brandColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brandColors.border,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    ...elevation.tier2,
  },
  alertTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: brandColors.charcoal,
    marginBottom: 8,
  },
  alertMessage: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brandColors.muted,
    marginBottom: 18,
  },
  alertActions: {
    gap: 8,
  },
  alertBtn: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: libraryTokens.surfaceContainerLow,
  },
  alertBtnPrimary: {
    backgroundColor: brandColors.lime,
    borderWidth: 1,
    borderColor: 'rgba(25, 28, 26, 0.08)',
  },
  alertBtnDestructive: {
    backgroundColor: brandColors.dangerBg,
  },
  alertBtnCancel: {
    backgroundColor: brandColors.surface,
    borderWidth: 1.5,
    borderColor: brandColors.border,
  },
  alertBtnLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brandColors.charcoal,
  },
  alertBtnLabelPrimary: {
    color: brandColors.charcoal,
  },
  alertBtnLabelDestructive: {
    color: brandColors.dangerIcon,
  },
  alertBtnLabelCancel: {
    color: brandColors.charcoal,
  },
  sheetCard: {
    backgroundColor: brandColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: brandColors.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    ...elevation.tier2,
  },
  sheetTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 24,
    color: brandColors.charcoal,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  sheetMessage: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: brandColors.muted,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  sheetOptions: {
    gap: 6,
  },
  sheetOption: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: libraryTokens.surfaceContainerLow,
    paddingHorizontal: 16,
  },
  sheetOptionCancel: {
    backgroundColor: brandColors.surface,
    borderWidth: 1.5,
    borderColor: brandColors.border,
    marginTop: 6,
  },
  sheetOptionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: brandColors.charcoal,
  },
  sheetOptionDestructive: {
    color: brandColors.dangerIcon,
  },
  sheetOptionCancelLabel: {
    fontFamily: fonts.bodyBold,
  },
});
