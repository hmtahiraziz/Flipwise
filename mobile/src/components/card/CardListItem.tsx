import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {formatLastStudiedRelative} from '../../lib/sm2';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import type {Flashcard} from '../../types/api';

type CardListItemProps = {
  card: Flashcard;
  onPress: () => void;
};

function cardSubtitle(card: Flashcard): string {
  const updated = formatLastStudiedRelative(card.updatedAt);
  if (updated === 'never') {
    return 'New card • Not yet reviewed';
  }
  return `Updated ${updated}`;
}

export function CardListItem({card, onPress}: CardListItemProps) {
  return (
    <SilhouetteCard borderRadius={20}>
      <Pressable
        className="flex-row items-center active:opacity-90"
        style={{
          backgroundColor: libraryTokens.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: libraryTokens.border,
          padding: 20,
          gap: 12,
        }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Edit card: ${card.question}`}>
        <View className="flex-1 min-w-0">
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              lineHeight: 24,
              color: libraryTokens.ink,
            }}>
            {card.question}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 13,
              lineHeight: 18,
              color: libraryTokens.muted,
              marginTop: 4,
            }}>
            {cardSubtitle(card)}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={libraryTokens.muted} />
      </Pressable>
    </SilhouetteCard>
  );
}
