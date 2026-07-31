import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type GenerateReviewFooterProps = {
  deckTitle?: string;
  cardCount: number;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
  compact?: boolean;
};

/** Fixed footer — Discard + Save row matching HTML mockup (h-14, rounded-xl). */
export function GenerateReviewFooter({
  deckTitle,
  cardCount,
  saving = false,
  onSave,
  onDiscard,
  compact,
}: GenerateReviewFooterProps) {
  const deckName = deckTitle?.trim() || 'deck';
  const saveLabel = compact ? `Save (${cardCount})` : `Save to ${deckName}`;

  return (
    <View
      style={{
        paddingHorizontal: libraryTokens.containerPadding,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: libraryTokens.background,
      }}>
      <View
        className="flex-row"
        style={{
          gap: 12,
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}>
        <Pressable
          onPress={onDiscard}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Discard all cards"
          className="active:scale-[0.98]"
          style={{
            flex: 1,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            backgroundColor: libraryTokens.surface,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            opacity: saving ? 0.5 : 1,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              color: libraryTokens.muted,
            }}>
            Discard
          </Text>
        </Pressable>

        <Pressable
          onPress={onSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
          className="active:opacity-90"
          style={{
            flex: 1,
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: libraryTokens.primaryContainer,
            borderBottomWidth: 4,
            borderBottomColor: '#ACD60E',
            opacity: saving ? 0.75 : 1,
          }}>
          {saving ? (
            <ActivityIndicator size="small" color={libraryTokens.onPrimaryContainer} />
          ) : null}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              color: libraryTokens.onPrimaryContainer,
              flexShrink: 1,
            }}>
            {saveLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
