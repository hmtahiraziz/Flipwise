import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type EditCardFooterProps = {
  isEditing: boolean;
  saving?: boolean;
  deleting?: boolean;
  onSave: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  compact?: boolean;
};

const BUTTON_HEIGHT = 52;

/** Stitch Edit Card footer — Cancel + Save Card. */
export function EditCardFooter({
  isEditing,
  saving = false,
  deleting = false,
  onSave,
  onCancel,
  onDelete: _onDelete,
  compact,
}: EditCardFooterProps) {
  const busy = saving || deleting;
  const saveLabel = isEditing
    ? compact
      ? 'Save'
      : 'Save Card'
    : compact
      ? 'Add'
      : 'Save Card';

  return (
    <View
      style={{
        paddingHorizontal: libraryTokens.containerPadding,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: 'rgba(249, 250, 246, 0.92)',
        borderTopWidth: 1,
        borderTopColor: libraryTokens.borderSubtle,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}>
        <Pressable
          onPress={onCancel}
          disabled={busy || !onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          className="active:opacity-90"
          style={{
            flex: 1,
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            backgroundColor: libraryTokens.surface,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            opacity: busy ? 0.6 : 1,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 14,
              color: libraryTokens.ink,
            }}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={onSave}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
          className="active:opacity-95"
          style={{
            flex: 2,
            minHeight: BUTTON_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 999,
            backgroundColor: libraryTokens.primaryContainer,
            opacity: busy ? 0.75 : 1,
          }}>
          {saving ? (
            <ActivityIndicator
              size="small"
              color={libraryTokens.onPrimaryContainer}
            />
          ) : (
            <MaterialIcons
              name="check"
              size={20}
              color={libraryTokens.onPrimaryContainer}
            />
          )}
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 14,
              color: libraryTokens.onPrimaryContainer,
            }}>
            {saveLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export const EDIT_CARD_FOOTER_HEIGHT = BUTTON_HEIGHT + 12 + 8 + 1;
