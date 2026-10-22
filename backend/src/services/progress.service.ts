import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  cardReviews,
  decks,
  flashcards,
  studySessions,
  userStreaks,
} from "../db/schema";
import {
  addCalendarDays,
  calendarDateInTimeZone,
  calendarDaysBetween,
} from "../utils/dates";

export type ProgressSummary = {
  dueTodayCount: number;
  dueTomorrowCount: number;
  lateCount: number;
  reviewedTodayCount: number;
  reviewedThisWeekCount: number;
  currentStreak: number;
  longestStreak: number;
  activityLast7Days: Array<{ date: string; cardsReviewed: number }>;
};

export type ProgressHistoryDay = {
  date: string;
  cardsReviewed: number;
  minutesStudied: number;
};

export async function recordStudyActivity(
  userId: string,
  minutesStudied = 0,
  timeZone?: string,
): Promise<void> {
  const db = getDb();
  const today = calendarDateInTimeZone(timeZone);
  const minutesIncrement = Number.isFinite(minutesStudied)
    ? Math.max(0, Math.min(5, Math.round(minutesStudied)))
    : 0;

  await db
    .insert(studySessions)
    .values({
      userId,
      sessionDate: today,
      cardsReviewed: 1,
      minutesStudied: minutesIncrement,
    })
    .onConflictDoUpdate({
      target: [studySessions.userId, studySessions.sessionDate],
      set: {
        cardsReviewed: sql`${studySessions.cardsReviewed} + 1`,
        minutesStudied: sql`${studySessions.minutesStudied} + ${minutesIncrement}`,
      },
    });

  const [streak] = await db
    .select({
      userId: userStreaks.userId,
      currentStreak: userStreaks.currentStreak,
      longestStreak: userStreaks.longestStreak,
      lastStudyDate: userStreaks.lastStudyDate,
    })
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (!streak) {
    await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: today,
    });
    return;
  }

  if (streak.lastStudyDate === today) {
    return;
  }

  let nextStreak = 1;
  if (streak.lastStudyDate) {
    const gap = calendarDaysBetween(streak.lastStudyDate, today);
    if (gap === 1) {
      nextStreak = streak.currentStreak + 1;
    }
  }

  const nextLongest = Math.max(streak.longestStreak, nextStreak);

  await db
    .update(userStreaks)
    .set({
      currentStreak: nextStreak,
      longestStreak: nextLongest,
      lastStudyDate: today,
    })
    .where(eq(userStreaks.userId, userId));
}

export async function getProgressSummaryForUser(
  userId: string,
  timeZone?: string,
): Promise<ProgressSummary> {
  const db = getDb();
  const today = calendarDateInTimeZone(timeZone);
  const tomorrow = addCalendarDays(today, 1);
  const sevenDaysAgo = addCalendarDays(today, -6);

  const [dueStats] = await db
    .select({
      dueTodayCount: sql<number>`cast(count(distinct case when ${cardReviews.nextReviewDate} = ${today}::date then ${cardReviews.id} end) as int)`.mapWith(
        Number,
      ),
      lateCount: sql<number>`cast(count(distinct case when ${cardReviews.nextReviewDate} < ${today}::date then ${cardReviews.id} end) as int)`.mapWith(
        Number,
      ),
      dueTomorrowCount: sql<number>`cast(count(distinct case when ${cardReviews.nextReviewDate} = ${tomorrow}::date then ${cardReviews.id} end) as int)`.mapWith(
        Number,
      ),
    })
    .from(cardReviews)
    .innerJoin(flashcards, eq(flashcards.id, cardReviews.flashcardId))
    .innerJoin(decks, eq(decks.id, flashcards.deckId))
    .where(
      and(
        eq(cardReviews.userId, userId),
        eq(decks.userId, userId),
        eq(decks.isArchived, false),
      ),
    );

  const [todaySession] = await db
    .select({ cardsReviewed: studySessions.cardsReviewed })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        eq(studySessions.sessionDate, today),
      ),
    )
    .limit(1);

  const [streak] = await db
    .select({
      currentStreak: userStreaks.currentStreak,
      longestStreak: userStreaks.longestStreak,
    })
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  const activityRows = await db
    .select({
      sessionDate: studySessions.sessionDate,
      cardsReviewed: studySessions.cardsReviewed,
    })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        gte(studySessions.sessionDate, sevenDaysAgo),
      ),
    )
    .orderBy(studySessions.sessionDate);

  const activityMap = new Map(
    activityRows.map((row) => [row.sessionDate, row.cardsReviewed]),
  );

  const activityLast7Days: ProgressSummary["activityLast7Days"] = [];
  let reviewedThisWeekCount = 0;
  for (let i = 0; i < 7; i += 1) {
    const date = addCalendarDays(sevenDaysAgo, i);
    const count = activityMap.get(date) ?? 0;
    reviewedThisWeekCount += count;
    activityLast7Days.push({
      date,
      cardsReviewed: count,
    });
  }

  return {
    dueTodayCount: dueStats?.dueTodayCount ?? 0,
    dueTomorrowCount: dueStats?.dueTomorrowCount ?? 0,
    lateCount: dueStats?.lateCount ?? 0,
    reviewedTodayCount: todaySession?.cardsReviewed ?? 0,
    reviewedThisWeekCount,
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    activityLast7Days,
  };
}

export async function getProgressHistoryForUser(
  userId: string,
  days: number,
  timeZone?: string,
): Promise<ProgressHistoryDay[]> {
  const db = getDb();
  const today = calendarDateInTimeZone(timeZone);
  const startDate = addCalendarDays(today, -(days - 1));

  const rows = await db
    .select({
      sessionDate: studySessions.sessionDate,
      cardsReviewed: studySessions.cardsReviewed,
      minutesStudied: studySessions.minutesStudied,
    })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        gte(studySessions.sessionDate, startDate),
      ),
    )
    .orderBy(studySessions.sessionDate);

  const rowMap = new Map(
    rows.map((row) => [
      row.sessionDate,
      {
        cardsReviewed: row.cardsReviewed,
        minutesStudied: row.minutesStudied,
      },
    ]),
  );

  const history: ProgressHistoryDay[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = addCalendarDays(startDate, i);
    const entry = rowMap.get(date);
    history.push({
      date,
      cardsReviewed: entry?.cardsReviewed ?? 0,
      minutesStudied: entry?.minutesStudied ?? 0,
    });
  }

  return history;
}

export function serializeProgressSummary(summary: ProgressSummary) {
  return summary;
}

export function serializeProgressHistory(history: ProgressHistoryDay[]) {
  return { history };
}
