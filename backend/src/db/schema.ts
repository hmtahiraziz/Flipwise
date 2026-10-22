import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  preferencesJson: text("preferences_json"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const decks = pgTable("decks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  examDate: date("exam_date"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  tags: text("tags"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: uuid("id").primaryKey().defaultRandom(),
  deckId: uuid("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  explanation: text("explanation"),
  hint: text("hint"),
  cardType: text("card_type").notNull().default("basic"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const studySessions = pgTable(
  "study_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionDate: date("session_date").notNull(),
    cardsReviewed: integer("cards_reviewed").notNull().default(0),
    minutesStudied: integer("minutes_studied").notNull().default(0),
  },
  (table) => [unique("study_sessions_user_date").on(table.userId, table.sessionDate)],
);

export const userStreaks = pgTable("user_streaks", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastStudyDate: date("last_study_date"),
});

export const cardReviews = pgTable("card_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  flashcardId: uuid("flashcard_id")
    .notNull()
    .unique()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  easeFactor: real("ease_factor").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(0),
  repetitions: integer("repetitions").notNull().default(0),
  nextReviewDate: date("next_review_date").notNull(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
});

/** Idempotent review submissions (client-provided key per rate action). */
export const reviewIdempotency = pgTable(
  "review_idempotency",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    flashcardId: uuid("flashcard_id").notNull(),
    responseJson: text("response_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("review_idempotency_user_key").on(
      table.userId,
      table.idempotencyKey,
    ),
  ],
);

/** Idempotency ledger for inbound webhooks (e.g. Svix message id). */
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Per-user daily AI usage counters (UTC calendar day). */
export const aiUsage = pgTable(
  "ai_usage",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    usageDate: date("usage_date").notNull(),
    generateCount: integer("generate_count").notNull().default(0),
    explainCount: integer("explain_count").notNull().default(0),
    ocrCount: integer("ocr_count").notNull().default(0),
  },
  (table) => [
    unique("ai_usage_user_date").on(table.userId, table.usageDate),
  ],
);

/** User reports of AI-generated or study content (Play AIGC policy). */
export const contentReports = pgTable("content_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  flashcardId: uuid("flashcard_id").references(() => flashcards.id, {
    onDelete: "set null",
  }),
  deckId: uuid("deck_id").references(() => decks.id, {
    onDelete: "set null",
  }),
  reason: text("reason").notNull(),
  details: text("details"),
  questionSnapshot: text("question_snapshot"),
  answerSnapshot: text("answer_snapshot"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
