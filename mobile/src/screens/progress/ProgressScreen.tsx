import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {Pressable, ScrollView, Text, View} from 'react-native';
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
import {fonts} from '../../config/theme';
import {useAppUser} from '../../hooks/useAppUser';
import {useDecks} from '../../hooks/useDecks';
import {useProgressSummary} from '../../hooks/useProgress';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {deckMasteryPercent} from '../../lib/deckMastery';
import {getSubjectIcon} from '../../lib/subjectIcons';
import type {MainTabParamList} from '../../navigation/types';

function streakMessage(streak: number): string {
  if (streak >= 7) {
    return "Keep it up! You're in the top 5% of learners this week.";
  }
  if (streak > 0) {
    return 'Keep it up! Review a few cards today to extend your streak.';
  }
  return 'Start a session today to begin your streak.';
}

export function ProgressScreen() {
  const layout = useLibraryLayout();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const {openProfile} = useProfileNavigation();
  const {user} = useAppUser();
  const {data: decks = [], isLoading: decksLoading} = useDecks();
  const {data: summary, isLoading: summaryLoading} = useProgressSummary();

  const isLoading = decksLoading || summaryLoading;
  const totalDue = (summary?.dueTodayCount ?? 0) + (summary?.lateCount ?? 0);
  const studiedToday = summary?.reviewedTodayCount ?? 0;
  const studiedThisWeek = summary?.reviewedThisWeekCount ?? 0;
  const streak = summary?.currentStreak ?? 0;
  const weeklyActivity = mapActivityToWeeklyChart(summary?.activityLast7Days ?? []);

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

            <View className="flex-row" style={{gap: 16}}>
              <StatTile label="Due now" value={totalDue} />
              <StatTile
                label="Reviewed"
                value={studiedToday}
                onPress={() =>
                  navigation.navigate('Review', {screen: 'ReviewSession'})
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
