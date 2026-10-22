import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {useMemo} from 'react';
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
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {FirstRunEmpty} from '../../components/ui/FirstRunEmpty';
import {SkeletonCard} from '../../components/ui/Skeleton';
import {progressTokens} from '../../config/progressTokens';
import {fonts} from '../../config/theme';
import {useDecks} from '../../hooks/useDecks';
import {useProgressHistory, useProgressSummary} from '../../hooks/useProgress';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {deckMasteryPercent} from '../../lib/deckMastery';
import {getSubjectIcon} from '../../lib/subjectIcons';
import type {MainTabParamList} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';
import type {Deck} from '../../types/api';

function streakMessage(streak: number, longest: number): string {
  if (streak >= 7) {
    return longest > streak
      ? `Strong run — your best is ${longest} days.`
      : "Keep it up — you're building a strong habit.";
  }
  if (streak > 0) {
    return longest > streak
      ? `Best so far: ${longest} days. Review today to keep going.`
      : 'Review a few cards today to keep the streak alive.';
  }
  return longest > 0
    ? `Best streak was ${longest} days — start again today.`
    : 'Finish a review today to start your streak.';
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function lastNDates(days: number): string[] {
  const out: string[] = [];
  const now = new Date();
  now.setHours(12, 0, 0, 0);
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
      const due = (d.dueTodayCount ?? 0) + (d.lateCount ?? 0);
      const score = due * 2 + (100 - mastery);
      return {deck: d, mastery, due, score};
    })
    .filter(c => c.due > 0 || c.mastery < 50)
    .sort((a, b) => b.score - a.score);

  const top = candidates[0];
  if (!top) return null;

  const reason =
    top.due > 0 && top.mastery < 50
      ? `${top.due} cards due · ${top.mastery}% mastery`
      : top.due > 0
        ? `${top.due} cards waiting — clear the backlog first`
        : `${top.mastery}% mastery — a short session will help`;

  return {deck: top.deck, reason};
}

