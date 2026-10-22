import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {fetchReviewQueue, rateCard} from '../services/api/reviewApi';
import type {EaseRating} from '../types/api';
import {deckKeys} from './useDecks';
import {progressKeys} from './useProgress';

export const reviewKeys = {
  all: ['reviews'] as const,
  queue: (deckId?: string) => ['reviews', 'queue', deckId ?? 'all'] as const,
};

export function useReviewQueue(deckId?: string) {
  return useQuery({
    queryKey: reviewKeys.queue(deckId),
    queryFn: () => fetchReviewQueue(deckId),
  });
}

export function useReviewMutations(deckId?: string) {
  const queryClient = useQueryClient();

  const invalidateReviewData = () => {
    void queryClient.invalidateQueries({queryKey: reviewKeys.all});
    void queryClient.invalidateQueries({queryKey: deckKeys.all});
    void queryClient.invalidateQueries({queryKey: progressKeys.all});
    if (deckId) {
      void queryClient.invalidateQueries({queryKey: deckKeys.detail(deckId)});
    }
  };

  const rateMutation = useMutation({
    mutationFn: ({
      cardId,
      rating,
      durationMs,
    }: {
      cardId: string;
      rating: EaseRating;
      durationMs?: number;
    }) => rateCard(cardId, rating, durationMs),
    // Fire-and-forget: do not await invalidation so the session never stalls.
    onSuccess: () => {
      invalidateReviewData();
    },
  });

  return {
    rateCard: rateMutation.mutateAsync,
    isRating: rateMutation.isPending,
  };
}
