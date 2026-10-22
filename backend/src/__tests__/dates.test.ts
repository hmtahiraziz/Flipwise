import { describe, expect, it } from "vitest";
import { AppError } from "../middleware/errorHandler";
import {
  addCalendarDays,
  calendarDateInTimeZone,
  calendarDaysBetween,
  parseOptionalTimeZone,
} from "../utils/dates";

describe("dates utils", () => {
  it("formats UTC calendar dates", () => {
    const date = new Date("2026-03-15T01:30:00.000Z");
    expect(calendarDateInTimeZone("UTC", date)).toBe("2026-03-15");
  });

  it("respects time zones across UTC midnight", () => {
    // 2026-03-15 01:00 UTC → still 2026-03-14 in America/Los_Angeles (PDT).
    const date = new Date("2026-03-15T01:00:00.000Z");
    expect(calendarDateInTimeZone("America/Los_Angeles", date)).toBe(
      "2026-03-14",
    );
  });

  it("adds calendar days stably", () => {
    expect(addCalendarDays("2026-03-14", 1)).toBe("2026-03-15");
    expect(calendarDaysBetween("2026-03-14", "2026-03-15")).toBe(1);
  });

  it("rejects invalid time zones", () => {
    expect(() => calendarDateInTimeZone("Not/A_Zone")).toThrow(AppError);
    expect(() => parseOptionalTimeZone("!!!")).toThrow(AppError);
    expect(parseOptionalTimeZone(undefined)).toBeUndefined();
  });
});
