import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type GenerateReviewFooterProps = {
  deckTitle?: string;
  cardCount: number;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
  compact?: boolean;
};

export function GenerateReviewFooter({
  cardCount,
  saving = false,
  onSave,
  onDiscard,
}: GenerateReviewFooterProps) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: brandColors.surface,
        borderTopWidth: 1,
        borderTopColor: libraryTokens.border,
      }}>
      <View
        className="flex-row items-center"
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
          className="active:opacity-90"
          style={{
            flex: 1,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            backgroundColor: brandColors.surface,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            opacity: saving ? 0.5 : 1,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 14,
              color: brandColors.charcoal,
            }}>
            Discard
          </Text>
        </Pressable>

        <Pressable
          onPress={onSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={`Save ${cardCount} cards`}
          className="active:opacity-90 flex-row items-center justify-center"
          style={{
            flex: 1.6,
            height: 48,
            borderRadius: 999,
            backgroundColor: brandColors.lime,
            gap: 6,
            opacity: saving ? 0.75 : 1,
          }}>
          {saving ? (
            <ActivityIndicator size="small" color={brandColors.charcoal} />
          ) : null}
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 14,
              color: brandColors.charcoal,
            }}>
            Save ({cardCount} Cards)
          </Text>
          <MaterialIcons name="arrow-forward" size={16} color={brandColors.charcoal} />
        </Pressable>
      </View>
    </View>
  );
}
