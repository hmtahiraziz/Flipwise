import { REPORT_REASONS } from "../services/report.service";
import { registry, z } from "./registry";

export const ErrorSchema = registry.register(
  "Error",
  z.object({
    error: z.string(),
  }),
);

export const ValidationErrorSchema = registry.register(
  "ValidationError",
  z.object({
    error: z.literal("Validation failed"),
    details: z.array(
      z.object({
        path: z.string(),
        message: z.string(),
      }),
    ),
  }),
);

export const OkSchema = registry.register(
  "Ok",
  z.object({
    ok: z.literal(true),
  }),
);

export const UuidParam = z.string().uuid().openapi({
  param: { name: "id", in: "path" },
  example: "11111111-1111-4111-8111-111111111111",
});

export const DeckIdParam = z.string().uuid().openapi({
  param: { name: "deckId", in: "path" },
  example: "22222222-2222-4222-8222-222222222222",
});

export const CardIdParam = z.string().uuid().openapi({
  param: { name: "cardId", in: "path" },
  example: "33333333-3333-4333-8333-333333333333",
});

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .openapi({ example: "2026-12-01" });

export const UserSchema = registry.register(
  "User",
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    avatarUrl: z.string().url().nullable(),
  }),
);

export const DeckSchema = registry.register(
  "Deck",
  z.object({
    id: z.string().uuid(),
    title: z.string(),
    subject: z.string(),
    description: z.string().nullable(),
    coverImageUrl: z.string().nullable(),
    examDate: z.string().nullable(),
    isFavorite: z.boolean(),
    tags: z.array(z.string()),
    isArchived: z.boolean(),
    cardCount: z.number().int(),
    dueCount: z.number().int(),
    dueTodayCount: z.number().int(),
    lateCount: z.number().int(),
    dueTomorrowCount: z.number().int(),
    lastStudiedAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const FlashcardSchema = registry.register(
  "Flashcard",
  z.object({
    id: z.string().uuid(),
    deckId: z.string().uuid(),
    question: z.string(),
    answer: z.string(),
    explanation: z.string().nullable(),
    hint: z.string().nullable(),
    cardType: z.string(),
    imageUrl: z.string().nullable(),
    sortOrder: z.number().int(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const CreateDeckBodySchema = registry.register(
  "CreateDeckBody",
  z.object({
    title: z.string().trim().min(1).max(120),
    subject: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500).optional(),
    examDate: dateStringSchema.optional().nullable(),
    isFavorite: z.boolean().optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().nullable(),
  }),
);

export const UpdateDeckBodySchema = registry.register(
  "UpdateDeckBody",
  CreateDeckBodySchema.extend({
    isArchived: z.boolean().optional(),
  }).partial(),
);

export const CardBodySchema = registry.register(
  "CardBody",
  z.object({
    question: z.string().trim().min(1).max(2000),
    answer: z.string().trim().min(1).max(4000),
    explanation: z.string().trim().max(4000).optional().nullable(),
    hint: z.string().trim().max(1000).optional().nullable(),
    cardType: z.string().trim().min(1).max(40).optional(),
    imageUrl: z.string().url().optional().nullable(),
  }),
);

export const BulkCardsBodySchema = registry.register(
  "BulkCardsBody",
  z.object({
    cards: z.array(CardBodySchema).min(1).max(50),
  }),
);

export const GenerateCardsBodySchema = registry.register(
  "GenerateCardsBody",
  z.object({
    sourceType: z.enum(["topic", "notes"]),
    content: z.string().trim().min(1).max(20000),
    count: z.number().int().min(3).max(30).default(10),
    tone: z
      .enum(["concise", "detailed", "child-friendly", "critical"])
      .default("concise"),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    cardFormat: z.enum(["qa", "cloze"]).default("qa"),
    detailMode: z.enum(["concise", "examples"]).default("concise"),
    language: z.string().trim().min(2).max(16).optional(),
    aiConsent: z.union([z.literal(true), z.literal("true"), z.literal("1")]),
  }),
);

export const UrlImportBodySchema = registry.register(
  "UrlImportBody",
  z.object({
    url: z.string().url().max(2000),
  }),
);

export const ImportResultSchema = registry.register(
  "ImportResult",
  z.object({
    content: z.string(),
    sourceType: z.literal("notes"),
  }),
);

export const GeneratedCardSchema = registry.register(
  "GeneratedCard",
  z.object({
    question: z.string(),
    answer: z.string(),
    explanation: z.string().optional().nullable(),
    hint: z.string().optional().nullable(),
    cardType: z.string().optional(),
  }),
);

export const RateCardBodySchema = registry.register(
  "RateCardBody",
  z.object({
    rating: z.enum(["again", "hard", "good", "easy"]),
    durationMs: z.number().int().nonnegative().max(3_600_000).optional(),
    timeZone: z.string().trim().min(1).max(64).optional(),
    idempotencyKey: z.string().trim().min(8).max(64).optional(),
  }),
);

export const ExplainBodySchema = registry.register(
  "ExplainBody",
  z.object({
    aiConsent: z.union([z.literal(true), z.literal("true"), z.literal("1")]),
  }),
);

export const ExplainResultSchema = registry.register(
  "ExplainResult",
  z.object({
    explanation: z.string(),
    keyPoints: z.array(z.string()),
    analogy: z.string(),
  }),
);

export const CardReviewSchema = registry.register(
  "CardReview",
  z.object({
    id: z.string().uuid().optional(),
    cardId: z.string().uuid().optional(),
    easeFactor: z.number().optional(),
    intervalDays: z.number().int().optional(),
    repetitions: z.number().int().optional(),
    nextReviewDate: z.string().optional(),
    lastReviewedAt: z.string().nullable().optional(),
  }).passthrough(),
);

export const ReviewQueueItemSchema = registry.register(
  "ReviewQueueItem",
  z.object({
    card: FlashcardSchema,
    review: CardReviewSchema,
    deck: z
      .object({
        id: z.string().uuid(),
        title: z.string(),
        subject: z.string(),
      })
      .passthrough(),
  }),
);

export const ProgressSummarySchema = registry.register(
  "ProgressSummary",
  z.object({
    dueTodayCount: z.number().int(),
    dueTomorrowCount: z.number().int(),
    lateCount: z.number().int(),
    reviewedTodayCount: z.number().int(),
    reviewedThisWeekCount: z.number().int(),
    currentStreak: z.number().int(),
    longestStreak: z.number().int(),
    activityLast7Days: z.array(
      z.object({
        date: z.string(),
        cardsReviewed: z.number().int(),
      }),
    ),
  }),
);

export const ProgressHistorySchema = registry.register(
  "ProgressHistory",
  z.object({
    history: z.array(
      z.object({
        date: z.string(),
        cardsReviewed: z.number().int(),
        minutesStudied: z.number(),
      }),
    ),
  }),
);

export const ReportBodySchema = registry.register(
  "ReportBody",
  z.object({
    reason: z.enum(REPORT_REASONS),
    details: z.string().trim().max(1000).optional().nullable(),
    flashcardId: z.string().uuid().optional(),
  }),
);

export const ReportSchema = registry.register(
  "Report",
  z.object({
    id: z.string().uuid(),
    reason: z.string(),
    createdAt: z.string().datetime(),
  }),
);

export const HealthSchema = registry.register(
  "Health",
  z.object({
    ok: z.literal(true),
  }),
);

export const jsonContent = <T extends z.ZodType>(schema: T) => ({
  "application/json": { schema },
});

export const bearerSecurity: Array<{ bearerAuth: string[] }> = [
  { bearerAuth: [] },
];
export const noSecurity: Array<Record<string, string[]>> = [];
