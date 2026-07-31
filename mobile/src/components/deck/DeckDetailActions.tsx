import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {deckDetailTokens} from '../../config/deckDetailTokens';

type DeckDetailActionsProps = {
  dueCount: number;
  onStartReview: () => void;
  onViewCards: () => void;
  onGenerate: () => void;
  compact?: boolean;
};

export function DeckDetailActions({
  dueCount,
  onStartReview,
  onViewCards,
  onGenerate,
  compact,
}: DeckDetailActionsProps) {
  const reviewLabel =
    dueCount > 0 ? `Start review (${dueCount})` : 'Start review';

  return (
    <View style={{gap: 16}}>
      <Pressable
        onPress={onStartReview}
        accessibilityRole="button"
        accessibilityLabel={reviewLabel}
        className="active:scale-[0.98]"
        style={{
          backgroundColor: deckDetailTokens.brand,
          borderRadius: deckDetailTokens.cardRadius,
          paddingVertical: compact ? 18 : 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          shadowColor: deckDetailTokens.brand,
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 4,
        }}>
        <MaterialIcons name="play-arrow" size={24} color={deckDetailTokens.ink} />
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: compact ? 16 : 18,
            lineHeight: 24,
            fontWeight: '800',
            color: deckDetailTokens.ink,
          }}>
          {reviewLabel}
        </Text>
      </Pressable>

      <View className="flex-row" style={{gap: 16}}>
        <Pressable
          onPress={onViewCards}
          accessibilityRole="button"
          accessibilityLabel="View cards"
          className="flex-1 active:scale-[0.98]"
          style={{
            backgroundColor: deckDetailTokens.surfaceContainer,
            borderRadius: deckDetailTokens.cardRadius,
            borderWidth: 1,
            borderColor: deckDetailTokens.borderStrong,
            paddingVertical: compact ? 14 : 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
          <MaterialIcons name="visibility" size={18} color={deckDetailTokens.ink} />
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 14,
              color: deckDetailTokens.ink,
            }}>
            View cards
          </Text>
        </Pressable>

        <Pressable
          onPress={onGenerate}
          accessibilityRole="button"
          accessibilityLabel="AI Generate"
          className="flex-1 active:scale-[0.98]"
          style={{
            backgroundColor: deckDetailTokens.surfaceContainer,
            borderRadius: deckDetailTokens.cardRadius,
            borderWidth: 1,
            borderColor: deckDetailTokens.borderStrong,
            paddingVertical: compact ? 14 : 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
          <MaterialIcons name="auto-awesome" size={18} color={deckDetailTokens.ink} />
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 14,
              color: deckDetailTokens.ink,
            }}>
            AI Generate
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
