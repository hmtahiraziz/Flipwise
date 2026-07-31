import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {createDeckTokens} from '../../config/createDeckTokens';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type DeckFormFooterProps = {
  label: string;
  saving?: boolean;
  disabled?: boolean;
  onPress: () => void;
  variant?: 'default' | 'create';
};

const BUTTON_HEIGHT = 56;

export function DeckFormFooter({
  label,
  saving = false,
  disabled = false,
  onPress,
  variant = 'default',
}: DeckFormFooterProps) {
  const busy = saving || disabled;
  const isCreate = variant === 'create';

  return (
    <View
      style={{
        paddingHorizontal: libraryTokens.containerPadding,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: isCreate ? createDeckTokens.footerBackground : libraryTokens.background,
        borderTopWidth: 1,
        borderTopColor: libraryTokens.borderSubtle,
      }}>
      <Pressable
        onPress={onPress}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="active:scale-[0.98]"
        style={{
          height: BUTTON_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: isCreate ? 999 : 12,
          backgroundColor: libraryTokens.primaryContainer,
          borderBottomWidth: isCreate ? 0 : 4,
          borderBottomColor: '#ACD60E',
          opacity: busy ? 0.75 : 1,
          maxWidth: libraryTokens.contentMaxWidth,
          width: '100%',
          alignSelf: 'center',
          ...(isCreate
            ? {
                shadowColor: '#000000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
              }
            : {}),
        }}>
        {saving ? (
          <ActivityIndicator
            size="small"
            color={isCreate ? createDeckTokens.buttonText : libraryTokens.onPrimaryContainer}
          />
        ) : null}
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 16,
            fontWeight: isCreate ? '700' : '600',
            color: isCreate ? createDeckTokens.buttonText : libraryTokens.onPrimaryContainer,
          }}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

export const DECK_FORM_FOOTER_HEIGHT = BUTTON_HEIGHT + 16 + 8 + 1;
