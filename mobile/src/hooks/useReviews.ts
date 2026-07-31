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

  const invalidateReviewData = async () => {
    await queryClient.invalidateQueries({queryKey: reviewKeys.all});
    await queryClient.invalidateQueries({queryKey: deckKeys.all});
    await queryClient.invalidateQueries({queryKey: progressKeys.all});
    if (deckId) {
      await queryClient.invalidateQueries({queryKey: deckKeys.detail(deckId)});
    }
  };

  const rateMutation = useMutation({
    mutationFn: ({cardId, rating}: {cardId: string; rating: EaseRating}) =>
      rateCard(cardId, rating),
    onSuccess: async () => {
      await invalidateReviewData();
    },
  });

  return {
    rateCard: rateMutation.mutateAsync,
    isRating: rateMutation.isPending,
  };
}
