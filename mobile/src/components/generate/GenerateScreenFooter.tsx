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

type GenerateScreenFooterProps = {
  onGenerate: () => void;
  onCancel?: () => void;
  generating?: boolean;
  disabled?: boolean;
  cardCount?: number;
  generateLabel?: string;
  aiConsentAccepted?: boolean;
  onToggleAiConsent?: () => void;
};

export function GenerateScreenFooter({
  onGenerate,
  onCancel,
  generating = false,
  disabled = false,
  cardCount = 10,
  generateLabel,
  aiConsentAccepted = false,
  onToggleAiConsent,
}: GenerateScreenFooterProps) {
  const generateDisabled = disabled || generating;

  return (
    <View style={styles.shell}>
      {onToggleAiConsent ? (
        <Pressable
          onPress={onToggleAiConsent}
          accessibilityRole="checkbox"
          accessibilityState={{checked: aiConsentAccepted}}
          accessibilityLabel="Agree to send content to AI for card generation"
          style={styles.consentRow}>
          <View
            style={[
              styles.checkbox,
              aiConsentAccepted ? styles.checkboxOn : null,
            ]}>
            {aiConsentAccepted ? (
              <MaterialIcons name="check" size={16} color={brandColors.charcoal} />
            ) : null}
          </View>
          <Text style={styles.consentText}>
            I agree that Cardweave may send this topic/notes/scan to our AI
            provider to generate flashcards. Do not submit secrets or sensitive
            personal data.
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        {onCancel ? (
          <Pressable
            onPress={onCancel}
            disabled={generating}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={[styles.cancelBtn, generating ? styles.btnDisabled : null]}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onGenerate}
          disabled={generateDisabled}
          accessibilityRole="button"
          accessibilityLabel={generateLabel ?? `Generate ${cardCount} cards`}
          style={[
            styles.generateBtn,
            generateDisabled ? styles.btnDisabled : null,
          ]}>
          <View style={styles.generateInner}>
            {generating ? (
              <ActivityIndicator size="small" color={brandColors.charcoal} />
            ) : (
              <MaterialIcons
                name="auto-awesome"
                size={18}
                color={brandColors.charcoal}
              />
            )}
            <Text style={styles.generateLabel} numberOfLines={1}>
              {generateLabel ?? `Generate ${cardCount} Cards`}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: brandColors.surface,
  },
  consentRow: {
    maxWidth: libraryTokens.contentMaxWidthWide,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: libraryTokens.border,
    backgroundColor: libraryTokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 10,
  },
  checkboxOn: {
    borderColor: brandColors.lime,
    backgroundColor: brandColors.lime,
  },
  consentText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    color: libraryTokens.muted,
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
  generateBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: brandColors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  generateInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brandColors.charcoal,
    marginLeft: 8,
  },
  btnDisabled: {
    opacity: 0.55,
  },
});
