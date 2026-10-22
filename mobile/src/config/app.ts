import {LEGAL_BASE_URL as ENV_LEGAL_BASE_URL} from '@env';
import {API_BASE_URL, isHttpsApiUrl, isLocalApiUrl} from './api';
import {APP_NAME, BUNDLE_ID} from './brand';

/** Keep in sync with mobile/package.json / android versionName for Play builds. */
export const APP_VERSION = '1.0.0';
export const SUPPORT_EMAIL = 'support@cardweave.app';
export const PRIVACY_EMAIL = 'privacy@cardweave.app';
export const LEGAL_ENTITY = APP_NAME;
export const PLAY_STORE_PACKAGE = BUNDLE_ID;

/**
 * Base URL for public account-deletion page (Play requirement).
 * Privacy / Terms are shown in-app — not opened as external URLs.
 */
function resolveLegalBaseUrl(): string {
  const fromEnv = ENV_LEGAL_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (!__DEV__ && isHttpsApiUrl(API_BASE_URL) && !isLocalApiUrl(API_BASE_URL)) {
    try {
      return new URL(API_BASE_URL).origin;
    } catch {
      // fall through
    }
  }

  // Dev fallback — Settings delete-account link; release builds use API origin or env.
  return API_BASE_URL.replace(/\/$/, '');
}

export const LEGAL_BASE_URL = resolveLegalBaseUrl();
export const DELETE_ACCOUNT_URL = `${LEGAL_BASE_URL}/delete-account`;
