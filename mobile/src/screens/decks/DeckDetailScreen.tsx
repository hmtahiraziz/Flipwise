import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {useCallback, useState} from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {DeckDetailActions} from '../../components/deck/DeckDetailActions';
import {DeckDetailScreenHeader} from '../../components/deck/DeckDetailScreenHeader';
import {DeckDetailStatTile} from '../../components/deck/DeckDetailStatTile';
import {DeckMasteryCard} from '../../components/deck/DeckMasteryCard';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {appAlert, showAppActionSheet} from '../../components/ui/AppAlert';
import {SkeletonCard} from '../../components/ui/Skeleton';
import {toast} from '../../components/ui/Toast';
import {deckDetailTokens} from '../../config/deckDetailTokens';
import {fonts} from '../../config/theme';
import {getApiErrorMessage} from '../../lib/errors';
import {deckMasteryPercent} from '../../lib/deckMastery';
import {formatLastStudiedShort} from '../../lib/sm2';
import {getSubjectColors} from '../../lib/subjectColors';
import {getSubjectIcon} from '../../lib/subjectIcons';
import {useCards} from '../../hooks/useCards';
import {useDeck, useDeckMutations} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {reviewKeys} from '../../hooks/useReviews';
import {fetchReviewQueue} from '../../services/api/reviewApi';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'DeckDetail'>;

