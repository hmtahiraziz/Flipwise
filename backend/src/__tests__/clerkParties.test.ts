import { afterEach, describe, expect, it } from "vitest";
import {
  clerkFrontendApiOrigin,
  getClerkAuthorizedParties,
  resetEnvCache,
} from "../config/env";

describe("clerkFrontendApiOrigin", () => {
  it("decodes Frontend API host from publishable key", () => {
    // base64("brave-skylark-40.clerk.accounts.dev$")
    const key =
      "pk_test_YnJhdmUtc2t5bGFyay00MC5jbGVyay5hY2NvdW50cy5kZXYk";
    expect(clerkFrontendApiOrigin(key)).toBe(
      "https://brave-skylark-40.clerk.accounts.dev",
    );
  });

  it("returns null for malformed keys", () => {
    expect(clerkFrontendApiOrigin("not-a-key")).toBeNull();
  });
});

describe("getClerkAuthorizedParties", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
    resetEnvCache();
  });

  function seedEnv() {
    process.env.PORT = "3000";
    process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
    process.env.CLERK_SECRET_KEY = "sk_test_mock";
    process.env.CLERK_PUBLISHABLE_KEY =
      "pk_test_YnJhdmUtc2t5bGFyay00MC5jbGVyay5hY2NvdW50cy5kZXYk";
    process.env.OPENAI_API_KEY = "sk-test-mock";
  }

  it("returns undefined when CLERK_AUTHORIZED_PARTIES is unset", () => {
    seedEnv();
    delete process.env.CLERK_AUTHORIZED_PARTIES;
    resetEnvCache();

    expect(getClerkAuthorizedParties()).toBeUndefined();
  });

  it("returns explicit allowlist merged with Frontend API origin", () => {
    seedEnv();
    process.env.CLERK_AUTHORIZED_PARTIES = "https://app.example.com";
    resetEnvCache();

    const parties = getClerkAuthorizedParties();
    expect(parties).toContain("https://app.example.com");
    expect(parties).toContain("https://brave-skylark-40.clerk.accounts.dev");
  });
});
