import {createSafeMMKV} from './createSafeMMKV';

const storage = createSafeMMKV('flipwise-app');

const KEYS = {
  hasCompletedOnboarding: 'hasCompletedOnboarding',
} as const;

export const onboardingStorage = {
  getHasCompletedOnboarding(): boolean {
    try {
      return storage.getBoolean(KEYS.hasCompletedOnboarding) ?? false;
    } catch (error) {
      console.warn('[OnboardingStorage] getHasCompletedOnboarding failed:', error);
      return false;
    }
  },

  setHasCompletedOnboarding(value: boolean) {
    try {
      storage.set(KEYS.hasCompletedOnboarding, value);
    } catch (error) {
      console.warn('[OnboardingStorage] setHasCompletedOnboarding failed:', error);
    }
  },
};
