import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {useCallback, useMemo, useState} from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {PickDeckForAiSheet} from '../../components/library/PickDeckForAiSheet';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {Button} from '../../components/ui/Button';
import {FirstRunEmpty} from '../../components/ui/FirstRunEmpty';
import {SkeletonCard} from '../../components/ui/Skeleton';
import {brandColors, elevation, fonts, radii} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useDecks} from '../../hooks/useDecks';
import {useProgressHistory, useProgressSummary} from '../../hooks/useProgress';
import {reviewKeys, useReviewQueue} from '../../hooks/useReviews';
import {useScreenLayout} from '../../hooks/useScreenLayout';
import {fetchReviewQueue} from '../../services/api/reviewApi';
import {deckMasteryPercent} from '../../lib/deckMastery';
import {
  daysUntilExam,
  examPlanDueCount,
  pickExamReviewDeck,
  resolveExamPlanDecks,
  suggestedExamCardsPerDay,
} from '../../lib/examPlan';
import {getApiErrorMessage} from '../../lib/errors';
import {formatLastStudiedRelative} from '../../lib/sm2';
import {maybeShowStudyReminder} from '../../lib/studyReminders';
import {getSubjectIcon} from '../../lib/subjectIcons';
import type {
  GenerateSourceType,
  HomeStackParamList,
  MainTabParamList,
} from '../../navigation/types';
import {localDataStorage} from '../../storage/localDataStorage';
import {preferencesStorage} from '../../storage/preferencesStorage';
import type {Deck} from '../../types/api';
import axios from 'axios';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeHome'>;

const SECONDS_PER_CARD = 20;
const SUBTEXT = '#70757D';

function timeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatHomeDate(date = new Date()): string {
  return date
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();
}

function firstNameFrom(name?: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) return 'there';
  return trimmed.split(/\s+/)[0] ?? 'there';
}

function estimateMinutes(cardCount: number): number {
  if (cardCount <= 0) return 0;
  return Math.max(1, Math.round((cardCount * SECONDS_PER_CARD) / 60));
}

function isOfflineError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
  mutedAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  mutedAction?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between" style={{marginBottom: 10}}>
      <Text
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: 14,
          color: brandColors.charcoal,
        }}>
        {title}
      </Text>
      {actionLabel ? (
        onAction ? (
          <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                color: mutedAction ? SUBTEXT : brandColors.olive,
              }}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : (
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: mutedAction ? SUBTEXT : brandColors.olive,
            }}>
            {actionLabel}
          </Text>
        )
      ) : null}
    </View>
  );
}

