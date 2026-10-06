import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Alert, Pressable, Text, View} from 'react-native';
import {brandColors, elevation, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {deckMasteryPercent} from '../../lib/deckMastery';
import {getSubjectIcon} from '../../lib/subjectIcons';
import {formatLastStudiedRelative} from '../../lib/sm2';
import type {Deck} from '../../types/api';

type DeckCardProps = {
  deck: Deck;
  onPress: () => void;
  onReview?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
};

const SUBJECT_TONES: Record<string, {bg: string; border: string; icon: string}> = {
  biotech: {bg: '#F5F3FF', border: '#EDE9FE', icon: '#7C3AED'},
  translate: {bg: '#ECFDF5', border: '#D1FAE5', icon: '#059669'},
  'history-edu': {bg: '#FFFBEB', border: '#FEF3C7', icon: '#D97706'},
  palette: {bg: '#FDF2F8', border: '#FCE7F3', icon: '#DB2777'},
  calculate: {bg: '#EFF6FF', border: '#DBEAFE', icon: '#2563EB'},
  'menu-book': {bg: '#EFF6FF', border: '#DBEAFE', icon: '#2563EB'},
};

function subjectTone(icon: string) {
  return SUBJECT_TONES[icon] ?? SUBJECT_TONES['menu-book'];
}

export function DeckCard({
  deck,
  onPress,
  onReview,
  onEdit,
  onDelete,
  onArchive,
  isFavorite,
  onToggleFavorite,
  compact,
}: DeckCardProps) {
  const subjectIcon = getSubjectIcon(deck.subject);
  const tone = subjectTone(subjectIcon);
  const mastery = deckMasteryPercent(deck);
  const due =
    deck.dueCount ?? (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);
  const showMenu = onEdit || onDelete || onArchive || onToggleFavorite;
  const caughtUp = due === 0 && deck.cardCount > 0;

  const openMenu = () => {
    const options: Array<{
      text: string;
      style?: 'destructive' | 'cancel';
      onPress?: () => void;
    }> = [];
    if (onToggleFavorite) {
      options.push({
        text: isFavorite ? 'Remove star' : 'Star deck',
        onPress: onToggleFavorite,
      });
    }
    if (onEdit) options.push({text: 'Edit deck', onPress: onEdit});
    if (onArchive) options.push({text: 'Archive deck', onPress: onArchive});
    if (onDelete) {
      options.push({text: 'Delete deck', style: 'destructive', onPress: onDelete});
    }
    options.push({text: 'Cancel', style: 'cancel'});
    Alert.alert(deck.title, undefined, options);
  };

  if (compact) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${deck.title}, ${mastery}% mastery`}
        onPress={onPress}
        onLongPress={showMenu ? openMenu : undefined}
        delayLongPress={400}
        className="active:opacity-95"
        style={{
          backgroundColor: libraryTokens.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: libraryTokens.border,
          padding: 14,
          marginBottom: libraryTokens.elementGap,
          gap: 10,
          ...elevation.tier1,
        }}>
        <View className="flex-row items-center justify-between">
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: tone.bg,
              borderWidth: 1,
              borderColor: tone.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name={subjectIcon} size={18} color={tone.icon} />
          </View>
          {isFavorite ? (
            <MaterialIcons name="star" size={16} color="#FBBF24" />
          ) : null}
        </View>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 14,
            color: libraryTokens.ink,
          }}>
          {deck.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 11,
            color: '#70757D',
          }}>
          {deck.cardCount} cards · {due > 0 ? `${due} due` : 'Caught up'}
        </Text>
        <View
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: '#F3F4F6',
            overflow: 'hidden',
          }}>
          <View
            style={{
              width: `${mastery}%`,
              height: '100%',
              backgroundColor: brandColors.lime,
            }}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${deck.title}, ${mastery}% mastery${isFavorite ? ', starred' : ''}`}
      onPress={onPress}
      onLongPress={showMenu ? openMenu : undefined}
      delayLongPress={400}
      className="active:opacity-98"
      style={{
        backgroundColor: libraryTokens.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        padding: 16,
        marginBottom: libraryTokens.elementGap,
        ...elevation.tier1,
      }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1" style={{gap: 12, paddingRight: 8}}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: tone.bg,
              borderWidth: 1,
              borderColor: tone.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name={subjectIcon} size={20} color={tone.icon} />
          </View>
          <View style={{flex: 1}}>
            <View className="flex-row items-center" style={{gap: 6}}>
              <Text
                numberOfLines={1}
                style={{
                  flexShrink: 1,
                  fontFamily: fonts.bodyBold,
                  fontSize: 15,
                  color: libraryTokens.ink,
                }}>
                {deck.title}
              </Text>
              {isFavorite ? (
                <MaterialIcons name="star" size={14} color="#FBBF24" />
              ) : null}
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 11,
                color: '#70757D',
                marginTop: 2,
              }}>
              {deck.subject?.trim() || 'General'} · {deck.cardCount} cards ·{' '}
              {formatLastStudiedRelative(deck.lastStudiedAt)}
            </Text>
          </View>
        </View>

        {caughtUp ? (
          <View
            style={{
              backgroundColor: '#ECFDF5',
              borderWidth: 1,
              borderColor: '#A7F3D0',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                color: '#047857',
              }}>
              Caught up ✓
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: brandColors.paleLime,
              borderWidth: 1,
              borderColor: brandColors.lime,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 11,
                color: brandColors.olive,
              }}>
              {due} due
            </Text>
          </View>
        )}
      </View>

      <View
        className="flex-row items-center justify-between"
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          gap: 12,
        }}>
        <View style={{flex: 1, maxWidth: '58%'}}>
          <View className="flex-row items-center justify-between" style={{marginBottom: 4}}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 11,
                color: libraryTokens.ink,
              }}>
              Mastery
            </Text>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                color: brandColors.olive,
              }}>
              {mastery}%
            </Text>
          </View>
          <View
            style={{
              height: 8,
              borderRadius: 999,
              backgroundColor: '#F3F4F6',
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: `${mastery}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: brandColors.lime,
              }}
            />
          </View>
        </View>

        <View className="flex-row items-center" style={{gap: 6}}>
          {caughtUp ? (
            <Pressable
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel="View deck"
              className="active:opacity-90"
              style={{
                backgroundColor: brandColors.surface,
                borderWidth: 1,
                borderColor: libraryTokens.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 7,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: libraryTokens.ink,
                }}>
                View
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onReview ?? onPress}
              accessibilityRole="button"
              accessibilityLabel={`Review ${deck.title}`}
              className="active:opacity-90 flex-row items-center"
              style={{
                backgroundColor: brandColors.lime,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 7,
                gap: 4,
              }}>
              <MaterialIcons name="play-arrow" size={14} color={brandColors.charcoal} />
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: brandColors.charcoal,
                }}>
                Review
              </Text>
            </Pressable>
          )}
          {showMenu ? (
            <Pressable
              onPress={openMenu}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Deck menu"
              className="active:opacity-70"
              style={{padding: 6, borderRadius: 8}}>
              <MaterialIcons name="more-vert" size={18} color="#70757D" />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
