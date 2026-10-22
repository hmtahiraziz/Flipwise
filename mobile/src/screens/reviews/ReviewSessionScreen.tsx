import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  FlipCard,
  ReviewBackground,
  ReviewProgress,
} from '../../components/review/FlipCard';
import {ExplainAiSheet} from '../../components/review/ExplainAiSheet';
import {RatingBar} from '../../components/review/RatingBar';
import {ReviewSessionHeader} from '../../components/review/ReviewSessionHeader';
import {DeckFormFooter} from '../../components/deck/DeckFormFooter';
import {appAlert} from '../../components/ui/AppAlert';
import {toast} from '../../components/ui/Toast';
import {libraryTokens} from '../../config/libraryTokens';
import {brandColors, fonts} from '../../config/theme';
import {reviewTokens} from '../../config/reviewTokens';
import {ensureAiProcessingConsent} from '../../lib/aiConsent';
import {getApiErrorMessage, getExplainErrorMessage} from '../../lib/errors';
import {useReviewMutations, useReviewQueue} from '../../hooks/useReviews';
import type {ReviewSessionParams} from '../../navigation/types';
import {explainCard} from '../../services/api/reviewApi';
import {
  localDataStorage,
  type UnfinishedSession,
} from '../../storage/localDataStorage';
import {useTheme} from '../../theme/ThemeProvider';
import type {
  EaseRating,
  ExplainCardResponse,
  ReviewQueueItem,
} from '../../types/api';

type ReviewSessionRouteMap = {ReviewSession: ReviewSessionParams};
type Props = NativeStackScreenProps<ReviewSessionRouteMap, 'ReviewSession'>;

type UndoSnapshot = {
  queue: ReviewQueueItem[];
  index: number;
  flipped: boolean;
};

function sessionMatchesDeck(
  saved: UnfinishedSession,
  deckId?: string,
): boolean {
  return (saved.deckId ?? undefined) === (deckId ?? undefined);
}

function buildResumedQueue(
  queue: ReviewQueueItem[],
  saved: UnfinishedSession,
): {queue: ReviewQueueItem[]; index: number} {
  const byId = new Map(queue.map(item => [item.card.id, item]));
  const ordered: ReviewQueueItem[] = [];

  for (const id of saved.cardIds) {
    const item = byId.get(id);
    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  }

  for (const item of byId.values()) {
    ordered.push(item);
  }

  const maxIndex = Math.max(ordered.length - 1, 0);
  const index = Math.min(Math.max(saved.index, 0), maxIndex);
  return {queue: ordered, index};
}

function createSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ReviewSessionScreen({navigation, route}: Props) {
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxContentWidth = Math.min(width - 40, 448);
  const deckId = route.params?.deckId;
  const forceFresh = route.params?.forceFresh === true;
  const {reducedMotion} = useTheme();
  const {data: queue = [], isLoading, error, refetch} = useReviewQueue(deckId);
  const {rateCard} = useReviewMutations(deckId);

  const [sessionQueue, setSessionQueue] = useState<ReviewQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionId, setSessionId] = useState(createSessionId);
  const [sessionStart, setSessionStart] = useState(() => Date.now());
  const [cardShownAt, setCardShownAt] = useState(() => Date.now());
  const [lastUndo, setLastUndo] = useState<UndoSnapshot | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [initPrompted, setInitPrompted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [explainVisible, setExplainVisible] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explainResult, setExplainResult] =
    useState<ExplainCardResponse | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);
  const explainRequestRef = useRef(0);
  /** Blocks double-taps only — never waits on the network. */
  const advancingRef = useRef(false);

  const sessionQueueRef = useRef(sessionQueue);
  const currentIndexRef = useRef(currentIndex);
  const completedRef = useRef(completed);
  const sessionIdRef = useRef(sessionId);
  const sessionStartRef = useRef(sessionStart);
  const deckIdRef = useRef(deckId);

  useEffect(() => {
    sessionQueueRef.current = sessionQueue;
  }, [sessionQueue]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    sessionStartRef.current = sessionStart;
  }, [sessionStart]);
  useEffect(() => {
    deckIdRef.current = deckId;
  }, [deckId]);

  const persistSession = useCallback(() => {
    const items = sessionQueueRef.current;
    const index = currentIndexRef.current;
    if (completedRef.current || items.length === 0 || index >= items.length) {
      return;
    }

    localDataStorage.setSession({
      sessionId: sessionIdRef.current,
      deckId: deckIdRef.current,
      cardIds: items.map(item => item.card.id),
      index,
      startedAt: new Date(sessionStartRef.current).toISOString(),
      ratingsPending: [],
    });
  }, []);

  const clearSession = useCallback(() => {
    localDataStorage.setSession(null);
  }, []);

  const startFresh = useCallback((items: ReviewQueueItem[]) => {
    const id = createSessionId();
    const now = Date.now();
    setSessionId(id);
    setSessionQueue(items);
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setSessionStart(now);
    setCardShownAt(now);
    setLastUndo(null);
    clearSession();
  }, [clearSession]);

  const startResumed = useCallback(
    (items: ReviewQueueItem[], saved: UnfinishedSession) => {
      const {queue: ordered, index} = buildResumedQueue(items, saved);
      const now = Date.now();
      setSessionId(saved.sessionId || createSessionId());
      setSessionQueue(ordered);
      setCurrentIndex(index);
      setFlipped(false);
      setCompleted(false);
      setSessionStart(
        saved.startedAt ? new Date(saved.startedAt).getTime() : now,
      );
      setCardShownAt(now);
      setLastUndo(null);
    },
    [],
  );

  useEffect(() => {
    if (initPrompted || isLoading || error || queue.length === 0) {
      return;
    }
    if (sessionQueue.length > 0 || completed) {
      return;
    }

    setInitPrompted(true);

    // Deck Study CTA: start immediately — no resume dialog blocking the push.
    if (forceFresh) {
      startFresh(queue);
      return;
    }

    const saved = localDataStorage.getSession();
    const canResume =
      saved != null &&
      sessionMatchesDeck(saved, deckId) &&
      saved.cardIds.length > 0 &&
      saved.index < saved.cardIds.length;

    if (!canResume || !saved) {
      startFresh(queue);
      return;
    }

    appAlert(
      'Resume session?',
      `Continue from card ${saved.index + 1} of ${saved.cardIds.length}?`,
      [
        {
          text: 'Start over',
          style: 'destructive',
          onPress: () => startFresh(queue),
        },
        {
          text: 'Resume',
          onPress: () => startResumed(queue, saved),
        },
      ],
      {cancelable: false},
    );
  }, [
    completed,
    deckId,
    error,
    forceFresh,
    initPrompted,
    isLoading,
    queue,
    sessionQueue.length,
    startFresh,
    startResumed,
  ]);

  const currentItem = sessionQueue[currentIndex];
  const totalCards = sessionQueue.length;
  const isSessionDone =
    completed || (totalCards > 0 && currentIndex >= totalCards);

  useEffect(() => {
    if (!currentItem) {
      setBookmarked(false);
      return;
    }
    setBookmarked(localDataStorage.isBookmarked(currentItem.card.id));
  }, [currentItem?.card.id]);

  useEffect(() => {
    if (currentItem) {
      setCardShownAt(Date.now());
    }
  }, [currentItem?.card.id]);

  const deckTitle = useMemo(() => {
    if (deckId && currentItem?.deck.title) return currentItem.deck.title;
    if (deckId) return sessionQueue[0]?.deck.title ?? 'Review';
    return 'All decks';
  }, [currentItem, deckId, sessionQueue]);

  useEffect(() => {
    if (paused || isSessionDone || isLoading) return;
    const tick = () => {
      const raw = Math.floor(
        (Date.now() - sessionStart - pausedTotalRef.current) / 1000,
      );
      setElapsedSec(Math.max(0, raw));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paused, sessionStart, isLoading]);

  const timerLabel = useMemo(() => {
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [elapsedSec]);

  const handlePauseToggle = useCallback(() => {
    if (paused) {
      if (pausedAtRef.current != null) {
        pausedTotalRef.current += Date.now() - pausedAtRef.current;
        pausedAtRef.current = null;
      }
      setPaused(false);
      toast.info('Session resumed');
      return;
    }
    pausedAtRef.current = Date.now();
    setPaused(true);
    toast.info('Session paused');
  }, [paused]);

  const runExplainAi = useCallback(async (cardId: string) => {
    const consented = await ensureAiProcessingConsent();
    if (!consented) {
      return;
    }

    const requestId = ++explainRequestRef.current;
    setExplainVisible(true);
    setExplainLoading(true);
    setExplainError(null);
    setExplainResult(null);
    try {
      const result = await explainCard(cardId);
      if (requestId !== explainRequestRef.current) return;
      setExplainResult(result);
    } catch (err) {
      if (requestId !== explainRequestRef.current) return;
      setExplainError(getExplainErrorMessage(err));
    } finally {
      if (requestId === explainRequestRef.current) {
        setExplainLoading(false);
      }
    }
  }, []);

  const handleExplainAi = useCallback(() => {
    if (paused) {
      toast.info('Session paused', 'Resume to use Explain with AI.');
      return;
    }
    const cardId = sessionQueue[currentIndex]?.card.id;
    if (!cardId) return;
    void runExplainAi(cardId);
  }, [sessionQueue, currentIndex, paused, runExplainAi]);

  const handleCloseExplain = useCallback(() => {
    explainRequestRef.current += 1;
    setExplainVisible(false);
    setExplainLoading(false);
    setExplainError(null);
    setExplainResult(null);
  }, []);

  useEffect(() => {
    handleCloseExplain();
  }, [currentIndex, handleCloseExplain]);

  const finishSession = useCallback(() => {
    setCompleted(true);
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    if (totalCards > 0 && currentIndex >= totalCards && !completed) {
      finishSession();
    }
  }, [currentIndex, totalCards, completed, finishSession]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        persistSession();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [persistSession]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      if (completedRef.current) {
        clearSession();
        return;
      }
      persistSession();
    });
    return unsub;
  }, [navigation, persistSession, clearSession]);

  const writeSession = useCallback(
    (items: ReviewQueueItem[], index: number) => {
      if (items.length === 0 || index >= items.length) {
        clearSession();
        return;
      }
      localDataStorage.setSession({
        sessionId: sessionIdRef.current,
        deckId: deckIdRef.current,
        cardIds: items.map(item => item.card.id),
        index,
        startedAt: new Date(sessionStartRef.current).toISOString(),
        ratingsPending: [],
      });
    },
    [clearSession],
  );

  const handleRate = useCallback(
    (rating: EaseRating) => {
      if (!currentItem || advancingRef.current || paused) return;
      advancingRef.current = true;

      const cardId = currentItem.card.id;
      const durationMs = Math.max(0, Date.now() - cardShownAt);
      const undoSnapshot: UndoSnapshot = {
        queue: sessionQueue,
        index: currentIndex,
        flipped: true,
      };

      // Advance UI immediately — sync rating in the background (Anki-style).
      setLastUndo(undoSnapshot);

      let nextQueue = sessionQueue;
      let nextIndex = currentIndex;

      if (rating === 'again') {
        nextQueue = [
          ...sessionQueue.filter(item => item.card.id !== currentItem.card.id),
          currentItem,
        ];
        setSessionQueue(nextQueue);
      } else {
        nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
      }

      setFlipped(false);
      writeSession(nextQueue, nextIndex);

      // Brief lock so a double-tap cannot skip two cards.
      setTimeout(() => {
        advancingRef.current = false;
      }, 120);

      void rateCard({cardId, rating, durationMs}).catch(err => {
        if (isNetworkError(err)) {
          localDataStorage.enqueuePendingRating({
            cardId,
            rating,
            durationMs,
          });
          toast.info('Saved offline — will sync');
          return;
        }
        toast.error('Could not save rating', getApiErrorMessage(err));
      });
    },
    [
      cardShownAt,
      currentIndex,
      currentItem,
      paused,
      rateCard,
      sessionQueue,
      writeSession,
    ],
  );

  const handleUndo = useCallback(() => {
    if (!lastUndo || advancingRef.current) return;
    setSessionQueue(lastUndo.queue);
    setCurrentIndex(lastUndo.index);
    setFlipped(lastUndo.flipped);
    setCompleted(false);
    setLastUndo(null);
    setCardShownAt(Date.now());
    writeSession(lastUndo.queue, lastUndo.index);
  }, [lastUndo, writeSession]);

  const handleToggleBookmark = useCallback(() => {
    if (!currentItem) return;
    const next = localDataStorage.toggleBookmark(currentItem.card.id);
    setBookmarked(next.includes(currentItem.card.id));
  }, [currentItem]);

  const handleDone = useCallback(() => {
    clearSession();
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [clearSession, navigation]);

  const screenStyle = {backgroundColor: libraryTokens.background};
  const bottomPadding = Math.max(insets.bottom, 12);
  const endStateFooter = (
    label: string,
    onPress: () => void,
    showSaveIcon = true,
  ) => (
    <View
      style={{
        paddingBottom: bottomPadding,
        backgroundColor: brandColors.surface,
      }}>
      <DeckFormFooter
        label={label}
        onPress={onPress}
        showSaveIcon={showSaveIcon}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={screenStyle}>
        <ActivityIndicator size="large" color={libraryTokens.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1" style={screenStyle}>
        <ReviewSessionHeader
          title="Review unavailable"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 px-5 pt-6">
          <Text className="text-danger mb-4">{getApiErrorMessage(error)}</Text>
        </View>
        {endStateFooter('Retry', () => void refetch(), false)}
      </View>
    );
  }

  if (queue.length === 0) {
    return (
      <View className="flex-1" style={screenStyle}>
        <ReviewSessionHeader
          title="All caught up"
          onBack={handleDone}
        />
        <View className="flex-1 px-5 pt-6 justify-center" style={{maxWidth: maxContentWidth, alignSelf: 'center', width: '100%'}}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: brandColors.paleLime,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
            <MaterialIcons name="check-circle" size={32} color={brandColors.olive} />
          </View>
          <Text
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 15,
              lineHeight: 22,
              color: reviewTokens.muted,
            }}>
            {deckId
              ? 'No cards are due for review in this deck right now.'
              : 'No cards are due across your library right now.'}
          </Text>
        </View>
        {endStateFooter('Done', handleDone)}
      </View>
    );
  }

  if (isSessionDone) {
    return (
      <View className="flex-1" style={screenStyle}>
        <ReviewSessionHeader
          title="Session complete"
          onBack={handleDone}
        />
        <View
          className="flex-1 px-5 pt-6 justify-center"
          style={{maxWidth: maxContentWidth, alignSelf: 'center', width: '100%'}}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              backgroundColor: brandColors.lime,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
            <MaterialIcons name="emoji-events" size={36} color={brandColors.charcoal} />
          </View>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 22,
              lineHeight: 28,
              color: brandColors.charcoal,
              marginBottom: 8,
            }}>
            Nice work
          </Text>
          <Text
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 15,
              lineHeight: 22,
              color: reviewTokens.muted,
            }}>
            You reviewed {totalCards} {totalCards === 1 ? 'card' : 'cards'}. Cards rated
            Good or Easy will reappear on their scheduled dates.
          </Text>
        </View>
        {endStateFooter('Done', handleDone)}
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View className="flex-1 items-center justify-center" style={screenStyle}>
        <ActivityIndicator size="large" color={libraryTokens.primary} />
      </View>
    );
  }

  const ratingBar = (
    <RatingBar
      review={currentItem.review}
      onRate={handleRate}
      disabled={paused}
      contentWidth={maxContentWidth}
    />
  );

  return (
    <View className="flex-1" style={screenStyle}>
      <ReviewBackground />

      <ReviewSessionHeader
        title={deckTitle}
        subtitle={`Card ${currentIndex + 1} of ${totalCards}`}
        modeLabel="Spaced Repetition"
        onBack={() => navigation.goBack()}
        bookmarked={bookmarked}
        onToggleBookmark={handleToggleBookmark}
        timerLabel={timerLabel}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          flexGrow: 1,
        }}>
        <View
          className="w-full self-center"
          style={{maxWidth: maxContentWidth, gap: 16}}>
          <ReviewProgress
            current={currentIndex + 1}
            total={totalCards}
            variant="session"
          />

          {paused ? (
            <View
              style={{
                backgroundColor: brandColors.paleLime,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: brandColors.border,
                padding: 12,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 13,
                  color: brandColors.olive,
                }}>
                Session paused — tap Resume below to continue
              </Text>
            </View>
          ) : null}

          <View className="justify-center">
            <FlipCard
              key={currentItem.card.id}
              question={currentItem.card.question}
              answer={currentItem.card.answer}
              flipped={flipped}
              onFlip={() => {
                if (!paused) setFlipped(prev => !prev);
              }}
              cardNumber={currentIndex + 1}
              reducedMotion={reducedMotion}
              explainLoading={explainLoading}
              onExplainAi={paused ? undefined : handleExplainAi}
            />
          </View>

          {flipped && !paused ? (
            reducedMotion ? (
              ratingBar
            ) : (
              <Animated.View entering={FadeInDown.duration(180)}>
                {ratingBar}
              </Animated.View>
            )
          ) : null}
        </View>
      </ScrollView>

      <View
        className="flex-row items-center justify-between"
        style={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: bottomPadding,
        }}>
        <Pressable
          onPress={handleUndo}
          disabled={!lastUndo}
          accessibilityRole="button"
          accessibilityLabel="Undo rating"
          className={`flex-row items-center active:opacity-70 ${
            !lastUndo ? 'opacity-30' : ''
          }`}
          style={{gap: 6, paddingVertical: 6, paddingHorizontal: 8}}>
          <MaterialIcons name="undo" size={16} color={libraryTokens.ink} />
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: libraryTokens.ink,
            }}>
            Undo rating
          </Text>
        </Pressable>
        <Pressable
          onPress={handlePauseToggle}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'Resume session' : 'Pause session'}
          className="flex-row items-center active:opacity-70"
          style={{gap: 6, paddingVertical: 6, paddingHorizontal: 8}}>
          <MaterialIcons
            name={paused ? 'play-arrow' : 'pause'}
            size={16}
            color={reviewTokens.muted}
          />
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: reviewTokens.muted,
            }}>
            {paused ? 'Resume session' : 'Pause session'}
          </Text>
        </Pressable>
      </View>

      <ExplainAiSheet
        visible={explainVisible}
        loading={explainLoading}
        error={explainError}
        result={explainResult}
        question={currentItem.card.question}
        onClose={handleCloseExplain}
        onRetry={() => {
          if (paused) {
            toast.info('Session paused', 'Resume to use Explain with AI.');
            return;
          }
          const cardId = currentItem.card.id;
          if (cardId) void runExplainAi(cardId);
        }}
      />
    </View>
  );
}
