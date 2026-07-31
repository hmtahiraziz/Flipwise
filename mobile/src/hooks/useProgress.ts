import {useQuery} from '@tanstack/react-query';
import {
  fetchProgressHistory,
  fetchProgressSummary,
} from '../services/api/progressApi';

export const progressKeys = {
  all: ['progress'] as const,
  summary: () => ['progress', 'summary'] as const,
  history: (days: number) => ['progress', 'history', days] as const,
};

export function useProgressSummary() {
  return useQuery({
    queryKey: progressKeys.summary(),
    queryFn: fetchProgressSummary,
  });
}

export function useProgressHistory(days = 30) {
  return useQuery({
    queryKey: progressKeys.history(days),
    queryFn: () => fetchProgressHistory(days),
  });
}