export function ProgressScreen() {
  const layout = useLibraryLayout();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const {preferences} = useTheme();
  const dailyGoal = preferences.dailyGoal;
  const {data: decks = [], isLoading: decksLoading} = useDecks();
  const {data: summary, isLoading: summaryLoading} = useProgressSummary();
  const {data: history = []} = useProgressHistory(28);

  const isLoading = decksLoading || summaryLoading;
  const isFirstRun = !decksLoading && decks.length === 0;

  const dueToday = summary?.dueTodayCount ?? 0;
  const overdue = summary?.lateCount ?? 0;
  const dueTomorrow = summary?.dueTomorrowCount ?? 0;
  const studiedToday = summary?.reviewedTodayCount ?? 0;
  const studiedThisWeek = summary?.reviewedThisWeekCount ?? 0;
  const streak = summary?.currentStreak ?? 0;
  const longestStreak = summary?.longestStreak ?? 0;

  const historyByDate = useMemo(() => {
    const map = new Map<string, {cards: number; minutes: number}>();
    for (const day of history) {
      map.set(day.date, {
        cards: day.cardsReviewed ?? 0,
        minutes: day.minutesStudied ?? 0,
      });
    }
    return map;
  }, [history]);

  const todayKey = useMemo(() => dateKey(new Date()), []);

  const minutesToday = historyByDate.get(todayKey)?.minutes ?? 0;

  const last7Keys = useMemo(() => lastNDates(7), []);
  const minutesThisWeek = useMemo(
    () =>
      last7Keys.reduce(
        (sum, key) => sum + (historyByDate.get(key)?.minutes ?? 0),
        0,
      ),
    [last7Keys, historyByDate],
  );

  const weeklyActivity = mapActivityToWeeklyChart(
    summary?.activityLast7Days ??
      last7Keys.map(date => ({
        date,
        cardsReviewed: historyByDate.get(date)?.cards ?? 0,
      })),
  );

  const goalProgress = Math.min(
    1,
    dailyGoal > 0 ? studiedToday / dailyGoal : 0,
  );
  const goalPercent = Math.round(goalProgress * 100);
  const cardsLeft = Math.max(0, dailyGoal - studiedToday);

  const heatmapDays = useMemo(() => {
    return lastNDates(28).map(date => ({
      date,
      count: historyByDate.get(date)?.cards ?? 0,
      minutes: historyByDate.get(date)?.minutes ?? 0,
    }));
  }, [historyByDate]);

  const activeDays = useMemo(
    () => heatmapDays.filter(d => d.count > 0).length,
    [heatmapDays],
  );

  const monthReviewed = useMemo(
    () => heatmapDays.reduce((sum, d) => sum + d.count, 0),
    [heatmapDays],
  );

  const monthMinutes = useMemo(
    () => heatmapDays.reduce((sum, d) => sum + d.minutes, 0),
    [heatmapDays],
  );

  const weakSpot = useMemo(() => weakSpotRecommendation(decks), [decks]);

  const rankedDecks = useMemo(() => {
    return [...decks]
      .filter(d => !d.isArchived)
      .sort((a, b) => {
        const dueA = (a.dueTodayCount ?? 0) + (a.lateCount ?? 0);
        const dueB = (b.dueTodayCount ?? 0) + (b.lateCount ?? 0);
        if (dueB !== dueA) return dueB - dueA;
        return deckMasteryPercent(a) - deckMasteryPercent(b);
      });
  }, [decks]);

  const headerRight = <HeaderProfileButton size={32} />;

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
            <SkeletonCard lines={3} />
          </>
        ) : isFirstRun ? (
          <FirstRunEmpty
            icon="insights"
            title="No progress yet"
            body="Create a deck on Home or Library, then finish a review to unlock streaks and charts."
          />
        ) : (
          <>
            <StreakCard
              streakDays={streak}
              longestStreak={longestStreak}
              message={streakMessage(streak, longestStreak)}
            />

            <View
              style={{
                backgroundColor: progressTokens.background,
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
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 13,
                    color: progressTokens.mutedWarm,
                  }}>
                  {studiedToday} / {dailyGoal} · {goalPercent}%
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
                  ? minutesToday > 0
                    ? `Goal complete — ${minutesToday} min studied today.`
                    : 'Goal complete — nice work.'
                  : minutesToday > 0
                    ? `${cardsLeft} cards left · ${minutesToday} min so far today`
                    : `${cardsLeft} cards left today.`}
              </Text>
            </View>

            <View style={{gap: 10}}>
              <View className="flex-row" style={{gap: 10}}>
                <StatTile
                  label="Due today"
                  value={dueToday}
                  hint={dueTomorrow > 0 ? `${dueTomorrow} tomorrow` : undefined}
                  onPress={() =>
                    tabNav.navigate('Review', {screen: 'ReviewHome'})
                  }
                />
                <StatTile
                  label="Overdue"
                  value={overdue}
                  hint={overdue > 0 ? 'Past due' : 'Caught up'}
                  onPress={() =>
                    tabNav.navigate('Review', {screen: 'ReviewHome'})
                  }
                />
              </View>
              <View className="flex-row" style={{gap: 10}}>
                <StatTile
                  label="Reviewed"
                  value={studiedToday}
                  hint={minutesToday > 0 ? `${minutesToday} min` : 'Today'}
                  onPress={() =>
                    tabNav.navigate('Review', {screen: 'ReviewSession'})
                  }
                />
                <StatTile
                  label="This week"
                  value={studiedThisWeek}
                  hint={
                    minutesThisWeek > 0 ? `${minutesThisWeek} min` : '7 days'
                  }
                />
              </View>
            </View>

            <View style={{gap: 12}}>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    lineHeight: 26,
                    fontWeight: '700',
                    color: progressTokens.ink,
                  }}>
                  Weekly activity
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
              <WeeklyActivityChart
                data={weeklyActivity}
                minutesThisWeek={minutesThisWeek}
              />
            </View>

            <View style={{gap: 12}}>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    lineHeight: 26,
                    fontWeight: '700',
                    color: progressTokens.ink,
                  }}>
                  4-week consistency
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 12,
                    color: progressTokens.mutedWarm,
                    flexShrink: 1,
                    textAlign: 'right',
                  }}>
                  {activeDays} active · {monthReviewed} cards
                  {monthMinutes > 0 ? ` · ${monthMinutes} min` : ''}
                </Text>
              </View>
              <View
                style={{
                  borderRadius: progressTokens.cardRadius,
                  borderWidth: 1,
                  borderColor: progressTokens.borderWarm,
                  backgroundColor: progressTokens.background,
                  padding: 16,
                }}>
                <View
                  className="flex-row flex-wrap"
                  style={{gap: 5, maxWidth: 280}}>
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
                        accessibilityLabel={`${day.date}: ${day.count} cards${day.minutes > 0 ? `, ${day.minutes} min` : ''}`}
                        style={{
                          width: 11,
                          height: 11,
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
            </View>

            {weakSpot ? (
              <Pressable
                onPress={() =>
                  tabNav.navigate('Review', {
                    screen: 'ReviewSession',
                    params: {deckId: weakSpot.deck.id},
                  })
                }
                accessibilityRole="button"
                className="active:opacity-90"
                style={{
                  backgroundColor: progressTokens.background,
                  borderRadius: progressTokens.cardRadius,
                  borderWidth: 1,
                  borderColor: progressTokens.borderWarm,
                  padding: 18,
                  gap: 10,
                }}>
                <View className="flex-row items-center" style={{gap: 10}}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: progressTokens.brandGreen,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <MaterialIcons
                      name="tips-and-updates"
                      size={20}
                      color={progressTokens.ink}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 18,
                        lineHeight: 24,
                        fontWeight: '700',
                        color: progressTokens.ink,
                      }}>
                      Focus next
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.bodySemiBold,
                        fontSize: 14,
                        color: progressTokens.ink,
                        marginTop: 2,
                      }}
                      numberOfLines={1}>
                      {weakSpot.deck.title}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="play-arrow"
                    size={22}
                    color={progressTokens.ink}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 13,
                    lineHeight: 18,
                    color: progressTokens.mutedWarm,
                  }}>
                  {weakSpot.reason}
                </Text>
              </Pressable>
            ) : null}

            {rankedDecks.length > 0 ? (
              <View style={{gap: 12}}>
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    lineHeight: 26,
                    fontWeight: '700',
                    color: progressTokens.ink,
                  }}>
                  Deck breakdown
                </Text>
                <View style={{gap: 10}}>
                  {rankedDecks.map(deck => {
                    const due =
                      (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);
                    return (
                      <DeckBreakdownRow
                        key={deck.id}
                        icon={getSubjectIcon(deck.subject)}
                        name={deck.title}
                        masteryPercent={deckMasteryPercent(deck)}
                        dueCount={due}
                        cardCount={deck.cardCount}
                        onPress={() =>
                          tabNav.navigate('Library', {
                            screen: 'DeckDetail',
                            params: {deckId: deck.id},
                          })
                        }
                      />
                    );
                  })}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
