import { getDb } from "../db";
import { contentReports } from "../db/schema";
import { AppError } from "../middleware/errorHandler";
import { getCardForUser } from "./card.service";

export const REPORT_REASONS = [
  "inaccurate",
  "offensive",
  "harmful",
  "copyright",
  "spam",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export type CreateReportInput = {
  reason: ReportReason;
  details?: string | null;
  flashcardId?: string;
};

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export async function createContentReport(
  userId: string,
  input: CreateReportInput,
) {
  const db = getDb();

  let deckId: string | null = null;
  let questionSnapshot: string | null = null;
  let answerSnapshot: string | null = null;
  let flashcardId: string | null = input.flashcardId ?? null;

  if (flashcardId) {
    const card = await getCardForUser(userId, flashcardId);
    deckId = card.deckId;
    questionSnapshot = truncate(card.question, 500);
    answerSnapshot = truncate(card.answer, 500);
  }

  const details = input.details?.trim()
    ? truncate(input.details, 1000)
    : null;

  const [created] = await db
    .insert(contentReports)
    .values({
      userId,
      flashcardId,
      deckId,
      reason: input.reason,
      details,
      questionSnapshot,
      answerSnapshot,
    })
    .returning({
      id: contentReports.id,
      reason: contentReports.reason,
      createdAt: contentReports.createdAt,
    });

  if (!created) {
    throw new AppError(500, "Failed to save report");
  }

  return {
    id: created.id,
    reason: created.reason,
    createdAt: created.createdAt.toISOString(),
  };
}
