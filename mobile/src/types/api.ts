export type HealthResponse = {
  ok: boolean;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type MeResponse = {
  user: User;
};

export type Deck = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  coverImageUrl: string | null;
  isArchived: boolean;
  cardCount: number;
  dueCount: number;
  dueTodayCount: number;
  lateCount: number;
  dueTomorrowCount: number;
  lastStudiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeckListResponse = {
  decks: Deck[];
};

export type DeckResponse = {
  deck: Deck;
};

export type ApiErrorBody = {
  error: string;
  details?: Array<{ path: string; message: string }>;
};

export type Flashcard = {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardDraft = {
  question: string;
  answer: string;
};

export type CardListResponse = {
  cards: Flashcard[];
};

export type CardResponse = {
  card: Flashcard;
};

export type BulkCardsResponse = {
  cards: Flashcard[];
};

export type GenerateCardsRequest = {
  sourceType: 'topic' | 'notes';
  content: string;
  count: number;
  tone?: 'concise' | 'detailed' | 'child-friendly' | 'critical';
};

export type ImportSourceResponse = {
  content: string;
  sourceType: 'notes';
};

export type GenerateCardsResponse = {
  cards: FlashcardDraft[];
};

export type EaseRating = 'again' | 'hard' | 'good' | 'easy';

export type ReviewQueueItem = {
  card: Flashcard;
  review: {
    id: string;
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReviewDate: string;
  };
  deck: {
    id: string;
    title: string;
    subject: string;
  };
};

export type ReviewQueueResponse = {
  queue: ReviewQueueItem[];
};

export type RateCardRequest = {
  rating: EaseRating;
};

export type RateCardResponse = {
  card: Flashcard;
  review: {
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReviewDate: string;
    lastReviewedAt: string;
  };
};

export type ProgressSummary = {
  dueTodayCount: number;
  dueTomorrowCount: number;
  lateCount: number;
  reviewedTodayCount: number;
  reviewedThisWeekCount: number;
  currentStreak: number;
  longestStreak: number;
  activityLast7Days: Array<{date: string; cardsReviewed: number}>;
};

export type ProgressSummaryResponse = {
  summary: ProgressSummary;
};

export type ProgressHistoryDay = {
  date: string;
  cardsReviewed: number;
  minutesStudied: number;
};

export type ProgressHistoryResponse = {
  history: ProgressHistoryDay[];
};
