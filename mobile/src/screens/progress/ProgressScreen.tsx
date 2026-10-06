import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCallback, useMemo, useState} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  DeckBreakdownRow,
  mapActivityToWeeklyChart,
  ProgressScreenHeader,
  StatTile,
  StreakCard,
  WeeklyActivityChart,
} from '../../components/progress';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {SkeletonCard} from '../../components/ui/Skeleton';
import {progressTokens} from '../../config/progressTokens';
import {brandColors, fonts} from '../../config/theme';
import {useAppUser} from '../../hooks/useAppUser';
import {useDecks} from '../../hooks/useDecks';
import {useProgressHistory, useProgressSummary} from '../../hooks/useProgress';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {deckMasteryPercent} from '../../lib/deckMastery';
import {getSubjectIcon} from '../../lib/subjectIcons';
import type {
  MainTabParamList,
  ProgressStackParamList,
} from '../../navigation/types';
import {preferencesStorage} from '../../storage/preferencesStorage';
import type {Deck} from '../../types/api';

function streakMessage(streak: number): string {
  if (streak >= 7) {
    return "Keep it up! You're in the top 5% of learners this week.";
  }
  if (streak > 0) {
    return 'Keep it up! Review a few cards today to extend your streak.';
  }
  return 'Start a session today to begin your streak.';
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function lastNDates(days: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

function weakSpotRecommendation(decks: Deck[]): {
  deck: Deck;
  reason: string;
} | null {
  const candidates = decks
    .filter(d => !d.isArchived && d.cardCount > 0)
    .map(d => {
      const mastery = deckMasteryPercent(d);
      const due = d.dueCount ?? (d.dueTodayCount ?? 0) + (d.lateCount ?? 0);
      const score = due * 2 + (100 - mastery);
      return {deck: d, mastery, due, score};
    })
    .filter(c => c.due > 0 || c.mastery < 50)
    .sort((a, b) => b.score - a.score);

  const top = candidates[0];
  if (!top) return null;

  const reason =
    top.due > 0 && top.mastery < 50
      ? `${top.due} cards due and ${top.mastery}% mastery — prioritize this deck.`
      : top.due > 0
        ? `${top.due} cards waiting — clear the backlog first.`
        : `Only ${top.mastery}% mastery so far — a short session will help.`;

  return {deck: top.deck, reason};
}

export function ProgressScreen() {
  const layout = useLibraryLayout();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const stackNav =
    useNavigation<NativeStackNavigationProp<ProgressStackParamList>>();
  const {openProfile} = useProfileNavigation();
  const {user} = useAppUser();
  const {data: decks = [], isLoading: decksLoading} = useDecks();
  const {data: summary, isLoading: summaryLoading} = useProgressSummary();
  const {data: history = []} = useProgressHistory(28);
  const [dailyGoal, setDailyGoal] = useState(() =>
    preferencesStorage.getDailyGoal(),
  );

  useFocusEffect(
    useCallback(() => {
      setDailyGoal(preferencesStorage.getDailyGoal());
    }, []),
  );

  const isLoading = decksLoading || summaryLoading;
  const totalDue = (summary?.dueTodayCount ?? 0) + (summary?.lateCount ?? 0);
  const studiedToday = summary?.reviewedTodayCount ?? 0;
  const studiedThisWeek = summary?.reviewedThisWeekCount ?? 0;
  const streak = summary?.currentStreak ?? 0;
  const weeklyActivity = mapActivityToWeeklyChart(
    summary?.activityLast7Days ?? [],
  );

  const goalProgress = Math.min(
    1,
    dailyGoal > 0 ? studiedToday / dailyGoal : 0,
  );
  const goalPercent = Math.round(goalProgress * 100);

  const heatmapDays = useMemo(() => {
    const byDate = new Map(history.map(h => [h.date, h.cardsReviewed]));
    return lastNDates(28).map(date => ({
      date,
      count: byDate.get(date) ?? 0,
    }));
  }, [history]);

  const weakSpot = useMemo(() => weakSpotRecommendation(decks), [decks]);

  const headerRight = (
    <Pressable
      onPress={openProfile}
      hitSlop={8}
      accessibilityLabel="Profile"
      accessibilityRole="button"
      className="active:opacity-80"
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: progressTokens.borderWarm,
        overflow: 'hidden',
      }}>
      <ProfileAvatar
        name={user?.name}
        email={user?.email}
        imageUrl={user?.avatarUrl}
        size={40}
      />
    </Pressable>
  );

  return (
    <View className="flex-1" style={{backgroundColor: progressTokens.background}}>
      <ProgressScreenHeader right={headerRight} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: 24,
          paddingBottom: layout.tabScrollBottomPadding + 24,
          gap: layout.sectionGap,
          maxWidth: 672,
          width: '100%',
          alignSelf: 'center',
        }}>
        {isLoading ? (
          <>
            <SkeletonCard lines={2} showBadge={false} />
            <SkeletonCard lines={1} />
          </>
        ) : (
          <>
            <StreakCard streakDays={streak} message={streakMessage(streak)} />

            <View
              style={{
                backgroundColor: progressTokens.surfaceWarm,
                borderRadius: progressTokens.cardRadius,
                borderWidth: 1,
                borderColor: progressTokens.borderWarm,
                padding: 20,
                gap: 12,
              }}>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    lineHeight: 26,
                    fontWeight: '700',
                    color: progressTokens.ink,
                  }}>
                  Daily goal
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 13,
                    color: progressTokens.mutedWarm,
                  }}>
                  {studiedToday} / {dailyGoal} cards
                </Text>
              </View>
              <View
                className="w-full rounded-full overflow-hidden"
                style={{height: 10, backgroundColor: progressTokens.borderWarm}}>
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${goalPercent}%`,
                    backgroundColor: progressTokens.brandGreen,
                  }}
                />
              </View>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: progressTokens.mutedWarm,
                }}>
                {goalPercent >= 100
                  ? 'Goal complete — nice work.'
                  : `${Math.max(0, dailyGoal - studiedToday)} cards left today.`}
              </Text>
            </View>

            <View className="flex-row" style={{gap: 16}}>
              <StatTile label="Due now" value={totalDue} />
              <StatTile
                label="Reviewed"
                value={studiedToday}
                onPress={() =>
                  tabNav.navigate('Review', {screen: 'ReviewSession'})
                }
              />
              <StatTile label="This week" value={studiedThisWeek} />
            </View>

            <View style={{gap: 16}}>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    lineHeight: 26,
                    fontWeight: '700',
                    color: progressTokens.ink,
                  }}>
                  4-week activity
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 12,
                    lineHeight: 16,
                    color: progressTokens.mutedWarm,
                  }}>
                  Last 28 days
                </Text>
              </View>
              <View
                className="flex-row flex-wrap"
                style={{gap: 6, maxWidth: 280}}>
                {heatmapDays.map(day => {
                  const intensity =
                    day.count <= 0
                      ? 0
                      : day.count < 5
                        ? 0.35
                        : day.count < 15
                          ? 0.65
                          : 1;
                  return (
                    <View
                      key={day.date}
                      accessibilityLabel={`${day.date}: ${day.count} cards`}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        backgroundColor:
                          intensity === 0
                            ? progressTokens.borderWarm
                            : progressTokens.brandGreen,
                        opacity: intensity === 0 ? 1 : intensity,
                      }}
                    />
                  );
                })}
              </View>
            </View>

            <View style={{gap: 16}}>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    lineHeight: 26,
                    fontWeight: '700',
                    color: progressTokens.ink,
                  }}>
                  Weekly Activity
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 12,
                    lineHeight: 16,
                    color: progressTokens.mutedWarm,
                  }}>
                  Last 7 days
                </Text>
              </View>
              <WeeklyActivityChart data={weeklyActivity} />
            </View>

            {weakSpot ? (
              <Pressable
                onPress={() =>
                  tabNav.navigate('Library', {
                    screen: 'DeckDetail',
                    params: {deckId: weakSpot.deck.id},
                  })
                }
                accessibilityRole="button"
                className="active:opacity-90"
                style={{
                  backgroundColor: progressTokens.surfaceWarm,
                  borderRadius: progressTokens.cardRadius,
                  borderWidth: 1,
                  borderColor: progressTokens.borderWarm,
                  padding: 20,
                  gap: 10,
                }}>
                <View className="flex-row items-center" style={{gap: 10}}>
                  <MaterialIcons
                    name="tips-and-updates"
                    size={22}
                    color={progressTokens.ink}
                  />
                  <Text
                    style={{
                      fontFamily: fonts.display,
                      fontSize: 18,
                      lineHeight: 26,
                      fontWeight: '700',
                      color: progressTokens.ink,
                    }}>
                    Focus next
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 15,
                    color: progressTokens.ink,
                  }}>
                  {weakSpot.deck.title}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    lineHeight: 20,
                    color: progressTokens.mutedWarm,
                  }}>
                  {weakSpot.reason}
                </Text>
              </Pressable>
            ) : null}

            <View style={{gap: 16}}>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    lineHeight: 26,
                    fontWeight: '700',
                    color: progressTokens.ink,
                  }}>
                  Recent activity
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 12,
                    color: progressTokens.mutedWarm,
                  }}>
                  Last 7 days
                </Text>
              </View>
              {(summary?.activityLast7Days ?? []).length === 0 ? (
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: progressTokens.mutedWarm,
                  }}>
                  Complete a review session to see activity here.
                </Text>
              ) : (
                (summary?.activityLast7Days ?? [])
                  .slice()
                  .reverse()
                  .map(day => (
                    <View
                      key={day.date}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 14,
                        backgroundColor: progressTokens.surfaceWarm,
                        borderWidth: 1,
                        borderColor: progressTokens.borderWarm,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                        }}>
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: progressTokens.brandGreen,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <MaterialIcons
                            name="check"
                            size={18}
                            color={progressTokens.ink}
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: fonts.bodySemiBold,
                              fontSize: 14,
                              color: progressTokens.ink,
                            }}>
                            {new Date(day.date + 'T12:00:00').toLocaleDateString(
                              undefined,
                              {weekday: 'short', month: 'short', day: 'numeric'},
                            )}
                          </Text>
                          <Text
                            style={{
                              fontFamily: fonts.body,
                              fontSize: 12,
                              color: progressTokens.mutedWarm,
                            }}>
                            Review session logged
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          fontFamily: fonts.bodyBold,
                          fontSize: 14,
                          color: progressTokens.ink,
                        }}>
                        {day.cardsReviewed} cards
                      </Text>
                    </View>
                  ))
              )}
            </View>

            <Pressable
              onPress={() => stackNav.navigate('StudyPlanner')}
              accessibilityRole="button"
              className="active:opacity-90 flex-row items-center"
              style={{
                gap: 12,
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: progressTokens.borderWarm,
                backgroundColor: progressTokens.surfaceWarm,
              }}>
              <MaterialIcons name="event" size={22} color={progressTokens.ink} />
              <View className="flex-1">
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 15,
                    color: progressTokens.ink,
                  }}>
                  Study planner
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 13,
                    color: progressTokens.mutedWarm,
                    marginTop: 2,
                  }}>
                  Set exam date and daily minutes
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={progressTokens.mutedWarm}
              />
            </Pressable>

            {weakSpot ? (
              <Pressable
                onPress={() =>
                  stackNav.navigate('QuizSession', {deckId: weakSpot.deck.id})
                }
                accessibilityRole="button"
                accessibilityLabel={`Start practice quiz for ${weakSpot.deck.title}`}
                className="active:opacity-95"
                style={{
                  backgroundColor: brandColors.surface,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: progressTokens.borderWarm,
                  padding: 18,
                  gap: 14,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: progressTokens.brandGreen,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <MaterialIcons
                      name="psychology"
                      size={24}
                      color={progressTokens.ink}
                    />
                  </View>
                  <View style={{flex: 1, gap: 4}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}>
                      <Text
                        style={{
                          fontFamily: fonts.displaySemiBold,
                          fontSize: 18,
                          color: progressTokens.ink,
                        }}>
                        Practice quiz
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 999,
                          backgroundColor: brandColors.paleLime,
                        }}>
                        <Text
                          style={{
                            fontFamily: fonts.bodyBold,
                            fontSize: 11,
                            color: brandColors.olive,
                          }}>
                          Adaptive
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 13,
                        lineHeight: 18,
                        color: progressTokens.mutedWarm,
                      }}>
                      MCQ or typed recall for {weakSpot.deck.title}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: progressTokens.surfaceWarm,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        color: progressTokens.mutedWarm,
                      }}>
                      Focus deck
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: fonts.bodySemiBold,
                        fontSize: 13,
                        color: progressTokens.ink,
                        marginTop: 2,
                      }}>
                      {weakSpot.deck.title}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 44,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: progressTokens.brandGreen,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 13,
                        color: progressTokens.ink,
                      }}>
                      Start
                    </Text>
                    <MaterialIcons
                      name="play-arrow"
                      size={18}
                      color={progressTokens.ink}
                    />
                  </View>
                </View>
              </Pressable>
            ) : null}

            {decks.length > 0 ? (
              <View style={{gap: 16}}>
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    lineHeight: 26,
                    fontWeight: '700',
                    color: progressTokens.ink,
                  }}>
                  Deck Breakdown
                </Text>
                <View style={{gap: 12}}>
                  {decks.map(deck => (
                    <DeckBreakdownRow
                      key={deck.id}
                      icon={getSubjectIcon(deck.subject)}
                      name={deck.title}
                      masteryPercent={deckMasteryPercent(deck)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
