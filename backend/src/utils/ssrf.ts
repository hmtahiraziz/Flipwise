import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { AppError } from "../middleware/errorHandler";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google",
  "metadata",
  "kubernetes.default",
  "kubernetes.default.svc",
]);

const BLOCKED_HOSTNAME_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".lan",
  ".home",
  ".corp",
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    value = (value << 8) + n;
  }
  return value >>> 0;
}

function inCidr(ip: string, base: string, prefix: number): boolean {
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(base);
  if (ipInt === null || baseInt === null) return false;
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

/** True for loopback, RFC1918, link-local, CGNAT, multicast, and unspecified. */
export function isBlockedIpAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    if (
      inCidr(address, "0.0.0.0", 8) ||
      inCidr(address, "10.0.0.0", 8) ||
      inCidr(address, "127.0.0.0", 8) ||
      inCidr(address, "169.254.0.0", 16) ||
      inCidr(address, "172.16.0.0", 12) ||
      inCidr(address, "192.168.0.0", 16) ||
      inCidr(address, "100.64.0.0", 10) ||
      inCidr(address, "192.0.0.0", 24) ||
      inCidr(address, "192.0.2.0", 24) ||
      inCidr(address, "198.51.100.0", 24) ||
      inCidr(address, "203.0.113.0", 24) ||
      inCidr(address, "224.0.0.0", 4) ||
      inCidr(address, "240.0.0.0", 4) ||
      address === "255.255.255.255"
    ) {
      return true;
    }
    return false;
  }

  if (family === 6) {
    const normalized = address.toLowerCase();
    if (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:") ||
      normalized.startsWith("ff")
    ) {
      return true;
    }
    // IPv4-mapped IPv6 (::ffff:x.x.x.x)
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) {
      return isBlockedIpAddress(mapped[1]);
    }
    return false;
  }

  return true;
}

export function assertSafeUrlForFetch(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new AppError(400, "Invalid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new AppError(400, "Only http and https URLs are supported");
  }

  if (parsed.username || parsed.password) {
    throw new AppError(400, "URLs with credentials are not allowed");
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname) {
    throw new AppError(400, "Invalid URL host");
  }

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new AppError(400, "This URL host is not allowed");
  }

  if (
    BLOCKED_HOSTNAME_SUFFIXES.some(
      (suffix) => hostname.endsWith(suffix) || hostname === suffix.slice(1),
    )
  ) {
    throw new AppError(400, "This URL host is not allowed");
  }

  if (isIP(hostname) && isBlockedIpAddress(hostname)) {
    throw new AppError(400, "Private or local network URLs are not allowed");
  }

  return parsed;
}

/**
 * Resolves the host and rejects if any address is private/metadata.
 * Mitigates DNS rebinding for the initial lookup (fetch may still race;
 * redirects are disabled by the caller).
 */
export async function assertPublicResolvedHost(hostname: string): Promise<void> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) {
    if (isBlockedIpAddress(host)) {
      throw new AppError(400, "Private or local network URLs are not allowed");
    }
    return;
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new AppError(400, "Could not resolve URL host");
  }

  if (!addresses.length) {
    throw new AppError(400, "Could not resolve URL host");
  }

  for (const entry of addresses) {
    if (isBlockedIpAddress(entry.address)) {
      throw new AppError(400, "Private or local network URLs are not allowed");
    }
  }
}
