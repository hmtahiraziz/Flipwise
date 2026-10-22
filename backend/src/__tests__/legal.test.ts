import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";

vi.mock("../config/env", () => ({
  getEnv: () => ({
    PORT: 3000,
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    CLERK_SECRET_KEY: "sk_test_mock",
    CLERK_PUBLISHABLE_KEY: "pk_test_mock",
    CLERK_WEBHOOK_SECRET: "whsec_test",
    OPENAI_API_KEY: "sk-test-mock",
    OPENAI_MODEL: "gpt-4o-mini",
  }),
}));

describe("legal pages", () => {
  it("serves privacy policy HTML", async () => {
    const app = createApp();
    const res = await request(app).get("/privacy");

    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
    expect(res.text).toContain("Privacy Policy");
    expect(res.text).toContain("Cardweave");
  });

  it("serves terms of service HTML", async () => {
    const app = createApp();
    const res = await request(app).get("/terms");

    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
    expect(res.text).toContain("Terms of Service");
  });

  it("serves public delete-account page", async () => {
    const app = createApp();
    const res = await request(app).get("/delete-account");

    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
    expect(res.text).toContain("Delete your account");
    expect(res.text).toContain("Settings");
  });
});
