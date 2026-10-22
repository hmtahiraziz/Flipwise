import {apiClient} from './client';
import {getDeviceTimeZone} from '../../lib/deviceTimeZone';
import type {
  ProgressHistoryResponse,
  ProgressSummaryResponse,
} from '../../types/api';

export async function fetchProgressSummary() {
  const {data} = await apiClient.get<ProgressSummaryResponse>(
    '/api/progress/summary',
    {params: {timeZone: getDeviceTimeZone()}},
  );
  return data.summary;
}

export async function fetchProgressHistory(days = 30) {
  const {data} = await apiClient.get<ProgressHistoryResponse>(
    '/api/progress/history',
    {params: {days, timeZone: getDeviceTimeZone()}},
  );
  return data.history;
}
