import {apiClient} from './client';
import type {
  ProgressHistoryResponse,
  ProgressSummaryResponse,
} from '../../types/api';

export async function fetchProgressSummary() {
  const {data} = await apiClient.get<ProgressSummaryResponse>(
    '/api/progress/summary',
  );
  return data.summary;
}

export async function fetchProgressHistory(days = 30) {
  const {data} = await apiClient.get<ProgressHistoryResponse>(
    '/api/progress/history',
    {params: {days}},
  );
  return data.history;
}
