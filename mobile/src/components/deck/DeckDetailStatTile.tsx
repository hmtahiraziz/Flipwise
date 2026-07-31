import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {deckDetailTokens} from '../../config/deckDetailTokens';

type DeckDetailStatTileProps = {
  icon: string;
  value: string | number;
  label: string;
};

export function DeckDetailStatTile({icon, value, label}: DeckDetailStatTileProps) {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: deckDetailTokens.surfaceWarm,
        borderRadius: deckDetailTokens.cardRadius,
        borderWidth: 1,
        borderColor: deckDetailTokens.border,
        paddingVertical: 16,
        paddingHorizontal: 8,
        minHeight: 108,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}>
      <MaterialIcons name={icon} size={20} color={deckDetailTokens.mutedText} />
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 24,
          lineHeight: 32,
          fontWeight: '700',
          color: deckDetailTokens.ink,
          marginTop: 8,
        }}>
        {value}
      </Text>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 10,
          lineHeight: 13,
          letterSpacing: 0.2,
          textTransform: 'uppercase',
          color: deckDetailTokens.mutedText,
          marginTop: 4,
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </View>
  );
}
