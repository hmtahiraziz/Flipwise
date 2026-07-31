export type Sm2Input = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  quality: number;
};

export type Sm2Result = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

/** SM-2 spaced repetition preview (quality 0–5). */
export function calculateSm2(input: Sm2Input): Sm2Result {
  let {easeFactor, intervalDays, repetitions} = input;
  const q = input.quality;

  if (q < 3) {
    return {easeFactor, intervalDays: 0, repetitions: 0};
  }

  let nextEase = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (nextEase < 1.3) nextEase = 1.3;

  let nextInterval: number;
  let nextRepetitions: number;

  if (repetitions === 0) {
    nextInterval = 1;
    nextRepetitions = 1;
  } else if (repetitions === 1) {
    nextInterval = 6;
    nextRepetitions = 2;
  } else {
    nextInterval = Math.round(intervalDays * nextEase);
    nextRepetitions = repetitions + 1;
  }

  return {
    easeFactor: nextEase,
    intervalDays: nextInterval,
    repetitions: nextRepetitions,
  };
}

export const easeRatingToQuality: Record<string, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export function formatIntervalHint(days: number): string {
  if (days <= 0) return '<1d';
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}

export function previewIntervalHint(
  review: {easeFactor: number; intervalDays: number; repetitions: number},
  rating: keyof typeof easeRatingToQuality,
): string {
  const quality = easeRatingToQuality[rating];
  const result = calculateSm2({...review, quality});
  return formatIntervalHint(result.intervalDays);
}

export function formatLastStudied(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

export function formatLastStudiedShort(iso: string | null | undefined): string {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${Math.max(diffMins, 1)}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return '1d';
  if (diffDays < 7) return `${diffDays}d`;
  return formatLastStudied(iso);
}

export function formatLastStudiedRelative(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${Math.max(diffMins, 1)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

export function deckStatusLabel(deck: {
  dueTodayCount?: number;
  lateCount?: number;
  dueTomorrowCount?: number;
  dueCount?: number;
}): string {
  const dueToday = (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);
  const dueTomorrow = deck.dueTomorrowCount ?? 0;
  const fallbackDue = deck.dueCount ?? 0;

  if (dueToday > 0 || (dueToday === 0 && fallbackDue > 0 && !deck.dueTodayCount)) {
    const count = dueToday > 0 ? dueToday : fallbackDue;
    return `${count} ${count === 1 ? 'card' : 'cards'} due today`;
  }
  if (dueTomorrow > 0) {
    return `${dueTomorrow} due tomorrow`;
  }
  return 'All caught up';
}
