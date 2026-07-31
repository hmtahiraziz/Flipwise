import {apiClient} from './client';
import type {
  EaseRating,
  RateCardResponse,
  ReviewQueueItem,
  ReviewQueueResponse,
} from '../../types/api';

export async function fetchReviewQueue(
  deckId?: string,
): Promise<ReviewQueueItem[]> {
  const {data} = await apiClient.get<ReviewQueueResponse>('/api/reviews/queue', {
    params: deckId ? {deckId} : undefined,
  });
  return data.queue;
}

export async function rateCard(
  cardId: string,
  rating: EaseRating,
): Promise<RateCardResponse> {
  const {data} = await apiClient.post<RateCardResponse>(
    `/api/reviews/${cardId}/rate`,
    {rating},
  );
  return data;
}
