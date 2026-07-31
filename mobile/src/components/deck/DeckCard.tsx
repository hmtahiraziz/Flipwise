import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Alert, Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {
  deckBadge,
  deckMasteryPercent,
  masteryColorsFromPercent,
  statusBadgeStyle,
  statusIconStyle,
} from '../../lib/deckMastery';
import {getSubjectIcon} from '../../lib/subjectIcons';
import {formatLastStudiedRelative} from '../../lib/sm2';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import type {Deck} from '../../types/api';

type DeckCardProps = {
  deck: Deck;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
};

export function DeckCard({deck, onPress, onEdit, onDelete, onArchive}: DeckCardProps) {
  const subjectIcon = getSubjectIcon(deck.subject);
  const mastery = deckMasteryPercent(deck);
  const badge = deckBadge(deck);
  const masteryStyle = masteryColorsFromPercent(mastery);
  const iconStyle = statusIconStyle(badge.variant);
  const badgeColors = statusBadgeStyle(badge.variant);
  const showMenu = onEdit || onDelete || onArchive;

  const openMenu = () => {
    const options: Array<{text: string; style?: 'destructive' | 'cancel'; onPress?: () => void}> =
      [];
    if (onEdit) options.push({text: 'Edit deck', onPress: onEdit});
    if (onArchive) options.push({text: 'Archive deck', onPress: onArchive});
    if (onDelete) options.push({text: 'Delete deck', style: 'destructive', onPress: onDelete});
    options.push({text: 'Cancel', style: 'cancel'});
    Alert.alert(deck.title, undefined, options);
  };

  const cardLabel = `${deck.cardCount} cards in deck • last studied ${formatLastStudiedRelative(deck.lastStudiedAt)}`;

  return (
    <SilhouetteCard style={{marginBottom: libraryTokens.elementGap}}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${deck.title}, ${mastery}% mastery`}
        className="flex-row items-center active:scale-[0.98]"
        style={{
          backgroundColor: libraryTokens.surface,
          borderRadius: libraryTokens.cardRadius,
          borderWidth: 1,
          borderColor: libraryTokens.border,
          padding: 20,
          gap: 16,
          minHeight: libraryTokens.minTapTarget,
        }}
        onPress={onPress}
        onLongPress={showMenu ? openMenu : undefined}
        delayLongPress={400}>
        <View className="flex-1" style={{gap: 12}}>
          <View className="flex-row items-center justify-between">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{backgroundColor: iconStyle.background}}>
              <MaterialIcons name={subjectIcon} size={22} color={iconStyle.icon} />
            </View>
            <View
              className="rounded-full px-2.5 py-0.5"
              style={{
                backgroundColor: badgeColors.background,
                borderWidth: badgeColors.border ? 1 : 0,
                borderColor: badgeColors.border ? 'rgba(239,68,68,0.1)' : undefined,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 10,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: badgeColors.text,
                }}>
                {badge.label}
              </Text>
            </View>
          </View>

          <View>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 16,
                lineHeight: 24,
                color: libraryTokens.ink,
              }}>
              {deck.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 13,
                lineHeight: 18,
                color: libraryTokens.muted,
                marginTop: 2,
              }}>
              {cardLabel}
            </Text>
          </View>

          <View style={{gap: 6}}>
            <View className="flex-row items-center justify-between">
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 11,
                  color: libraryTokens.muted,
                }}>
                Mastery
              </Text>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 11,
                  color: masteryStyle.text,
                }}>
                {mastery}%
              </Text>
            </View>
            <View
              className="w-full rounded-full overflow-hidden"
              style={{height: 6, backgroundColor: libraryTokens.surfaceContainerLow}}>
              {mastery > 0 ? (
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${mastery}%`,
                    backgroundColor: masteryStyle.bar,
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>

        <MaterialIcons name="chevron-right" size={24} color={libraryTokens.muted} />
      </Pressable>
    </SilhouetteCard>
  );
}
