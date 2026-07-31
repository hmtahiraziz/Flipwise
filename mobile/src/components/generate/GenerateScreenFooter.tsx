import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {libraryTokens, libraryCardShadow} from '../../config/libraryTokens';

type GenerateScreenFooterProps = {
  onGenerate: () => void;
  generating?: boolean;
  disabled?: boolean;
};

/** Fixed footer — Generate CTA only (tone/quantity live in scroll content). */
export function GenerateScreenFooter({
  onGenerate,
  generating = false,
  disabled = false,
}: GenerateScreenFooterProps) {
  return (
    <View
      style={{
        paddingHorizontal: libraryTokens.containerPadding,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: libraryTokens.background,
      }}>
      <View
        style={{
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}>
        <Pressable
          onPress={onGenerate}
          disabled={disabled || generating}
          accessibilityRole="button"
          accessibilityLabel="Generate cards"
          className="active:opacity-90"
          style={{
            width: '100%',
            minHeight: 56,
            paddingVertical: 16,
            borderRadius: 999,
            backgroundColor: libraryTokens.primaryContainer,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: disabled || generating ? 0.65 : 1,
            ...libraryCardShadow,
            shadowOpacity: 0.14,
            shadowRadius: 18,
            elevation: 5,
          }}>
          {generating ? (
            <ActivityIndicator size="small" color="#161E00" />
          ) : (
            <MaterialIcons name="bolt" size={24} color="#161E00" />
          )}
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 18,
              letterSpacing: 0.1,
              color: '#161E00',
            }}>
            Generate Cards
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
