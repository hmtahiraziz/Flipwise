import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useMemo} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {LibraryTopBar} from '../../components/library/LibraryTopBar';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {FirstRunEmpty} from '../../components/ui/FirstRunEmpty';
import {SkeletonCard} from '../../components/ui/Skeleton';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {getApiErrorMessage} from '../../lib/errors';
import {useDecks} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProgressSummary} from '../../hooks/useProgress';
import {useReviewQueue} from '../../hooks/useReviews';
import type {
  MainTabParamList,
  ReviewStackParamList,
} from '../../navigation/types';
import type {ReviewQueueItem} from '../../types/api';

type Props = NativeStackScreenProps<ReviewStackParamList, 'ReviewHome'>;

type DeckSummary = {
  deckId: string;
  title: string;
  subject: string;
  dueCount: number;
  avgInterval: number;
  avgEase: number;
};

function groupQueueByDeck(queue: ReviewQueueItem[]): DeckSummary[] {
  const map = new Map<string, DeckSummary & {_easeSum: number; _intSum: number}>();
  for (const item of queue) {
    const existing = map.get(item.deck.id);
    if (existing) {
      existing.dueCount += 1;
      existing._easeSum += item.review.easeFactor;
      existing._intSum += item.review.intervalDays;
      existing.avgEase = existing._easeSum / existing.dueCount;
      existing.avgInterval = existing._intSum / existing.dueCount;
    } else {
      map.set(item.deck.id, {
        deckId: item.deck.id,
        title: item.deck.title,
        subject: item.deck.subject,
        dueCount: 1,
        avgEase: item.review.easeFactor,
        avgInterval: item.review.intervalDays,
        _easeSum: item.review.easeFactor,
        _intSum: item.review.intervalDays,
      });
    }
  }
  return Array.from(map.values())
    .map(({_easeSum: _e, _intSum: _i, ...rest}) => rest)
    .sort((a, b) => b.dueCount - a.dueCount);
}

