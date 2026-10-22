import { describe, expect, it } from "vitest";
import { AppError } from "../middleware/errorHandler";
import { assertSafeUrlForFetch, isBlockedIpAddress } from "../utils/ssrf";

describe("ssrf guards", () => {
  it("blocks private and metadata IPv4 addresses", () => {
    expect(isBlockedIpAddress("127.0.0.1")).toBe(true);
    expect(isBlockedIpAddress("10.0.0.5")).toBe(true);
    expect(isBlockedIpAddress("172.16.1.1")).toBe(true);
    expect(isBlockedIpAddress("192.168.1.10")).toBe(true);
    expect(isBlockedIpAddress("169.254.169.254")).toBe(true);
    expect(isBlockedIpAddress("100.64.1.1")).toBe(true);
    expect(isBlockedIpAddress("8.8.8.8")).toBe(false);
  });

  it("blocks loopback and link-local IPv6", () => {
    expect(isBlockedIpAddress("::1")).toBe(true);
    expect(isBlockedIpAddress("fe80::1")).toBe(true);
    expect(isBlockedIpAddress("fc00::1")).toBe(true);
  });

  it("rejects localhost and credentialed URLs", () => {
    expect(() => assertSafeUrlForFetch("http://localhost/notes")).toThrow(
      AppError,
    );
    expect(() =>
      assertSafeUrlForFetch("http://user:pass@example.com/x"),
    ).toThrow(AppError);
    expect(() =>
      assertSafeUrlForFetch("http://169.254.169.254/latest/meta-data"),
    ).toThrow(AppError);
    expect(() => assertSafeUrlForFetch("file:///etc/passwd")).toThrow(AppError);
  });

  it("allows public https URLs", () => {
    const url = assertSafeUrlForFetch("https://example.com/notes");
    expect(url.hostname).toBe("example.com");
  });
});
