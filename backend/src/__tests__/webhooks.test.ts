import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const mockVerify = vi.fn();
const mockDeleteByClerkId = vi.fn();
const mockWasProcessed = vi.fn();
const mockMarkProcessed = vi.fn();

vi.mock("../config/env", () => ({
  getEnv: () => ({
    PORT: 3000,
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    CLERK_SECRET_KEY: "sk_test_mock",
    CLERK_PUBLISHABLE_KEY: "pk_test_mock",
    CLERK_WEBHOOK_SECRET: "whsec_test_secret",
    OPENAI_API_KEY: "sk-test-mock",
    OPENAI_MODEL: "gpt-4o-mini",
  }),
}));

vi.mock("svix", () => ({
  Webhook: class {
    verify(...args: unknown[]) {
      return mockVerify(...args);
    }
  },
}));

vi.mock("../services/user.service", () => ({
  deleteUserDataByClerkId: (...args: unknown[]) =>
    mockDeleteByClerkId(...args),
}));

vi.mock("../services/webhook.service", () => ({
  wasWebhookProcessed: (...args: unknown[]) => mockWasProcessed(...args),
  markWebhookProcessed: (...args: unknown[]) => mockMarkProcessed(...args),
}));

describe("Clerk webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWasProcessed.mockResolvedValue(false);
    mockMarkProcessed.mockResolvedValue(true);
    mockDeleteByClerkId.mockResolvedValue({ deleted: true, userId: "uuid-1" });
  });

  it("rejects missing Svix headers", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/webhooks/clerk")
      .set("Content-Type", "application/json")
      .send({ type: "user.deleted", data: { id: "user_1" } });

    expect(res.status).toBe(400);
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("rejects invalid signatures", async () => {
    mockVerify.mockImplementation(() => {
      throw new Error("bad sig");
    });

    const app = createApp();
    const res = await request(app)
      .post("/webhooks/clerk")
      .set("Content-Type", "application/json")
      .set("svix-id", "msg_1")
      .set("svix-timestamp", "123")
      .set("svix-signature", "v1,bad")
      .send({ type: "user.deleted", data: { id: "user_1" } });

    expect(res.status).toBe(400);
    expect(mockDeleteByClerkId).not.toHaveBeenCalled();
  });

  it("wipes Neon data on user.deleted and records idempotency key", async () => {
    mockVerify.mockReturnValue({
      type: "user.deleted",
      data: { id: "user_clerk_abc" },
    });

    const app = createApp();
    const body = JSON.stringify({
      type: "user.deleted",
      data: { id: "user_clerk_abc" },
    });

    const res = await request(app)
      .post("/webhooks/clerk")
      .set("Content-Type", "application/json")
      .set("svix-id", "msg_abc")
      .set("svix-timestamp", "1710000000")
      .set("svix-signature", "v1,test")
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
    expect(mockDeleteByClerkId).toHaveBeenCalledWith("user_clerk_abc");
    expect(mockMarkProcessed).toHaveBeenCalledWith(
      "msg_abc",
      "clerk",
      "user.deleted",
    );
  });

  it("is idempotent for duplicate svix-id", async () => {
    mockVerify.mockReturnValue({
      type: "user.deleted",
      data: { id: "user_1" },
    });
    mockWasProcessed.mockResolvedValue(true);

    const app = createApp();
    const res = await request(app)
      .post("/webhooks/clerk")
      .set("Content-Type", "application/json")
      .set("svix-id", "msg_dup")
      .set("svix-timestamp", "1710000000")
      .set("svix-signature", "v1,test")
      .send({ type: "user.deleted", data: { id: "user_1" } });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, duplicate: true });
    expect(mockDeleteByClerkId).not.toHaveBeenCalled();
    expect(mockMarkProcessed).not.toHaveBeenCalled();
  });
});

