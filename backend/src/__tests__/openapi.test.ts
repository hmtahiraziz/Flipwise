import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { buildOpenApiDocument } from "../docs/openapi";

vi.mock("../config/env", () => ({
  getEnv: () => ({
    PORT: 3000,
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    CLERK_SECRET_KEY: "sk_test_mock",
    CLERK_PUBLISHABLE_KEY: "pk_test_mock",
    OPENAI_API_KEY: "sk-test-mock",
    OPENAI_MODEL: "gpt-4o-mini",
    API_DOCS_USER: "docsadmin",
    API_DOCS_PASSWORD: "secretpass",
  }),
  getClerkAuthorizedParties: () => undefined,
}));

describe("OpenAPI document", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    delete process.env.ENABLE_API_DOCS;
  });

  it("builds a valid OpenAPI 3 document with Clerk bearer auth", () => {
    const doc = buildOpenApiDocument();

    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.info.title).toBe("AI Flashcard API");
    expect(doc.components?.securitySchemes?.bearerAuth).toMatchObject({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    });
    expect(doc.paths?.["/api/decks"]).toBeDefined();
    expect(doc.paths?.["/api/auth/me"]).toBeDefined();
    expect(doc.paths?.["/health"]).toBeDefined();
    expect(doc.security).toEqual([{ bearerAuth: [] }]);
  });

  it("rejects docs without basic auth", async () => {
    const app = createApp();
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(401);
    expect(res.headers["www-authenticate"]).toMatch(/Basic/i);
  });

  it("serves openapi.json with valid basic auth", async () => {
    const app = createApp();
    const res = await request(app)
      .get("/openapi.json")
      .auth("docsadmin", "secretpass");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info.title).toBe("AI Flashcard API");
  });

  it("rejects docs with wrong password", async () => {
    const app = createApp();
    const res = await request(app)
      .get("/openapi.json")
      .auth("docsadmin", "wrong");
    expect(res.status).toBe(401);
  });
});
