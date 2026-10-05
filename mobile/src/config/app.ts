import {LEGAL_BASE_URL as ENV_LEGAL_BASE_URL} from '@env';
import {API_BASE_URL, isHttpsApiUrl, isLocalApiUrl} from './api';
import {APP_NAME, BUNDLE_ID} from './brand';

/** Keep in sync with mobile/package.json / android versionName for Play builds. */
export const APP_VERSION = '1.0.0';
export const SUPPORT_EMAIL = 'support@flipwise.app';
export const PRIVACY_EMAIL = 'privacy@flipwise.app';
export const LEGAL_ENTITY = APP_NAME;
export const PLAY_STORE_PACKAGE = BUNDLE_ID;

const MARKETING_LEGAL_BASE = 'https://flipwise.app';

function resolveLegalBaseUrl(): string {
  const fromEnv = ENV_LEGAL_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  // Until the marketing site is live, serve /privacy and /terms from the API host.
  if (!__DEV__ && isHttpsApiUrl(API_BASE_URL) && !isLocalApiUrl(API_BASE_URL)) {
    try {
      return new URL(API_BASE_URL).origin;
    } catch {
      // fall through
    }
  }

  return MARKETING_LEGAL_BASE;
}

export const LEGAL_BASE_URL = resolveLegalBaseUrl();
export const PRIVACY_POLICY_URL = `${LEGAL_BASE_URL}/privacy`;
export const TERMS_OF_SERVICE_URL = `${LEGAL_BASE_URL}/terms`;