export function ReviewHomeScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const {data: queue = [], isLoading, isRefetching, refetch, error} =
    useReviewQueue();
  const {data: decks = [], isLoading: decksLoading} = useDecks();
  const {data: summary} = useProgressSummary();

  const deckBreakdown = useMemo(() => groupQueueByDeck(queue), [queue]);
  const totalDue = queue.length;
  const lateCount = summary?.lateCount ?? 0;
  const dueToday = summary?.dueTodayCount ?? totalDue;
  const streak = summary?.currentStreak ?? 0;
  const reviewedToday = summary?.reviewedTodayCount ?? 0;
  const isFirstRun = !decksLoading && decks.length === 0;

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const startGlobalReview = useCallback(() => {
    navigation.navigate('ReviewSession', {});
  }, [navigation]);

  const startDeckReview = useCallback(
    (deckId: string) => {
      navigation.navigate('ReviewSession', {deckId});
    },
    [navigation],
  );

  const topBar = (
    <LibraryTopBar
      title="Review"
      right={<HeaderProfileButton size={32} />}
    />
  );

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      {topBar}

      {isLoading || decksLoading ? (
        <View style={{paddingHorizontal: layout.horizontalPadding, paddingTop: 16, gap: 12}}>
          <SkeletonCard lines={2} showBadge={false} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </View>
      ) : isFirstRun ? (
        <View
          style={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 24,
            paddingBottom: layout.tabScrollBottomPadding + 24,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}>
          <FirstRunEmpty
            icon="style"
            title="Nothing to review yet"
            body="Create a deck in Library or Home first — due cards will show up here."
          />
        </View>
      ) : error ? (
        <View style={{paddingHorizontal: layout.horizontalPadding, paddingTop: 24}}>
          <View
            style={{
              backgroundColor: brandColors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
              gap: 12,
            }}>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: libraryTokens.error,
              }}>
              {getApiErrorMessage(error)}
            </Text>
            <Pressable
              onPress={() => void refetch()}
              className="active:opacity-90"
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: libraryTokens.surfaceContainerLow,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 14,
                  color: libraryTokens.ink,
                }}>
                Retry
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={deckBreakdown}
          keyExtractor={item => item.deckId}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 12,
            paddingBottom: layout.tabScrollBottomPadding + 24,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
            gap: 12,
            flexGrow: 1,
          }}
          ListHeaderComponent={
            <View style={{gap: 16, marginBottom: 8}}>
              {/* Hero queue card */}
              <View
                style={{
                  backgroundColor: brandColors.surface,
                  borderRadius: 24,
                  padding: 20,
                  gap: 16,
                  borderWidth: 1,
                  borderColor: libraryTokens.borderSubtle,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flex: 1, gap: 4}}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        letterSpacing: 0.66,
                        textTransform: 'uppercase',
                        color: libraryTokens.muted,
                      }}>
                      Spaced Repetition Queue
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 28,
                        lineHeight: 34,
                        color: libraryTokens.ink,
                      }}>
                      {totalDue > 0
                        ? `${totalDue} card${totalDue === 1 ? '' : 's'} due`
                        : 'All caught up'}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 14,
                        lineHeight: 20,
                        color: libraryTokens.muted,
                      }}>
                      {totalDue > 0
                        ? `${dueToday} due today · ${lateCount} overdue · SM-2 schedule`
                        : 'No cards are due right now. Keep your streak alive.'}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      backgroundColor: libraryTokens.primaryContainer,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <MaterialIcons
                      name={totalDue > 0 ? 'style' : 'celebration'}
                      size={26}
                      color={brandColors.charcoal}
                    />
                  </View>
                </View>

                <View style={{flexDirection: 'row', gap: 8}}>
                  {[
                    {label: 'Streak', value: `${streak}d`, icon: 'local-fire-department'},
                    {label: 'Today', value: `${reviewedToday}`, icon: 'done-all'},
                    {
                      label: 'Decks',
                      value: `${deckBreakdown.length}`,
                      icon: 'folder',
                    },
                  ].map(stat => (
                    <View
                      key={stat.label}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 14,
                        backgroundColor: libraryTokens.surfaceContainerLow,
                        gap: 4,
                      }}>
                      <MaterialIcons
                        name={stat.icon}
                        size={16}
                        color={libraryTokens.primary}
                      />
                      <Text
                        style={{
                          fontFamily: fonts.displaySemiBold,
                          fontSize: 18,
                          color: libraryTokens.ink,
                        }}>
                        {stat.value}
                      </Text>
                      <Text
                        style={{
                          fontFamily: fonts.bodyBold,
                          fontSize: 11,
                          color: libraryTokens.muted,
                        }}>
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {totalDue > 0 ? (
                  <Pressable
                    onPress={startGlobalReview}
                    accessibilityRole="button"
                    accessibilityLabel={`Start review of ${totalDue} cards`}
                    className="active:opacity-95"
                    style={{
                      height: 52,
                      borderRadius: 999,
                      backgroundColor: libraryTokens.primaryContainer,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}>
                    <MaterialIcons
                      name="play-arrow"
                      size={22}
                      color={brandColors.charcoal}
                    />
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 15,
                        color: brandColors.charcoal,
                      }}>
                      Start review ({totalDue})
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {totalDue > 0 ? (
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 11,
                    letterSpacing: 0.66,
                    textTransform: 'uppercase',
                    color: libraryTokens.muted,
                    paddingHorizontal: 4,
                  }}>
                  By deck
                </Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <FirstRunEmpty
              icon="celebration"
              title="Inbox zero"
              body="You're caught up. Check back later or add more cards."
              primaryAction={{
                label: 'Browse library',
                onPress: () => tabNav.navigate('Library'),
                icon: 'folder-open',
              }}
            />
          }
          renderItem={({item}) => (
            <Pressable
              onPress={() => startDeckReview(item.deckId)}
              accessibilityRole="button"
              className="active:opacity-95"
              style={{
                backgroundColor: brandColors.surface,
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: libraryTokens.borderSubtle,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: libraryTokens.secondaryContainer,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialIcons
                  name="menu-book"
                  size={22}
                  color={libraryTokens.onSecondaryContainer}
                />
              </View>
              <View style={{flex: 1, minWidth: 0, gap: 2}}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 16,
                    color: libraryTokens.ink,
                  }}>
                  {item.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 12,
                    color: libraryTokens.muted,
                  }}>
                  {item.subject || 'General'} · avg {item.avgInterval.toFixed(0)}d
                  interval · EF {item.avgEase.toFixed(2)}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: libraryTokens.primaryContainer,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 12,
                    color: brandColors.charcoal,
                  }}>
                  {item.dueCount} due
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={libraryTokens.muted}
              />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
