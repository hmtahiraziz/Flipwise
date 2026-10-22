import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  /** Required to accept Clerk webhooks; without it POST /webhooks/clerk returns 503. */
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_MAX_TOKENS_GENERATE: z.coerce.number().int().min(256).max(8192).default(4096),
  OPENAI_MAX_TOKENS_EXPLAIN: z.coerce.number().int().min(128).max(2048).default(800),
  OPENAI_MAX_TOKENS_OCR: z.coerce.number().int().min(256).max(4096).default(2048),
  AI_DAILY_GENERATE_LIMIT: z.coerce.number().int().min(1).max(500).default(20),
  AI_DAILY_EXPLAIN_LIMIT: z.coerce.number().int().min(1).max(1000).default(60),
  AI_DAILY_OCR_LIMIT: z.coerce.number().int().min(1).max(200).default(15),
  CORS_ORIGIN: z.string().optional(),
  /**
   * Optional comma-separated JWT `azp` allowlist for Clerk verifyToken.
   * When unset, azp is not checked (signature/expiry still are) — required for
   * React Native / Expo where azp varies and guessing breaks auth.
   * When set, also merges the Clerk Frontend API origin from the publishable key.
   */
  CLERK_AUTHORIZED_PARTIES: z.string().optional(),
  /** HTTP Basic Auth for /api-docs and /openapi.json */
  API_DOCS_USER: z.string().min(1).default("docs"),
  API_DOCS_PASSWORD: z.string().min(1).default("docs"),
});

/**
 * Clerk publishable keys encode the Frontend API host as base64 after `pk_test_` / `pk_live_`.
 * Example: pk_test_YnJh... → https://brave-skylark-40.clerk.accounts.dev
 */
export function clerkFrontendApiOrigin(publishableKey: string): string | null {
  const key = publishableKey.trim();
  const match = /^pk_(?:test|live)_(.+)$/.exec(key);
  if (!match?.[1]) return null;
  try {
    const decoded = Buffer.from(match[1], "base64")
      .toString("utf8")
      .replace(/\$$/, "")
      .trim();
    if (!decoded || !decoded.includes(".")) return null;
    return `https://${decoded}`;
  } catch {
    return null;
  }
}

/**
 * Returns an azp allowlist only when CLERK_AUTHORIZED_PARTIES is explicitly set.
 * `undefined` means skip the authorizedParties check in verifyToken.
 */
export function getClerkAuthorizedParties(): string[] | undefined {
  const env = getEnv();
  const raw = env.CLERK_AUTHORIZED_PARTIES;
  if (!raw?.trim()) {
    return undefined;
  }

  const parties = new Set<string>();
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (trimmed) parties.add(trimmed);
  }

  const frontendOrigin = clerkFrontendApiOrigin(env.CLERK_PUBLISHABLE_KEY);
  if (frontendOrigin) {
    parties.add(frontendOrigin);
  }

  return parties.size > 0 ? [...parties] : undefined;
}

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${msg}`);
  }
  cached = parsed.data;
  return cached;
}

/** Test helper — clears cached env after mutating process.env. */
export function resetEnvCache(): void {
  cached = null;
}
