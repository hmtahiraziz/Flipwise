import { and, desc, eq, max, sql } from "drizzle-orm";
import { getDb } from "../db";
import { cardReviews, decks, flashcards } from "../db/schema";
import { AppError } from "../middleware/errorHandler";

export type DeckRecord = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  coverImageUrl: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
  dueCount: number;
  dueTodayCount: number;
  lateCount: number;
  dueTomorrowCount: number;
  lastStudiedAt: Date | null;
};

export type CreateDeckInput = {
  title: string;
  subject: string;
  description?: string;
  coverImageUrl?: string;
};

export type UpdateDeckInput = Partial<
  CreateDeckInput & { isArchived?: boolean }
>;

function deckSelectFields() {
  return {
    id: decks.id,
    title: decks.title,
    subject: decks.subject,
    description: decks.description,
    coverImageUrl: decks.coverImageUrl,
    isArchived: decks.isArchived,
    createdAt: decks.createdAt,
    updatedAt: decks.updatedAt,
    cardCount:
      sql<number>`cast(count(distinct ${flashcards.id}) as int)`.mapWith(Number),
    dueCount: sql<number>`cast(count(distinct case when ${cardReviews.nextReviewDate} <= current_date then ${cardReviews.id} end) as int)`.mapWith(
      Number,
    ),
    dueTodayCount: sql<number>`cast(count(distinct case when ${cardReviews.nextReviewDate} = current_date then ${cardReviews.id} end) as int)`.mapWith(
      Number,
    ),
    lateCount: sql<number>`cast(count(distinct case when ${cardReviews.nextReviewDate} < current_date then ${cardReviews.id} end) as int)`.mapWith(
      Number,
    ),
    dueTomorrowCount: sql<number>`cast(count(distinct case when ${cardReviews.nextReviewDate} = current_date + 1 then ${cardReviews.id} end) as int)`.mapWith(
      Number,
    ),
    lastStudiedAt: max(cardReviews.lastReviewedAt),
  };
}

function deckGroupBy() {
  return [
    decks.id,
    decks.title,
    decks.subject,
    decks.description,
    decks.coverImageUrl,
    decks.isArchived,
    decks.createdAt,
    decks.updatedAt,
  ] as const;
}

export function serializeDeck(deck: DeckRecord) {
  return {
    id: deck.id,
    title: deck.title,
    subject: deck.subject,
    description: deck.description,
    coverImageUrl: deck.coverImageUrl,
    isArchived: deck.isArchived,
    cardCount: deck.cardCount,
    dueCount: deck.dueCount,
    dueTodayCount: deck.dueTodayCount,
    lateCount: deck.lateCount,
    dueTomorrowCount: deck.dueTomorrowCount,
    lastStudiedAt: deck.lastStudiedAt?.toISOString() ?? null,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  };
}

export async function listDecksForUser(userId: string): Promise<DeckRecord[]> {
  const db = getDb();
  return db
    .select(deckSelectFields())
    .from(decks)
    .leftJoin(flashcards, eq(flashcards.deckId, decks.id))
    .leftJoin(
      cardReviews,
      and(
        eq(cardReviews.flashcardId, flashcards.id),
        eq(cardReviews.userId, userId),
      ),
    )
    .where(and(eq(decks.userId, userId), eq(decks.isArchived, false)))
    .groupBy(...deckGroupBy())
    .orderBy(desc(decks.updatedAt));
}

export async function getDeckForUser(
  userId: string,
  deckId: string,
): Promise<DeckRecord> {
  const db = getDb();
  const [deck] = await db
    .select(deckSelectFields())
    .from(decks)
    .leftJoin(flashcards, eq(flashcards.deckId, decks.id))
    .leftJoin(
      cardReviews,
      and(
        eq(cardReviews.flashcardId, flashcards.id),
        eq(cardReviews.userId, userId),
      ),
    )
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .groupBy(...deckGroupBy())
    .limit(1);

  if (!deck) {
    throw new AppError(404, "Deck not found");
  }

  return deck;
}

export async function createDeckForUser(
  userId: string,
  input: CreateDeckInput,
): Promise<DeckRecord> {
  const db = getDb();
  const [created] = await db
    .insert(decks)
    .values({
      userId,
      title: input.title,
      subject: input.subject,
      description: input.description ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
    })
    .returning({ id: decks.id });

  if (!created) {
    throw new AppError(500, "Failed to create deck");
  }

  return getDeckForUser(userId, created.id);
}

export async function updateDeckForUser(
  userId: string,
  deckId: string,
  input: UpdateDeckInput,
): Promise<DeckRecord> {
  const db = getDb();

  const [updated] = await db
    .update(decks)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.subject !== undefined ? { subject: input.subject } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.coverImageUrl !== undefined
        ? { coverImageUrl: input.coverImageUrl }
        : {}),
      ...(input.isArchived !== undefined ? { isArchived: input.isArchived } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .returning({ id: decks.id });

  if (!updated) {
    throw new AppError(404, "Deck not found");
  }

  return getDeckForUser(userId, updated.id);
}

export async function deleteDeckForUser(
  userId: string,
  deckId: string,
): Promise<void> {
  const db = getDb();
  const [deleted] = await db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .returning({ id: decks.id });

  if (!deleted) {
    throw new AppError(404, "Deck not found");
  }
}
