import {useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect, useRef} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {isNetworkError} from '../lib/errors';
import {rateCard} from '../services/api/reviewApi';
import {
  localDataStorage,
  type PendingRating,
} from '../storage/localDataStorage';
import {deckKeys} from './useDecks';
import {progressKeys} from './useProgress';
import {reviewKeys} from './useReviews';

/**
 * Flushes offline-queued review ratings when the app becomes active or
 * navigation focus changes. Safe to mount once under QueryClientProvider
 * (e.g. RootNavigator when signed in).
 *
 * Returns `flush` so callers can also trigger on NavigationContainer focus/state.
 */
export function usePendingReviewSync() {
  const queryClient = useQueryClient();
  const flushingRef = useRef(false);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;

    const all = localDataStorage.getPendingRatings();
    const pending = all.filter(item => item.status === 'pending');
    const alreadyFailed = all.filter(item => item.status === 'failed');
    if (pending.length === 0) return;

    flushingRef.current = true;
    let syncedAny = false;

    try {
      const remaining: PendingRating[] = [...alreadyFailed];

      for (const item of pending) {
        try {
          // Reuse queued id as idempotency key so retries never double-advance SM-2.
          await rateCard(item.cardId, item.rating, item.durationMs, item.id);
          syncedAny = true;
        } catch (error) {
          if (isNetworkError(error)) {
            remaining.push(item);
          } else {
            remaining.push({...item, status: 'failed'});
          }
        }
      }

      localDataStorage.setPendingRatings(remaining);

      if (syncedAny) {
        await Promise.all([
          queryClient.invalidateQueries({queryKey: reviewKeys.all}),
          queryClient.invalidateQueries({queryKey: deckKeys.all}),
          queryClient.invalidateQueries({queryKey: progressKeys.all}),
        ]);
      }
    } finally {
      flushingRef.current = false;
    }
  }, [queryClient]);

  useEffect(() => {
    void flush();

    const onChange = (next: AppStateStatus) => {
      if (next === 'active') {
        void flush();
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [flush]);

  return flush;
}
