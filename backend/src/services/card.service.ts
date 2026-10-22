import { and, asc, eq, inArray, max, sql } from "drizzle-orm";
import { getDb } from "../db";
import { cardReviews, decks, flashcards } from "../db/schema";
import { AppError } from "../middleware/errorHandler";
import { getDeckForUser } from "./deck.service";

export type FlashcardRecord = {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  explanation: string | null;
  hint: string | null;
  cardType: string;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCardInput = {
  question: string;
  answer: string;
  explanation?: string | null;
  hint?: string | null;
  cardType?: string;
  imageUrl?: string | null;
};

export type UpdateCardInput = Partial<CreateCardInput>;

const flashcardColumns = {
  id: flashcards.id,
  deckId: flashcards.deckId,
  question: flashcards.question,
  answer: flashcards.answer,
  explanation: flashcards.explanation,
  hint: flashcards.hint,
  cardType: flashcards.cardType,
  imageUrl: flashcards.imageUrl,
  sortOrder: flashcards.sortOrder,
  createdAt: flashcards.createdAt,
  updatedAt: flashcards.updatedAt,
} as const;

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function serializeFlashcard(card: FlashcardRecord) {
  return {
    id: card.id,
    deckId: card.deckId,
    question: card.question,
    answer: card.answer,
    explanation: card.explanation,
    hint: card.hint,
    cardType: card.cardType,
    imageUrl: card.imageUrl,
    sortOrder: card.sortOrder,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

async function getNextSortOrder(deckId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ maxOrder: max(flashcards.sortOrder) })
    .from(flashcards)
    .where(eq(flashcards.deckId, deckId));

  return (row?.maxOrder ?? -1) + 1;
}

async function createReviewRows(
  userId: string,
  cardIds: string[],
): Promise<void> {
  if (cardIds.length === 0) return;

  const db = getDb();
  const today = todayDateString();

  await db.insert(cardReviews).values(
    cardIds.map((flashcardId) => ({
      flashcardId,
      userId,
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      nextReviewDate: today,
    })),
  );
}

export async function getCardForUser(
  userId: string,
  cardId: string,
): Promise<FlashcardRecord> {
  const db = getDb();
  const [row] = await db
    .select(flashcardColumns)
    .from(flashcards)
    .innerJoin(decks, eq(decks.id, flashcards.deckId))
    .where(and(eq(flashcards.id, cardId), eq(decks.userId, userId)))
    .limit(1);

  if (!row) {
    throw new AppError(404, "Card not found");
  }

  return row;
}

async function assertCardOwnership(
  userId: string,
  cardId: string,
): Promise<FlashcardRecord> {
  return getCardForUser(userId, cardId);
}

export async function listCardsForDeck(
  userId: string,
  deckId: string,
): Promise<FlashcardRecord[]> {
  await getDeckForUser(userId, deckId);

  const db = getDb();
  return db
    .select(flashcardColumns)
    .from(flashcards)
    .where(eq(flashcards.deckId, deckId))
    .orderBy(asc(flashcards.sortOrder), asc(flashcards.createdAt));
}

export async function createCardForDeck(
  userId: string,
  deckId: string,
  input: CreateCardInput,
): Promise<FlashcardRecord> {
  await getDeckForUser(userId, deckId);

  const db = getDb();
  const sortOrder = await getNextSortOrder(deckId);

  const [created] = await db
    .insert(flashcards)
    .values({
      deckId,
      question: input.question,
      answer: input.answer,
      explanation: input.explanation ?? null,
      hint: input.hint ?? null,
      cardType: input.cardType ?? "basic",
      imageUrl: input.imageUrl ?? null,
      sortOrder,
    })
    .returning(flashcardColumns);

  if (!created) {
    throw new AppError(500, "Failed to create card");
  }

  await createReviewRows(userId, [created.id]);
  return created;
}

export async function createCardsBulkForDeck(
  userId: string,
  deckId: string,
  cards: CreateCardInput[],
): Promise<FlashcardRecord[]> {
  if (cards.length === 0) {
    throw new AppError(400, "At least one card is required");
  }

  await getDeckForUser(userId, deckId);

  const db = getDb();
  const startOrder = await getNextSortOrder(deckId);

  const rows = await db
    .insert(flashcards)
    .values(
      cards.map((card, index) => ({
        deckId,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation ?? null,
        hint: card.hint ?? null,
        cardType: card.cardType ?? "basic",
        imageUrl: card.imageUrl ?? null,
        sortOrder: startOrder + index,
      })),
    )
    .returning(flashcardColumns);

  await createReviewRows(
    userId,
    rows.map((row) => row.id),
  );

  await db
    .update(decks)
    .set({ updatedAt: sql`now()` })
    .where(eq(decks.id, deckId));

  return rows;
}

function ownedDeckIdsSubquery(userId: string) {
  const db = getDb();
  return db.select({ id: decks.id }).from(decks).where(eq(decks.userId, userId));
}

export async function updateCardForUser(
  userId: string,
  cardId: string,
  input: UpdateCardInput,
): Promise<FlashcardRecord> {
  const db = getDb();
  const [updated] = await db
    .update(flashcards)
    .set({
      ...(input.question !== undefined ? { question: input.question } : {}),
      ...(input.answer !== undefined ? { answer: input.answer } : {}),
      ...(input.explanation !== undefined
        ? { explanation: input.explanation }
        : {}),
      ...(input.hint !== undefined ? { hint: input.hint } : {}),
      ...(input.cardType !== undefined ? { cardType: input.cardType } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(flashcards.id, cardId),
        inArray(flashcards.deckId, ownedDeckIdsSubquery(userId)),
      ),
    )
    .returning(flashcardColumns);

  if (!updated) {
    throw new AppError(404, "Card not found");
  }

  return updated;
}

export async function deleteCardForUser(
  userId: string,
  cardId: string,
): Promise<void> {
  const db = getDb();
  const [deleted] = await db
    .delete(flashcards)
    .where(
      and(
        eq(flashcards.id, cardId),
        inArray(flashcards.deckId, ownedDeckIdsSubquery(userId)),
      ),
    )
    .returning({ id: flashcards.id });

  if (!deleted) {
    throw new AppError(404, "Card not found");
  }
}
