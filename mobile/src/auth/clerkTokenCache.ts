import {tokenCache as clerkTokenCache} from '@clerk/clerk-expo/token-cache';

const TOKEN_CACHE_TIMEOUT_MS = 4_000;

async function withTimeout<T>(
  promise: Promise<T>,
  label: string,
  fallback: T,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>(resolve => {
        timer = setTimeout(() => {
          console.warn(`[ClerkTokenCache] ${label} timed out after ${TOKEN_CACHE_TIMEOUT_MS}ms`);
          resolve(fallback);
        }, TOKEN_CACHE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

/**
 * Wraps Clerk's SecureStore token cache so a hung SecureStore call cannot
 * leave Clerk stuck in loading forever (blank white ClerkLoading screen).
 */
function createSafeTokenCache(cache: NonNullable<typeof clerkTokenCache>) {
  return {
    async getToken(key: string) {
      if (__DEV__) {
        console.log('[ClerkTokenCache] getToken', key);
      }
      try {
        const value = await withTimeout(cache.getToken(key), `getToken(${key})`, null);
        if (__DEV__) {
          console.log('[ClerkTokenCache] getToken done', {key, hasValue: !!value});
        }
        return value;
      } catch (error) {
        console.warn('[ClerkTokenCache] getToken error:', error);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      if (__DEV__) {
        console.log('[ClerkTokenCache] saveToken', key);
      }
      try {
        await withTimeout(cache.saveToken(key, value), `saveToken(${key})`, undefined);
      } catch (error) {
        console.warn('[ClerkTokenCache] saveToken error:', error);
      }
    },
  };
}

export const tokenCache = clerkTokenCache
  ? createSafeTokenCache(clerkTokenCache)
  : undefined;
