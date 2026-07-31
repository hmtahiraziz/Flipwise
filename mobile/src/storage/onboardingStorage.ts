import {createMMKV} from 'react-native-mmkv';

const storage = createMMKV({id: 'flipwise-app'});

const KEYS = {
  hasCompletedOnboarding: 'hasCompletedOnboarding',
} as const;

export const onboardingStorage = {
  getHasCompletedOnboarding(): boolean {
    return storage.getBoolean(KEYS.hasCompletedOnboarding) ?? false;
  },

  setHasCompletedOnboarding(value: boolean) {
    storage.set(KEYS.hasCompletedOnboarding, value);
  },
};