export function DeckDetailScreen({navigation, route}: Props) {
  const {deckId} = route.params;
  const layout = useLibraryLayout();
  const queryClient = useQueryClient();
  const {data: deck, isLoading, error, refetch} = useDeck(deckId);
  const {data: cards = []} = useCards(deckId);
  const {deleteDeck, updateDeck} = useDeckMutations();
  const [favoriting, setFavoriting] = useState(false);

  const horizontalPadding = layout.isNarrow
    ? 16
    : deckDetailTokens.containerPadding;
  const screenBg = {backgroundColor: deckDetailTokens.surface};

  const confirmDelete = () => {
    appAlert(
      'Delete deck',
      'This will permanently delete the deck and all its cards.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
  };

  const openOverflowMenu = () => {
    showAppActionSheet({
      title: deck?.title ?? 'Deck',
      options: [
        'Edit deck',
        deck?.isFavorite ? 'Unstar deck' : 'Star deck',
        'Delete deck',
        'Cancel',
      ],
      cancelButtonIndex: 3,
      destructiveButtonIndex: 2,
      onPress: index => {
        if (index === 0) navigation.navigate('EditDeck', {deckId});
        if (index === 1) void toggleFavorite();
        if (index === 2) confirmDelete();
      },
    });
  };

  const handleDelete = async () => {
    try {
      await deleteDeck(deckId);
      navigation.popToTop();
    } catch (err) {
      toast.error('Could not delete deck', getApiErrorMessage(err));
    }
  };

  const toggleFavorite = useCallback(async () => {
    if (!deck || favoriting) return;
    setFavoriting(true);
    try {
      await updateDeck(deckId, {
        isFavorite: !deck.isFavorite,
      });
      toast.success(deck.isFavorite ? 'Removed from starred' : 'Starred');
    } catch (err) {
      toast.error('Could not update deck', getApiErrorMessage(err));
    } finally {
      setFavoriting(false);
    }
  }, [deck, deckId, favoriting, updateDeck]);

  const startReview = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: reviewKeys.queue(deckId),
      queryFn: () => fetchReviewQueue(deckId),
    });
    navigation.navigate('ReviewSession', {deckId, forceFresh: true});
  }, [deckId, navigation, queryClient]);

  const headerRight = <HeaderProfileButton />;

  if (isLoading) {
    return (
      <View className="flex-1" style={screenBg}>
        <DeckDetailScreenHeader
          title="Loading..."
          onBack={() => navigation.goBack()}
          compact={layout.isNarrow}
        />
        <View style={{paddingHorizontal: horizontalPadding, paddingTop: 16, gap: 12}}>
          <SkeletonCard lines={3} showBadge />
          <SkeletonCard lines={2} />
        </View>
      </View>
    );
  }

  if (error || !deck) {
    return (
      <View className="flex-1" style={screenBg}>
        <DeckDetailScreenHeader
          title="Deck unavailable"
          onBack={() => navigation.goBack()}
          compact={layout.isNarrow}
        />
        <View style={{paddingHorizontal: horizontalPadding, paddingTop: 24}}>
          <Text style={{color: deckDetailTokens.error, marginBottom: 16}}>
            {getApiErrorMessage(error, 'Deck not found')}
          </Text>
          <Pressable
            onPress={() => void refetch()}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              backgroundColor: deckDetailTokens.surfaceContainer,
              borderWidth: 1,
              borderColor: deckDetailTokens.borderStrong,
              borderRadius: deckDetailTokens.cardRadius,
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                color: deckDetailTokens.ink,
              }}>
              Retry
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const dueToday = deck.dueTodayCount ?? 0;
  const lateCount = deck.lateCount ?? 0;
  const dueTodayTotal = dueToday + lateCount;
  const mastery = deckMasteryPercent(deck);
  const subject = deck.subject?.trim() ?? '';
  const showSubject =
    subject.length > 0 &&
    subject.localeCompare(deck.title.trim(), undefined, {
      sensitivity: 'accent',
    }) !== 0;
  const subjectColors = getSubjectColors(subject || deck.title);
  const subjectIcon = getSubjectIcon(subject || deck.title);
  const previewCards = cards.slice(0, 3);
  const tags = (deck.tags ?? []).filter(Boolean);

  return (
    <View className="flex-1" style={screenBg}>
      <DeckDetailScreenHeader
        title={deck.title}
        subtitle={showSubject ? subject : undefined}
        onBack={() => navigation.goBack()}
        onMore={openOverflowMenu}
        right={headerRight}
        compact={layout.isNarrow}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 16,
          paddingBottom: layout.tabScrollBottomPadding + 24,
          maxWidth: 560,
          width: '100%',
          alignSelf: 'center',
          gap: deckDetailTokens.sectionGap,
        }}>
        {/* Hero */}
        <View
          style={{
            backgroundColor: deckDetailTokens.surfaceContainer,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: deckDetailTokens.borderSubtle,
            padding: 18,
            gap: 14,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 14,
            }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: subjectColors.background,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name={subjectIcon}
                size={28}
                color={deckDetailTokens.ink}
              />
            </View>
            <View style={{flex: 1, minWidth: 0, gap: 6}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}>
                {showSubject ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: deckDetailTokens.brandMuted,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        color: deckDetailTokens.ink,
                      }}>
                      {subject}
                    </Text>
                  </View>
                ) : null}
                {dueTodayTotal > 0 ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: deckDetailTokens.brand,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        color: deckDetailTokens.ink,
                      }}>
                      {dueTodayTotal} due
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: deckDetailTokens.secondaryContainer,
                    }}>
                    <MaterialIcons
                      name="check-circle"
                      size={12}
                      color={deckDetailTokens.onSecondaryContainer}
                    />
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        color: deckDetailTokens.onSecondaryContainer,
                      }}>
                      Caught up
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: layout.isNarrow ? 24 : 28,
                  lineHeight: layout.isNarrow ? 30 : 34,
                  fontWeight: '800',
                  letterSpacing: -0.5,
                  color: deckDetailTokens.ink,
                }}>
                {deck.title}
              </Text>
              {deck.description ? (
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    lineHeight: 20,
                    color: deckDetailTokens.mutedText,
                  }}
                  numberOfLines={3}>
                  {deck.description}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => void toggleFavorite()}
              disabled={favoriting}
              accessibilityRole="button"
              accessibilityLabel={
                deck.isFavorite ? 'Unstar deck' : 'Star deck'
              }
              className="active:opacity-80"
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: deckDetailTokens.surfaceWarm,
              }}>
              <MaterialIcons
                name={deck.isFavorite ? 'star' : 'star-border'}
                size={22}
                color={
                  deck.isFavorite ? '#E8A317' : deckDetailTokens.mutedText
                }
              />
            </Pressable>
          </View>

          {(tags.length > 0 || deck.examDate) && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
                paddingTop: 4,
              }}>
              {deck.examDate ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: deckDetailTokens.surfaceWarm,
                  }}>
                  <MaterialIcons
                    name="event"
                    size={14}
                    color={deckDetailTokens.primary}
                  />
                  <Text
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 12,
                      color: deckDetailTokens.ink,
                    }}>
                    Exam{' '}
                    {new Date(deck.examDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              ) : null}
              {tags.map(tag => (
                <View
                  key={tag}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: deckDetailTokens.surfaceWarm,
                  }}>
                  <Text
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 12,
                      color: deckDetailTokens.mutedText,
                    }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={{flexDirection: 'row', gap: deckDetailTokens.statGap}}>
          <DeckDetailStatTile
            icon="style"
            value={deck.cardCount}
            label={'Total\nCards'}
          />
          <DeckDetailStatTile
            icon="event"
            value={dueTodayTotal}
            label={'Due\nNow'}
            accent={dueTodayTotal > 0}
          />
          <DeckDetailStatTile
            icon="schedule"
            value={formatLastStudiedShort(deck.lastStudiedAt)}
            label={'Last\nStudied'}
          />
        </View>

        {/* Actions */}
        <DeckDetailActions
          dueCount={dueTodayTotal}
          compact={layout.isNarrow}
          onStartReview={startReview}
          onViewCards={() => navigation.navigate('CardList', {deckId})}
          onGenerate={() => navigation.navigate('GenerateCards', {deckId})}
          onAddCard={() => navigation.navigate('EditCard', {deckId})}
          onImport={() =>
            navigation.navigate('GenerateCards', {
              deckId,
              initialSource: 'pdf',
            })
          }
          onScan={() =>
            navigation.navigate('GenerateCards', {
              deckId,
              initialSource: 'scan',
            })
          }
        />

        {/* Mastery */}
        <DeckMasteryCard
          masteryPercent={mastery}
          totalCards={deck.cardCount}
          dueCount={dueTodayTotal}
          lateCount={lateCount}
        />

        {/* Card preview */}
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
              Card preview
            </Text>
            {deck.cardCount > 0 ? (
              <Pressable
                onPress={() => navigation.navigate('CardList', {deckId})}
                hitSlop={8}
                className="active:opacity-70">
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 13,
                    color: deckDetailTokens.primary,
                  }}>
                  See all ({deck.cardCount})
                </Text>
              </Pressable>
            ) : null}
          </View>

          {previewCards.length === 0 ? (
            <View
              style={{
                backgroundColor: deckDetailTokens.surfaceContainer,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: deckDetailTokens.borderSubtle,
                borderStyle: 'dashed',
                padding: 24,
                alignItems: 'center',
                gap: 10,
              }}>
              <MaterialIcons
                name="style"
                size={28}
                color={deckDetailTokens.mutedText}
              />
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 15,
                  color: deckDetailTokens.ink,
                  textAlign: 'center',
                }}>
                No cards yet
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: deckDetailTokens.mutedText,
                  textAlign: 'center',
                }}>
                Generate with AI or add your first card to start studying.
              </Text>
            </View>
          ) : (
            previewCards.map((card, index) => (
              <Pressable
                key={card.id}
                onPress={() =>
                  navigation.navigate('EditCard', {deckId, cardId: card.id})
                }
                className="active:opacity-95"
                style={{
                  backgroundColor: deckDetailTokens.surfaceContainer,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: deckDetailTokens.borderSubtle,
                  padding: 14,
                  gap: 8,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      backgroundColor: deckDetailTokens.brand,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        color: deckDetailTokens.ink,
                      }}>
                      {index + 1}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={18}
                    color={deckDetailTokens.mutedText}
                  />
                </View>
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 14,
                    lineHeight: 20,
                    color: deckDetailTokens.ink,
                  }}>
                  {card.question}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 12,
                    color: deckDetailTokens.mutedText,
                  }}>
                  {card.answer}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {/* Quick edit */}
        <Pressable
          onPress={() => navigation.navigate('EditDeck', {deckId})}
          className="active:opacity-90"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: 16,
            backgroundColor: deckDetailTokens.surfaceContainer,
            borderWidth: 1,
            borderColor: deckDetailTokens.borderSubtle,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: deckDetailTokens.surfaceWarm,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name="edit"
                size={20}
                color={deckDetailTokens.ink}
              />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 15,
                  color: deckDetailTokens.ink,
                }}>
                Edit deck details
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: deckDetailTokens.mutedText,
                }}>
                Title, subject, description
              </Text>
            </View>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={deckDetailTokens.mutedText}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}
