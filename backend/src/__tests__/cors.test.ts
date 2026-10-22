import { afterEach, describe, expect, it } from "vitest";
import { resolveCorsOrigin } from "../app";

describe("resolveCorsOrigin", () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it("allows * in non-production", () => {
    expect(resolveCorsOrigin("*", false)).toBe(true);
    expect(resolveCorsOrigin(undefined, false)).toBe(true);
  });

  it("fails fast on * or unset in production", () => {
    expect(() => resolveCorsOrigin("*", true)).toThrow(/allowlist/i);
    expect(() => resolveCorsOrigin(undefined, true)).toThrow(/allowlist/i);
    expect(() => resolveCorsOrigin("  ", true)).toThrow(/allowlist/i);
  });

  it("returns allowlist entries in production", () => {
    expect(resolveCorsOrigin("https://cardweave.app", true)).toBe(
      "https://cardweave.app",
    );
    expect(
      resolveCorsOrigin("https://a.example, https://b.example", true),
    ).toEqual(["https://a.example", "https://b.example"]);
  });
});
