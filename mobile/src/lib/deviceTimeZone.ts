/** Device IANA time zone for server-side due dates / streaks. */
export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function newIdempotencyKey(prefix = 'rv'): string {
  const webCrypto = (
    globalThis as {crypto?: {randomUUID?: () => string}}
  ).crypto;
  const rand =
    typeof webCrypto?.randomUUID === 'function'
      ? webCrypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`.slice(0, 64);
}
