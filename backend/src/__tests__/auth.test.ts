import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const mockFindOrCreate = vi.fn();
const mockGetUserById = vi.fn();
const mockVerifyToken = vi.fn();

vi.mock("../config/env", () => ({
  getEnv: () => ({
    PORT: 3000,
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    CLERK_SECRET_KEY: "sk_test_mock",
    CLERK_PUBLISHABLE_KEY: "pk_test_mock",
    OPENAI_API_KEY: "sk-test-mock",
    OPENAI_MODEL: "gpt-4o-mini",
  }),
}));

vi.mock("@clerk/backend", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

vi.mock("../services/user.service", () => ({
  findOrCreateUserFromClerk: (...args: unknown[]) => mockFindOrCreate(...args),
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}));

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 410 for legacy register", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "password123" });

    expect(res.status).toBe(410);
  });

  it("returns 401 without bearer token on /me", async () => {
    const app = createApp();
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns synced user when Clerk token is valid", async () => {
    mockVerifyToken.mockResolvedValue({ sub: "user_clerk123" });
    mockFindOrCreate.mockResolvedValue({
      id: "uuid-1",
      email: "test@flipwise.app",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.png",
    });
    mockGetUserById.mockResolvedValue({
      id: "uuid-1",
      email: "test@flipwise.app",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.png",
    });

    const app = createApp();
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer clerk_session_jwt");

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: "uuid-1",
      email: "test@flipwise.app",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(mockVerifyToken).toHaveBeenCalled();
    expect(mockFindOrCreate).toHaveBeenCalledWith("user_clerk123");
  });
});
