import { AppError } from "../middleware/errorHandler";

/** Accept common truthy encodings from JSON or multipart fields. */
export function parseAiConsent(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

export function requireAiConsent(value: unknown): void {
  if (!parseAiConsent(value)) {
    throw new AppError(
      400,
      "AI processing consent is required before sending content to our AI provider.",
    );
  }
}
