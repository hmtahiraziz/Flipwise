import {createMMKV} from 'react-native-mmkv';

const storage = createMMKV({id: 'flipwise-auth'});

const KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
} as const;

export const tokenStorage = {
  getAccessToken(): string | undefined {
    return storage.getString(KEYS.accessToken);
  },

  getRefreshToken(): string | undefined {
    return storage.getString(KEYS.refreshToken);
  },

  getUserJson(): string | undefined {
    return storage.getString(KEYS.user);
  },

  setSession(accessToken: string, refreshToken: string, userJson: string) {
    storage.set(KEYS.accessToken, accessToken);
    storage.set(KEYS.refreshToken, refreshToken);
    storage.set(KEYS.user, userJson);
  },

  setTokens(accessToken: string, refreshToken: string) {
    storage.set(KEYS.accessToken, accessToken);
    storage.set(KEYS.refreshToken, refreshToken);
  },

  clear() {
    storage.remove(KEYS.accessToken);
    storage.remove(KEYS.refreshToken);
    storage.remove(KEYS.user);
  },
};
