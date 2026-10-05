import {useAuth} from '@clerk/clerk-expo';
import {NavigationContainer} from '@react-navigation/native';
import {useEffect} from 'react';
import {BootLoading} from '../components/ui/BootLoading';
import {
  selectHasCompletedOnboarding,
  selectOnboardingHydrated,
  useOnboardingStore,
} from '../store/onboardingStore';
import {AuthStack} from './AuthStack';
import {MainTabs} from './MainTabs';
import {OnboardingStack} from './OnboardingStack';

export function RootNavigator() {
  const {isLoaded, isSignedIn} = useAuth();
  const isHydrated = useOnboardingStore(selectOnboardingHydrated);
  const hasCompletedOnboarding = useOnboardingStore(selectHasCompletedOnboarding);

  useEffect(() => {
    console.log('[Boot] RootNavigator mounted — calling hydrate()');
    useOnboardingStore.getState().hydrate();
  }, []);

  useEffect(() => {
    console.log('[Boot] gate state', {
      isLoaded,
      isSignedIn: isSignedIn ?? null,
      isHydrated,
      hasCompletedOnboarding,
    });
  }, [isLoaded, isSignedIn, isHydrated, hasCompletedOnboarding]);

  if (!isLoaded || !isHydrated) {
    return <BootLoading />;
  }

  const stack = !hasCompletedOnboarding
    ? 'OnboardingStack'
    : isSignedIn
      ? 'MainTabs'
      : 'AuthStack';

  if (__DEV__) {
    console.log('[Boot] rendering navigator stack:', stack);
  }

  return (
    <NavigationContainer>
      {!hasCompletedOnboarding ? (
        <OnboardingStack />
      ) : isSignedIn ? (
        <MainTabs />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
