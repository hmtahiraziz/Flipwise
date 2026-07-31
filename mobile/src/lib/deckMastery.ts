import type {Deck} from '../types/api';
import {
  libraryTokens,
  masteryColorsFromPercent,
  statusBadgeStyle,
  statusIconStyle,
  type DeckStatusVariant,
} from '../config/libraryTokens';

export type DeckBadgeVariant = DeckStatusVariant | 'default';
export type MasteryTier = 'excellent' | 'progress' | 'new';

export function deckMasteryPercent(deck: Deck): number {
  if (deck.cardCount === 0) {
    return 0;
  }
  if (!deck.lastStudiedAt) {
    return 0;
  }
  const mastered = Math.max(0, deck.cardCount - deck.dueCount);
  return Math.round((mastered / deck.cardCount) * 100);
}

export function deckBadge(deck: Deck): {label: string; variant: DeckStatusVariant} {
  const mastery = deckMasteryPercent(deck);
  const dueToday = (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);

  if (!deck.lastStudiedAt && deck.cardCount > 0) {
    return {label: 'New', variant: 'new'};
  }
  if (mastery >= 70 && dueToday === 0) {
    return {label: 'Excellent', variant: 'excellent'};
  }
  return {label: 'Active', variant: 'active'};
}

export function masteryTierFromPercent(percent: number): MasteryTier {
  if (percent >= 70) return 'excellent';
  if (percent >= 30) return 'progress';
  return 'new';
}

export {masteryColorsFromPercent, statusBadgeStyle, statusIconStyle};

/** @deprecated use masteryColorsFromPercent */
export function masteryColors(tier: MasteryTier) {
  if (tier === 'excellent') {
    return masteryColorsFromPercent(88);
  }
  if (tier === 'progress') {
    return masteryColorsFromPercent(54);
  }
  return masteryColorsFromPercent(12);
}

/** @deprecated use statusIconStyle */
export function deckIconColors(variant: DeckBadgeVariant) {
  if (variant === 'default') {
    return statusIconStyle('active');
  }
  return statusIconStyle(variant);
}

export {libraryTokens};
