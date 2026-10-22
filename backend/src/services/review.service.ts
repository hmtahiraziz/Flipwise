import { and, asc, eq, lte, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  cardReviews,
  decks,
  flashcards,
  reviewIdempotency,
} from "../db/schema";
import { AppError } from "../middleware/errorHandler";
import {
  addCalendarDays,
  calendarDateInTimeZone,
} from "../utils/dates";
import {
  calculateSm2,
  easeRatingToQuality,
  type Sm2Result,
} from "../utils/sm2";
import { serializeFlashcard, type FlashcardRecord } from "./card.service";
import { recordStudyActivity } from "./progress.service";

export type EaseRating = keyof typeof easeRatingToQuality;

export type ReviewQueueItem = {
  card: FlashcardRecord;
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

export type RateCardResult = {
  card: FlashcardRecord;
  review: {
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReviewDate: string;
    lastReviewedAt: string;
  };
};

const IDEMPOTENCY_DEBOUNCE_MS = 2_000;

function computeNextReviewDate(
  intervalDays: number,
  timeZone?: string,
): string {
  const today = calendarDateInTimeZone(timeZone);
  return intervalDays <= 0 ? today : addCalendarDays(today, intervalDays);
}

export function serializeReviewQueueItem(item: ReviewQueueItem) {
  return {
    card: serializeFlashcard(item.card),
    review: item.review,
    deck: item.deck,
  };
}

export function serializeRateResult(result: RateCardResult) {
  return {
    card: serializeFlashcard(result.card),
    review: result.review,
  };
}

export async function getReviewQueueForUser(
  userId: string,
  deckId?: string,
  timeZone?: string,
): Promise<ReviewQueueItem[]> {
  const db = getDb();
  const today = calendarDateInTimeZone(timeZone);

  const conditions = [
    eq(cardReviews.userId, userId),
    lte(cardReviews.nextReviewDate, today),
    eq(decks.userId, userId),
  ];

  if (deckId) {
    conditions.push(eq(decks.id, deckId));
  }

  const rows = await db
    .select({
      cardId: flashcards.id,
      deckId: flashcards.deckId,
      question: flashcards.question,
      answer: flashcards.answer,
      explanation: flashcards.explanation,
      hint: flashcards.hint,
      cardType: flashcards.cardType,
      imageUrl: flashcards.imageUrl,
      sortOrder: flashcards.sortOrder,
      cardCreatedAt: flashcards.createdAt,
      cardUpdatedAt: flashcards.updatedAt,
      reviewId: cardReviews.id,
      easeFactor: cardReviews.easeFactor,
      intervalDays: cardReviews.intervalDays,
      repetitions: cardReviews.repetitions,
      nextReviewDate: cardReviews.nextReviewDate,
      deckTitle: decks.title,
      deckSubject: decks.subject,
    })
    .from(cardReviews)
    .innerJoin(flashcards, eq(flashcards.id, cardReviews.flashcardId))
    .innerJoin(decks, eq(decks.id, flashcards.deckId))
    .where(and(...conditions))
    .orderBy(asc(cardReviews.nextReviewDate), asc(cardReviews.easeFactor));

  return rows.map((row) => ({
    card: {
      id: row.cardId,
      deckId: row.deckId,
      question: row.question,
      answer: row.answer,
      explanation: row.explanation,
      hint: row.hint,
      cardType: row.cardType,
      imageUrl: row.imageUrl,
      sortOrder: row.sortOrder,
      createdAt: row.cardCreatedAt,
      updatedAt: row.cardUpdatedAt,
    },
    review: {
      id: row.reviewId,
      easeFactor: row.easeFactor,
      intervalDays: row.intervalDays,
      repetitions: row.repetitions,
      nextReviewDate: row.nextReviewDate,
    },
    deck: {
      id: row.deckId,
      title: row.deckTitle,
      subject: row.deckSubject,
    },
  }));
}

function toRateResult(
  existing: {
    cardId: string;
    deckId: string;
    question: string;
    answer: string;
    explanation: string | null;
    hint: string | null;
    cardType: string;
    imageUrl: string | null;
    sortOrder: number;
    cardCreatedAt: Date;
    cardUpdatedAt: Date;
  },
  sm2Result: Sm2Result,
  nextReviewDate: string,
  lastReviewedAt: Date,
): RateCardResult {
  return {
    card: {
      id: existing.cardId,
      deckId: existing.deckId,
      question: existing.question,
      answer: existing.answer,
      explanation: existing.explanation,
      hint: existing.hint,
      cardType: existing.cardType,
      imageUrl: existing.imageUrl,
      sortOrder: existing.sortOrder,
      createdAt: existing.cardCreatedAt,
      updatedAt: existing.cardUpdatedAt,
    },
    review: {
      easeFactor: sm2Result.easeFactor,
      intervalDays: sm2Result.intervalDays,
      repetitions: sm2Result.repetitions,
      nextReviewDate,
      lastReviewedAt: lastReviewedAt.toISOString(),
    },
  };
}

export async function rateCardForUser(
  userId: string,
  cardId: string,
  rating: EaseRating,
  options?: {
    timeZone?: string;
    idempotencyKey?: string;
  },
): Promise<RateCardResult> {
  const quality = easeRatingToQuality[rating];
  if (quality === undefined) {
    throw new AppError(400, "Invalid rating");
  }

  const db = getDb();
  const idempotencyKey = options?.idempotencyKey?.trim();

  if (idempotencyKey) {
    const [cached] = await db
      .select({
        responseJson: reviewIdempotency.responseJson,
      })
      .from(reviewIdempotency)
      .where(
        and(
          eq(reviewIdempotency.userId, userId),
          eq(reviewIdempotency.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);

    if (cached) {
      return JSON.parse(cached.responseJson) as RateCardResult;
    }
  }

  const [existing] = await db
    .select({
      reviewId: cardReviews.id,
      easeFactor: cardReviews.easeFactor,
      intervalDays: cardReviews.intervalDays,
      repetitions: cardReviews.repetitions,
      lastReviewedAt: cardReviews.lastReviewedAt,
      nextReviewDate: cardReviews.nextReviewDate,
      cardId: flashcards.id,
      deckId: flashcards.deckId,
      question: flashcards.question,
      answer: flashcards.answer,
      explanation: flashcards.explanation,
      hint: flashcards.hint,
      cardType: flashcards.cardType,
      imageUrl: flashcards.imageUrl,
      sortOrder: flashcards.sortOrder,
      cardCreatedAt: flashcards.createdAt,
      cardUpdatedAt: flashcards.updatedAt,
    })
    .from(cardReviews)
    .innerJoin(flashcards, eq(flashcards.id, cardReviews.flashcardId))
    .innerJoin(decks, eq(decks.id, flashcards.deckId))
    .where(
      and(
        eq(cardReviews.flashcardId, cardId),
        eq(cardReviews.userId, userId),
        eq(decks.userId, userId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new AppError(404, "Review not found");
  }

  // Soft debounce: identical rapid double-taps without an idempotency key.
  if (
    !idempotencyKey &&
    existing.lastReviewedAt &&
    Date.now() - existing.lastReviewedAt.getTime() < IDEMPOTENCY_DEBOUNCE_MS
  ) {
    return {
      card: {
        id: existing.cardId,
        deckId: existing.deckId,
        question: existing.question,
        answer: existing.answer,
        explanation: existing.explanation,
        hint: existing.hint,
        cardType: existing.cardType,
        imageUrl: existing.imageUrl,
        sortOrder: existing.sortOrder,
        createdAt: existing.cardCreatedAt,
        updatedAt: existing.cardUpdatedAt,
      },
      review: {
        easeFactor: existing.easeFactor,
        intervalDays: existing.intervalDays,
        repetitions: existing.repetitions,
        nextReviewDate: existing.nextReviewDate,
        lastReviewedAt: existing.lastReviewedAt.toISOString(),
      },
    };
  }

  const sm2Result: Sm2Result = calculateSm2({
    easeFactor: existing.easeFactor,
    intervalDays: existing.intervalDays,
    repetitions: existing.repetitions,
    quality,
  });

  const nextReviewDate = computeNextReviewDate(
    sm2Result.intervalDays,
    options?.timeZone,
  );
  const lastReviewedAt = new Date();

  await db
    .update(cardReviews)
    .set({
      easeFactor: sm2Result.easeFactor,
      intervalDays: sm2Result.intervalDays,
      repetitions: sm2Result.repetitions,
      nextReviewDate,
      lastReviewedAt,
    })
    .where(
      and(
        eq(cardReviews.id, existing.reviewId),
        eq(cardReviews.userId, userId),
      ),
    );

  await db
    .update(decks)
    .set({ updatedAt: sql`now()` })
    .where(and(eq(decks.id, existing.deckId), eq(decks.userId, userId)));

  // Server-owned study minutes — do not trust client duration.
  await recordStudyActivity(userId, 1, options?.timeZone);

  const result = toRateResult(
    existing,
    sm2Result,
    nextReviewDate,
    lastReviewedAt,
  );

  if (idempotencyKey) {
    await db
      .insert(reviewIdempotency)
      .values({
        userId,
        idempotencyKey,
        flashcardId: cardId,
        responseJson: JSON.stringify(result),
      })
      .onConflictDoNothing();
  }

  return result;
}
