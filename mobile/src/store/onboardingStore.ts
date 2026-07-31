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
    const hasCompletedOnboarding = onboardingStorage.getHasCompletedOnboarding();
    set({hasCompletedOnboarding, isHydrated: true});
  },

  completeOnboarding: () => {
    onboardingStorage.setHasCompletedOnboarding(true);
    set({hasCompletedOnboarding: true});
  },
}));

export const selectOnboardingHydrated = (state: OnboardingState) => state.isHydrated;

export const selectHasCompletedOnboarding = (state: OnboardingState) =>
  state.hasCompletedOnboarding;
