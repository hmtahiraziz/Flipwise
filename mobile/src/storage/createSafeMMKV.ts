import {createMMKV} from 'react-native-mmkv';

type StorageValue = boolean | string | number;

/** Minimal surface used by Flipwise storage modules. */
export type SafeMMKV = {
  getBoolean: (key: string) => boolean | undefined;
  getString: (key: string) => string | undefined;
  set: (key: string, value: StorageValue) => void;
  remove: (key: string) => void;
};

function createMemoryMMKV(id: string): SafeMMKV {
  const map = new Map<string, StorageValue>();
  if (__DEV__) {
    console.warn(`[MMKV] Using in-memory fallback for "${id}"`);
  }
  return {
    getBoolean(key) {
      const value = map.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    getString(key) {
      const value = map.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    set(key, value) {
      map.set(key, value);
    },
    remove(key) {
      map.delete(key);
    },
  };
}

/**
 * Creates MMKV storage, falling back to memory if Nitro/MMKV is unavailable.
 * Top-level `createMMKV()` throws can otherwise crash boot or leave gates hanging.
 */
export function createSafeMMKV(id: string): SafeMMKV {
  try {
    return createMMKV({id});
  } catch (error) {
    console.warn(`[MMKV] createMMKV("${id}") failed:`, error);
    return createMemoryMMKV(id);
  }
}
