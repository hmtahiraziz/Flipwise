import type {StudyPlan} from '../storage/localDataStorage';
import type {Deck} from '../types/api';

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const date = new Date(`${trimmed}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function daysUntilExam(isoDate: string): number | null {
  const target = parseIsoDate(isoDate);
  if (!target) return null;
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  return Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatExamDateLabel(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (!date) return isoDate;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function deckDueCount(deck: Deck): number {
  return (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);
}

/** Decks included in the exam plan. Empty deckIds = all active decks. */
export function resolveExamPlanDecks(
  decks: Deck[],
  plan: StudyPlan | null | undefined,
): Deck[] {
  const active = decks.filter(d => !d.isArchived);
  const ids = plan?.deckIds ?? [];
  if (ids.length === 0) return active;
  const selected = active.filter(d => ids.includes(d.id));
  return selected.length > 0 ? selected : active;
}

export function examPlanDueCount(decks: Deck[]): number {
  return decks.reduce((sum, d) => sum + deckDueCount(d), 0);
}

export function suggestedExamCardsPerDay(
  dueCount: number,
  daysLeft: number | null,
  fallbackTarget?: number | null,
): number | null {
  if (daysLeft == null || daysLeft <= 0) {
    return dueCount > 0 ? dueCount : fallbackTarget ?? null;
  }
  if (dueCount > 0) {
    return Math.max(1, Math.ceil(dueCount / daysLeft));
  }
  return fallbackTarget ?? null;
}

/** Best deck to open for an exam review session. */
export function pickExamReviewDeck(planDecks: Deck[]): Deck | null {
  if (planDecks.length === 0) return null;
  const ranked = [...planDecks].sort((a, b) => deckDueCount(b) - deckDueCount(a));
  return ranked.find(d => deckDueCount(d) > 0) ?? ranked[0] ?? null;
}

export function addDaysIso(fromIso: string | null, days: number): string {
  const base = fromIso ? parseIsoDate(fromIso) : new Date();
  const d = base ? new Date(base) : new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}
