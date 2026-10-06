import {createSafeMMKV} from './createSafeMMKV';

const storage = createSafeMMKV('flipwise-local');

const KEYS = {
  bookmarks: 'bookmarks_v1',
  favorites: 'favorite_decks_v1',
  session: 'unfinished_session_v1',
  pendingRatings: 'pending_ratings_v1',
  studyPlan: 'study_plan_v1',
  drafts: 'drafts_v1',
} as const;

export type UnfinishedSession = {
  sessionId: string;
  deckId?: string;
  cardIds: string[];
  index: number;
  startedAt: string;
  ratingsPending: Array<{cardId: string; rating: string; durationMs?: number}>;
};

export type PendingRating = {
  id: string;
  cardId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
  durationMs?: number;
  createdAt: string;
  status: 'pending' | 'failed';
};

export type StudyPlan = {
  examDate: string;
  deckIds: string[];
  minutesPerDay: number;
  availableDays: number[];
  dailyTarget: number;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = storage.getString(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[LocalDataStorage] write failed:', key, error);
  }
}

export const localDataStorage = {
  getBookmarks(): string[] {
    return readJson<string[]>(KEYS.bookmarks, []);
  },

  toggleBookmark(cardId: string): string[] {
    const current = this.getBookmarks();
    const next = current.includes(cardId)
      ? current.filter(id => id !== cardId)
      : [...current, cardId];
    writeJson(KEYS.bookmarks, next);
    return next;
  },

  isBookmarked(cardId: string): boolean {
    return this.getBookmarks().includes(cardId);
  },

  getFavoriteDeckIds(): string[] {
    return readJson<string[]>(KEYS.favorites, []);
  },

  toggleFavoriteDeck(deckId: string): string[] {
    const current = this.getFavoriteDeckIds();
    const next = current.includes(deckId)
      ? current.filter(id => id !== deckId)
      : [...current, deckId];
    writeJson(KEYS.favorites, next);
    return next;
  },

  isFavoriteDeck(deckId: string): boolean {
    return this.getFavoriteDeckIds().includes(deckId);
  },

  getSession(): UnfinishedSession | null {
    return readJson<UnfinishedSession | null>(KEYS.session, null);
  },

  setSession(session: UnfinishedSession | null) {
    if (!session) {
      try {
        storage.remove(KEYS.session);
      } catch {
        writeJson(KEYS.session, null);
      }
      return;
    }
    writeJson(KEYS.session, session);
  },

  getPendingRatings(): PendingRating[] {
    return readJson<PendingRating[]>(KEYS.pendingRatings, []);
  },

  setPendingRatings(ratings: PendingRating[]) {
    writeJson(KEYS.pendingRatings, ratings);
  },

  enqueuePendingRating(rating: Omit<PendingRating, 'id' | 'createdAt' | 'status'>) {
    const item: PendingRating = {
      ...rating,
      id: `${rating.cardId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const next = [...this.getPendingRatings(), item];
    this.setPendingRatings(next);
    return item;
  },

  getStudyPlan(): StudyPlan | null {
    return readJson<StudyPlan | null>(KEYS.studyPlan, null);
  },

  setStudyPlan(plan: StudyPlan | null) {
    if (!plan) {
      try {
        storage.remove(KEYS.studyPlan);
      } catch {
        writeJson(KEYS.studyPlan, null);
      }
      return;
    }
    writeJson(KEYS.studyPlan, plan);
  },

  getDraft(key: string): string | null {
    const drafts = readJson<Record<string, string>>(KEYS.drafts, {});
    return drafts[key] ?? null;
  },

  setDraft(key: string, value: string | null) {
    const drafts = readJson<Record<string, string>>(KEYS.drafts, {});
    if (value == null) {
      delete drafts[key];
    } else {
      drafts[key] = value;
    }
    writeJson(KEYS.drafts, drafts);
  },
};
