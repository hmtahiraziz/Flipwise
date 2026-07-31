import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryCardShadow, libraryTokens} from '../../config/libraryTokens';
import {getSubjectIcon} from '../../lib/subjectIcons';
import type {GenerateSourceType} from '../../navigation/types';
import type {Deck} from '../../types/api';

type PickDeckForAiSheetProps = {
  visible: boolean;
  initialSource: GenerateSourceType;
  decks: Deck[];
  onClose: () => void;
  onCreateDeck: () => void;
  onSelectDeck: (deckId: string) => void;
};

function StepPill({
  step,
  label,
  active,
}: {
  step: number;
  label: string;
  active?: boolean;
}) {
  return (
    <View className="flex-row items-center" style={{gap: 8, flex: 1}}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active
            ? libraryTokens.primaryContainer
            : libraryTokens.secondaryContainer,
        }}>
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 12,
            color: active ? libraryTokens.onPrimaryContainer : libraryTokens.muted,
          }}>
          {step}
        </Text>
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: fonts.bodySemiBold,
          fontSize: 12,
          color: active ? libraryTokens.ink : libraryTokens.muted,
        }}>
        {label}
      </Text>
    </View>
  );
}

function PickDeckRow({
  deck,
  onPress,
}: {
  deck: Deck;
  onPress: () => void;
}) {
  const subjectIcon = getSubjectIcon(deck.subject);
  const subject = deck.subject?.trim();
  const showSubject =
    subject &&
    subject.localeCompare(deck.title.trim(), undefined, {sensitivity: 'accent'}) !==
      0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Use deck ${deck.title}`}
      onPress={onPress}
      className="active:opacity-90"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        backgroundColor: libraryTokens.surface,
        minHeight: libraryTokens.minTapTarget,
        ...libraryCardShadow,
        shadowOpacity: 0.04,
      }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: libraryTokens.surfaceContainerLow,
        }}>
        <MaterialIcons
          name={subjectIcon}
          size={22}
          color={libraryTokens.primary}
        />
      </View>

      <View style={{flex: 1, gap: 2}}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 16,
            color: libraryTokens.ink,
          }}>
          {deck.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: libraryTokens.muted,
          }}>
          {showSubject ? `${subject} · ` : ''}
          {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
        </Text>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={22}
        color={libraryTokens.muted}
      />
    </Pressable>
  );
}

export function PickDeckForAiSheet({
  visible,
  initialSource,
  decks,
  onClose,
  onCreateDeck,
  onSelectDeck,
}: PickDeckForAiSheetProps) {
  const {height} = useWindowDimensions();
  const maxSheetHeight = Math.min(height * 0.82, 640);
  const isTopic = initialSource === 'topic';

  const title = isTopic ? 'Generate from a topic' : 'Generate from notes';
  const subtitle = isTopic
    ? 'Create a deck first, then pick where your AI cards should live. Topic starts from the deck subject — refine to a subtopic next.'
    : 'Create a deck first, then pick where your imported notes and AI cards should live.';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close deck picker"
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.45)',
          }}
        />

        <View
          style={{
            maxHeight: maxSheetHeight,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: libraryTokens.background,
            paddingTop: 10,
            paddingBottom: 24,
            ...libraryCardShadow,
            shadowOpacity: 0.12,
            elevation: 16,
          }}>
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 999,
              backgroundColor: libraryTokens.border,
              marginBottom: 16,
            }}
          />

          <View style={{paddingHorizontal: 24, gap: 16}}>
            <View className="flex-row items-start justify-between" style={{gap: 12}}>
              <View style={{flex: 1, gap: 6}}>
                <View className="flex-row items-center" style={{gap: 8}}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: libraryTokens.primaryContainer,
                    }}>
                    <MaterialIcons
                      name="auto-awesome"
                      size={18}
                      color={libraryTokens.onPrimaryContainer}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.displayMedium,
                      fontSize: 22,
                      lineHeight: 28,
                      color: libraryTokens.ink,
                    }}>
                    {title}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    lineHeight: 20,
                    color: libraryTokens.muted,
                  }}>
                  {subtitle}
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: libraryTokens.surface,
                  borderWidth: 1,
                  borderColor: libraryTokens.border,
                }}>
                <MaterialIcons name="close" size={18} color={libraryTokens.ink} />
              </Pressable>
            </View>

            <View
              className="flex-row items-center"
              style={{
                gap: 8,
                padding: 14,
                borderRadius: 18,
                backgroundColor: libraryTokens.surface,
                borderWidth: 1,
                borderColor: libraryTokens.border,
              }}>
              <StepPill step={1} label="Create deck" active />
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={libraryTokens.muted}
              />
              <StepPill step={2} label={isTopic ? 'Pick deck & topic' : 'Pick deck & notes'} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create new deck"
              onPress={onCreateDeck}
              className="active:scale-[0.99]"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 52,
                borderRadius: 999,
                backgroundColor: libraryTokens.primaryContainer,
                paddingHorizontal: 20,
              }}>
              <MaterialIcons
                name="add"
                size={20}
                color={libraryTokens.onPrimaryContainer}
              />
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  color: libraryTokens.onPrimaryContainer,
                }}>
                Create new deck
              </Text>
            </Pressable>
          </View>

          <View style={{marginTop: 20, paddingHorizontal: 24, gap: 12, flex: 1}}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: libraryTokens.muted,
              }}>
              {decks.length > 0 ? 'Or choose an existing deck' : 'Your decks'}
            </Text>

            {decks.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 28,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: libraryTokens.border,
                  backgroundColor: libraryTokens.surface,
                }}>
                <MaterialIcons
                  name="folder-open"
                  size={28}
                  color={libraryTokens.muted}
                />
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 15,
                    color: libraryTokens.ink,
                    textAlign: 'center',
                  }}>
                  No decks yet
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: fonts.body,
                    fontSize: 13,
                    lineHeight: 18,
                    color: libraryTokens.muted,
                    textAlign: 'center',
                  }}>
                  Start by creating a deck for the subject you are studying.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{gap: 10, paddingBottom: 8}}>
                {decks.map(deck => (
                  <PickDeckRow
                    key={deck.id}
                    deck={deck}
                    onPress={() => onSelectDeck(deck.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
