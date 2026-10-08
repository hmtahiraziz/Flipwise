import {ActivityIndicator, Pressable, Text, View} from 'react-native';
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
};

export function GenerateScreenFooter({
  onGenerate,
  onCancel,
  generating = false,
  disabled = false,
  cardCount = 10,
  generateLabel,
}: GenerateScreenFooterProps) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.95)',
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
        {onCancel ? (
          <Pressable
            onPress={onCancel}
            disabled={generating}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            className="active:opacity-80"
            style={{
              height: 48,
              paddingHorizontal: 20,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              backgroundColor: libraryTokens.background,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: generating ? 0.5 : 1,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 12,
                color: brandColors.charcoal,
              }}>
              Cancel
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onGenerate}
          disabled={disabled || generating}
          accessibilityRole="button"
          accessibilityLabel={`Generate ${cardCount} cards`}
          className="active:opacity-90 flex-row items-center justify-center"
          style={{
            flex: 1,
            height: 48,
            borderRadius: 999,
            backgroundColor: brandColors.lime,
            gap: 8,
            opacity: disabled || generating ? 0.65 : 1,
          }}>
          {generating ? (
            <ActivityIndicator size="small" color={brandColors.charcoal} />
          ) : (
            <MaterialIcons name="auto-awesome" size={16} color={brandColors.charcoal} />
          )}
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 14,
              color: brandColors.charcoal,
            }}>
            {generateLabel ?? `Generate ${cardCount} Cards`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
