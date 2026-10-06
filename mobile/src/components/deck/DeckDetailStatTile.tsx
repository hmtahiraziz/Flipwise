import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {deckDetailTokens} from '../../config/deckDetailTokens';

type DeckDetailStatTileProps = {
  icon: string;
  value: string | number;
  label: string;
  accent?: boolean;
};

export function DeckDetailStatTile({
  icon,
  value,
  label,
  accent,
}: DeckDetailStatTileProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: accent
          ? deckDetailTokens.brandMuted
          : deckDetailTokens.surfaceContainer,
        borderRadius: deckDetailTokens.cardRadius,
        borderWidth: 1,
        borderColor: deckDetailTokens.borderSubtle,
        paddingVertical: 14,
        paddingHorizontal: 6,
        minHeight: 100,
        gap: 4,
      }}>
      <MaterialIcons
        name={icon}
        size={18}
        color={accent ? deckDetailTokens.primary : deckDetailTokens.mutedText}
      />
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 22,
          lineHeight: 28,
          fontWeight: '800',
          color: deckDetailTokens.ink,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {value}
      </Text>
      <Text
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: 10,
          lineHeight: 13,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          color: deckDetailTokens.mutedText,
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </View>
  );
}
