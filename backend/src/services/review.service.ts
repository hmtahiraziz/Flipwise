import { and, asc, eq, lte, sql } from "drizzle-orm";
import { getDb } from "../db";
import { cardReviews, decks, flashcards } from "../db/schema";
import { AppError } from "../middleware/errorHandler";
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

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function computeNextReviewDate(intervalDays: number): string {
  const today = todayDateString();
  return intervalDays <= 0 ? today : addDays(today, intervalDays);
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
): Promise<ReviewQueueItem[]> {
  const db = getDb();
  const today = todayDateString();

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

export async function rateCardForUser(
  userId: string,
  cardId: string,
  rating: EaseRating,
): Promise<RateCardResult> {
  const quality = easeRatingToQuality[rating];
  if (quality === undefined) {
    throw new AppError(400, "Invalid rating");
  }

  const db = getDb();

  const [existing] = await db
    .select({
      reviewId: cardReviews.id,
      easeFactor: cardReviews.easeFactor,
      intervalDays: cardReviews.intervalDays,
      repetitions: cardReviews.repetitions,
      cardId: flashcards.id,
      deckId: flashcards.deckId,
      question: flashcards.question,
      answer: flashcards.answer,
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

  const sm2Result: Sm2Result = calculateSm2({
    easeFactor: existing.easeFactor,
    intervalDays: existing.intervalDays,
    repetitions: existing.repetitions,
    quality,
  });

  const nextReviewDate = computeNextReviewDate(sm2Result.intervalDays);
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
    .where(eq(cardReviews.id, existing.reviewId));

  await db
    .update(decks)
    .set({ updatedAt: sql`now()` })
    .where(eq(decks.id, existing.deckId));

  await recordStudyActivity(userId);

  return {
    card: {
      id: existing.cardId,
      deckId: existing.deckId,
      question: existing.question,
      answer: existing.answer,
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
