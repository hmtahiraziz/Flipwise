import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type CardListFooterProps = {
  onGenerate: () => void;
  onAddManual: () => void;
  compact?: boolean;
};

const BUTTON_HEIGHT = 56;

/** Sticky footer for the deck card list — flex layout, no overlap with list items. */
export function CardListFooter({
  onGenerate,
  onAddManual,
  compact,
}: CardListFooterProps) {
  const generateLabel = compact ? 'Generate' : 'Generate with AI';
  const addLabel = compact ? 'Add card' : 'Add card manually';

  return (
    <View
      style={{
        paddingHorizontal: libraryTokens.containerPadding,
        paddingTop: 12,
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
          onPress={onAddManual}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          className="active:scale-[0.98]"
          style={{
            flex: 1,
            height: BUTTON_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: 12,
            backgroundColor: libraryTokens.surface,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            paddingHorizontal: compact ? 8 : 12,
          }}>
          <MaterialIcons name="add" size={20} color={libraryTokens.muted} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: compact ? 14 : 16,
              color: libraryTokens.muted,
              flexShrink: 1,
            }}>
            {addLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={onGenerate}
          accessibilityRole="button"
          accessibilityLabel={generateLabel}
          className="active:opacity-90"
          style={{
            flex: 1,
            height: BUTTON_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingHorizontal: compact ? 8 : 12,
            borderRadius: 12,
            backgroundColor: libraryTokens.primaryContainer,
            borderBottomWidth: 4,
            borderBottomColor: '#ACD60E',
          }}>
          <MaterialIcons name="auto-awesome" size={20} color={libraryTokens.onPrimaryContainer} />
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
            {generateLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export const CARD_LIST_FOOTER_HEIGHT = BUTTON_HEIGHT + 12 + 8 + 1;
