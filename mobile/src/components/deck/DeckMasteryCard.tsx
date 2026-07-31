import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {deckDetailTokens} from '../../config/deckDetailTokens';

type DeckMasteryCardProps = {
  masteryPercent: number;
  totalCards: number;
};

export function DeckMasteryCard({masteryPercent, totalCards}: DeckMasteryCardProps) {
  const clamped = Math.min(100, Math.max(0, masteryPercent));

  return (
    <View style={{gap: 24}}>
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 20,
          lineHeight: 28,
          fontWeight: '800',
          color: deckDetailTokens.ink,
        }}>
        Mastery Progress
      </Text>

      <View
        style={{
          backgroundColor: deckDetailTokens.surfaceContainer,
          borderRadius: deckDetailTokens.cardRadius,
          borderWidth: 1,
          borderColor: deckDetailTokens.border,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}>
        <View className="flex-row items-end justify-between mb-4">
          <View className="flex-row items-center" style={{gap: 8}}>
            <MaterialIcons name="trending-up" size={20} color={deckDetailTokens.brand} />
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 18,
                lineHeight: 24,
                color: deckDetailTokens.ink,
              }}>
              {clamped}% mastered
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 14,
              lineHeight: 20,
              color: deckDetailTokens.mutedText,
            }}>
            {totalCards} cards total
          </Text>
        </View>

        <View
          style={{
            height: 12,
            borderRadius: 999,
            backgroundColor: '#F1F5F9',
            overflow: 'hidden',
          }}>
          <View
            style={{
              height: '100%',
              width: `${clamped > 0 ? clamped : 0}%`,
              backgroundColor: deckDetailTokens.brand,
              borderRadius: 999,
            }}
          />
        </View>
      </View>
    </View>
  );
}
