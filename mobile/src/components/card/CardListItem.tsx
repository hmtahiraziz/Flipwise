import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {formatLastStudiedRelative} from '../../lib/sm2';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import type {Flashcard} from '../../types/api';

type CardListItemProps = {
  card: Flashcard;
  starred?: boolean;
  onPress: () => void;
  onToggleStar?: () => void;
};

function cardSubtitle(card: Flashcard): string {
  const updated = formatLastStudiedRelative(card.updatedAt);
  if (updated === 'never') {
    return 'New card • Not yet reviewed';
  }
  return `Updated ${updated}`;
}

export function CardListItem({
  card,
  starred = false,
  onPress,
  onToggleStar,
}: CardListItemProps) {
  return (
    <SilhouetteCard borderRadius={20}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: libraryTokens.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: libraryTokens.border,
          paddingVertical: 12,
          paddingLeft: 20,
          paddingRight: 12,
          gap: 4,
        }}>
        <Pressable
          className="flex-1 min-w-0 active:opacity-90"
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Edit card: ${card.question}`}
          style={{paddingVertical: 8, paddingRight: 8}}>
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
        </Pressable>
        {onToggleStar ? (
          <Pressable
            onPress={onToggleStar}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={starred ? 'Unstar card' : 'Star card'}
            className="active:opacity-70"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: starred
                ? brandColors.paleLime
                : libraryTokens.surfaceContainerLow,
            }}>
            <MaterialIcons
              name={starred ? 'star' : 'star-border'}
              size={22}
              color={starred ? '#E8A317' : libraryTokens.muted}
            />
          </Pressable>
        ) : null}
        <Pressable
          onPress={onPress}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Open card"
          className="active:opacity-70"
          style={{
            width: 36,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialIcons name="chevron-right" size={22} color={libraryTokens.muted} />
        </Pressable>
      </View>
    </SilhouetteCard>
  );
}
