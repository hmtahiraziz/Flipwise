import {create} from 'zustand';
import {onboardingStorage} from '../storage/onboardingStorage';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
  isHydrated: boolean;
  hydrate: () => void;
  completeOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>(set => ({
  hasCompletedOnboarding: false,
  isHydrated: false,

  hydrate: () => {
    if (__DEV__) {
      console.log('[Onboarding] hydrate() start');
    }
    try {
      const hasCompletedOnboarding = onboardingStorage.getHasCompletedOnboarding();
      set({hasCompletedOnboarding});
      if (__DEV__) {
        console.log('[Onboarding] hydrate() read', {hasCompletedOnboarding});
      }
    } catch (error) {
      console.warn('[Onboarding] hydrate() failed:', error);
    } finally {
      // Always unblock RootNavigator, even when MMKV/storage throws.
      set({isHydrated: true});
      if (__DEV__) {
        console.log('[Onboarding] hydrate() done — isHydrated=true');
      }
    }
  },

  completeOnboarding: () => {
    onboardingStorage.setHasCompletedOnboarding(true);
    set({hasCompletedOnboarding: true});
  },
}));

export const selectOnboardingHydrated = (state: OnboardingState) => state.isHydrated;

export const selectHasCompletedOnboarding = (state: OnboardingState) =>
  state.hasCompletedOnboarding;
