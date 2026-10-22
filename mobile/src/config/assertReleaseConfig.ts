import {API_BASE_URL, isHttpsApiUrl, isLocalApiUrl} from './api';
import {clerkPublishableKey, isClerkConfigured, isClerkProductionKey} from './clerk';

export type ReleaseConfigResult = {
  /** Hard failures — app must not continue. */
  errors: string[];
  /** Soft issues — app can run (e.g. pk_test_ on a sideload build). */
  warnings: string[];
};

/**
 * Validates env for store / release builds.
 * Does not throw — callers show ConfigErrorScreen when errors.length > 0.
 * Privacy / Terms are in-app; Play Console privacy URL is set separately on your API host.
 */
export function validateReleaseConfig(): ReleaseConfigResult {
  if (__DEV__) {
    return {errors: [], warnings: []};
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isClerkConfigured) {
    errors.push(
      'CLERK_PUBLISHABLE_KEY is missing or invalid. Set it in .env.production and rebuild.',
    );
  } else if (!isClerkProductionKey) {
    warnings.push(
      `Using Clerk test key (${clerkPublishableKey.slice(0, 8)}…). Use pk_live_ before Play Store upload.`,
    );
  }

  if (isLocalApiUrl(API_BASE_URL)) {
    errors.push(
      `API_BASE_URL must not be a local host (got ${API_BASE_URL}). Use your Railway HTTPS URL.`,
    );
  } else if (!isHttpsApiUrl(API_BASE_URL)) {
    errors.push(`API_BASE_URL must use HTTPS in release (got ${API_BASE_URL}).`);
  }

  return {errors, warnings};
}

/** @deprecated Prefer validateReleaseConfig() — kept for call-site clarity. */
export function assertReleaseConfig(): ReleaseConfigResult {
  return validateReleaseConfig();
}