function StatTile({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subtitle,
  subtitleColor,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: brandColors.surface,
        borderWidth: 1,
        borderColor: brandColors.border,
        borderRadius: 16,
        padding: 12,
        minHeight: 88,
        justifyContent: 'space-between',
        ...elevation.tier1,
      }}>
      <View className="flex-row items-center" style={{gap: 6}}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            backgroundColor: iconBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialIcons name={icon} size={13} color={iconColor} />
        </View>
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 11,
            letterSpacing: 0.4,
            color: SUBTEXT,
            textTransform: 'uppercase',
          }}>
          {label}
        </Text>
      </View>
      <View style={{marginTop: 8}}>
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 16,
            lineHeight: 20,
            color: brandColors.charcoal,
          }}>
          {value}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 10,
            color: subtitleColor ?? SUBTEXT,
            marginTop: 2,
          }}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  highlight,
  onPress,
}: {
  icon: string;
  label: string;
  highlight?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="active:opacity-85"
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.surface,
        borderWidth: 1,
        borderColor: brandColors.border,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 4,
        minHeight: 88,
      }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: highlight ? brandColors.lime : brandColors.progressTrack,
          marginBottom: 6,
        }}>
        <MaterialIcons name={icon} size={20} color={brandColors.charcoal} />
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: highlight ? fonts.bodyBold : fonts.bodySemiBold,
          fontSize: 11,
          color: brandColors.charcoal,
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function HomeScreen({navigation}: Props) {
  const layout = useScreenLayout();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const queryClient = useQueryClient();
  const {user} = useAppUser();

  const {
    data: decks = [],
    isLoading: decksLoading,
    isRefetching: decksRefetching,
    refetch: refetchDecks,
    error: decksError,
  } = useDecks();
  const {
    data: queue = [],
    isLoading: queueLoading,
    isRefetching: queueRefetching,
    refetch: refetchQueue,
    error: queueError,
  } = useReviewQueue();
  const {
    data: summary,
    isLoading: summaryLoading,
    isRefetching: summaryRefetching,
    refetch: refetchSummary,
    error: summaryError,
  } = useProgressSummary();
  const {data: history = []} = useProgressHistory(7);

  const [dailyGoal, setDailyGoal] = useState(() => preferencesStorage.getDailyGoal());
  const [session, setSession] = useState(() => localDataStorage.getSession());
  const [studyPlan, setStudyPlan] = useState(() => localDataStorage.getStudyPlan());
  const [examDatePref, setExamDatePref] = useState(
    () => preferencesStorage.get().examDate,
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSource, setPickerSource] = useState<GenerateSourceType>('topic');

  useFocusEffect(
    useCallback(() => {
      setDailyGoal(preferencesStorage.getDailyGoal());
      setSession(localDataStorage.getSession());
      setStudyPlan(localDataStorage.getStudyPlan());
      setExamDatePref(preferencesStorage.get().examDate);
    }, []),
  );

  const isLoading = decksLoading || queueLoading || summaryLoading;
  const isRefetching = decksRefetching || queueRefetching || summaryRefetching;
  const loadError = decksError || queueError || summaryError;
  const offline = loadError ? isOfflineError(loadError) : false;
  const hasCachedData = decks.length > 0 || summary != null || queue.length > 0;
  const blockingError = !!loadError && !hasCachedData;

  const dueCount = useMemo(() => {
    if (queue.length > 0) return queue.length;
    if (summary) {
      return (summary.dueTodayCount ?? 0) + (summary.lateCount ?? 0);
    }
    return decks.reduce(
      (sum, deck) => sum + (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0),
      0,
    );
  }, [queue.length, summary, decks]);

  useFocusEffect(
    useCallback(() => {
      maybeShowStudyReminder(dueCount);
    }, [dueCount]),
  );

  const reviewedToday = summary?.reviewedTodayCount ?? 0;
  const streak = summary?.currentStreak ?? 0;
  const goalProgress = Math.min(1, dailyGoal > 0 ? reviewedToday / dailyGoal : 0);
  const goalPercent = Math.round(goalProgress * 100);
  const etaMins = estimateMinutes(dueCount);

  const minutesToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const entry = history.find(d => d.date === today);
    if (entry?.minutesStudied) return entry.minutesStudied;
    return reviewedToday > 0 ? Math.max(reviewedToday * 2, 1) : 0;
  }, [history, reviewedToday]);

  const retentionPercent = useMemo(() => {
    const late = summary?.lateCount ?? 0;
    const week = summary?.reviewedThisWeekCount ?? 0;
    const denom = week + late;
    if (denom <= 0) return null;
    return Math.max(0, Math.min(99, Math.round((week / denom) * 100)));
  }, [summary?.lateCount, summary?.reviewedThisWeekCount]);

  const continueDecks = useMemo(() => {
    return [...decks]
      .filter(
        d =>
          !d.isArchived &&
          ((d.dueTodayCount ?? 0) + (d.lateCount ?? 0) > 0 || d.lastStudiedAt),
      )
      .sort((a, b) => {
        const dueA = (a.dueTodayCount ?? 0) + (a.lateCount ?? 0);
        const dueB = (b.dueTodayCount ?? 0) + (b.lateCount ?? 0);
        if (dueB !== dueA) return dueB - dueA;
        const ta = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0;
        const tb = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 3);
  }, [decks]);

  const quizDecks = useMemo(() => {
    return [...decks]
      .filter(d => !d.isArchived && d.cardCount >= 1)
      .map(d => {
        const mastery = deckMasteryPercent(d);
        const due = (d.dueTodayCount ?? 0) + (d.lateCount ?? 0);
        const score = (d.lateCount ?? 0) * 3 + due + (100 - mastery);
        return {deck: d, mastery, due, score};
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [decks]);

  const openQuiz = useCallback(
    (deckId: string) => {
      navigation.navigate('QuizSession', {deckId});
    },
    [navigation],
  );

  const examDate = studyPlan?.examDate || examDatePref;
  const examDays = examDate ? daysUntilExam(examDate) : null;
  const examMinutes = studyPlan?.minutesPerDay ?? null;
  const examPlanDecks = useMemo(
    () => resolveExamPlanDecks(decks, studyPlan),
    [decks, studyPlan],
  );
  const examDueCount = useMemo(
    () => examPlanDueCount(examPlanDecks),
    [examPlanDecks],
  );
  const examPlanCards = suggestedExamCardsPerDay(
    examDueCount,
    examDays,
    studyPlan?.dailyTarget,
  );
  const examDeckLabel =
    studyPlan?.deckIds && studyPlan.deckIds.length > 0
      ? `${examPlanDecks.length} deck${examPlanDecks.length === 1 ? '' : 's'}`
      : null;
  const examTitle = examDate ? 'Upcoming exam' : 'Set exam plan';

  const displayName = firstNameFrom(user?.name);
  const greeting = `${timeGreeting()}, ${displayName}`;

  const onRefresh = useCallback(() => {
    void Promise.all([refetchDecks(), refetchQueue(), refetchSummary()]);
    setDailyGoal(preferencesStorage.getDailyGoal());
    setSession(localDataStorage.getSession());
    setStudyPlan(localDataStorage.getStudyPlan());
    setExamDatePref(preferencesStorage.get().examDate);
  }, [refetchDecks, refetchQueue, refetchSummary]);

  const startTodaysReview = useCallback(() => {
    if (dueCount > 0) {
      tabNav.navigate('Review', {screen: 'ReviewSession', params: {}});
      return;
    }
    tabNav.navigate('Review', {screen: 'ReviewHome'});
  }, [tabNav, dueCount]);

  const resumeSession = useCallback(() => {
    tabNav.navigate('Review', {
      screen: 'ReviewSession',
      params: session?.deckId ? {deckId: session.deckId} : {},
    });
  }, [tabNav, session?.deckId]);

  const openDeckReview = useCallback(
    (deckId: string) => {
      void queryClient.prefetchQuery({
        queryKey: reviewKeys.queue(deckId),
        queryFn: () => fetchReviewQueue(deckId),
      });
      navigation.navigate('ReviewSession', {deckId, forceFresh: true});
    },
    [navigation, queryClient],
  );

  const startExamReview = useCallback(() => {
    const deck = pickExamReviewDeck(examPlanDecks);
    if (deck) {
      openDeckReview(deck.id);
      return;
    }
    if (dueCount > 0) {
      tabNav.navigate('Review', {screen: 'ReviewSession', params: {}});
      return;
    }
    tabNav.navigate('Review', {screen: 'ReviewHome'});
  }, [examPlanDecks, openDeckReview, dueCount, tabNav]);

  const openLibrary = useCallback(() => {
    tabNav.navigate('Library');
  }, [tabNav]);

  const openCreateDeck = useCallback(() => {
    tabNav.navigate('Library', {screen: 'CreateDeck'});
  }, [tabNav]);

  const openDeckPicker = useCallback((source: GenerateSourceType) => {
    setPickerSource(source);
    setPickerVisible(true);
  }, []);

  const handlePickerCreateDeck = useCallback(() => {
    setPickerVisible(false);
    tabNav.navigate('Library', {
      screen: 'CreateDeck',
      params: {redirectTo: 'GenerateCards', initialSource: pickerSource},
    });
  }, [tabNav, pickerSource]);

  const handlePickerSelectDeck = useCallback(
    (deckId: string) => {
      setPickerVisible(false);
      tabNav.navigate('Library', {
        screen: 'GenerateCards',
        params: {deckId, initialSource: pickerSource},
      });
    },
    [tabNav, pickerSource],
  );

  const handleScan = useCallback(() => {
    openDeckPicker('scan');
  }, [openDeckPicker]);

  const contentPadding = {
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 4,
    paddingBottom: layout.tabScrollBottomPadding + 24,
    maxWidth: libraryTokens.contentMaxWidthWide,
    width: '100%' as const,
    alignSelf: 'center' as const,
    gap: 20,
  };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        className="flex-1"
        style={{backgroundColor: brandColors.background}}>
        <ScrollView contentContainerStyle={contentPadding}>
          <SkeletonCard lines={2} showBadge={false} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={1} showBadge={false} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1"
      style={{backgroundColor: brandColors.background}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={contentPadding}>
        {/* Header — Stitch MainHeader */}
        <View>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  letterSpacing: 0.6,
                  color: SUBTEXT,
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}>
                {formatHomeDate()}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 24,
                  lineHeight: 30,
                  letterSpacing: -0.4,
                  color: brandColors.charcoal,
                }}>
                {greeting}
              </Text>
            </View>
            <HeaderProfileButton size={34} />
          </View>
          <Text
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 12,
              color: SUBTEXT,
              marginTop: 4,
            }}>
            {dueCount > 0
              ? "Ready for today's review session?"
              : decks.length === 0
                ? 'Create your first deck to get started.'
                : "You're all caught up for now."}
          </Text>
        </View>

        {blockingError ? (
          <View
            style={{
              backgroundColor: brandColors.surface,
              borderWidth: 1,
              borderColor: brandColors.border,
              borderRadius: radii.xl,
              padding: 20,
              gap: 12,
            }}>
            <MaterialIcons
              name={offline ? 'cloud-off' : 'error-outline'}
              size={28}
              color={brandColors.muted}
            />
            <Text
              style={{
                fontFamily: fonts.displayMedium,
                fontSize: 18,
                color: brandColors.charcoal,
              }}>
              {offline ? 'You look offline' : 'Could not load home'}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: brandColors.muted,
                lineHeight: 20,
              }}>
              {offline
                ? 'Check your connection, then pull to refresh.'
                : getApiErrorMessage(loadError)}
            </Text>
            <Button label="Retry" variant="secondary" onPress={onRefresh} />
          </View>
        ) : null}

        {!blockingError && loadError ? (
          <View
            className="flex-row items-center"
            style={{
              gap: 10,
              backgroundColor: brandColors.surface,
              borderWidth: 1,
              borderColor: brandColors.border,
              borderRadius: 14,
              padding: 12,
            }}>
            <MaterialIcons
              name={offline ? 'cloud-off' : 'error-outline'}
              size={18}
              color={brandColors.muted}
            />
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.body,
                fontSize: 13,
                color: brandColors.muted,
              }}>
              {offline
                ? 'Offline — showing saved data.'
                : getApiErrorMessage(loadError)}
            </Text>
            <Pressable onPress={onRefresh} hitSlop={8}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 13,
                  color: brandColors.olive,
                }}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!blockingError && session ? (
          <Pressable
            onPress={resumeSession}
            accessibilityRole="button"
            className="active:opacity-90"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: brandColors.paleLime,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: brandColors.border,
              padding: 14,
            }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: brandColors.lime,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons name="play-arrow" size={22} color={brandColors.charcoal} />
            </View>
            <View className="flex-1">
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 14,
                  color: brandColors.charcoal,
                }}>
                Resume unfinished session
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: SUBTEXT,
                  marginTop: 2,
                }}>
                {session.index + 1} of {session.cardIds.length} cards · tap to continue
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={SUBTEXT} />
          </Pressable>
        ) : null}

        {!blockingError && decks.length === 0 ? (
          <FirstRunEmpty
            icon="auto-awesome"
            title="Welcome to Cardweave"
            body="Create a deck to start reviewing with spaced repetition."
            primaryAction={{
              label: 'Create deck',
              onPress: openCreateDeck,
              icon: 'add',
            }}
          />
        ) : null}

        {!blockingError && decks.length > 0 ? (
          <>
            {/* Hero — Daily Review Session */}
            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: brandColors.border,
                backgroundColor: '#FBFDEE',
                padding: 20,
                overflow: 'hidden',
                ...elevation.tier1,
              }}>
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  right: -40,
                  bottom: -40,
                  width: 144,
                  height: 144,
                  borderRadius: 72,
                  backgroundColor: 'rgba(199, 245, 43, 0.28)',
                }}
              />
              <View className="flex-row items-start justify-between">
                <View style={{flex: 1, paddingRight: 12}}>
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      borderWidth: 1,
                      borderColor: brandColors.border,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: brandColors.olive,
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        color: brandColors.olive,
                      }}>
                      {dueCount > 0
                        ? `${dueCount} cards due · ~${etaMins} mins`
                        : 'All caught up'}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.displayMedium,
                      fontSize: 20,
                      lineHeight: 26,
                      color: brandColors.charcoal,
                      marginTop: 10,
                    }}>
                    Daily Review Session
                  </Text>
                </View>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 16,
                    backgroundColor: brandColors.surface,
                    borderWidth: 1,
                    borderColor: brandColors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <MaterialIcons name="auto-awesome" size={18} color={brandColors.olive} />
                </View>
              </View>

              <View style={{marginTop: 16, marginBottom: 16, gap: 6}}>
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 12,
                      color: brandColors.charcoal,
                    }}>
                    Daily Target
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.bodyBold,
                      fontSize: 12,
                      color: SUBTEXT,
                    }}>
                    {reviewedToday} / {dailyGoal} completed{' '}
                    <Text style={{color: brandColors.olive, fontFamily: fonts.display}}>
                      ({goalPercent}%)
                    </Text>
                  </Text>
                </View>
                <View
                  style={{
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: 'rgba(163,163,163,0.28)',
                    padding: 2,
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      width: `${Math.max(goalPercent, goalPercent > 0 ? 4 : 0)}%`,
                      height: '100%',
                      borderRadius: 999,
                      backgroundColor: brandColors.olive,
                    }}
                  />
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={startTodaysReview}
                className="active:opacity-90 flex-row items-center justify-center"
                style={{
                  minHeight: 48,
                  borderRadius: 999,
                  backgroundColor: brandColors.lime,
                  gap: 8,
                }}>
                <MaterialIcons name="bolt" size={18} color={brandColors.charcoal} />
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 14,
                    color: brandColors.charcoal,
                  }}>
                  {dueCount > 0
                    ? `Start Today's Review (${dueCount})`
                    : "Start Today's Review"}
                </Text>
              </Pressable>
            </View>

            {/* Metrics row */}
            <View className="flex-row" style={{gap: 10}}>
              <StatTile
                icon="local-fire-department"
                iconBg={brandColors.paleLime}
                iconColor={brandColors.olive}
                label="Streak"
                value={`${streak} Day${streak === 1 ? '' : 's'}`}
                subtitle={
                  streak >= 7
                    ? '🔥 Top 5%'
                    : streak > 0
                      ? 'Keep it going'
                      : 'Start today'
                }
                subtitleColor={streak >= 7 ? brandColors.olive : SUBTEXT}
              />
              <StatTile
                icon="check-circle"
                iconBg={brandColors.progressTrack}
                iconColor={brandColors.charcoal}
                label="Cards"
                value={`${reviewedToday} Done`}
                subtitle="Today"
              />
              <StatTile
                icon="schedule"
                iconBg={brandColors.progressTrack}
                iconColor={brandColors.charcoal}
                label="Time"
                value={`${minutesToday} Mins`}
                subtitle={
                  retentionPercent != null
                    ? `${retentionPercent}% retention`
                    : 'Studied'
                }
              />
            </View>

            {/* Quick Actions */}
            <View>
              <SectionHeader
                title="Quick Actions"
                actionLabel="AI Tools"
                onAction={() => openDeckPicker('topic')}
              />
              <View className="flex-row" style={{gap: 8}}>
                <QuickAction icon="add" label="New Deck" onPress={openCreateDeck} />
                <QuickAction
                  icon="auto-awesome"
                  label="AI Creator"
                  highlight
                  onPress={() => openDeckPicker('topic')}
                />
                <QuickAction
                  icon="photo-camera"
                  label="Scan Notes"
                  onPress={handleScan}
                />
                <QuickAction
                  icon="description"
                  label="Import Doc"
                  onPress={() => openDeckPicker('pdf')}
                />
              </View>
            </View>

            {/* Continue Learning */}
            {continueDecks.length > 0 ? (
              <View>
                <SectionHeader
                  title="Continue Learning"
                  actionLabel={`View All (${decks.filter(d => !d.isArchived).length})`}
                  onAction={openLibrary}
                />
                <View style={{gap: 12}}>
                  {continueDecks.map(deck => (
                    <ContinueDeckCard
                      key={deck.id}
                      deck={deck}
                      onResume={() => openDeckReview(deck.id)}
                      onPress={() =>
                        tabNav.navigate('Library', {
                          screen: 'DeckDetail',
                          params: {deckId: deck.id},
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Practice Quiz — real decks, opens working quiz session */}
            {quizDecks.length > 0 ? (
              <View>
                <SectionHeader title="Practice Quiz" actionLabel="MCQ · Typed" mutedAction />
                <View style={{gap: 12}}>
                  {quizDecks.map(({deck, mastery, due}, index) => {
                    const isPrimary = index === 0;
                    return (
                      <Pressable
                        key={deck.id}
                        onPress={() => openQuiz(deck.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Start practice quiz for ${deck.title}`}
                        className="active:opacity-95"
                        style={{
                          backgroundColor: brandColors.surface,
                          borderWidth: 1,
                          borderColor: brandColors.border,
                          borderRadius: 16,
                          padding: 16,
                          gap: 12,
                          ...elevation.tier1,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: 12,
                          }}>
                          <View
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 14,
                              backgroundColor: isPrimary
                                ? brandColors.lime
                                : brandColors.progressTrack,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <MaterialIcons
                              name="psychology"
                              size={22}
                              color={brandColors.charcoal}
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
                                  fontFamily: fonts.bodyBold,
                                  fontSize: 15,
                                  color: brandColors.charcoal,
                                }}
                                numberOfLines={1}>
                                {deck.title}
                              </Text>
                              {isPrimary ? (
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
                                      fontSize: 10,
                                      color: brandColors.olive,
                                    }}>
                                    Suggested
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                            <Text
                              style={{
                                fontFamily: fonts.bodyMedium,
                                fontSize: 12,
                                color: SUBTEXT,
                              }}>
                              {deck.cardCount} cards
                              {due > 0 ? ` · ${due} due` : ''}
                              {mastery > 0 ? ` · ${mastery}% mastery` : ''}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: brandColors.lime,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}>
                          <MaterialIcons
                            name="play-arrow"
                            size={20}
                            color={brandColors.charcoal}
                          />
                          <Text
                            style={{
                              fontFamily: fonts.bodyBold,
                              fontSize: 13,
                              color: brandColors.charcoal,
                            }}>
                            Start quiz
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Exam planner */}
            {examDate && examDays != null ? (
              <View
                style={{
                  backgroundColor: brandColors.surface,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: brandColors.lime,
                  padding: 16,
                  gap: 12,
                }}>
                <Pressable
                  onPress={() => navigation.navigate('StudyPlanner')}
                  accessibilityRole="button"
                  accessibilityLabel="Open exam planner"
                  className="active:opacity-95"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: brandColors.lime,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <MaterialIcons
                      name="event"
                      size={22}
                      color={brandColors.charcoal}
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
                          fontFamily: fonts.bodyBold,
                          fontSize: 15,
                          color: brandColors.charcoal,
                        }}>
                        {examTitle}
                      </Text>
                      <View
                        style={{
                          backgroundColor: brandColors.paleLime,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: brandColors.lime,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}>
                        <Text
                          style={{
                            fontFamily: fonts.bodyBold,
                            fontSize: 10,
                            letterSpacing: 0.3,
                            color: brandColors.olive,
                            textTransform: 'uppercase',
                          }}>
                          {examDays <= 0
                            ? 'Today'
                            : `In ${examDays} day${examDays === 1 ? '' : 's'}`}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 12,
                        color: SUBTEXT,
                      }}>
                      {[
                        examPlanCards ? `${examPlanCards} cards/day` : null,
                        examMinutes ? `${examMinutes} min/day` : null,
                        examDeckLabel,
                        examDueCount > 0 ? `${examDueCount} due` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="edit"
                    size={20}
                    color={brandColors.muted}
                  />
                </Pressable>

                <Pressable
                  onPress={startExamReview}
                  accessibilityRole="button"
                  accessibilityLabel="Start today's exam review"
                  className="active:opacity-95"
                  style={{
                    minHeight: 44,
                    borderRadius: 12,
                    backgroundColor: brandColors.lime,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}>
                  <MaterialIcons
                    name="play-arrow"
                    size={20}
                    color={brandColors.charcoal}
                  />
                  <Text
                    style={{
                      fontFamily: fonts.bodyBold,
                      fontSize: 13,
                      color: brandColors.charcoal,
                    }}>
                    {examDueCount > 0
                      ? "Start today's exam review"
                      : 'Open exam decks'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => navigation.navigate('StudyPlanner')}
                accessibilityRole="button"
                accessibilityLabel="Set exam plan"
                className="active:opacity-95 flex-row items-center"
                style={{
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: brandColors.border,
                  backgroundColor: brandColors.surface,
                  padding: 16,
                  gap: 14,
                }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: brandColors.progressTrack,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <MaterialIcons
                    name="event"
                    size={22}
                    color={brandColors.charcoal}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 15,
                      color: brandColors.charcoal,
                    }}>
                    Set exam plan
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: SUBTEXT,
                      marginTop: 2,
                    }}>
                    Pick a date, decks, and daily study minutes
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={SUBTEXT} />
              </Pressable>
            )}
          </>
        ) : null}
      </ScrollView>

      <PickDeckForAiSheet
        visible={pickerVisible}
        initialSource={pickerSource}
        decks={decks}
        onClose={() => setPickerVisible(false)}
        onCreateDeck={handlePickerCreateDeck}
        onSelectDeck={handlePickerSelectDeck}
      />
    </SafeAreaView>
  );
}

function ContinueDeckCard({
  deck,
  onPress,
  onResume,
}: {
  deck: Deck;
  onPress: () => void;
  onResume: () => void;
}) {
  const mastery = deckMasteryPercent(deck);
  const due = (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);
  const icon = getSubjectIcon(deck.subject);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="active:opacity-95"
      style={{
        backgroundColor: brandColors.surface,
        borderWidth: 1,
        borderColor: brandColors.border,
        borderRadius: 16,
        padding: 16,
        ...elevation.tier1,
      }}>
      <View className="flex-row items-start justify-between" style={{marginBottom: 8}}>
        <View className="flex-row items-center flex-1" style={{gap: 10, paddingRight: 8}}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: brandColors.paleLime,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name={icon} size={20} color={brandColors.olive} />
          </View>
          <View style={{flex: 1}}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 14,
                color: brandColors.charcoal,
              }}>
              {deck.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 11,
                color: SUBTEXT,
                marginTop: 2,
              }}>
              {due > 0 ? `${due} cards due` : `${deck.cardCount} cards`}
              {' · '}
              Last studied {formatLastStudiedRelative(deck.lastStudiedAt)}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: brandColors.progressTrack,
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 10,
              letterSpacing: 0.6,
              color: brandColors.charcoal,
              textTransform: 'uppercase',
            }}>
            Active
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 4,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: 'rgba(228, 231, 220, 0.6)',
        }}>
        <View className="flex-row items-center justify-between" style={{marginBottom: 6}}>
          <Text
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 11,
              color: SUBTEXT,
            }}>
            Deck Mastery
          </Text>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              color: brandColors.charcoal,
            }}>
            {mastery}%
          </Text>
        </View>
        <View
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: brandColors.progressTrack,
            overflow: 'hidden',
            marginBottom: 12,
          }}>
          <View
            style={{
              width: `${mastery}%`,
              height: '100%',
              borderRadius: 999,
              backgroundColor: brandColors.olive,
            }}
          />
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{gap: 4}}>
            <MaterialIcons name="bolt" size={14} color={brandColors.olive} />
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                color: SUBTEXT,
              }}>
              {deck.subject?.trim() || 'Study deck'}
            </Text>
          </View>
          <Pressable
            onPress={e => {
              e.stopPropagation?.();
              onResume();
            }}
            hitSlop={6}
            accessibilityRole="button"
            className="flex-row items-center active:opacity-80"
            style={{
              backgroundColor: brandColors.lime,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 7,
              gap: 2,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 12,
                color: brandColors.charcoal,
              }}>
              Resume
            </Text>
            <MaterialIcons name="chevron-right" size={14} color={brandColors.charcoal} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
