import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const mockVerifyToken = vi.fn();
const mockFindOrCreate = vi.fn();
const mockCreateReport = vi.fn();

vi.mock("../config/env", () => ({
  getEnv: () => ({
    PORT: 3000,
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    CLERK_SECRET_KEY: "sk_test_mock",
    CLERK_PUBLISHABLE_KEY: "pk_test_mock",
    CLERK_WEBHOOK_SECRET: "whsec_test",
    OPENAI_API_KEY: "sk-test-mock",
    OPENAI_MODEL: "gpt-4o-mini",
    OPENAI_MAX_TOKENS_GENERATE: 4096,
    OPENAI_MAX_TOKENS_EXPLAIN: 800,
    OPENAI_MAX_TOKENS_OCR: 2048,
    AI_DAILY_GENERATE_LIMIT: 20,
    AI_DAILY_EXPLAIN_LIMIT: 60,
    AI_DAILY_OCR_LIMIT: 15,
  }),
  getClerkAuthorizedParties: () => ["com.cardweave.app"],
}));

vi.mock("@clerk/backend", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

vi.mock("../services/user.service", () => ({
  findOrCreateUserFromClerk: (...args: unknown[]) => mockFindOrCreate(...args),
  getUserById: vi.fn(),
}));

vi.mock("../services/report.service", async importOriginal => {
  const actual =
    await importOriginal<typeof import("../services/report.service")>();
  return {
    ...actual,
    createContentReport: (...args: unknown[]) => mockCreateReport(...args),
  };
});

describe("content reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyToken.mockResolvedValue({ sub: "user_clerk" });
    mockFindOrCreate.mockResolvedValue({
      id: "uuid-1",
      email: "a@b.com",
      name: null,
      avatarUrl: null,
    });
    mockCreateReport.mockResolvedValue({
      id: "rep-1",
      reason: "inaccurate",
      createdAt: new Date().toISOString(),
    });
  });

  it("requires auth", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/reports")
      .send({ reason: "inaccurate" });
    expect(res.status).toBe(401);
  });

  it("creates a report for authenticated user", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/reports")
      .set("Authorization", "Bearer token")
      .send({
        reason: "inaccurate",
        flashcardId: "11111111-1111-4111-8111-111111111111",
      });

    expect(res.status).toBe(201);
    expect(res.body.report).toMatchObject({
      id: "rep-1",
      reason: "inaccurate",
    });
    expect(mockCreateReport).toHaveBeenCalledWith("uuid-1", {
      reason: "inaccurate",
      flashcardId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("rejects invalid reasons", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/reports")
      .set("Authorization", "Bearer token")
      .send({ reason: "not-a-reason" });
    expect(res.status).toBe(400);
  });
});
