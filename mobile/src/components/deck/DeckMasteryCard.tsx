import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {deckDetailTokens} from '../../config/deckDetailTokens';

type DeckMasteryCardProps = {
  masteryPercent: number;
  totalCards: number;
  dueCount?: number;
  lateCount?: number;
};

function masteryLabel(percent: number): string {
  if (percent >= 80) return 'Solid retention';
  if (percent >= 55) return 'Building strength';
  if (percent >= 25) return 'Needs attention';
  return 'Fresh deck';
}

export function DeckMasteryCard({
  masteryPercent,
  totalCards,
  dueCount = 0,
  lateCount = 0,
}: DeckMasteryCardProps) {
  const clamped = Math.min(100, Math.max(0, masteryPercent));
  const masteredApprox = Math.round((clamped / 100) * totalCards);

  return (
    <View style={{gap: 12}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontFamily: fonts.displaySemiBold,
            fontSize: 18,
            color: deckDetailTokens.ink,
          }}>
          Retention Health
        </Text>
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 12,
            color: deckDetailTokens.primary,
          }}>
          {masteryLabel(clamped)}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: deckDetailTokens.surfaceContainer,
          borderRadius: deckDetailTokens.cardRadius,
          borderWidth: 1,
          borderColor: deckDetailTokens.borderSubtle,
          padding: 18,
          gap: 14,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: deckDetailTokens.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name="trending-up"
                size={18}
                color={deckDetailTokens.ink}
              />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 28,
                  lineHeight: 32,
                  fontWeight: '800',
                  color: deckDetailTokens.ink,
                }}>
                {clamped}%
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: deckDetailTokens.mutedText,
                }}>
                ~{masteredApprox} of {totalCards} cards strong
              </Text>
            </View>
          </View>
          <View style={{alignItems: 'flex-end', gap: 4}}>
            {dueCount > 0 ? (
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: deckDetailTokens.ink,
                }}>
                {dueCount} due
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: deckDetailTokens.primary,
                }}>
                Caught up
              </Text>
            )}
            {lateCount > 0 ? (
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: deckDetailTokens.error,
                }}>
                {lateCount} overdue
              </Text>
            ) : null}
          </View>
        </View>

        <View
          style={{
            height: 10,
            borderRadius: 999,
            backgroundColor: deckDetailTokens.surfaceWarm,
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

        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 12,
            lineHeight: 16,
            color: deckDetailTokens.mutedText,
          }}>
          SM-2 spaced repetition schedules the next review based on how well you
          recall each card.
        </Text>
      </View>
    </View>
  );
}
