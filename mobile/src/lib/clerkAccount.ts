import {clerkPublishableKey} from '../config/clerk';

function decodeBase64(value: string): string | null {
  try {
    const globalAtob = (globalThis as unknown as {atob?: (input: string) => string}).atob;
    if (!globalAtob) {
      return null;
    }

    return globalAtob(value).replace(/\$$/, '') || null;
  } catch {
    return null;
  }
}

/** Decode Clerk frontend API host from the publishable key (pk_test_/pk_live_ + base64). */
export function getClerkFrontendApi(publishableKey: string): string | null {
  const match = publishableKey.match(/^pk_(?:test|live)_(.+)$/);
  if (!match) {
    return null;
  }

  return decodeBase64(match[1]);
}

export function getClerkAccountPortalUrl(): string | null {
  const frontendApi = getClerkFrontendApi(clerkPublishableKey);
  if (!frontendApi) {
    return null;
  }

  return `https://${frontendApi}/user`;
}
