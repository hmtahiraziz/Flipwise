import { and, eq, sql } from "drizzle-orm";
import { getEnv } from "../config/env";
import { getDb } from "../db";
import { aiUsage } from "../db/schema";
import { AppError } from "../middleware/errorHandler";

export type AiQuotaKind = "generate" | "explain" | "ocr";

function todayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function limitFor(kind: AiQuotaKind): number {
  const env = getEnv();
  switch (kind) {
    case "generate":
      return env.AI_DAILY_GENERATE_LIMIT;
    case "explain":
      return env.AI_DAILY_EXPLAIN_LIMIT;
    case "ocr":
      return env.AI_DAILY_OCR_LIMIT;
  }
}

function columnIncrement(kind: AiQuotaKind) {
  switch (kind) {
    case "generate":
      return {
        set: { generateCount: sql`${aiUsage.generateCount} + 1` },
        setWhere: sql`${aiUsage.generateCount} < ${limitFor(kind)}`,
        initial: {
          generateCount: 1,
          explainCount: 0,
          ocrCount: 0,
        },
      } as const;
    case "explain":
      return {
        set: { explainCount: sql`${aiUsage.explainCount} + 1` },
        setWhere: sql`${aiUsage.explainCount} < ${limitFor(kind)}`,
        initial: {
          generateCount: 0,
          explainCount: 1,
          ocrCount: 0,
        },
      } as const;
    case "ocr":
      return {
        set: { ocrCount: sql`${aiUsage.ocrCount} + 1` },
        setWhere: sql`${aiUsage.ocrCount} < ${limitFor(kind)}`,
        initial: {
          generateCount: 0,
          explainCount: 0,
          ocrCount: 1,
        },
      } as const;
  }
}

function countForKind(
  row: {
    generateCount: number;
    explainCount: number;
    ocrCount: number;
  },
  kind: AiQuotaKind,
): number {
  switch (kind) {
    case "generate":
      return row.generateCount;
    case "explain":
      return row.explainCount;
    case "ocr":
      return row.ocrCount;
  }
}

/**
 * Throws 429 if today's quota for `kind` is already exhausted.
 * Does not increment usage — call before an expensive LLM request, then
 * `consumeAiQuota` only after success so failed calls do not burn the cap.
 */
export async function assertAiQuotaAvailable(
  userId: string,
  kind: AiQuotaKind,
): Promise<void> {
  const db = getDb();
  const usageDate = todayUtcDateString();
  const limit = limitFor(kind);

  const rows = await db
    .select({
      generateCount: aiUsage.generateCount,
      explainCount: aiUsage.explainCount,
      ocrCount: aiUsage.ocrCount,
    })
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.usageDate, usageDate)))
    .limit(1);

  if (rows.length === 0) {
    return;
  }

  if (countForKind(rows[0]!, kind) >= limit) {
    throw new AppError(
      429,
      `Daily AI ${kind} limit of ${limit} reached. Try again tomorrow.`,
    );
  }
}

/**
 * Atomically consumes one unit of the given AI quota for today (UTC).
 * Throws 429 when the daily cap is already reached.
 */
export async function consumeAiQuota(
  userId: string,
  kind: AiQuotaKind,
): Promise<void> {
  const db = getDb();
  const usageDate = todayUtcDateString();
  const limit = limitFor(kind);
  const { set, setWhere, initial } = columnIncrement(kind);

  // Fast path: insert first use of the day.
  const inserted = await db
    .insert(aiUsage)
    .values({
      userId,
      usageDate,
      ...initial,
    })
    .onConflictDoNothing()
    .returning({
      userId: aiUsage.userId,
      generateCount: aiUsage.generateCount,
      explainCount: aiUsage.explainCount,
      ocrCount: aiUsage.ocrCount,
    });

  if (inserted.length > 0) {
    return;
  }

  // Existing row: increment only while under the limit.
  const updated = await db
    .update(aiUsage)
    .set(set)
    .where(
      and(
        eq(aiUsage.userId, userId),
        eq(aiUsage.usageDate, usageDate),
        setWhere,
      ),
    )
    .returning({
      userId: aiUsage.userId,
    });

  if (updated.length > 0) {
    return;
  }

  throw new AppError(
    429,
    `Daily AI ${kind} limit of ${limit} reached. Try again tomorrow.`,
  );
}
