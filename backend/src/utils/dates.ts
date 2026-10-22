import { AppError } from "../middleware/errorHandler";

const IANA_TZ =
  /^[A-Za-z0-9_+\/-]+(?:\/[A-Za-z0-9_+\/-]+)*$/;

/**
 * Validates an IANA time zone and returns a YYYY-MM-DD calendar date in that zone.
 * Falls back to UTC when unset.
 */
export function calendarDateInTimeZone(
  timeZone: string | undefined,
  at: Date = new Date(),
): string {
  const tz = timeZone?.trim() || "UTC";
  if (tz !== "UTC" && !IANA_TZ.test(tz)) {
    throw new AppError(400, "Invalid timeZone");
  }

  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(at);

    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (!year || !month || !day) {
      throw new Error("incomplete");
    }
    return `${year}-${month}-${day}`;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, "Invalid timeZone");
  }
}

export function addCalendarDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calendarDaysBetween(from: string, to: string): number {
  const start = new Date(`${from}T12:00:00.000Z`).getTime();
  const end = new Date(`${to}T12:00:00.000Z`).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function parseOptionalTimeZone(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new AppError(400, "timeZone must be a string");
  }
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Validate by attempting a format — throws AppError if bad.
  calendarDateInTimeZone(trimmed);
  return trimmed;
}
