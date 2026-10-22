import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertAiQuotaAvailable,
  consumeAiQuota,
} from "../services/aiQuota.service";

const mockReturningInsert = vi.fn();
const mockReturningUpdate = vi.fn();
const mockOnConflictDoNothing = vi.fn(() => ({
  returning: mockReturningInsert,
}));
const mockValues = vi.fn(() => ({
  onConflictDoNothing: mockOnConflictDoNothing,
}));
const mockInsert = vi.fn(() => ({ values: mockValues }));
const mockWhere = vi.fn(() => ({ returning: mockReturningUpdate }));
const mockSet = vi.fn(() => ({ where: mockWhere }));
const mockUpdate = vi.fn(() => ({ set: mockSet }));
const mockSelectLimit = vi.fn();
const mockSelectWhere = vi.fn(() => ({ limit: mockSelectLimit }));
const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

vi.mock("../config/env", () => ({
  getEnv: () => ({
    AI_DAILY_GENERATE_LIMIT: 2,
    AI_DAILY_EXPLAIN_LIMIT: 5,
    AI_DAILY_OCR_LIMIT: 3,
  }),
}));

vi.mock("../db", () => ({
  getDb: () => ({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
  }),
}));

describe("consumeAiQuota", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnConflictDoNothing.mockReturnValue({ returning: mockReturningInsert });
    mockValues.mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
    mockInsert.mockReturnValue({ values: mockValues });
    mockWhere.mockReturnValue({ returning: mockReturningUpdate });
    mockSet.mockReturnValue({ where: mockWhere });
    mockUpdate.mockReturnValue({ set: mockSet });
  });

  it("succeeds on first insert of the day", async () => {
    mockReturningInsert.mockResolvedValue([{ userId: "u1" }]);
    await expect(consumeAiQuota("u1", "generate")).resolves.toBeUndefined();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("increments existing row when under limit", async () => {
    mockReturningInsert.mockResolvedValue([]);
    mockReturningUpdate.mockResolvedValue([{ userId: "u1" }]);
    await expect(consumeAiQuota("u1", "explain")).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("throws 429 when limit reached", async () => {
    mockReturningInsert.mockResolvedValue([]);
    mockReturningUpdate.mockResolvedValue([]);
    await expect(consumeAiQuota("u1", "ocr")).rejects.toMatchObject({
      statusCode: 429,
    });
  });
});

describe("assertAiQuotaAvailable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockSelectFrom });
    mockSelectFrom.mockReturnValue({ where: mockSelectWhere });
    mockSelectWhere.mockReturnValue({ limit: mockSelectLimit });
  });

  it("allows when no usage row exists", async () => {
    mockSelectLimit.mockResolvedValue([]);
    await expect(
      assertAiQuotaAvailable("u1", "explain"),
    ).resolves.toBeUndefined();
  });

  it("allows when under the daily limit", async () => {
    mockSelectLimit.mockResolvedValue([
      { generateCount: 0, explainCount: 2, ocrCount: 0 },
    ]);
    await expect(
      assertAiQuotaAvailable("u1", "explain"),
    ).resolves.toBeUndefined();
  });

  it("throws 429 when explain limit is already reached", async () => {
    mockSelectLimit.mockResolvedValue([
      { generateCount: 0, explainCount: 5, ocrCount: 0 },
    ]);
    await expect(assertAiQuotaAvailable("u1", "explain")).rejects.toMatchObject(
      { statusCode: 429 },
    );
  });
});

