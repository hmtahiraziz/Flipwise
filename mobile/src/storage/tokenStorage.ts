import {createSafeMMKV} from './createSafeMMKV';

const storage = createSafeMMKV('cardweave-auth');

const KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
} as const;

export const tokenStorage = {
  getAccessToken(): string | undefined {
    try {
      return storage.getString(KEYS.accessToken);
    } catch (error) {
      console.warn('[TokenStorage] getAccessToken failed:', error);
      return undefined;
    }
  },

  getRefreshToken(): string | undefined {
    try {
      return storage.getString(KEYS.refreshToken);
    } catch (error) {
      console.warn('[TokenStorage] getRefreshToken failed:', error);
      return undefined;
    }
  },

  getUserJson(): string | undefined {
    try {
      return storage.getString(KEYS.user);
    } catch (error) {
      console.warn('[TokenStorage] getUserJson failed:', error);
      return undefined;
    }
  },

  setSession(accessToken: string, refreshToken: string, userJson: string) {
    try {
      storage.set(KEYS.accessToken, accessToken);
      storage.set(KEYS.refreshToken, refreshToken);
      storage.set(KEYS.user, userJson);
    } catch (error) {
      console.warn('[TokenStorage] setSession failed:', error);
    }
  },

  setTokens(accessToken: string, refreshToken: string) {
    try {
      storage.set(KEYS.accessToken, accessToken);
      storage.set(KEYS.refreshToken, refreshToken);
    } catch (error) {
      console.warn('[TokenStorage] setTokens failed:', error);
    }
  },

  clear() {
    try {
      storage.remove(KEYS.accessToken);
      storage.remove(KEYS.refreshToken);
      storage.remove(KEYS.user);
    } catch (error) {
      console.warn('[TokenStorage] clear failed:', error);
    }
  },
};
