import {apiClient} from './client';
import {getDeviceTimeZone, newIdempotencyKey} from '../../lib/deviceTimeZone';
import type {
  EaseRating,
  ExplainCardResponse,
  RateCardResponse,
  ReviewQueueItem,
  ReviewQueueResponse,
} from '../../types/api';

export async function fetchReviewQueue(
  deckId?: string,
): Promise<ReviewQueueItem[]> {
  const {data} = await apiClient.get<ReviewQueueResponse>('/api/reviews/queue', {
    params: {
      ...(deckId ? {deckId} : {}),
      timeZone: getDeviceTimeZone(),
    },
  });
  return data.queue;
}

export async function rateCard(
  cardId: string,
  rating: EaseRating,
  _durationMs?: number,
  idempotencyKey: string = newIdempotencyKey(),
): Promise<RateCardResponse> {
  const {data} = await apiClient.post<RateCardResponse>(
    `/api/reviews/${cardId}/rate`,
    {
      rating,
      timeZone: getDeviceTimeZone(),
      idempotencyKey,
    },
  );
  return data;
}

export async function explainCard(cardId: string): Promise<ExplainCardResponse> {
  const {data} = await apiClient.post<ExplainCardResponse>(
    `/api/reviews/${cardId}/explain`,
    {aiConsent: true},
  );
  return data;
}
