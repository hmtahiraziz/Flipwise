import {useAuth} from '@clerk/clerk-expo';
import {NavigationContainer} from '@react-navigation/native';
import {useEffect} from 'react';
import {View} from 'react-native';
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
    useOnboardingStore.getState().hydrate();
  }, []);

  if (!isLoaded || !isHydrated) {
    return <View style={{flex: 1, backgroundColor: '#FFFFFF'}} />;
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
