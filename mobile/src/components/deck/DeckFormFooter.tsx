import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type DeckFormFooterProps = {
  label: string;
  saving?: boolean;
  disabled?: boolean;
  onPress: () => void;
  onCancel?: () => void;
  showSaveIcon?: boolean;
};

/** Flat Cancel + Save — same pattern as EditCardFooter (no border/shadow). */
export function DeckFormFooter({
  label,
  saving = false,
  disabled = false,
  onPress,
  onCancel,
  showSaveIcon = true,
}: DeckFormFooterProps) {
  const busy = saving || disabled;

  return (
    <View style={styles.shell}>
      <View style={styles.actions}>
        {onCancel ? (
          <Pressable
            onPress={onCancel}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={[styles.cancelBtn, busy ? styles.btnDisabled : null]}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onPress}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[styles.saveBtn, busy ? styles.btnDisabled : null]}>
          <View style={styles.saveInner}>
            {saving ? (
              <ActivityIndicator size="small" color={brandColors.charcoal} />
            ) : showSaveIcon ? (
              <MaterialIcons
                name="check"
                size={18}
                color={brandColors.charcoal}
              />
            ) : null}
            <Text
              style={[
                styles.saveLabel,
                !showSaveIcon && !saving ? styles.saveLabelSolo : null,
              ]}
              numberOfLines={1}>
              {label}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export const DECK_FORM_FOOTER_HEIGHT = 52 + 12 + 10;

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: brandColors.surface,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    maxWidth: libraryTokens.contentMaxWidthWide,
    width: '100%',
    alignSelf: 'center',
  },
  cancelBtn: {
    width: 108,
    height: 52,
    borderRadius: 999,
    backgroundColor: libraryTokens.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cancelLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brandColors.charcoal,
  },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: brandColors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  saveInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brandColors.charcoal,
    marginLeft: 8,
  },
  saveLabelSolo: {
    marginLeft: 0,
  },
  btnDisabled: {
    opacity: 0.55,
  },
});
