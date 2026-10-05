import {API_BASE_URL, isHttpsApiUrl, isLocalApiUrl} from './api';
import {clerkPublishableKey, isClerkConfigured, isClerkProductionKey} from './clerk';
import {PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL} from './app';

/**
 * Validates env for store builds. In release (__DEV__ === false), misconfiguration
 * throws so a bad AAB cannot ship silently against localhost / test Clerk keys.
 */
export function assertReleaseConfig(): void {
  if (__DEV__) {
    return;
  }

  const problems: string[] = [];

  if (!isClerkConfigured) {
    problems.push('CLERK_PUBLISHABLE_KEY is missing or invalid');
  } else if (!isClerkProductionKey) {
    problems.push(
      `CLERK_PUBLISHABLE_KEY must be a pk_live_ key for release (got ${clerkPublishableKey.slice(0, 8)}…)`,
    );
  }

  if (isLocalApiUrl(API_BASE_URL)) {
    problems.push(`API_BASE_URL must not be a local host (got ${API_BASE_URL})`);
  } else if (!isHttpsApiUrl(API_BASE_URL)) {
    problems.push(`API_BASE_URL must use HTTPS in release (got ${API_BASE_URL})`);
  }

  if (!PRIVACY_POLICY_URL.startsWith('https://')) {
    problems.push(`PRIVACY_POLICY_URL must be HTTPS (got ${PRIVACY_POLICY_URL})`);
  }
  if (!TERMS_OF_SERVICE_URL.startsWith('https://')) {
    problems.push(`TERMS_OF_SERVICE_URL must be HTTPS (got ${TERMS_OF_SERVICE_URL})`);
  }

  if (problems.length > 0) {
    throw new Error(
      `[Flipwise] Release config invalid:\n- ${problems.join('\n- ')}\n` +
        'Set production values in .env (or ENVFILE=.env.production). See docs/PLAY_STORE.md',
    );
  }
}
