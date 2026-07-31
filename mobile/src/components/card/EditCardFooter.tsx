import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type EditCardFooterProps = {
  isEditing: boolean;
  saving?: boolean;
  deleting?: boolean;
  onSave: () => void;
  onDelete?: () => void;
  compact?: boolean;
};

const BUTTON_HEIGHT = 56;

/** Edit card footer — Delete + Save matching app design language. */
export function EditCardFooter({
  isEditing,
  saving = false,
  deleting = false,
  onSave,
  onDelete,
  compact,
}: EditCardFooterProps) {
  const busy = saving || deleting;
  const saveLabel = isEditing
    ? compact
      ? 'Save'
      : 'Save changes'
    : compact
      ? 'Add card'
      : 'Add card';

  if (!isEditing) {
    return (
      <View
        style={{
          paddingHorizontal: libraryTokens.containerPadding,
          paddingTop: 16,
          paddingBottom: 8,
          backgroundColor: libraryTokens.background,
          borderTopWidth: 1,
          borderTopColor: libraryTokens.borderSubtle,
        }}>
        <Pressable
          onPress={onSave}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
          className="active:opacity-90"
          style={{
            height: BUTTON_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 12,
            backgroundColor: libraryTokens.primaryContainer,
            borderBottomWidth: 4,
            borderBottomColor: '#ACD60E',
            opacity: busy ? 0.75 : 1,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}>
          {saving ? (
            <ActivityIndicator size="small" color={libraryTokens.onPrimaryContainer} />
          ) : null}
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              color: libraryTokens.onPrimaryContainer,
            }}>
            {saveLabel}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: libraryTokens.containerPadding,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: libraryTokens.background,
        borderTopWidth: 1,
        borderTopColor: libraryTokens.borderSubtle,
      }}>
      <View
        className="flex-row"
        style={{
          gap: libraryTokens.elementGap,
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}>
        <Pressable
          onPress={() => onDelete?.()}
          disabled={busy || !onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete card"
          className="active:scale-[0.98]"
          style={{
            flex: 1,
            height: BUTTON_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: 12,
            backgroundColor: libraryTokens.errorMuted,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.25)',
            opacity: busy ? 0.5 : 1,
          }}>
          {deleting ? (
            <ActivityIndicator size="small" color={libraryTokens.error} />
          ) : (
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: compact ? 14 : 16,
                color: libraryTokens.error,
              }}>
              Delete
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={onSave}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
          className="active:opacity-90"
          style={{
            flex: 1,
            height: BUTTON_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: libraryTokens.primaryContainer,
            borderBottomWidth: 4,
            borderBottomColor: '#ACD60E',
            opacity: busy ? 0.75 : 1,
          }}>
          {saving ? (
            <ActivityIndicator size="small" color={libraryTokens.onPrimaryContainer} />
          ) : null}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: compact ? 14 : 16,
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

export const EDIT_CARD_FOOTER_HEIGHT = BUTTON_HEIGHT + 16 + 8 + 1;
